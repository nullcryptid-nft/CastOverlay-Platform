import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Badge, ClubState, LeaderboardEntry } from "../types";

// ── Badge catalog ──────────────────────────────────────────────
const BADGE_CATALOG: Badge[] = [
  {
    id: "first-session",
    name: "Prvá hra",
    description: "Spusti prvý overlay",
    icon: "🎮",
    gradient: "from-cyan-500 to-blue-600",
    points: 50,
  },
  {
    id: "win-streak",
    name: "Séria víťazstiev",
    description: "3 výhry za sebou s aktivným overlayom",
    icon: "🔥",
    gradient: "from-emerald-500 to-teal-600",
    points: 150,
  },
  {
    id: "cluttered-hud",
    name: "HUD Master",
    description: "Vytvor a exportuj vlastný HUD profil",
    icon: "🎨",
    gradient: "from-purple-500 to-pink-600",
    points: 100,
  },
  {
    id: "meme-maker",
    name: "Meme Engineer",
    description: "Nahraj vlastný zvuk do soundboardu",
    icon: "🔊",
    gradient: "from-amber-500 to-orange-600",
    points: 80,
  },
  {
    id: "clip-art",
    name: "Clipping Artist",
    description: "Ulož prvý replay klip",
    icon: "🎬",
    gradient: "from-rose-500 to-red-600",
    points: 120,
  },
  {
    id: "streak-7",
    name: "7 dní bez zámky",
    description: "7 dní po sebe s aktivovaným overlayom",
    icon: "🔥",
    gradient: "from-yellow-400 to-amber-500",
    points: 300,
  },
  {
    id: "grinder",
    name: "Grinder",
    description: "Odoň 25 zápasov s overlayom",
    icon: "💪",
    gradient: "from-indigo-500 to-violet-600",
    points: 400,
  },
];

// ── Simulated community for leaderboard ────────────────────────
const COMMUNITY_PLAYERS: Array<Omit<LeaderboardEntry, "rank">> = [
  { username: "CyberNinja", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberNinja", points: 8420, streakDays: 21, gamesPlayed: 312 },
  { username: "ProGamerX", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamerX", points: 7985, streakDays: 18, gamesPlayed: 298 },
  { username: "StreamQueen", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=StreamQueen", points: 7210, streakDays: 14, gamesPlayed: 267 },
  { username: "TiltMaster", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TiltMaster", points: 6540, streakDays: 12, gamesPlayed: 244 },
  { username: "AimBot", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AimBot", points: 5980, streakDays: 11, gamesPlayed: 221 },
  { username: "NoScope99", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NoScope99", points: 5320, streakDays: 9, gamesPlayed: 198 },
  { username: "GhostMain", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GhostMain", points: 4740, streakDays: 8, gamesPlayed: 176 },
  { username: "ClutchLass", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ClutchLass", points: 4120, streakDays: 7, gamesPlayed: 154 },
  { username: "FlickKiller", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=FlickKiller", points: 3650, streakDays: 6, gamesPlayed: 141 },
  { username: "LagLord", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LagLord", points: 3080, streakDays: 5, gamesPlayed: 118 },
];

// ── Helpers ────────────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const INITIAL_BADGES = BADGE_CATALOG.map((b) => ({ ...b }));

export const useClubStore = create<ClubState>()(
  persist(
    (set) => ({
      points: 0,
      streakDays: 0,
      lastActiveDate: null,
      gamesPlayed: 0,
      badges: INITIAL_BADGES,
      leaderboard: [],

      checkIn: (opts) => {
        set((state) => {
          const today = todayISO();
          const streak =
            state.lastActiveDate === today ||
            state.lastActiveDate === yesterdayISO() ||
            state.lastActiveDate === null
              ? (state.lastActiveDate === today
                  ? state.streakDays
                  : state.streakDays + 1)
              : 1;

          let points = state.points + 25; // base check-in bonus
          let badges = state.badges;

          // Win bonus + win-streak badge
          if (opts?.won) {
            points += 75;
          }

          // First session badge
          if (state.gamesPlayed === 0) {
            badges = badges.map((b) =>
              b.id === "first-session"
                ? { ...b, earnedAt: new Date().toISOString() }
                : b
            );
          }
          // Grinder badge
          if (state.gamesPlayed >= 24) {
            badges = badges.map((b) =>
              b.id === "grinder" && !b.earnedAt
                ? { ...b, earnedAt: new Date().toISOString() }
                : b
            );
          }
          // 7-day streak badge
          if (streak >= 7) {
            badges = badges.map((b) =>
              b.id === "streak-7" && !b.earnedAt
                ? { ...b, earnedAt: new Date().toISOString() }
                : b
            );
          }

          return {
            points,
            streakDays: streak,
            lastActiveDate: today,
            gamesPlayed: state.gamesPlayed + 1,
            badges,
          };
        });
      },

      earnPoints: (n) => {
        set((state) => ({ points: state.points + n }));
      },

      refreshLeaderboard: (username, avatarUrl) => {
        set((state) => {
          const merged: (LeaderboardEntry | Omit<LeaderboardEntry, "rank">)[] = [
            ...COMMUNITY_PLAYERS,
            {
              username,
              avatarUrl,
              points: state.points,
              streakDays: state.streakDays,
              gamesPlayed: state.gamesPlayed,
            },
          ].sort((a, b) => b.points - a.points);

          merged.forEach((entry, i) => (entry as LeaderboardEntry).rank = i + 1);
          return { leaderboard: merged.slice(0, 15) as LeaderboardEntry[] };
        });
      },

      resetProgress: () => {
        set({
          points: 0,
          streakDays: 0,
          lastActiveDate: null,
          gamesPlayed: 0,
          badges: INITIAL_BADGES.map((b) => ({ ...b })),
          leaderboard: [],
        });
      },

      awardBadge: (id: string) => {
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === id && !b.earnedAt
              ? { ...b, earnedAt: new Date().toISOString() }
              : b
          ),
          points: state.points + (state.badges.find((b) => b.id === id)?.points ?? 0),
        }));
      },
    }),
    {
      name: "castoverlay-club",
      partialize: (state) => ({
        points: state.points,
        streakDays: state.streakDays,
        lastActiveDate: state.lastActiveDate,
        gamesPlayed: state.gamesPlayed,
        badges: state.badges,
      }),
    },
  ),
);

/** Convenience action: award a specific badge by id */
export function awardBadge(id: string): void {
  useClubStore.setState((state) => ({
    badges: state.badges.map((b) =>
      b.id === id && !b.earnedAt
        ? { ...b, earnedAt: new Date().toISOString() }
        : b
    ),
    points: state.points + (state.badges.find((b) => b.id === id)?.points ?? 0),
  }));
}