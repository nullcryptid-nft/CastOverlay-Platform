import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BootupScreenProps {
  onComplete: () => void;
}

const BOOT_DURATION_MS = 2800;

export const BootupScreen: React.FC<BootupScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  // Capture a stable ref to onComplete so a parent re-render (new closure)
  // cannot restart or interfere with the in-flight rAF loop.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / BOOT_DURATION_MS, 1);
      setProgress(pct);

      if (pct >= 1 && !doneRef.current) {
        doneRef.current = true;
        onCompleteRef.current?.();
        return;
      }
      if (pct < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []); // empty deps – single rAF session for the lifetime of the component

  // Status that cycles as the boot progresses – gives the loader life.
  const pctRound = Math.round(progress * 100);
  const status =
    pctRound < 15
      ? "ESTABLISHING UPLINK..."
      : pctRound < 40
      ? "LOADING HUD MODULES..."
      : pctRound < 70
      ? "CALIBRATING OVERLAYS..."
      : pctRound < 95
      ? "SYNCING STEAM ACCOUNT..."
      : "CASTOVERLAY READY";

  return (
    <motion.div
      className="bootup-screen-root fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#04060a] select-none pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      {/* ── Ambient cyberpunk background layers ───────────────────── */}
      {/* Glowing horizon + animated perspective grid floor */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cyber-grid-floor" />
        <div className="cyber-horizon" />
      </div>

      {/* Radial neon glow behind the logo */}
      <motion.div
        aria-hidden
        className="absolute w-[520px] h-[320px] rounded-full bg-cyan-500/10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.85, 1] }}
        transition={{ duration: 2.4, ease: "easeInOut" }}
      />

      {/* ── HUD corner brackets ───────────────────────────────────── */}
      <div className="absolute inset-10 sm:inset-14 pointer-events-none">
        {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls) => (
          <div key={cls} className={`absolute h-6 w-6 ${cls} border-cyan-400/50`} />
        ))}
      </div>

      {/* Scanlines + vignette overlays (drawn above content for CRT feel) */}
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      {/* ── Neon 3D logo lockup ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center"
      >
        {/* Core emblem */}
        <div
          className="cyber-neon-breathe relative w-16 h-16 rounded-2xl grid place-items-center bg-gradient-to-br from-cyan-400/25 to-indigo-600/25 border border-cyan-300/40 backdrop-blur-sm"
          style={{
            boxShadow:
              "0 0 30px rgba(34,211,238,0.45), inset 0 0 18px rgba(34,211,238,0.25)",
          }}
        >
          <span
            className="text-3xl font-black text-cyan-200"
            style={{
              textShadow:
                "0 0 10px rgba(34,211,238,0.9), 0 0 24px rgba(34,211,238,0.5)",
            }}
          >
            C
          </span>
          {/* spec highlight on the emblem */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent opacity-40 pointer-events-none" />
        </div>

        {/* Wordmark with glitch */}
        <h1
          data-text="CASTOVERLAY"
          className="cyber-glitch mt-6 text-4xl sm:text-5xl font-black tracking-[0.18em] text-white"
          style={{
            textShadow:
              "0 0 12px rgba(34,211,238,0.7), 0 0 30px rgba(99,102,241,0.45)",
          }}
        >
          CAST<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">OVERLAY</span>
        </h1>

        {/* Tagline */}
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-300/70">
          <span className="h-px w-8 bg-cyan-400/50" />
          Streaming&nbsp;HUD&nbsp;Platform
          <span className="h-px w-8 bg-cyan-400/50" />
        </div>
      </motion.div>

      {/* ── Progress rail ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
        className="relative mt-12 w-80 max-w-[78vw]"
      >
        {/* Status message */}
        <div className="mb-2 flex items-center justify-between text-[10px] font-mono tracking-[0.25em]">
          <span className="text-cyan-300/80">{status}</span>
          <span
            className="text-cyan-200"
            style={{ textShadow: "0 0 8px rgba(34,211,238,0.8)" }}
          >
            {pctRound}%
          </span>
        </div>

        {/* Spinner (left) + track with glowing fill + shimmer */}
        <div className="flex items-center gap-2.5">
          {/* Neon rotating spinner at the far left, next to the bar start */}
          <div className="cyber-spinner shrink-0" />
          <div
            className="flex-1 h-2 overflow-hidden rounded-full bg-cyan-950/40"
            style={{
              border: "1px solid rgba(34,211,238,0.25)",
              boxShadow: "inset 0 0 12px rgba(34,211,238,0.18)",
            }}
          >
            <motion.div
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400"
              initial={{ width: "0%" }}
              animate={{ width: `${pctRound}%` }}
              transition={{ duration: 0.15, ease: "linear" }}
              style={{
                boxShadow:
                  "0 0 14px rgba(34,211,238,0.85), 0 0 30px rgba(34,211,238,0.4)",
              }}
            >
              <div className="cyber-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Base label row */}
        <div className="mt-3 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.3em] text-slate-500">
          <span>v2.1.0</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            SYSTEM&nbsp;ACTIVE
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};