import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, TrendingUp, TrendingDown, Plus, Minus, RefreshCw } from "lucide-react";

interface ScoreWidgetProps {
  wins: number;
  losses: number;
  onWin: () => void;
  onLoss: () => void;
  onReset: () => void;
}

// ── Tilt card (3D hover effect) ─────────────────────────────────────
export function TiltCard({ children, className, glowColor = "rgba(6,182,212,0.4)" }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const [glow, setGlow] = useState({ x: 50, y: 50, angleX: 0, angleY: 0, active: false });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setGlow({
      x: (px + 0.5) * 100,
      y: (py + 0.5) * 100,
      angleX: py * -14,
      angleY: px * 14,
      active: true,
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setGlow({ x: 50, y: 50, angleX: 0, angleY: 0, active: false });
  }, []);

  // Extract rgb values from glowColor (format: "rgba(R,G,B,0.4)")
  const rgbMatch = glowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const rgb = rgbMatch ? `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}` : "rgba(6,182,212,";

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative ${className || ""}`}
      style={{
        boxShadow: glow.active
          ? `0 0 30px ${rgb}0.35), 0 0 60px ${rgb}0.18), inset 0 0 30px ${rgb}0.08)`
          : "0 4px 24px rgba(0,0,0,0.4)",
        border: glow.active ? `1px solid ${rgb}0.55)` : "1px solid rgba(255,255,255,0.1)",
        transition: "box-shadow 0.3s, border-color 0.3s, transform 0.15s ease-out",
        transform: glow.active
          ? `perspective(800px) rotateX(${glow.angleX}deg) rotateY(${glow.angleY}deg) scale(1.02)`
          : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      }}
    >
      {glow.active && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            borderRadius: "inherit",
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, ${rgb}0.18), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

function AnimatedCounter({ value, label, icon, color, glowColor, onIncrement, onDecrement }: {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const digits = value.toString().padStart(3, "0").split("").map(Number);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="relative flex flex-col items-center"
    >
      <div className="relative mb-4">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-bg-card to-bg-tertiary border-2 flex items-center justify-center"
          style={{ borderColor: `${color}40`, boxShadow: `0 0 30px ${glowColor}40, inset 0 0 30px ${color}10` }}
        >
          <span className="text-5xl">{icon}</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], boxShadow: [`0 0 20px ${glowColor}60`, `0 0 40px ${glowColor}`, `0 0 20px ${glowColor}60`] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: color, boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}80` }}
        >
          <Plus className="w-3 h-3 text-bg-primary" />
        </motion.div>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        {digits.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
            className="relative h-16 w-12 overflow-hidden bg-bg-primary/50 rounded-lg border-r border-border-primary last:border-r-0"
          >
            <motion.div
              animate={{ y: -digit * 64 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
              className="flex flex-col"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="h-16 w-12 flex items-center justify-center font-display text-4xl font-bold"
                  style={{
                    color: i === digit ? color : "#333344",
                    textShadow: i === digit ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}80` : "none",
                  }}
                >
                  {i}
                </span>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-sm font-bold tracking-wider" style={{ color, textShadow: `0 0 10px ${glowColor}` }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onIncrement}
            className="p-2 rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary hover:border-neon-green/50 hover:text-neon-green hover:shadow-glow-green transition-all duration-300"
            title="Increment"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDecrement}
            className="p-2 rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary hover:border-neon-pink/50 hover:text-neon-pink hover:shadow-glow-pink transition-all duration-300"
            title="Decrement"
          >
            <Minus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function ScoreWidget({ wins, losses, onWin, onLoss, onReset }: ScoreWidgetProps) {
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : "0.0";
  const [fx, setFx] = useState<{ type: "win" | "loss" } | null>(null);

  const handleWin = () => { setFx({ type: "win" }); onWin(); setTimeout(() => setFx(null), 1200); };
  const handleLoss = () => { setFx({ type: "loss" }); onLoss(); setTimeout(() => setFx(null), 800); };

  const shakeAnim = {
    x: [0, -4, 4, -3, 3, -2, 2, 0],
    transition: { duration: 0.45, ease: "easeOut" as const },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, ...(fx?.type === "loss" ? shakeAnim.x && { x: shakeAnim.x } : {}) }}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.4 }}
      className="card-cyber rounded-2xl p-6 bg-grid-pattern relative overflow-visible"
      style={{
        boxShadow: fx?.type === "loss"
          ? "0 0 40px rgba(255,0,68,0.4), 0 0 80px rgba(255,0,68,0.15)"
          : fx?.type === "win"
            ? "0 0 40px rgba(0,255,133,0.35), 0 0 80px rgba(0,255,133,0.12)"
            : undefined,
      }}
    >
      {/* Radial shockwave on WIN */}
      <AnimatePresence>
        {fx?.type === "win" && (
          <motion.div
            key="shockwave"
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-50"
            style={{
              border: "3px solid #00FF85",
              boxShadow: "0 0 40px #00FF85, 0 0 80px #00FF8560 inset",
            }}
          />
        )}
      </AnimatePresence>

      {/* Green border flash on WIN */}
      <AnimatePresence>
        {fx?.type === "win" && (
          <motion.div
            key="green-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, times: [0, 0.3, 1] }}
            className="absolute -inset-2 rounded-3xl pointer-events-none pointer-events-none z-0"
            style={{
              border: "2px solid rgba(0,255,133,0.5)",
              boxShadow: "0 0 30px rgba(0,255,133,0.3) inset",
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen shake overlay for LOSS */}
      <AnimatePresence>
        {fx?.type === "loss" && (
          <motion.div
            key="red-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.3, 1] }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-50"
            style={{
              background: "radial-gradient(circle at center, rgba(255,0,68,0.2), transparent 70%)",
              border: "2px solid rgba(255,0,68,0.4)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-green" />
          STREAM SCOREBOARD
        </h2>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg font-mono text-xs bg-bg-tertiary border border-border-primary text-text-secondary hover:border-neon-orange/50 hover:text-neon-orange hover:shadow-[0_0_15px_#ff6b00] transition-all duration-300 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          RESET
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-md mx-auto relative z-10">
        <AnimatedCounter
          value={wins}
          label="WINS"
          icon={<TrendingUp className="w-8 h-8" />}
          color="#00FF85"
          glowColor="#00FF85"
          onIncrement={handleWin}
          onDecrement={() => {}}
        />
        <AnimatedCounter
          value={losses}
          label="LOSSES"
          icon={<TrendingDown className="w-8 h-8" />}
          color="#FF0044"
          glowColor="#FF0044"
          onIncrement={handleLoss}
          onDecrement={() => {}}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
        className="mt-8 pt-6 border-t border-border-primary flex flex-col items-center gap-3 relative z-10"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary/50 border border-border-primary">
            <Target className="w-4 h-4 text-neon-cyan" />
            <span className="font-mono text-sm text-text-secondary">TOTAL</span>
            <span className="font-display text-xl font-bold text-text-primary">{wins + losses}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary/50 border border-border-primary">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="font-mono text-sm text-text-secondary">WIN RATE</span>
            <span className="font-display text-xl font-bold text-neon-green" style={{ textShadow: "0 0 10px #00FF85" }}>
              {winRate}%
            </span>
          </div>
        </div>

        <motion.div
          animate={{ scaleX: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15, duration: 1.5, delay: 0.5 }}
            className="h-full rounded-full relative"
            style={{
              background: "linear-gradient(90deg, #00FF85, #00F0FF)",
              boxShadow: "0 0 15px #00FF85, 0 0 30px #00F0FF",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
