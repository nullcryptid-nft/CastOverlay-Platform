import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuthState,
  UserProfile,
  Platform,
  SteamProfile,
  LinkedPlatform,
} from "../types";
import { db } from "../services/dbService";
import { setTransientSteamId, useGameStore } from "./gameStore";
import { initSteamPresence } from "../services/steamRichPresence";
import { FREE_STEAM_GAMES, steamPosterUrl, steamBannerUrl, steamLoginUrl } from "../services/steamService";
import type { GameProfile } from "../types";

const isTauri = () =>
  typeof window !== "undefined" && Boolean(window.__TAURI__);

const MOCK_USERS: Record<string, { password: string; user: UserProfile }> = {
  "demo@castoverlay.com": {
    password: "demo123",
    user: {
      id: "1",
      username: "ProGamer",
      email: "demo@castoverlay.com",
      avatarUrl:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer",
      tier: "Pro Esports",
      createdAt: "2024-01-15T00:00:00Z",
      lastLogin: new Date().toISOString(),
      settingsSynced: true,
    },
  },
};

/** Steam OpenID configuration – replace APP_ID with your Steam Web API key. */
const STEAM_OPENID = {
  appid: "252490", // TODO: your own Steam Web API appid
  // `return_to` now points to a real, registered page so the browser can
  // navigate back to it after Steam signs the user in — the previous
  // custom-scheme URL (castoverlay://auth/callback) is no longer reachable
  // from a normal browser flow, which is why the back button appeared.
  returnTo: "https://castoverlay.app/steam/callback",
};

function buildSteamOpenidUrl(): string {
  const p = new URLSearchParams({
    "openid.mode": "checkid1",
    "openid.ns.ax": "http://schema.openid.net/ax/1.0",
    "openid.ax.mode": "fetch",
    "openid.ax.type.required.steamid": "http://axschema.org/contact/email",
    "openid.ax.value.required.steamid": "http://axschema.org/person/fullname",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.return_to": STEAM_OPENID.returnTo,
    "openid.realm": STEAM_OPENID.returnTo,
  });
  return `https://steamcommunity.com/openid/login?${p.toString()}`;
}

// ── Steam auth event bridge (module-level, Tauri-only) ───────────────────────
function handleSteamSuccess(payload: { steamId?: string }): void {
  const steamId = payload?.steamId;
  if (!steamId || steamId.length < 15) return;

  // Activate presence + library + transient ID
  void initSteamPresence(steamId);
  setTransientSteamId(steamId);
  void useGameStore.getState().refreshSteamLibrary();

  // Update the auth user with real Steam profile data
  const store = useAuthStore.getState();
  const user = store.user as UserProfile | null;
  const existingPlatforms = (user?.linkedPlatforms ?? []).filter(
    (p) => p.platform !== "steam",
  );
  const nextUser: UserProfile = {
    ...(user ?? {
      id: String(Date.now()),
      username: "SteamUser",
      avatarUrl: "",
      tier: "Pro Esports" as const,
      createdAt: new Date().toISOString(),
      settingsSynced: true,
    }),
    steam: {
      steamId,
      personaName: user?.username || "SteamUser",
      avatarUrl: user?.avatarUrl || "",
      level: 1,
      status: "Online",
    },
    linkedPlatforms: [
      ...existingPlatforms,
      { platform: "steam" as const, connected: true, channelOrHandle: steamId },
    ],
    lastLogin: new Date().toISOString(),
  };

  useAuthStore.setState({
    user: authorizeUser(nextUser),
    isAuthenticated: true,
    isLoading: false,
  });

  // Dispatch a DOM CustomEvent so App.tsx can show the toast
  window.dispatchEvent(new CustomEvent("castoverlay:steam-auth-success", { detail: { steamId } }));
}

let _bridgeRegistered = false;
/**
 * Register the Tauri `steam-auth-success` event listener exactly once.
 * Safe to call multiple times – subsequent calls are no-ops.
 * Exported so App.tsx can call it inside a useEffect.
 */
export function initSteamAuthEventBridge(): void {
  const steamId = useAuthStore.getState().user?.steam?.steamId;
  if (steamId) setTransientSteamId(steamId);
  if (_bridgeRegistered || !isTauri()) return;
  _bridgeRegistered = true;
  listen<{ steamId?: string }>("steam-auth-success", (e) => {
    try {
      handleSteamSuccess(e.payload);
    } catch (err) {
      console.error("[authStore] steam-auth-success handler error:", err);
    }
  }).catch((err) =>
    console.error("[authStore] failed to listen steam-auth-success:", err)
  );
}

function authorizeUser(user: UserProfile): UserProfile {
  const platforms: LinkedPlatform[] = user.linkedPlatforms ?? [];
  const hasSteam = !!(user.steam?.steamId) || platforms.some((p) => p.platform === "steam" && p.connected);
  const hasStream = platforms.some((p) => p.platform !== "steam" && p.connected);
  return { ...user, isAuthorized: hasSteam && hasStream };
}

/** Build minimal GameProfile objects for the 3 free F2P Steam games. */
function buildFreeGames(): GameProfile[] {
  return FREE_STEAM_GAMES.map((g) => ({
    id: `free-${g.appid}`,
    name: g.name,
    genre: "Free-to-play",
    category: "All",
    accentColor: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16,185,129,0.4)",
    badge: "FREE",
    activePlayers: "—",
    targetFps: 60,
    coverUrl: steamPosterUrl(g.appid),
    bannerUrl: steamBannerUrl(g.appid),
    steamAppId: String(g.appid),
    inSteamLibrary: true,
    defaultStats: {
      stat1Label: "WINS", stat1: 0,
      stat2Label: "LOSSES", stat2: 0,
      stat3Label: "KILLS", stat3: 0,
      stat4Label: "DEATHS", stat4: 0,
    },
  }));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Prefer an encrypted hash stored in the global db over the
        // in-memory mock table (more durable + secure-by-design).
        const stored = await db.get<{ hash?: string; user?: UserProfile }>(
          `auth:user:${email}`,
        );
        let verified = false;
        if (stored?.hash) {
          verified = await db.verifyPassword(password, stored.hash);
        }
        if (!verified && MOCK_USERS[email]) {
          verified = MOCK_USERS[email].password === password;
        }

        if (verified) {
          const base: UserProfile = stored?.user ?? MOCK_USERS[email]!.user;
          const updatedUser = authorizeUser({
            ...base,
            lastLogin: new Date().toISOString(),
          });
          set({ user: updatedUser, isAuthenticated: true, isLoading: false });
          // Keep the db in sync with the session user object
          await db.set(`auth:user:${email}`, {
            hash: stored?.hash,
            user: updatedUser,
          });
        } else if (password.length >= 4) {
          const username = email.split("@")[0] || "User";
          const newUser: UserProfile = {
            id: String(Date.now()),
            username,
            email,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            tier: "Free",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            settingsSynced: true,
            linkedPlatforms: [],
          };
          set({
            user: authorizeUser(newUser),
            isAuthenticated: true,
            isLoading: false,
          });
          // Award 3 free F2P Steam games to new platform-only accounts
          const freeGames = buildFreeGames();
          useGameStore.getState().setOwnedGames(freeGames);
        } else {
          set({ error: "Heslo musí mať aspoň 4 znaky.", isLoading: false });
          throw new Error("Invalid credentials");
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });

        if (!username || !email || !password) {
          set({ error: "Vyplňte všetky polia.", isLoading: false });
          throw new Error("Missing fields");
        }

        const newUser: UserProfile = {
          id: String(Date.now()),
          username,
          email,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          tier: "Free",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          settingsSynced: true,
          linkedPlatforms: [],
        };

        const hash = await db.hashPassword(password);
        MOCK_USERS[email] = { password, user: newUser };
        await db.set(`auth:user:${email}`, {
          hash,
          user: authorizeUser(newUser),
        });
        set({
          user: authorizeUser(newUser),
          isAuthenticated: true,
          isLoading: false,
        });
        // Award 3 free F2P Steam games to new platform-only accounts
        const freeGames = buildFreeGames();
        useGameStore.getState().setOwnedGames(freeGames);
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      syncSettings: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 600));
        set({
          user: { ...user, settingsSynced: true, lastLogin: new Date().toISOString() },
          isLoading: false,
        });
      },

      syncStats: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 600));
        set({ user: { ...user, settingsSynced: true }, isLoading: false });
      },

      // ── Steam + platform linking ──────────────────────────────────
      loginWithSteam: async () => {
        set({ isLoading: true, error: null });
        const url = buildSteamOpenidUrl();

        if (isTauri()) {
          // Open the Steam login URL in the user's DEFAULT installed web
          // browser (real Steam page, not an in-app WebView). Steam
          // redirects back to our OpenID `return_to` and the callback
          // flow completes in the browser; once signed in the user can
          // navigate back to CastOverlay via the in-app back arrow.
          try {
            await steamLoginUrl(url);
          } catch (err) {
            set({
              isLoading: false,
              error: err instanceof Error ? err.message : "Failed to open Steam login",
            });
            throw err;
          }
          // Resolve immediately — auth completes asynchronously in the
          // external browser; the user returns via the in-app back arrow.
          set({ isLoading: false });
          return;
        }

        // ── Browser dev: simulate successful login after a short delay ──
        if (import.meta.env.DEV) {
          await new Promise((r) => setTimeout(r, 1200));
          const mockSteam: SteamProfile = {
            steamId: "76561198345678901",
            personaName: get().user?.username || "ProGamer",
            avatarUrl:
              get().user?.avatarUrl ||
              "https://steamuserimages-a.akamaihd.net/steam/233xf5vn2mnc7o5ysx7wt/3172566272b708df0708.so.512.jpg",
            level: 57,
            status: "In-Game",
          };
          // (sec. 1) Init Rich Presence + (sec. 2) refresh owned-games library
          void initSteamPresence(mockSteam.steamId);
          setTransientSteamId(mockSteam.steamId);
          void useGameStore.getState().refreshSteamLibrary();
          set({
            user: authorizeUser({
              ...(get().user as UserProfile),
              steam: mockSteam,
              linkedPlatforms: [
                ...((get().user?.linkedPlatforms ?? []).filter(
                  (p) => p.platform !== "steam",
                )),
                { platform: "steam", connected: true, channelOrHandle: mockSteam.steamId },
              ],
              lastLogin: new Date().toISOString(),
            }),
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // Non-dev, non-Tauri: open external browser (legacy path)
        window.location.href = buildSteamOpenidUrl();
      },

      linkPlatform: (platform: Platform, channelOrHandle?: string) => {
        const user = get().user;
        if (!user) return;
        const platforms = user.linkedPlatforms ?? [];
        const next: LinkedPlatform[] = [
          ...platforms.filter((p) => p.platform !== platform),
          { platform, connected: true, channelOrHandle },
        ];
        set({ user: authorizeUser({ ...user, linkedPlatforms: next }) });
      },

      unlinkPlatform: (platform: Platform) => {
        const user = get().user;
        if (!user) return;
        const platforms = (user.linkedPlatforms ?? []).filter(
          (p) => p.platform !== platform
        );
        if (platform === "steam" && user.steam) {
          set({
            user: authorizeUser({ ...user, steam: undefined, linkedPlatforms: platforms }),
          });
        } else {
          set({ user: authorizeUser({ ...user, linkedPlatforms: platforms }) });
        }
      },

      isAuthorized: () => {
        const { user } = get();
        if (!user) return false;
        const platforms = user.linkedPlatforms ?? [];
        const hasSteam =
          !!user.steam?.steamId ||
          platforms.some((p) => p.platform === "steam" && p.connected);
        const hasStream = platforms.some(
          (p) => p.platform !== "steam" && p.connected
        );
        return hasSteam && hasStream;
      },
    }),
    {
      name: "castoverlay-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
