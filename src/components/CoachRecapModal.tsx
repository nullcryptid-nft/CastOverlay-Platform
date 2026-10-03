import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, X, TrendingUp, Trophy, Swords, Target, Zap, MessageCircle, RefreshCw,
} from "lucide-react";
import { useCoachStore } from "../stores/coachStore";
import { useSettingsStore } from "../stores/settingsStore";
import { localeFor, useTranslation } from "../i18n";

interface CoachRecapModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Post-match AI recap modal.
 * Shows performance rating, key stats, AI summary and suggestions.
 * Re-generates the AI summary on demand when an API key is stored.
 */
export const CoachRecapModal: React.FC<CoachRecapModalProps> = ({
  open,
  onClose,
}) => {
  const { lastRecap, generateRecap, matchHistory } = useCoachStore();
  const { ui, language } = useSettingsStore();
  const t = useTranslation();
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = useCallback(async () => {
    if (!lastRecap) return;
    setRegenerating(true);
    const gameName = matchHistory[0]?.gameName ?? "Hra";
    await generateRecap(gameName);
    setRegenerating(false);
  }, [lastRecap, generateRecap, matchHistory]);

  const ratingColor =
    lastRecap && lastRecap.overallRating >= 70
      ? "text-emerald-400"
      : lastRecap && lastRecap.overallRating >= 40
        ? "text-amber-400"
        : "text-rose-400";

  const ratingBg =
    lastRecap && lastRecap.overallRating >= 70
      ? "from-emerald-500/20 to-teal-500/10"
      : lastRecap && lastRecap.overallRating >= 40
        ? "from-amber-500/20 to-orange-500/10"
        : "from-rose-500/20 to-red-500/10";

  return (
    <AnimatePresence>
      {open && lastRecap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl border border-white/15 bg-slate-900/95 backdrop-blur-2xl shadow-2xl w-full max-w-2xl overflow-hidden`}
            style={{ opacity: ui.windowOpacity }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                  <Brain className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-wide">
                    {t("coach.title")}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {matchHistory[0]?.gameName ?? "Neznáma hra"} •{" "}
                    {new Date(lastRecap.createdAt).toLocaleTimeString(localeFor(language))}
                    {lastRecap.aiGenerated && (
                      <span className="ml-1.5 text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        GPT-4o
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Overall Rating */}
              <div
                className={`rounded-xl bg-gradient-to-r ${ratingBg} border border-white/10 p-4 flex items-center space-x-4`}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`text-5xl font-black font-mono ${ratingColor}`}
                >
                  {lastRecap.overallRating}
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t("coach.total")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("coach.basis")}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          lastRecap.overallRating >= 70
                            ? "bg-emerald-400"
                            : lastRecap.overallRating >= 40
                              ? "bg-amber-400"
                              : "bg-rose-400"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${lastRecap.overallRating}%` }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      />
                    </div>
                    <span className={`font-mono text-xs font-bold ${ratingColor}`}>
                      {lastRecap.overallRating >= 70
                        ? "MVP!"
                        : lastRecap.overallRating >= 40
                          ? "OK"
                          : "ŠKOLka"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    icon: <Swords className="h-3.5 w-3.5" />,
                    label: t("coach.kd"),
                    value: String(lastRecap.kdRatio),
                    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
                  },
                  {
                    icon: <Trophy className="h-3.5 w-3.5" />,
                    label: t("coach.winrate"),
                    value: `${Math.round(lastRecap.winRateSession * 100)}%`,
                    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                  },
                  {
                    icon: <Zap className="h-3.5 w-3.5" />,
                    label: t("coach.kills"),
                    value: String(lastRecap.totalKills),
                    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
                  },
                  {
                    icon: <Target className="h-3.5 w-3.5" />,
                    label: t("coach.bestStreak"),
                    value: String(lastRecap.bestStreak),
                    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center ${stat.color}`}
                  >
                    <span className="mb-1">{stat.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <span className="text-xl font-black font-mono text-white mt-1">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-3.5 w-3.5 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {lastRecap.aiGenerated ? t("coach.analysis") : t("coach.tactics")}
                  </h4>
                  {lastRecap.aiGenerated && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                      OpenAI
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lastRecap.aiSummary}
                </p>
                <ul className="space-y-1.5 pt-1">
                  {lastRecap.aiSuggestions.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-start space-x-2 text-[11px] text-slate-300"
                    >
                      <TrendingUp className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Regenerate button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/10 transition"
                >
                  {t("coach.close")}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`}
                  />
                  <span>
                    {regenerating ? t("coach.generating") : t("coach.regenerate")}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
