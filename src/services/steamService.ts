import type { GameProfile, SteamProfile } from "../types";

const STEAM_API_KEY: string =
  (import.meta as any).env?.VITE_STEAM_API_KEY ?? "";

const STEAM_API_BASE = "https://api.steampowered.com";

/**
 * Steam CDN image builders — official HD art resolved dynamically per appId.
 * - Vertical Poster: library_600x900_2x
 * - Banner (header): header.jpg
 * - Hero/Capsule: capsule/library_616x353_2x (large hero art)
 */
export const steamPosterUrl = (appId: number | string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`;
export const steamBannerUrl = (appId: number | string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
export const steamHeroUrl = (appId: number | string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_616x353_2x.jpg`;
export const steamLogoUrl = (appId: number | string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/logo.png`;

/** Store URL for a game's Steam storefront page */
export const steamStoreUrl = (appId: number | string) =>
  `https://store.steampowered.com/app/${appId}/`;

/**
 * Open any https URL (e.g. Steam OpenID login page) in the user's default
 * installed web browser — keeps the sign-in flow entirely outside the Tauri
 * WebView while still letting the in-app back arrow continue to work for
 * returning to CastOverlay.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (window.__TAURI__) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("open_external_url", { url });
    return;
  }
  window.open(url, "_blank");
}

/**
 * Open the real Steam OpenID login page (https://steamcommunity.com/openid/login)
 * in the user's default web browser — Steam signs the user in there and
 * redirects back to the `return_to` URL; the user returns to CastOverlay via
 * the in-app back arrow afterwards.
 */
export async function steamLoginUrl(loginUrl: string): Promise<void> {
  return openExternalUrl(loginUrl);
}

/**
 * Open the given game's Steam store page in the user's installed Steam
 * client. Uses `steam://store/<appId>`.
 */
export async function launchSteamStore(appId: number | string): Promise<void> {
  if (!appId || Number(appId) === 0) return;
  if (window.__TAURI__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("launch_steam_store_app", { appId: Number(appId) });
      return;
    } catch { /* fall through */ }
  }
  window.location.href = `steam://store/${Number(appId)}`;
}

/**
 * Open the installed Steam client directly to the checkout cart for the
 * given title (`steam://buy/<appId>`). Steam pre-loads the game into the
 * cart and shows the purchase flow for the player.
 */
export async function buyOnSteam(appId: number | string): Promise<void> {
  if (!appId || Number(appId) === 0) return;
  if (window.__TAURI__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("open_steam_buy", { appId: Number(appId) });
      return;
    } catch { /* fall through */ }
  }
  window.location.href = `steam://buy/${Number(appId)}`;
}

/**
 * Launch the native desktop Steam client at its home page (`steam://open/`).
 */
export async function openSteamClient(): Promise<void> {
  if (window.__TAURI__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("open_steam_client");
      return;
    } catch { /* fall through */ }
  }
  window.location.href = "steam://open/";
}

/**
 * Steam Wallet balance (in units of the user's preferred currency, e.g. "EUR").
 * Uses the public Steam Web API. Returns null if the call fails or the API key
 * is not set.
 */
export async function getExactSteamBalance(
  steamId64: string,
): Promise<number | null> {
  if (!steamId64) return null;
  // Public WalletBalance community endpoint; account-private profiles return 0.
  const url = `https://steamcommunity.com/profiles/${steamId64}/?xml=1&xr=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const xml = await res.text();
    const balanceMatch = xml.match(/balance[^>]*value=\"?(\d+)/i);
    if (balanceMatch) {
      return Number.parseInt(balanceMatch[1], 10);
    }
  } catch { /* ignore */ }
  if (!STEAM_API_KEY) return null;
  const url2 = `${STEAM_API_BASE}/ISteamEconService/GetPlayerWalletBalance/v1/?key=${STEAM_API_KEY}&steamid=${steamId64}`;
  const data = await fetchJson<{
    response: { success: number; balance: number };
  }>(url2);
  const ok = data?.response?.success === 1;
  return ok ? data.response.balance : null;
}

export const iThereAnyDealUrl = (appId: number | string) =>
  `https://www.isthereanydeal.com/games.php?pt=steam&q=&ap=${appId}`;

export const ggDealsUrl = (appId: number | string) =>
  `https://gg.deals/s/steam/app/${appId}`;

/**
 * Fetch the user's owned games (appids) via IPlayerService/GetOwnedGames.
 * Requires the Steam user to have "Show game ownership" enabled in profile
 * settings. Returns null when the call fails (offline / private profile) so
 * callers can decide on a fallback.
 */
export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
}

export async function getOwnedSteamGames(
  steamId64: string,
): Promise<SteamOwnedGame[] | null> {
  if (!steamId64) return null;
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId64}&includeAppinfo=1&filters=apps`;
  const data = await fetchJson<{ response: { games: SteamOwnedGame[] } }>(url);
  const games = data?.response?.games;
  return Array.isArray(games) ? games : null;
}

export async function getOwnedAppIds(
  steamId64: string,
): Promise<number[] | null> {
  const games = await getOwnedSteamGames(steamId64);
  return games?.map((game) => game.appid) ?? null;
}

export interface SteamStoreSearchResult {
  appid: number;
  name: string;
}

export async function searchSteamStore(
  query: string,
  locale = "en",
): Promise<SteamStoreSearchResult[]> {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=${locale}&cc=${locale}`;
  const data = await fetchJson<{
    items?: Array<{ id: number; name: string; type?: string }>;
  }>(url);
  return (data?.items ?? [])
    .filter((item) => item.type === undefined || item.type === "app")
    .map((item) => ({ appid: item.id, name: item.name }));
}

export async function launchSteamGame(appId: number): Promise<void> {
  const steamUrl = `steam://run/${appId}`;
  if (window.__TAURI__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("launch_steam_game", { appId });
      return;
    } catch { /* fall through */ }
  }
  window.location.href = steamUrl;
}

/**
 * Launch a game the user owns on disk: first ask the Tauri Rust command
 * `launch_steam_game` (which scans the installed Steam library folders
 * for a matching install dir and spawns the game's executable directly).
 * If that fails — e.g. local install not found or not running inside Tauri —
 * fall back to the `steam://run/<appId>` protocol handled by the installed
 * Steam client.
 *
 * Returns `true` if the local exe path was found and spawned successfully,
 * `false` if we had to fall back to the Steam client (or Tauri is not
 * available at all).
 */
export async function launchGameLocally(
  appName: string,
  appId: number,
): Promise<boolean> {
  if (!window.__TAURI__) {
    // Browser-only: open the Steam client.
    window.location.href = `steam://run/${appId}`;
    return false;
  }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    try {
      await invoke("launch_steam_game", { appId, appName });
      return true;
    } catch {
      // Local launcher failed (no install found, no api key, etc.) —
      // fall through to the Steam client.
      window.location.href = `steam://run/${appId}`;
      return false;
    }
  } catch {
    window.location.href = `steam://run/${appId}`;
    return false;
  }
}

/**
 * Filter a catalog down to only the games the user actually owns.
 * When `ownedAppIds` is null (API failed / privacy), returns null and the
 * caller should keep the previous assumption (do NOT silently claim ownership).
 */
export async function filterOwnedGames(
  catalog: GameProfile[],
  steamId64: string,
): Promise<GameProfile[] | null> {
  const appId = (g: GameProfile) => Number(g.steamAppId) || 0;
  const owned = await getOwnedAppIds(steamId64);
  if (!owned) return null;
  const ownedSet = new Set(owned);
  // Non-Steam titles (appId 0) belong to the catalog but cannot be verified;
  // keep them in "owned" list if the user has Steam linked at all (they are
  // playable from non-Steam clients). We mark them inSteamLibrary=false later.
  return catalog.filter((g) => appId(g) === 0 || ownedSet.has(appId(g)));
}

const GAME_APP_IDS: Record<string, number> = {
  "counter-strike 2": 730,
  "counter-strike": 730,
  "cs2": 730,
  "cyberpunk 2077": 1091500,
  "cyberpunk": 1091500,
  "dota 2": 570,
  "dota2": 570,
  "rocket league": 252950,
  "rocketleague": 252950,
  "fortnite": 0, // not on Steam
  "apex legends": 1172470,
  "apex": 1172470,
  "valorant": 4319606,
  "rainbow six siege": 359550,
  "rainbow six": 359550,
  "call of duty: warzone": 1559660,
  "warzone": 1559660,
  "elden ring": 1245620,
  "baldur's gate 3": 1086940,
  "bg3": 1086940,
  "gta v": 271590,
  "gta v / fiveM": 271590,
  "fiveM": 271590,
  "minecraft": 271590,
  "rust": 252490,
  "league of legends": 574020,
  "lol": 574020,
  "pubg: battlegrounds": 578080,
  "pubg": 578080,
  "overwatch 2": 634240,
  "overwatch": 634240,
  "forza horizon 5": 1725030,
  "forza": 1725030,
  "ea sports fc 24": 2778860,
  "eafc24": 2778860,
  "tekken 8": 2161900,
  "tekken": 2161900,
  "street fighter 6": 1146450,
  "street fighter": 1146450,
  "sf6": 1146450,
  "hades": 1145360,
  "hades ii": 1145350,
  "hollow knight": 367520,
  "hollow knight: silksong": 1030300,
  "stardew valley": 413150,
  "terraria": 105600,
  "valorant / riot": 0,
  "undertale": 411390,
  "dead by daylight": 381210,
  "doom eternal": 876720,
  "destiny 2": 1085660,
  "warframe": 230410,
  "palworld": 1623730,
};

export function resolveSteamAppId(name: string): number | null {
  const key = name.toLowerCase().trim();
  return GAME_APP_IDS[key] ?? null;
}

async function fetchJson<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getSteamAppDetails(
  appId: number,
): Promise<Partial<GameProfile> | null> {
  if (!appId || appId === 0) return null;
  const url = `${STEAM_API_BASE}/ISteamApps/GetAppDetails/v1/?appids=${appId}&cc=sk`;
  const data = await fetchJson<Record<string, { success: boolean; data: any }>>(
    url,
  );
  const entry = data?.[String(appId)];
  if (!entry?.success || !entry.data) return null;

  const d = entry.data;

  // Build system requirements from pc_requirements (keys vary by game)
  const pcReqs: Record<string, string> = d.pc_requirements ?? {};
  const sysReq = {
    min: {
      cpu: pcReqs["Minimum CPU"] ?? pcReqs["Minimum RAM"] ?? "",
      ram: pcReqs["Minimum RAM"] ?? "",
      gpu: pcReqs["Minimum Graphics"] ?? pcReqs["Minimum GPU"] ?? "",
      disk: pcReqs["Minimum Storage"] ?? pcReqs["Minimum OS"] ?? "",
    },
    rec: {
      cpu: pcReqs["Recommended CPU"] ?? pcReqs["Minimum CPU"] ?? "",
      ram: pcReqs["Recommended RAM"] ?? pcReqs["Recommended RAM"] ?? "",
      gpu: pcReqs["Recommended Graphics"] ?? pcReqs["Recommended GPU"] ?? "",
      disk: pcReqs["Recommended Storage"] ?? pcReqs["Minimum Storage"] ?? "",
    },
  };

  return {
    developer: d.developer || undefined,
    releaseDate: d.release_date?.split(" - ")[0] || undefined,
    logoUrl: d.header_image || undefined,
    bannerUrl: d.header_image || undefined,
    coverUrl: d.header_image || undefined,
    screenshotsUrls:
      typeof d.screenshot === "string"
        ? [d.screenshot]
        : Array.isArray(d.screenshot)
          ? d.screenshot.slice(0, 5)
          : undefined,
    genre: d.genres
      ? d.genres.map((g: { description: string }) => g.description).join(", ")
      : undefined,
    systemRequirements: Object.keys(pcReqs).length > 0 ? sysReq : undefined,
  };
}

export async function getSteamProfile(
  steamId64: string,
): Promise<SteamProfile | null> {
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId64}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = await res.json();
    const p = body?.response?.players?.[0];
    if (!p) return null;

    const statusMap: Record<number, SteamProfile["status"]> = {
      0: "LastSeen",
      1: "Online",
      2: "In-Game",
      3: "Away",
      4: "Snooze",
      5: "Online",
    } as Record<number, SteamProfile["status"]>;

    return {
      steamId: p.steamid,
      personaName: p.persona_name,
      avatarUrl: p.avatarfull,
      level: p.level ?? 1,
      status: (statusMap[p.personastate] as SteamProfile["status"]) ?? "Online",
    };
  } catch {
    return null;
  }
}

/**
 * Enrich a single game with Steam CDN artwork + optionally live API data.
 * The Steam Web API may not be available (no key / CORS), so artwork is
 * always derived from the CDN URLs built from the resolved appId.
 * @param ownedAppIds - optional set of appids the user owns (from
 *   GetOwnedGames). When provided, `inSteamLibrary` is set precisely.
 */
export async function enrichGame(
  game: GameProfile,
  ownedAppIds?: ReadonlySet<number> | null,
): Promise<GameProfile> {
  const appId = Number(game.steamAppId) || resolveSteamAppId(game.name);
  const onSteam = appId > 0;

  // 1) Artwork — always upgrade placeholder images to official CDN art.
  const toSteamCdn = (u: string | undefined): string | undefined =>
    u && !u.includes("steamstatic.com") ? undefined : u;
  const base: GameProfile = onSteam
    ? {
        ...game,
        steamAppId: String(appId),
        coverUrl: toSteamCdn(game.coverUrl) ?? steamPosterUrl(appId),
        bannerUrl: toSteamCdn(game.bannerUrl) ?? steamBannerUrl(appId),
        logoUrl: game.logoUrl ?? steamLogoUrl(appId),
      }
    : game;

  if (ownedAppIds) {
    base.inSteamLibrary = onSteam ? ownedAppIds.has(appId) : false;
  }

  // 2) Live API payload (developer, release date, sysreqs) when possible.
  const apiData = await getSteamAppDetails(appId);
  if (apiData) {
    return { ...base, ...apiData };
  }

  // 3) Mock fallback in dev, keeping CDN artwork + ownership flag intact.
  if (import.meta.env.DEV) {
    const { MOCK_STEAM_GAMES } = await import("../mockData/mockGames");
    const mock = MOCK_STEAM_GAMES.find(
      (m) => Number(m.steamAppId) === appId || m.name.toLowerCase() === game.name.toLowerCase(),
    );
    if (mock) {
      // Preserve CDN artwork and ownership flag over the mock's own values.
      return {
        ...mock,
        ...base,
        steamAppId: String(appId),
      };
    }
  }

  return base;
}

/**
 * Enrich all games. Pass `ownedAppIds` for precise In-Library marking
 * (null = unknown, keep existing flags).
 */
export async function enrichAllGames(
  games: GameProfile[],
  ownedAppIds?: ReadonlySet<number> | null,
): Promise<GameProfile[]> {
  return Promise.all(games.map((g) => enrichGame(g, ownedAppIds)));
}

export async function getSteamAppListTop(limit = 50): Promise<SteamStoreSearchResult[]> {
  const url = `https://api.steampowered.com/ISteamApps/GetAppList/v1/`;
  const data = await fetchJson<{ apps: SteamStoreSearchResult[] }>(url);
  const all = data?.apps ?? [];
  // Sort alphabetically and take top N for quick display
  return all
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Fetch ALL Steam apps (40K+) from the ISteamApps/GetAppList endpoint. */
export async function getAllSteamApps(): Promise<SteamStoreSearchResult[]> {
  const url = `https://api.steampowered.com/ISteamApps/GetAppList/v1/`;
  const data = await fetchJson<{ apps: SteamStoreSearchResult[] }>(url);
  return data?.apps ?? [];
}

/**
 * Free-to-play Steam games granted to platform-only (non-Steam) accounts.
 * All three are officially free on Steam and installable.
 */
export const FREE_STEAM_GAMES: SteamStoreSearchResult[] = [
  { appid: 236390, name: "War Thunder" },
  { appid: 230410, name: "Warframe" },
  { appid: 1085660, name: "Destiny 2" },
];

export default {
  resolveSteamAppId,
  getSteamAppDetails,
  getSteamProfile,
  getOwnedAppIds,
  getOwnedSteamGames,
  searchSteamStore,
  launchSteamGame,
  openExternalUrl,
  steamLoginUrl,
  filterOwnedGames,
  steamPosterUrl,
  steamBannerUrl,
  steamHeroUrl,
  steamLogoUrl,
  steamStoreUrl,
  enrichGame,
  enrichAllGames,
  getSteamAppListTop,
  getAllSteamApps,
  FREE_STEAM_GAMES,
  STEAM_API_KEY,
  STEAM_API_BASE,
};
