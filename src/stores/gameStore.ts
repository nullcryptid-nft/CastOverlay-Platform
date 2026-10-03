import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState, GameProfile, StatPreset } from "../types";
import { GAME_PROFILES, GAME_CATEGORIES } from "../data/games";
import { recordMatch } from "./coachStore";
import { useClubStore, awardBadge } from "./clubStore";
import {
  enrichAllGames,
  getOwnedSteamGames,
  steamBannerUrl,
  steamPosterUrl,
} from "../services/steamService";

const fallbackStats: StatPreset = {
  stat1Label: "WINS", stat1: 0,
  stat2Label: "LOSSES", stat2: 0,
  stat3Label: "KILLS", stat3: 0,
  stat4Label: "DEATHS", stat4: 0,
};

function randomStreak(max: number) {
  return Math.floor(Math.random() * max);
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      selectedGame: null,
      ownedGames: [],
      /**
       * Catalog list of all games (owned + unowned) after Steam enrichment.
       * null = not yet enriched. Non-null = full set with correct
       * `inSteamLibrary` flags; the "catalog" tab filters on this.
       */
      catalogGames: null,
      /**
       * AppIds of games the user actually owns on Steam, resolved via
       * IPlayerService/GetOwnedGames on the last successful login. Keep in a
       * dedicated slot so the UI can be re-filtered on re-login.
       */
      ownedAppIds: null as number[] | null,
      steamLibraryGames: null,
      sessionStats: fallbackStats,
      selectedCategory: "All",
      searchQuery: "",
      stressMode: false,
      victoryBanner: false,

      setSelectedGame: (game: GameProfile) => {
        set({
          selectedGame: game,
          sessionStats: game.defaultStats,
        });
      },

      setOwnedGames: (games: GameProfile[]) => {
        const selected = get().selectedGame;
        const stillSelected = !!(selected && games.includes(selected));
        set({
          ownedGames: games,
          selectedGame:
            stillSelected && selected ? selected : (games[0] ?? null),
        });
      },

      updateSessionStats: (stats: Partial<StatPreset>) => {
        set((state) => ({
          sessionStats: { ...state.sessionStats, ...stats },
        }));
      },

      updateSingleStat: (key: keyof StatPreset, delta: number) => {
        set((state) => {
          const currentVal =
            typeof state.sessionStats[key] === "number"
              ? (state.sessionStats[key] as number)
              : 0;
          return {
            sessionStats: {
              ...state.sessionStats,
              [key]: Math.max(0, currentVal + delta),
            },
          };
        });
      },

      resetSessionStats: () => {
        const { selectedGame } = get();
        set({ sessionStats: selectedGame?.defaultStats || fallbackStats });
      },

      setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setStressMode: (enabled: boolean) => {
        set({ stressMode: enabled });
      },

      triggerVictory: () => {
        const { sessionStats, selectedGame } = get();
        recordMatch(selectedGame.name, {
          won: true,
          kills: Math.max(1, Math.round((sessionStats.stat3 || 5) * 0.6)),
          deaths: Math.max(0, Math.round((sessionStats.stat2 || 3) * 0.8)),
          assists: Math.round((sessionStats.stat4 || 2) * 0.5),
          bestStreak: randomStreak(8) + 2,
          damageDealt: Math.round((sessionStats.stat3 || 5) * 84),
          accuracy: 0.22 + Math.random() * 0.18,
          durationMin: 12 + Math.floor(Math.random() * 10),
        });
        // CastOverlay Club: check in + streak
        useClubStore.getState().checkIn({ won: true });
        awardBadge("win-streak");
        set({
          victoryBanner: true,
          sessionStats: {
            ...sessionStats,
            stat1: Math.min(999, sessionStats.stat1 + 1),
            stat3: Math.min(99, sessionStats.stat3 + 2),
          },
        });
        setTimeout(() => set({ victoryBanner: false }), 3500);
      },

      triggerDefeat: () => {
        const { sessionStats, selectedGame } = get();
        recordMatch(selectedGame.name, {
          won: false,
          kills: Math.max(0, Math.round((sessionStats.stat3 || 3) * 0.3)),
          deaths: Math.max(1, Math.round((sessionStats.stat3 || 5) * 0.9)),
          assists: Math.round((sessionStats.stat4 || 2) * 0.3),
          bestStreak: randomStreak(3) + 1,
          damageDealt: Math.round((sessionStats.stat3 || 3) * 60),
          accuracy: 0.15 + Math.random() * 0.12,
          durationMin: 8 + Math.floor(Math.random() * 12),
        });
        // CastOverlay Club: check in (no win bonus)
        useClubStore.getState().checkIn({ won: false });
        set({
          sessionStats: {
            ...sessionStats,
            stat2: Math.min(999, sessionStats.stat2 + 1),
          },
        });
      },

      // ── Dynamic Steam library detection (sec. 2) ──────────────────
      // Uses IPlayerService/GetOwnedGames (via the transient steamId set by
      // authStore on Steam login) to precisely mark which games the user
      // actually owns. Falls back to the full catalog (no ownership claims)
      // when the API is unavailable.
      refreshSteamLibrary: async () => {
        try {
          const steamId = _transientSteamId;
          const steamGames = steamId ? await getOwnedSteamGames(steamId) : null;
          const ownedSet = steamGames ? new Set(steamGames.map((game) => game.appid)) : null;
          const enrichedCatalog = await enrichAllGames(GAME_PROFILES, ownedSet ?? undefined);
          const profilesByAppId = new Map(
            enrichedCatalog
              .filter((game) => Number(game.steamAppId) > 0)
              .map((game) => [Number(game.steamAppId), game]),
          );
          const steamLibrary = steamGames?.map((game) => {
            const knownProfile = profilesByAppId.get(game.appid);
            if (knownProfile) {
              return {
                ...knownProfile,
                name: game.name || knownProfile.name,
                hoursPlayed: game.playtime_forever / 60,
                inSteamLibrary: true,
              };
            }
            return {
              id: `steam-${game.appid}`,
              name: game.name,
              genre: "Steam hra",
              category: "All",
              accentColor: "from-cyan-500 to-blue-600",
              glowColor: "rgba(6,182,212,0.4)",
              badge: "STEAM KNIŽNICA",
              activePlayers: "—",
              targetFps: 60,
              coverUrl: steamPosterUrl(game.appid),
              bannerUrl: steamBannerUrl(game.appid),
              steamAppId: String(game.appid),
              hoursPlayed: game.playtime_forever / 60,
              inSteamLibrary: true,
              defaultStats: {
                stat1Label: "WINS",
                stat1: 0,
                stat2Label: "LOSSES",
                stat2: 0,
                stat3Label: "KILLS",
                stat3: 0,
                stat4Label: "DEATHS",
                stat4: 0,
              },
            };
          }) ?? null;
          const owned = steamLibrary
            ? steamLibrary
            : enrichedCatalog;
          set({
            ownedGames: owned,
            ownedAppIds: ownedSet ? Array.from(ownedSet) : null,
            catalogGames: enrichedCatalog,
            steamLibraryGames: steamLibrary,
          });
        } catch {
          set({
            steamLibraryGames: null,
            catalogGames: get().catalogGames ?? [...GAME_PROFILES],
            ownedGames: get().ownedGames?.length ? get().ownedGames : [...GAME_PROFILES],
          });
        }
      },

      // Apply ownership after re-login / manual re-sync.
      setOwnedAppIds: (ids: number[] | null) => {
        set({ ownedAppIds: ids });
        const catalog = get().catalogGames;
        if (!catalog) return;
        const ownedSet = ids ? new Set(ids) : null;
        const nextCatalog = catalog.map((g) => ({
          ...g,
          inSteamLibrary: ownedSet
            ? ownedSet.has(Number(g.steamAppId) || 0)
            : g.inSteamLibrary,
        }));
        set({
          catalogGames: nextCatalog,
          ownedGames: ownedSet
            ? nextCatalog.filter((g) => g.inSteamLibrary)
            : nextCatalog,
        });
      },
    }),
    {
      name: "castoverlay-game",
      partialize: (state) => ({
        selectedGame: state.selectedGame,
        sessionStats: state.sessionStats,
        selectedCategory: state.selectedCategory,
        ownedAppIds: state.ownedAppIds,
      }),
    },
  ),
);


/**
 * Transient steamId64 channel (authStore → gameStore).
 * Set by authStore.loginWithSteam after successful authentication;
 * consumed by refreshSteamLibrary / getOwnedSet.
 */
let _transientSteamId: string | null = null;
export function setTransientSteamId(id: string | null) {
  _transientSteamId = id;
}
export function getTransientSteamId(): string | null {
  return _transientSteamId;
}

export { GAME_CATEGORIES };
export { GAME_PROFILES as EXTENDED_GAME_PROFILES };
