import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { useOverlayStore } from "../../stores/overlayStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useLayoutStudioStore } from "../../stores/layoutStudioStore";
import { useHudDrag } from "../../hooks/useHudDrag";
import { startChatSimulation } from "../../stores/chatOverlayStore";
import { ChatOverlayPanel } from "../ChatOverlayPanel";
import type { StatPreset } from "../../types";
import { useTranslation } from "../../i18n";

interface OverlayHUDProps {
  onReturnToDashboard: () => void;
  onToggleSafeZone?: () => void;
}

export const OverlayHUD: React.FC<OverlayHUDProps> = ({
  onReturnToDashboard,
  onToggleSafeZone,
}) => {
  const {
    selectedGame,
    sessionStats,
    updateSingleStat,
    resetSessionStats,
    triggerVictory,
  } = useGameStore();
  const { hardware, isLocked, setLocked } = useOverlayStore();
  const { ui } = useSettingsStore();
  const t = useTranslation();
  const { elements, selectElement, selectedId } =
    useLayoutStudioStore();
  const { onElementMouseDown } = useHudDrag();

  // Start simulated multi-platform chat feed
  useEffect(() => {
    const stop = startChatSimulation(3500);
    return stop;
  }, []);

  const getMetricColor = (val: number, thresholds = [60, 85]) => {
    if (val < thresholds[0]) return "text-emerald-400";
    if (val < thresholds[1]) return "text-amber-400";
    return "text-rose-500";
  };

  const statItems: Array<{
    key: keyof StatPreset;
    labelKey: keyof StatPreset;
    color: string;
  }> = [
    {
      key: "stat1",
      labelKey: "stat1Label",
      color: "border-emerald-500/40 text-emerald-400",
    },
    {
      key: "stat2",
      labelKey: "stat2Label",
      color: "border-rose-500/40 text-rose-400",
    },
    {
      key: "stat3",
      labelKey: "stat3Label",
      color: "border-cyan-500/40 text-cyan-400",
    },
    {
      key: "stat4",
      labelKey: "stat4Label",
      color: "border-purple-500/40 text-purple-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 p-4 flex flex-col justify-between pointer-events-auto z-50 select-none overflow-hidden font-sans"
      style={{
        transform: `scale(${ui.hudScale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Top Floating Mini-Bar | id="topbar" */}
      {/* @layout-el:topbar */}
      <div
        data-hud-el="topbar"
        className={`absolute rounded-2xl border p-2.5 shadow-2xl flex items-center space-x-3 backdrop-blur-2xl ${
          selectedId === "topbar"
            ? "border-cyan-400 ring-2 ring-cyan-400/40"
            : "border-white/15"
        }`}
        style={{
          left: `${elements.find((e) => e.id === "topbar")?.x ?? 2}%`,
          top: `${elements.find((e) => e.id === "topbar")?.y ?? 2}%`,
          width: `${elements.find((e) => e.id === "topbar")?.w ?? 38}%`,
          opacity: (elements.find((e) => e.id === "topbar")?.opacity ?? 0.92) * ui.windowOpacity,
          pointerEvents: "auto",
          cursor: isLocked ? "not-allowed" : "move",
          background: "rgba(2, 6, 16, 0.85)",
        }}
        onMouseDown={isLocked ? undefined : onElementMouseDown("topbar")}
        onMouseEnter={() => selectElement("topbar")}
      >
        <button
          onClick={onReturnToDashboard}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-white border border-white/10 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
          <span>{t("hud.mainMenu")}</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10" />

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase">
            {selectedGame.name}
          </span>
          <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-mono">
            {selectedGame.badge}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Live Hardware Minimal Telemetry */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-slate-400">
            CPU:{" "}
            <strong className={getMetricColor(hardware.cpu)}>
              {hardware.cpu}%
            </strong>
          </span>
          <span className="text-slate-400">
            RAM:{" "}
            <strong className="text-purple-400">{hardware.ramUsed}G</strong>
          </span>
          <span className="text-slate-400">
            FPS: <strong className="text-cyan-400">{hardware.fps}</strong>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        <button
          onClick={triggerVictory}
          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
          title={t("hud.simulateWin")}
        >
          <Trophy className="h-4 w-4" />
        </button>

        <button
          onClick={() => setLocked(!isLocked)}
          className={`p-1.5 rounded-lg border transition ${
            isLocked
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-slate-800 text-slate-400 border-white/10"
          }`}
          title={t("hud.lockPosition")}
        >
          {isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </button>

        {onToggleSafeZone && (
          <button
            onClick={onToggleSafeZone}
            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition"
            title={t("hud.safeZone")}
          >
            <Shield className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Interactive Floating HUD Card | id="metrics" */}
      <div
        data-hud-el="metrics"
        className={`absolute rounded-2xl border backdrop-blur-2xl p-4 shadow-2xl space-y-3 ${
          selectedId === "metrics"
            ? "border-cyan-400 ring-2 ring-cyan-400/40"
            : "border-white/15"
        }`}
        style={{
          left: `${elements.find((e) => e.id === "metrics")?.x ?? 60}%`,
          top: `${elements.find((e) => e.id === "metrics")?.y ?? 8}%`,
          width: `${elements.find((e) => e.id === "metrics")?.w ?? 38}%`,
          opacity: (elements.find((e) => e.id === "metrics")?.opacity ?? 0.92) * ui.windowOpacity,
          pointerEvents: "auto",
          cursor: isLocked ? "not-allowed" : "move",
          background: "rgba(2, 6, 16, 0.85)",
        }}
        onMouseDown={isLocked ? undefined : onElementMouseDown("metrics")}
        onMouseEnter={() => selectElement("metrics")}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black tracking-wider text-white uppercase">
              {t("hud.liveMetrics")}
            </span>
          </div>

          <button
            onClick={resetSessionStats}
            className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("hud.reset")}</span>
          </button>
        </div>

        {/* Counter items in compact HUD layout */}
        <div className="grid grid-cols-2 gap-2.5">
          {statItems.map((item) => {
            const label = String(sessionStats[item.labelKey]);
            const val = Number(sessionStats[item.key]);

            return (
              <div
                key={item.key}
                className={`p-2.5 rounded-xl border bg-slate-900/90 flex flex-col justify-between ${item.color}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>

                <motion.div
                  key={val}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black font-mono text-white my-1"
                >
                  {val}
                </motion.div>

                <div className="flex items-center space-x-1 pt-1">
                  <button
                    onClick={() => updateSingleStat(item.key, -1)}
                    className="flex-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    <Minus className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => updateSingleStat(item.key, 1)}
                    className="flex-1 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
                  >
                    <Plus className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Multi-Platform Chat Overlay */}
      <ChatOverlayPanel />
    </motion.div>
  );
};
