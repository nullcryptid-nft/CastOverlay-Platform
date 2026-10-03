import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CoachRecap,
  CoachState,
  MatchResult,
  TiltMetrics,
} from "../types";

// ── Tilt computation ───────────────────────────────────────────
function computeTilt(t: TiltMetrics): TiltMetrics {
  // Each consecutive loss adds 15 points; wins reduce by 10
  let level = t.level;
  level += t.lossStreak * 0; // already encoded in level
  level = Math.max(0, Math.min(100, level));
  return { ...t, level, lastUpdated: new Date().toISOString() };
}

const initialTilt: TiltMetrics = {
  level: 0,
  lossStreak: 0,
  winStreak: 0,
  todayHours: 0,
  lastUpdated: new Date().toISOString(),
};

// ── Statistics helpers ─────────────────────────────────────────
function sessionStats(history: MatchResult[]) {
  if (history.length === 0)
    return {
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      wins: 0,
      bestStreak: 0,
      kdRatio: 0,
      winRate: 0,
      avgAccuracy: 0,
    };

  const totalKills = history.reduce((s, m) => s + m.kills, 0);
  const totalDeaths = history.reduce((s, m) => s + m.deaths, 0);
  const totalAssists = history.reduce((s, m) => s + m.assists, 0);
  const wins = history.filter((m) => m.won).length;
  const bestStreak = Math.max(...history.map((m) => m.bestStreak));
  const kdRatio = totalDeaths > 0 ? +(totalKills / totalDeaths).toFixed(2) : totalKills;
  const winRate = +(wins / history.length).toFixed(3);
  const avgAccuracy = +(
    history.reduce((s, m) => s + m.accuracy, 0) / history.length
  ).toFixed(3);

  return {
    totalKills,
    totalDeaths,
    totalAssists,
    wins,
    bestStreak,
    kdRatio,
    winRate,
    avgAccuracy,
  };
}

// ── Rule-based fallback recap ──────────────────────────────────
function buildRuleBasedRecap(
  matchId: string,
  history: MatchResult[],
  gameName: string,
): CoachRecap {
  const s = sessionStats(history);
  const last = history[0];

  // Overall rating: blend K/D, win, and accuracy
  const rating = Math.min(
    100,
    Math.round(
      40 * Math.min(1, s.kdRatio / 1.5) +
        30 * s.winRate +
        20 * s.avgAccuracy +
        10 * Math.min(1, s.bestStreak / 8),
    ),
  );

  const suggestions: string[] = [];
  if (s.kdRatio < 0.8)
    suggestions.push(
      `Tvoje K/D (${s.kdRatio}) je pod 1. Počkaj s výstrelom — nechaj Kill už屈服iteľný.`,
    );
  if (s.winRate < 0.4)
    suggestions.push(
      "Vlayers hodinách hráš menej jako duo/štvorca — zmeň koordináciu.",
    );
  if (s.avgAccuracy < 0.25)
    suggestions.push(
      "Pristraľ sa na headshotsa (sprahovost " +
        Math.round(s.avgAccuracy * 100) +
        "% — cieľ je 35%).",
    );
  if (last && last.won && s.kdRatio >= 1)
    suggestions.push(
      "Návy年的发展 je výborný — drži tempá a experimentuj s novej streš相似文献.",
    );
  if (suggestions.length === 0)
    suggestions.push(
      "Solny výkon! Skús posunúť sa do vyššej divízie alebo zdielej clipboard.",
    );

  const summary = last
    ? `Tento zápas v hre ${gameName} si mal ratio ${s.kdRatio},最伟大的 streak bol ${Math.max(...history.map((m) => m.bestStreak))} killov. Celkové winrate za session je ${Math.round(s.winRate * 100)}%.`
    : "Stihol si hru — bez dát z matchów zobrazujem systematický advice.";

  return {
    matchId,
    overallRating: rating,
    kdRatio: s.kdRatio,
    winRateSession: s.winRate,
    bestStreak: s.bestStreak,
    totalKills: s.totalKills,
    totalDeaths: s.totalDeaths,
    aiSummary: summary,
    aiSuggestions: suggestions,
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  };
}

// ── AI API call (OpenAI-compatible) ────────────────────────────
const AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// If user has set a custom key in localStorage, use it; otherwise fall back
function getAiKey(): string | null {
  try {
    return localStorage.getItem("castoverlay-ai-key");
  } catch {
    return null;
  }
}

async function callAiRecap(
  matchId: string,
  history: MatchResult[],
  gameName: string,
): Promise<CoachRecap | null> {
  const apiKey = getAiKey();
  if (!apiKey) return null;

  const s = sessionStats(history);
  const last = history[0];

  // Build a safe, JSON payload
  const matchData = {
    game: gameName,
    lastMatch: last
      ? {
          won: last.won,
          K: last.kills,
          D: last.deaths,
          A: last.assists,
          bestStreak: last.bestStreak,
          dmg: last.damageDealt,
          acc: Math.round(last.accuracy * 100) + "%",
          duration: last.durationMin + " min",
        }
      : undefined,
    session: {
      matches: history.length,
      K: s.totalKills,
      D: s.totalDeaths,
      A: s.totalAssists,
      Kd: s.kdRatio,
      WinRate: Math.round(s.winRate * 100) + "%",
      BestStreak: s.bestStreak,
      AvgAcc: Math.round(s.avgAccuracy * 100) + "%",
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly FPS game coach. Respond with ONLY valid JSON: " +
              '{"summary":"one paragraph in Slovak max 80 words","suggestions":["tip1","tip2","tip3"]}.' ,
          },
          {
            role: "user",
            content: JSON.stringify(matchData, null, 2),
          },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json: {
      choices: Array<{ message: { content: string } }>;
    } = await res.json();
    const raw = json.choices[0]?.message?.content?.trim() ?? "";

    // Parse only JSON block from content
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary: string;
      suggestions: string[];
    };

    if (!parsed.summary || !Array.isArray(parsed.suggestions)) return null;

    const rating = Math.min(
      100,
      Math.round(
        40 * Math.min(1, s.kdRatio / 1.5) +
          30 * s.winRate +
          20 * s.avgAccuracy +
          10 * Math.min(1, s.bestStreak / 8),
      ),
    );

    return {
      matchId,
      overallRating: rating,
      kdRatio: s.kdRatio,
      winRateSession: s.winRate,
      bestStreak: s.bestStreak,
      totalKills: s.totalKills,
      totalDeaths: s.totalDeaths,
      aiSummary: parsed.summary,
      aiSuggestions: parsed.suggestions.slice(0, 4),
      aiGenerated: true,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Export helper ──────────────────────────────────────────────
/** Call directly from anywhere (e.g. gameStore on victory/defeat) */
export function recordMatch(
  gameName: string,
  result: Omit<MatchResult, "id" | "finishedAt" | "gameName">,
): MatchResult {
  return useCoachStore.getState().addMatchResult({ ...result, gameName });
}

/** Convenience: call AI recap after a match */
export async function autoGenerateRecap(gameName: string): Promise<CoachRecap> {
  return useCoachStore.getState().generateRecap(gameName);
}

// ── Store ──────────────────────────────────────────────────────
export const useCoachStore = create<CoachState>()(
  persist(
    (set, get) => ({
      tilt: { ...initialTilt },
      isTilted: false,
      matchHistory: [],
      lastRecap: null,
      showRestReminder: false,
      recaps: [],

      addMatch: (game: string, result: MatchResult) => {
        const match: MatchResult = { ...result, gameName: game, id: crypto.randomUUID(), finishedAt: new Date().toISOString() };
        set((state) => ({ matchHistory: [match, ...state.matchHistory] }));
        get().updateTiltAfterMatch(result);
      },

      updateTilt: (partial) => {
        const { tilt } = get();
        let next = { ...tilt, ...partial };

        // Recompute level
        if (partial.lossStreak !== undefined) {
          next.level = Math.min(100, (partial.lossStreak ?? 0) * 20);
        }
        next = computeTilt(next);
        set({ tilt: next, isTilted: next.lossStreak >= 3 });
      },

      recordLoss: () => {
        const { tilt } = get();
        const next = computeTilt({
          ...tilt,
          lossStreak: tilt.lossStreak + 1,
          winStreak: 0,
          level: Math.min(100, (tilt.lossStreak + 1) * 20),
          todayHours: tilt.todayHours + 0.15,
        });
        set({
          tilt: next,
          isTilted: next.lossStreak >= 3,
          showRestReminder: next.lossStreak >= 3,
        });
      },

      recordWin: () => {
        const { tilt } = get();
        const next = computeTilt({
          ...tilt,
          lossStreak: 0,
          winStreak: tilt.winStreak + 1,
          level: Math.max(0, tilt.level - 20),
          todayHours: tilt.todayHours + 0.15,
        });
        set({
          tilt: next,
          isTilted: false,
          showRestReminder: false,
        });
      },

      resetTilt: () =>
        set({
          tilt: { ...initialTilt, lastUpdated: new Date().toISOString() },
          isTilted: false,
          showRestReminder: false,
        }),

      addMatchResult: (result) => {
        const match: MatchResult = {
          ...result,
          gameName: result.gameName || "Neznáma hra",
          id: crypto.randomUUID(),
          finishedAt: new Date().toISOString(),
        };
        const { matchHistory } = get();
        // Push newest first, cap at 50
        const updated = [match, ...matchHistory].slice(0, 50);
        set({ matchHistory: updated });

        // Track tilt
        if (result.won) get().recordWin();
        else get().recordLoss();

        return match;
      },

      clearMatchHistory: () => set({ matchHistory: [] }),

      dismissRestReminder: () => set({ showRestReminder: false }),

      generateRecap: async (gameName: string) => {
        const { matchHistory } = get();
        const matchId = matchHistory[0]?.id ?? "unknown";

        // Try AI first, fall back gracefully
        let recap = await callAiRecap(matchId, matchHistory, gameName);
        if (!recap) {
          recap = buildRuleBasedRecap(matchId, matchHistory, gameName);
        }

        set({ lastRecap: recap });
        return recap;
      },

      clearRecap: () => set({ lastRecap: null }),

      updateTiltAfterMatch: (result: MatchResult) => {
        if (result.won) get().recordWin();
        else get().recordLoss();
      },
    }),
    {
      name: "castoverlay-coach",
      partialize: (state) => ({
        tilt: state.tilt,
        matchHistory: state.matchHistory,
        lastRecap: state.lastRecap,
        showRestReminder: state.showRestReminder,
      }),
    },
  ),
);
