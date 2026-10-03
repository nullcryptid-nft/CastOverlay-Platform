import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Radio,
  Gamepad2,
  Tv,
} from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { useOverlayStore } from "../../stores/overlayStore";
import { useSocialStore } from "../../stores/socialStore";
import { RichPresenceCard } from "../RichPresenceCard";
import type { StatPreset } from "../../types";

export const DashboardView: React.FC<{ onLaunchOverlay: () => void }> = ({
  onLaunchOverlay,
}) => {
  const { selectedGame, sessionStats, updateSingleStat, resetSessionStats } =
    useGameStore();
  const { hardware } = useOverlayStore();
  const { onlineMembers, totalMembers, discordUrl } = useSocialStore();

  const getMetricColor = (val: number, thresholds = [60, 85]) => {
    if (val < thresholds[0])
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (val < thresholds[1])
      return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-500 border-rose-500/30 bg-rose-500/10";
  };

  const statItems: Array<{
    key: keyof StatPreset;
    labelKey: keyof StatPreset;
    color: string;
  }> = [
    {
      key: "stat1",
      labelKey: "stat1Label",
      color: "text-emerald-400 border-emerald-500/40",
    },
    {
      key: "stat2",
      labelKey: "stat2Label",
      color: "text-rose-400 border-rose-500/40",
    },
    {
      key: "stat3",
      labelKey: "stat3Label",
      color: "text-cyan-400 border-cyan-500/40",
    },
    {
      key: "stat4",
      labelKey: "stat4Label",
      color: "text-purple-400 border-purple-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hardware Telemetry Side Panel */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">
                SYSTÉMOVÁ TELEMETRIA
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              1000 Hz IPC
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {/* CPU */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Využitie CPU</span>
                <span
                  className={`font-mono ${getMetricColor(hardware.cpu).split(" ")[0]}`}
                >
                  {hardware.cpu}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                  animate={{ width: `${Math.min(100, hardware.cpu)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* RAM */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Alokovaná RAM</span>
                <span className="font-mono text-purple-400">
                  {hardware.ramUsed} GB / {hardware.ramTotal} GB
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  animate={{
                    width: `${(hardware.ramUsed / hardware.ramTotal) * 100}%`,
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* GPU Temp & FPS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  GPU Teplota
                </p>
                <p className="text-lg font-black font-mono text-amber-400 mt-1">
                  {hardware.gpuTemp}°C
                </p>
                <span className="text-[9px] text-slate-500 font-mono">
                  DSR VSYNC
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Aktuálne FPS
                </p>
                <p className="text-lg font-black font-mono text-cyan-400 mt-1">
                  {hardware.fps}
                </p>
                <span className="text-[9px] text-emerald-400 font-mono">
                  STABILNÉ
                </span>
              </div>
            </div>

            {/* IPC Overhead Badge */}
            <div className="flex items-center justify-between text-xs bg-slate-950/80 p-2.5 rounded-xl border border-white/10">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Priepustnosť renderingu</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">
                0.12 ms
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stream Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                STREAM VYSIELANIE
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE 1080p60
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Overlay je synchronizovaný s OBS Studio.
          </p>
        </div>

        {/* Steam Rich Presence status (sec. 1) */}
        <RichPresenceCard />

        {/* Discord Community Card */}
        <a
          href={discordUrl}
          target="_blank"
          rel="noreferrer"
          className="block p-4 rounded-2xl bg-gradient-to-br from-[#5865F2]/20 to-slate-950 border border-[#5865F2]/30 transition hover:border-[#5865F2]/60"
        >
          <div className="flex items-center space-x-3">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#5865F2] shrink-0" fill="currentColor">
              <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.249.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.291.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-wider">DISCORD KOMUNITA</p>
              <p className="text-[10px] text-slate-400">
                {onlineMembers} online · {totalMembers} členov
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#5865F2] shrink-0">Pripojiť &rarr;</span>
          </div>
        </a>
      </div>

      {/* Main HUD Interactive Scoreboard */}
      <div className="lg:col-span-2 space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div>
              <h3 className="font-black text-sm tracking-wide text-white uppercase flex items-center space-x-2">
                <Gamepad2 className="h-4 w-4 text-cyan-400" />
                <span>INTERAKTÍVNE POČÍTADLO PRESET: {selectedGame.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Štatistiky sú v reálnom čase synchronizované s transparentným
                Overlay oknom.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetSessionStats}
                className="px-2.5 py-1 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1"
                title="Resetovať počítadlá"
              >
                <RotateCcw className="h-3 w-3" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Stat Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {statItems.map((item) => {
              const label = String(sessionStats[item.labelKey]);
              const val = Number(sessionStats[item.key]);

              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded-xl border bg-slate-950/70 relative overflow-hidden flex flex-col justify-between ${item.color}`}
                >
                  <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                    {label}
                  </div>

                  <motion.div
                    key={val}
                    initial={{ scale: 1.2, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black font-mono my-2 text-white"
                  >
                    {val}
                  </motion.div>

                  <div className="flex items-center space-x-1.5 pt-1">
                    <button
                      onClick={() => updateSingleStat(item.key, -1)}
                      className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold flex items-center justify-center text-xs transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateSingleStat(item.key, 1)}
                      className="flex-1 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 active:bg-cyan-500 text-cyan-300 font-bold flex items-center justify-center text-xs transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick HUD Actions */}
          <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Tv className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  PLÁVAJÚCE OVERLAY OKNO
                </h4>
                <p className="text-[11px] text-slate-400">
                  Aktivujte kompaktný HUD widget ponad vašu spustenú hru
                </p>
              </div>
            </div>

            <button
              onClick={onLaunchOverlay}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95 flex items-center space-x-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>PREPNÚŤ DO OVERLAY REŽIMU</span>
            </button>
          </div>
        </div>

        {/* Pro Esport Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  ANALÝZA SESSION VÝKONU
                </h4>
                <p className="text-xs text-slate-400">
                  K/D Ratio a Winrate sú prepočítavané v reálnom čase bez
                  oneskorenia.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                STATUS ENGINE
              </span>
              <p className="text-xs font-mono font-bold text-emerald-400">
                NATIVE DIRECT3D/VULKAN
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
