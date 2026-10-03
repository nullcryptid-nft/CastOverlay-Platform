import { motion } from "framer-motion";
import { Zap, Cpu, MousePointer2, Minimize, Settings, X, Lock, Unlock } from "lucide-react";

interface HeaderBarProps {
  gameStatus: "IN-GAME" | "IDLE";
  clickThrough: boolean;
  opacity: number;
  isLocked: boolean;
  onClickThroughToggle: () => void;
  onOpacityChange: (value: number) => void;
  onMinimize: () => void;
  onSettings: () => void;
  onLockToggle: () => void;
  onClose: () => void;
}

export function HeaderBar({
  gameStatus,
  clickThrough,
  opacity,
  isLocked,
  onClickThroughToggle,
  onOpacityChange,
  onMinimize,
  onSettings,
  onLockToggle,
  onClose,
}: HeaderBarProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-primary flex items-center justify-between px-4 py-3"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center relative overflow-hidden">
            <Zap className="w-6 h-6 text-bg-primary" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-neon-cyan/30 rounded-lg"
            />
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1 right-1 w-2 h-2 bg-neon-cyan rounded-full animate-pulse-glow"
            />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary tracking-wider">CastOverlay</h1>
            <p className="font-mono text-xs text-text-muted">STREAM OVERLAY</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="ml-6 pl-6 border-l border-border-primary flex items-center gap-3"
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`relative px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              gameStatus === "IN-GAME"
                ? "bg-neon-green/15 text-neon-green border border-neon-green/30"
                : "bg-neon-orange/15 text-neon-orange border border-neon-orange/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                gameStatus === "IN-GAME" ? "bg-neon-green animate-pulse-glow" : "bg-neon-orange"
              }`}
            />
            STATUS: {gameStatus}
          </motion.span>
        </motion.div>
      </div>

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClickThroughToggle}
          className={`relative px-3 py-2 rounded-lg font-mono text-xs transition-all duration-300 flex items-center gap-2 ${
            clickThrough
              ? "bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 hover:shadow-glow-pink"
              : "bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-cyan/50 hover:text-neon-cyan"
          }`}
          title={clickThrough ? "Click-Through: ON" : "Click-Through: OFF"}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <MousePointer2 className="w-4 h-4" />
          <span className="hidden sm:inline">CLICK-THROUGH</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLockToggle}
          className="p-2 rounded-lg bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-purple/50 hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          title={isLocked ? "Unlock Position" : "Lock Position"}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="relative px-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Cpu className="w-4 h-4 text-neon-cyan" />
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-24 h-1.5 appearance-none bg-transparent cursor-pointer accent-neon-cyan"
            aria-label="Opacity"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          />
          <span className="font-mono text-xs text-text-secondary w-10 text-right">{opacity}%</span>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onSettings}
          className="p-2 rounded-lg bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-purple/50 hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          title="Settings"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onMinimize}
          className="p-2 rounded-lg bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-orange/50 hover:text-neon-orange hover:shadow-[0_0_15px_#ff6b00] transition-all duration-300"
          title="Minimize"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Minimize className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 rounded-lg bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-pink/50 hover:text-neon-pink hover:shadow-glow-pink transition-all duration-300"
          title="Close Overlay"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  );
}