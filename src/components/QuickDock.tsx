import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Trophy, Settings, ChevronUp, ChevronDown, Zap, Gamepad2, Layers, Monitor, Activity } from "lucide-react";

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: () => void;
  tooltip?: string;
}

interface QuickDockProps {
  showPerformance: boolean;
  showScoreboard: boolean;
  showGameStatus: boolean;
  showStreamInfo: boolean;
  onTogglePerformance: () => void;
  onToggleScoreboard: () => void;
  onToggleGameStatus: () => void;
  onToggleStreamInfo: () => void;
  onSettings: () => void;
  collapsed?: boolean;
  onToggleCollapse: () => void;
}

const dockItems: Omit<DockItem, "active" | "onToggle">[] = [
  { id: "performance", label: "PERFORMANCE", icon: <Cpu className="w-5 h-5" />, tooltip: "Engine Dashboard" },
  { id: "scoreboard", label: "SCOREBOARD", icon: <Trophy className="w-5 h-5" />, tooltip: "Stream Scoreboard" },
  { id: "gamestatus", label: "GAME STATUS", icon: <Gamepad2 className="w-5 h-5" />, tooltip: "Game Status Widget" },
  { id: "streaminfo", label: "STREAM INFO", icon: <Activity className="w-5 h-5" />, tooltip: "Stream Information" },
];

export function QuickDock({
  showPerformance,
  showScoreboard,
  showGameStatus,
  showStreamInfo,
  onTogglePerformance,
  onToggleScoreboard,
  onToggleGameStatus,
  onToggleStreamInfo,
  onSettings,
  collapsed = false,
  onToggleCollapse,
}: QuickDockProps) {
  const items: DockItem[] = [
    { ...dockItems[0], active: showPerformance, onToggle: onTogglePerformance },
    { ...dockItems[1], active: showScoreboard, onToggle: onToggleScoreboard },
    { ...dockItems[2], active: showGameStatus, onToggle: onToggleGameStatus },
    { ...dockItems[3], active: showStreamInfo, onToggle: onToggleStreamInfo },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
          collapsed ? "h-14" : "h-auto pb-4"
        }`}
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <motion.div
          className="relative mx-auto max-w-4xl px-4"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-neon-cyan/30 rounded-full mb-2" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="absolute top-2 right-2 p-2 rounded-lg bg-bg-tertiary border border-border-primary text-text-secondary hover:border-neon-purple/50 hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            aria-label={collapsed ? "Expand dock" : "Collapse dock"}
          >
            {collapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.onToggle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.05 + 0.6 }}
                    className={`relative px-4 py-2.5 rounded-xl font-mono text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                      item.active
                        ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-glow-cyan"
                        : "bg-bg-tertiary/50 text-text-secondary border border-border-primary hover:border-neon-cyan/30 hover:text-text-primary"
                    }`}
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                    title={item.tooltip}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center transition-colors ${item.active ? "text-neon-cyan" : "text-text-muted"}`}>
                      {item.icon}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                    <motion.div
                      animate={{ scaleX: item.active ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                      style={{ background: "linear-gradient(90deg, #00F0FF, #7000FF)" }}
                    />
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSettings}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.8 }}
                  className="relative px-4 py-2.5 rounded-xl font-mono text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all duration-300 bg-bg-tertiary/50 text-text-secondary border border-border-primary hover:border-neon-purple/50 hover:text-neon-purple hover:shadow-glow-purple"
                  style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">SETTINGS</span>
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-4 border-t border-border-primary flex flex-wrap items-center justify-center gap-3 md:gap-6 text-center"
              >
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-bg-tertiary/30 border border-border-primary">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span className="font-mono text-xs text-text-secondary">OVERLAY ACTIVE</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-bg-tertiary/30 border border-border-primary">
                  <Layers className="w-4 h-4 text-neon-purple" />
                  <span className="font-mono text-xs text-text-secondary">LAYER MODE</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-bg-tertiary/30 border border-border-primary">
                  <Monitor className="w-4 h-4 text-neon-green" />
                  <span className="font-mono text-xs text-text-secondary">GAME CAPTURE</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1 md:gap-2"
            >
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={item.onToggle}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.03 + 0.6 }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    item.active
                      ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-glow-cyan"
                      : "bg-bg-tertiary/50 text-text-muted border border-border-primary hover:border-neon-cyan/30 hover:text-text-secondary"
                  }`}
                  style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                  title={item.tooltip}
                >
                  <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onSettings}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.72 }}
                className="p-2 rounded-lg bg-bg-tertiary/50 text-text-muted border border-border-primary hover:border-neon-purple/50 hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.footer>
    </AnimatePresence>
  );
}