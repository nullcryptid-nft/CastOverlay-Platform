import React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert } from "lucide-react";

interface SafeZone {
  label: string;
  x: number; // 0-100 left
  y: number; // 0-100 top
  w: number; // 0-100 width
  h: number; // 0-100 height
  color: string;
  dashed?: boolean;
}

const GAME_SAFE_ZONES: Record<string, SafeZone[]> = {
  "cs2": [
    { label: "MINIMAP", x: 1, y: 1, w: 18, h: 22, color: "rgba(255,193,7,0.15)", dashed: true },
    { label: "HUDDISPLAY", x: 2, y: 88, w: 22, h: 8, color: "rgba(255,193,7,0.12)" },
    { label: "WEAPON/Ammo", x: 80, y: 86, w: 18, h: 10, color: "rgba(255,193,7,0.12)" },
    { label: "Crosshair Zone", x: 38, y: 28, w: 24, h: 36, color: "rgba(6,255,0,0.08)" },
  ],
  "valorant": [
    { label: "MINIMAP", x: 1, y: 1, w: 20, h: 24, color: "rgba(255,63,94,0.15)", dashed: true },
    { label: "AGENT ABILITIES", x: 30, y: 88, w: 40, h: 8, color: "rgba(255,63,94,0.12)" },
    { label: "HP/BAR", x: 2, y: 88, w: 15, h: 8, color: "rgba(255,63,94,0.12)" },
    { label: "SCORE/ROUND", x: 85, y: 1, w: 14, h: 8, color: "rgba(255,63,94,0.12)" },
  ],
  "apex": [
    { label: "MINIMAP", x: 1, y: 1, w: 22, h: 26, color: "rgba(6,182,212,0.15)", dashed: true },
    { label: "LOOT BAR", x: 1, y: 86, w: 25, h: 10, color: "rgba(6,182,212,0.12)" },
    { label: "PULSE/TIMER", x: 88, y: 1, w: 11, h: 8, color: "rgba(6,182,212,0.12)" },
    { label: "CENTER SAFE", x: 35, y: 25, w: 30, h: 40, color: "rgba(6,255,0,0.08)" },
  ],
};

const DEFAULT_ZONES: SafeZone[] = [
  { label: "TOP-LEFT SAFE", x: 1, y: 1, w: 20, h: 25, color: "rgba(168,85,247,0.15)", dashed: true },
  { label: "TOP-RIGHT SAFE", x: 79, y: 1, w: 20, h: 12, color: "rgba(168,85,247,0.12)" },
  { label: "CENTER SAFE", x: 35, y: 25, w: 30, h: 40, color: "rgba(6,255,0,0.08)" },
  { label: "BOTTOM SAFE", x: 30, y: 50, w: 40, h: 30, color: "rgba(168,85,247,0.12)" },
];

function colorWithAlpha(color: string, alpha: number): string {
  const base = color.replace(/[\d.]+\)$/, "");
  return `${base}${alpha})`;
}

export const SafeZoneGrid: React.FC<{ open?: boolean; gameId: string; onClose: () => void }> = ({ open = true, gameId, onClose }) => {
  if (!open) return null;
  const zones = GAME_SAFE_ZONES[gameId] || DEFAULT_ZONES;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[9997] pointer-events-auto"
    >
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        background: `
          repeating-linear-gradient(0deg, rgba(6,182,212,0.06) 0px, rgba(6,182,212,0.06) 1px, transparent 1px, transparent 50px),
          repeating-linear-gradient(90deg, rgba(6,182,212,0.06) 0px, rgba(6,182,212,0.06) 1px, transparent 1px, transparent 50px)
        `,
      }} />

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
        <div className="w-1 h-8 bg-cyan-400 mx-auto" />
        <div className="w-8 h-1 bg-cyan-400" />
      </div>

      {/* Safe zones */}
      {zones.map((zone) => (
        <motion.div
          key={zone.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.w}%`,
            height: `${zone.h}%`,
            border: `1px ${zone.dashed ? "dashed" : "solid"} ${colorWithAlpha(zone.color, 0.5)}`,
            background: zone.color,
            backdropFilter: "blur(1px)",
          }}
          className="absolute flex items-start justify-start p-1.5"
        >
          <span
            className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
            style={{
              color: colorWithAlpha(zone.color, 0.75),
              background: "rgba(0,0,0,0.5)",
            }}
          >
            {zone.label}
          </span>
        </motion.div>
      ))}

      {/* Header badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl"
        style={{
          background: "rgba(2,6,16,0.9)",
          borderColor: "rgba(6,182,212,0.3)",
          boxShadow: "0 0 30px rgba(6,182,212,0.15)",
        }}
      >
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Safe Zone Grid — {gameId.toUpperCase()}
        </span>
        <button
          onClick={onClose}
          className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
        >
          ESC
        </button>
      </motion.div>
    </motion.div>
  );
};

export const SafeZoneToggleButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition"
    title="Zapnúť/zapnúť Safe-Zone Grid (bezpečné zóny pre HUD)"
  >
    <ShieldAlert className="w-4 h-4" />
  </button>
);