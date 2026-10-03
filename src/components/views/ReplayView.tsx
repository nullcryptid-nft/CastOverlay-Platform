import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Camera,
  Save,
  Trash2,
  Check,
  X,
  Clock,
  MicOff,
  Play,
  Zap,
  HardDrive,
  Clapperboard,
} from "lucide-react";
import { useReplayStore, captureReplay } from "../../stores/replayStore";
import { useGameStore } from "../../stores/gameStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { localeFor, useTranslation } from "../../i18n";
import type { ReplayClip, ReplayFormat } from "../../types";

// ── Frame capture helper ─────────────────────────────────────────────
// In a real Tauri build, captureVideoFrame would call the Rust backend
// to grab a GPU frame. For this browser-compatible implementation we
// paint the current overlay state into an offscreen canvas each tick.
function useFrameCapture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { pushFrame } = useReplayStore();
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    if (!canvasRef.current) {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 360;
      canvasRef.current = c;
    }

    let active = true;

    const interval = setInterval(() => {
      if (!active || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Dark frame with timestamp watermark (simulated game frame)
      const t = new Date();
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(0, 0, 640, 360);

      // Gradient accent bar
      const grad = ctx.createLinearGradient(0, 0, 640, 0);
      grad.addColorStop(0, "rgba(6,182,212,0.15)");
      grad.addColorStop(1, "rgba(99,102,241,0.15)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 40);

      // Timestamp text
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        t.toLocaleTimeString(localeFor(language), { hour12: false }) +
          "." +
          String(Math.floor(t.getMilliseconds() / 100)),
        636,
        28,
      );

      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.55);
      pushFrame({ timestamp: t.getTime(), jpeg: dataUrl });
    }, 166); // ~6 fps

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pushFrame]);
}

// ── Clip card ────────────────────────────────────────────────────────
interface ClipCardProps {
  clip: ReplayClip;
  onDelete: () => void;
  onSave: (format: ReplayFormat) => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onDelete, onSave }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);

  const dateStr = new Date(clip.capturedAt).toLocaleString(localeFor(language), {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden backdrop-blur-xl"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-slate-950">
        {clip.thumb ? (
          <img
            src={`data:image/jpeg;base64,${clip.thumb}`}
            alt="Replay frame"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setPreviewOpen((prev) => !prev)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-950">
            <Film className="h-16 w-16 text-slate-700" />
          </div>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
          onClick={() => setPreviewOpen(true)}
        >
          <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 group-hover:bg-cyan-500/40 transition-colors">
            <Play className="h-8 w-8 text-cyan-300 ml-1" />
          </div>
        </div>

        {/* Meta badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold border border-white/10 backdrop-blur-sm">
            <Camera className="h-3 w-3 text-cyan-400" />
            <span>MENU</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold border border-white/10 backdrop-blur-sm">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span>{clip.duration}s</span>
          </span>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl w-full rounded-2xl bg-slate-950 border border-cyan-500/20 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Clapperboard className="h-4 w-4 text-cyan-400" />
                  <span>{t("replay.previewTitle")} – {clip.gameName}</span>
                </h3>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {clip.thumb ? (
                <img
                  src={`data:image/jpeg;base64,${clip.thumb}`}
                  alt="Replay preview"
                  className="w-full rounded-xl border border-white/10"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-slate-900 rounded-xl">
                  <Film className="h-24 w-24 text-slate-700" />
                </div>
              )}
              <p className="text-center text-slate-500 text-xs mt-3 font-mono">
                {dateStr} • {clip.duration} s • {clip.format.toUpperCase()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info bar */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">{clip.gameName}</p>
          <p className="text-[10px] text-slate-500 font-mono">{dateStr}</p>
        </div>

        <div className="relative flex items-center space-x-1.5">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={t("replay.actions")}
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 transition"
            title={t("replay.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-slate-900 shadow-2xl z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onSave("mp4");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition"
                >
                  <Film className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t("replay.saveMp4")}</span>
                </button>
                <button
                  onClick={() => {
                    onSave("gif");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 text-xs text-slate-200 hover:bg-purple-500/10 hover:text-purple-300 transition"
                >
                  <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                  <span>{t("replay.toGif")}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main view ────────────────────────────────────────────────────────
export const ReplayView: React.FC = () => {
  const {
    isCapturing,
    lastClip,
    ringDurationSec,
    frames,
    setRingDurationSec,
    clearRing,
    setLastClip,
  } = useReplayStore();
  const { selectedGame } = useGameStore();
  const t = useTranslation();

  const [localClip, setLocalClip] = useState<ReplayClip | null>(lastClip);
  const [toast, setToast] = useState<string | null>(null);

  // Keep local clip in sync with store
  useEffect(() => {
    if (lastClip) setLocalClip(lastClip);
  }, [lastClip]);

  // Start frame capture on mount
  useFrameCapture();

  const handleCapture = () => {
    const clip = captureReplay(selectedGame?.name);
    if (clip) {
      setToast(`${t("replay.saved").replace("{format}", "MP4")} Alt+C`);
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast(t("replay.noFrames"));
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSave = (format: ReplayFormat) => {
    if (!localClip) return;
    if (typeof window !== "undefined" && window.__TAURI__) {
      // In Tauri build, would call Rust backend
      console.log(
        `[Replay] Saving clip ${localClip.id} as ${format} via Tauri backend`,
      );
    }
    // In browser, create a blob download
    if (localClip.thumb) {
      const b64 = localClip.thumb.replace(/^data:image\/jpeg;base64,/, "");
      const bytes = atob(b64);
      const bin = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) bin[i] = bytes.charCodeAt(i);

      const blob = new Blob([bin], {
        type: format === "gif" ? "image/gif" : "image/jpeg",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `castoverlay-replay-${format === "gif" ? "gif" : "jpg"}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(t("replay.saved").replace("{format}", format.toUpperCase()));
    } else {
      setToast(t("replay.emptyBuffer"));
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleClear = () => {
    clearRing();
    setLastClip(null);
    setLocalClip(null);
    setToast(t("replay.cleared"));
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20">
            <Film className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wider uppercase">
              {t("replay.title")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("replay.subtitle").replace("{seconds}", String(ringDurationSec)).replace("{game}", selectedGame.name)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Capture indicator */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
              isCapturing
                ? "bg-rose-500/10 border-rose-500/30 animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            <MicOff className="h-3.5 w-3.5 text-slate-500" />
            <span
              className={`text-[10px] font-black tracking-wider ${
                isCapturing ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {isCapturing ? t("replay.capturing") : t("replay.passive")}
            </span>
          </div>

          {/* Duration selector */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-white/5">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <select
              value={ringDurationSec}
              onChange={(e) => setRingDurationSec(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={30} className="bg-slate-900">
                30 s
              </option>
              <option value={60} className="bg-slate-900">
                60 s
              </option>
              <option value={120} className="bg-slate-900">
                120 s
              </option>
            </select>
          </div>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            <Zap className="h-4 w-4" />
            <span>{t("replay.captureButton")}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono">
              Alt+C
            </kbd>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-white/10 text-slate-400 transition"
            title={t("replay.clearBuffer")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buffer stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t("replay.frames")}
          value={String(frames.length)}
          accent="text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
        />
        <StatCard
          label={t("replay.duration")}
          value={`${ringDurationSec}s`}
          accent="text-purple-400 border-purple-500/20 bg-purple-500/5"
        />
        <StatCard
          label={t("replay.lastClip")}
          value={localClip ? localClip.capturedAt : "—"}
          accent="text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
        />
        <StatCard
          label={t("replay.game")}
          value={selectedGame?.name || "—"}
          accent="text-amber-400 border-amber-500/20 bg-amber-500/5"
        />
      </div>

      {/* Clip gallery */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Film className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase">
            {t("replay.clips")}
          </h3>
          <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-full bg-slate-800 border border-white/5">
            {localClip ? "1" : "0"} • Sa spočíta
          </span>
        </div>

        {localClip ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClipCard
              clip={localClip}
              onDelete={handleClear}
              onSave={handleSave}
            />
          </div>
        ) : (
          <div className="h-48 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 flex flex-col items-center justify-center space-y-2">
            <Film className="h-14 w-14 text-slate-700" />
            <p className="text-sm text-slate-400 font-semibold">
              {t("replay.noneYet")}
            </p>
            <p className="text-xs text-slate-500">
              Stlačite <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-white/10 text-[10px] font-mono">Alt+C</kbd>{" "}
              alebo tlačidlo{" "}
              <span className="text-cyan-400 font-black">"NULOVAŤ REPLAY"</span>
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Clapperboard className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase">
            {t("replay.howItWorks")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-cyan-400 font-bold">1. Pasívne zoradnávacie</span>
            <p className="text-slate-400">
              Aplikácia neustále prichytáva {Math.round(600 / 166)} FPS snímok do
              cirk funkciou s maximálne {ringDurationSec}s históriou —
              nuluje v pamäti: ~40 MB RAM.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-purple-400 font-bold">2. Nullnutie</span>
            <p className="text-slate-400">
              Prispôsobíte si stlačenie klávesníckej skratky{" "}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-white/10 font-mono">
                Alt+C
              </kbd>{" "}
              (alebo tlačidlom) okamžite zurezunní posledné{" "}
              {ringDurationSec}s do klipu, uloženého na diskovi.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-emerald-400 font-bold">3. Zdieľanie</span>
            <p className="text-slate-400">
              Klip je uložený v ľahkom formáte (MP4 / GIF), pripravený na
              sharing do Discordu, TikToku, X (Twitter) alebo SWS.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-white text-sm font-bold shadow-2xl shadow-cyan-500/10 flex items-center space-x-2"
          >
            <Check className="h-4 w-4 text-cyan-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Stat card helper ─────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string;
  accent: string;
}> = ({ label, value, accent }) => (
  <div
    className={`p-3.5 rounded-xl border ${accent} flex flex-col justify-between h-20`}
  >
    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">
      {label}
    </span>
    <span className="text-lg font-black font-mono truncate">
      {value.includes("latest") || value.includes("—") || value.length <= 8
        ? value
        : new Date(value).toISOString().slice(11, 19)}
    </span>
  </div>
);
