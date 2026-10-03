import React from "react";
import { motion } from "framer-motion";
import { Brain, Clock, RotateCcw, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useCoachStore } from "../stores/coachStore";

/**
 * Compact tilt level indicator shown in the top bar.
 * Color ramps green → amber → red as tilt increases.
 */
export const TiltMeter: React.FC = () => {
  const { tilt, isTilted, resetTilt } = useCoachStore();

  const color =
    tilt.level < 30
      ? "bg-emerald-500"
      : tilt.level < 60
        ? "bg-amber-500"
        : tilt.level < 80
          ? "bg-orange-500"
          : "bg-rose-500";

  const textClass =
    tilt.level < 30
      ? "text-emerald-400"
      : tilt.level < 60
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <button
      onClick={resetTilt}
      title="Zresetovať tilt (po 3 prehách sa spomaľuje)"
      className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-[11px] font-semibold transition ${
        isTilted
          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
          : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700"
      }`}
    >
      <Brain className={`h-3.5 w-3.5 ${isTilted ? "text-rose-400" : "text-cyan-400"}`} />
      <span className="hidden sm:inline">{isTilted ? "TILT!" : "AI COACH"}</span>
      <div className="w-14 bg-slate-900 rounded-full overflow-hidden h-1.5">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${tilt.level}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className={`font-mono text-[10px] ${textClass}`}>
        {Math.round(tilt.level)}%
      </span>
    </button>
  );
};

/**
 * Full-screen 5-min break overlay that appears when the player is tilted.
 * Shown only in dashboard mode (not overlay HUD).
 */
export const TiltRestBanner: React.FC = () => {
  const { showRestReminder, dismissRestReminder, tilt } = useCoachStore();

  return (
    <AnimatePresence>
      {showRestReminder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/80 backdrop-blur-xl shadow-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-300">
                ⚠️ AI Coach: Pauza!
              </h4>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Prehral si <strong>{tilt.lossStreak}</strong> zápasy za sebou.
                Odporúčam 5 minútový odpočinok — napij sa vody, natiahni sa a
                vráť sa s čerstvou hlavou.
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={dismissRestReminder}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1" />
                  Prestať a pokračovať
                </button>
                <span className="text-[10px] text-amber-500/60">
                  Tilt meter: {Math.round(tilt.level)}%
                </span>
              </div>
            </div>
            <button
              onClick={dismissRestReminder}
              className="p-1 rounded hover:bg-white/10 text-amber-500/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
