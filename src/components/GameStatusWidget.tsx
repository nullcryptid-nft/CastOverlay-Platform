import { motion } from "framer-motion";
import { Gamepad2, Wifi, Cpu, Database, Monitor, AlertTriangle } from "lucide-react";

interface GameStatusWidgetProps {
  isInGame: boolean;
  gameName?: string;
  fps?: number;
  ping?: number;
  cpuUsage?: number;
  ramUsage?: number;
}

export function GameStatusWidget({ isInGame, gameName, fps, ping, cpuUsage, ramUsage }: GameStatusWidgetProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.5 }}
      className="card-cyber rounded-2xl p-6 bg-grid-pattern relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-neon-orange" />
          GAME STATUS
        </h2>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              `0 0 10px ${isInGame ? "#00FF85" : "#FF6B00"}60`,
              `0 0 20px ${isInGame ? "#00FF85" : "#FF6B00"}`,
              `0 0 10px ${isInGame ? "#00FF85" : "#FF6B00"}60`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`relative px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isInGame
              ? "bg-neon-green/15 text-neon-green border border-neon-green/30"
              : "bg-neon-orange/15 text-neon-orange border border-neon-orange/30"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isInGame ? "bg-neon-green animate-pulse-glow" : "bg-neon-orange"}`} />
          {isInGame ? "IN-GAME" : "IDLE"}
        </motion.div>
      </div>

      {isInGame && gameName && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-orange/20 to-neon-purple/20 border border-neon-orange/30 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-neon-orange" />
            </div>
            <div>
              <p className="font-mono text-xs text-text-muted uppercase tracking-wider">CURRENT GAME</p>
              <p className="font-display text-lg font-bold text-text-primary truncate max-w-xs">{gameName}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-cyan/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-neon-cyan" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">FPS</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={fps}
              className="font-display text-3xl font-bold text-text-primary"
              style={{ textShadow: "0 0 15px #00F0FF" }}
            >
              {fps ?? "--"}
            </motion.span>
            <span className="font-mono text-xs text-text-muted">FPS</span>
          </div>
          <motion.div
            className="mt-2 h-1.5 bg-bg-primary rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((fps ?? 0) / 144, 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #00F0FF, #00FF85)",
                boxShadow: "0 0 10px #00F0FF",
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-green/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-neon-green" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">PING</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={ping}
              className="font-display text-3xl font-bold text-text-primary"
              style={{ textShadow: "0 0 15px #00FF85" }}
            >
              {ping ?? "--"}
            </motion.span>
            <span className="font-mono text-xs text-text-muted">MS</span>
          </div>
          <div className="mt-2 font-mono text-xs" style={{ color: (ping ?? 0) < 50 ? "#00FF85" : (ping ?? 0) < 100 ? "#FF6B00" : "#FF0044" }}>
            {(ping ?? 0) < 50 ? "EXCELLENT" : (ping ?? 0) < 100 ? "GOOD" : "HIGH"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-purple/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-neon-purple" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">CPU</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={cpuUsage}
              className="font-display text-3xl font-bold text-text-primary"
              style={{ textShadow: "0 0 15px #7000FF" }}
            >
              {cpuUsage ?? "--"}
            </motion.span>
            <span className="font-mono text-xs text-text-muted">%</span>
          </div>
          <motion.div
            className="mt-2 h-1.5 bg-bg-primary rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((cpuUsage ?? 0) / 100, 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #7000FF, #BC13FE)",
                boxShadow: "0 0 10px #7000FF",
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-pink/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-neon-pink" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">RAM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={ramUsage}
              className="font-display text-3xl font-bold text-text-primary"
              style={{ textShadow: "0 0 15px #FF006E" }}
            >
              {ramUsage ?? "--"}
            </motion.span>
            <span className="font-mono text-xs text-text-muted">%</span>
          </div>
          <motion.div
            className="mt-2 h-1.5 bg-bg-primary rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((ramUsage ?? 0) / 100, 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #FF006E, #FF6B00)",
                boxShadow: "0 0 10px #FF006E",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {!isInGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
          className="mt-6 p-6 rounded-xl bg-gradient-to-r from-neon-orange/10 to-neon-purple/10 border border-neon-orange/20 text-center"
        >
          <AlertTriangle className="w-12 h-12 mx-auto text-neon-orange/50 mb-3" />
          <p className="font-display text-lg font-bold text-text-primary mb-1">WAITING FOR GAME</p>
          <p className="font-mono text-sm text-text-muted">Launch a game to activate overlay</p>
        </motion.div>
      )}
    </motion.section>
  );
}