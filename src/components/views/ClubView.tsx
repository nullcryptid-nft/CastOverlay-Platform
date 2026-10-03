import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Medal, Users, Check, Lock, Zap } from "lucide-react";
import { useClubStore } from "../../stores/clubStore";
import { useAuthStore } from "../../stores/authStore";
import { localeFor, useTranslation } from "../../i18n";
import { useSettingsStore } from "../../stores/settingsStore";

export const ClubView: React.FC = () => {
  const { points, streakDays, gamesPlayed, badges, leaderboard, resetProgress, refreshLeaderboard } =
    useClubStore();
  const { user } = useAuthStore();
  const t = useTranslation();
  const language = useSettingsStore((state) => state.language);

  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const me = leaderboard.find((e) => e.username === user?.username);

  // Rebuild leaderboard so the local user is always ranked in
  useEffect(() => {
    if (user) {
      refreshLeaderboard(user.username, user.avatarUrl);
    }
  }, [user, points, streakDays, gamesPlayed, refreshLeaderboard]);

  return (
    <div className="space-y-6">
      {/* ── Header / loyalty summary ────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-violet-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Trophy className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wide">
              CastOverlay Club
            </h2>
            <p className="text-xs text-slate-400">
              {t("club.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t("club.points")}</p>
            <p className="text-xl font-black font-mono text-amber-300">
              {points.toLocaleString(localeFor(language))}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
            <p className="text-xl font-black font-mono text-orange-400 flex items-center gap-1">
              <Flame className="h-4 w-4" /> {streakDays}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t("club.games")}</p>
            <p className="text-xl font-black font-mono text-cyan-300">
              {gamesPlayed}
            </p>
          </div>
        </div>
      </div>

      {/* ── Badges grid ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <Medal className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("club.badges")}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {earnedCount}/{badges.length} {t("club.unlocked")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map((badge) => {
            const earned = Boolean(badge.earnedAt);
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-3 flex flex-col items-center space-y-2 transition ${
                  earned
                    ? "border-white/20 bg-slate-950/60"
                    : "border-white/5 bg-slate-950/30 opacity-60"
                }`}
                title={badge.description}
              >
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl shadow-lg ${
                    earned ? `bg-gradient-to-br ${badge.gradient}` : "bg-slate-800 grayscale"
                  }`}
                >
                  {earned ? badge.icon : <Lock className="h-5 w-5 text-slate-500" />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-200">{badge.name}</p>
                  <p className="text-[10px] font-mono text-amber-400/80">
                    +{badge.points} b
                  </p>
                </div>
                {earned && (
                  <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-black" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          {t("club.badgeDescription")}
        </p>

        <div className="mt-3">
          <button
            onClick={resetProgress}
            className="text-[10px] font-bold text-rose-400/70 hover:text-rose-400 transition"
          >
            {t("club.reset")}
          </button>
        </div>
      </div>

      {/* ── Weekly leaderboard ──────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/10 mb-4">
          <Users className="h-4 w-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-slate-200 uppercase">
            {t("club.leaderboard")}
          </h3>
        </div>

        <div className="space-y-1.5">
          {leaderboard.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              {t("club.empty")}
            </p>
          )}
          {leaderboard.map((entry) => {
            const isMe = entry.username === user?.username;
            return (
              <motion.div
                key={entry.username}
                layout
                className={`flex items-center space-x-3 p-2.5 rounded-xl border ${
                  isMe
                    ? "border-cyan-500/40 bg-cyan-500/10"
                    : "border-white/5 bg-slate-950/50"
                }`}
              >
                <span
                  className={`w-8 text-center text-sm font-black font-mono ${
                    entry.rank === 1
                      ? "text-amber-400"
                      : entry.rank === 2
                        ? "text-slate-300"
                        : entry.rank === 3
                          ? "text-orange-400"
                          : "text-slate-500"
                  }`}
                >
                  {entry.rank}
                </span>
                <img
                  src={entry.avatarUrl}
                  alt={entry.username}
                  className="h-7 w-7 rounded-full bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {entry.username} {isMe && <span className="text-cyan-400">({t("club.you")})</span>}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {entry.streakDays} {t("club.daysStreak")} • {entry.gamesPlayed} {t("club.games")}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-amber-300 font-mono text-xs font-bold">
                  <Zap className="h-3 w-3" />
                  {entry.points.toLocaleString(localeFor(language))}
                </div>
              </motion.div>
            );
          })}
          {me && (
            <p className="text-[10px] text-slate-500 mt-2">
              {t("club.rank")} <strong className="text-cyan-400">#{me.rank}</strong> z
              {leaderboard.length}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
