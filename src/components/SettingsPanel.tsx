import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Monitor, Gamepad2, Cpu, Palette, Save, RefreshCw, MousePointer2, Sun, Globe, Wifi, Database, Zap } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    opacity: number;
    clickThrough: boolean;
    showFps: boolean;
    showCpu: boolean;
    showRam: boolean;
    showNetwork: boolean;
    theme: "cyberpunk" | "minimal" | "neon";
    accentColor: "cyan" | "purple" | "green" | "pink" | "orange";
    animationIntensity: "low" | "medium" | "high";
    language: "sk" | "en";
  };
  onChange: (key: keyof SettingsPanelProps["settings"], value: any) => void;
  onSave: () => void;
  onReset: () => void;
}

const accentColors = [
  { id: "cyan", name: "CYAN", color: "#00F0FF", glow: "#00F0FF" },
  { id: "purple", name: "PURPLE", color: "#7000FF", glow: "#7000FF" },
  { id: "green", name: "EMERALD", color: "#00FF85", glow: "#00FF85" },
  { id: "pink", name: "MAGENTA", color: "#FF006E", glow: "#FF006E" },
  { id: "orange", name: "ORANGE", color: "#FF6B00", glow: "#FF6B00" },
];

const themes = [
  { id: "cyberpunk", name: "CYBERPUNK", desc: "Full neon effects, glassmorphism, animations" },
  { id: "minimal", name: "MINIMAL", desc: "Clean, reduced visual noise, performance focused" },
  { id: "neon", name: "NEON", desc: "Maximum glow, intense colors, arcade style" },
];

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onChange,
  onSave,
  onReset,
}: SettingsPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="fixed top-16 right-4 bottom-16 w-96 max-h-[calc(100vh-8rem)] z-50 card-cyber rounded-2xl overflow-hidden flex flex-col"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-primary bg-bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-bg-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-text-primary">SETTINGS</h2>
                  <p className="font-mono text-xs text-text-muted">Configure your overlay</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg bg-bg-tertiary text-text-secondary border border-border-primary hover:border-neon-pink/50 hover:text-neon-pink hover:shadow-glow-pink transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <h3 className="font-display text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-neon-cyan" />
                  APPEARANCE
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                        <Palette className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-text-primary">Theme</p>
                        <p className="font-mono text-xs text-text-muted">Visual style preset</p>
                      </div>
                    </div>
                    <select
                      value={settings.theme}
                      onChange={(e) => onChange("theme", e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-primary text-text-primary font-mono text-xs focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan appearance-none pr-8"
                    >
                      {themes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-text-primary">Accent Color</p>
                        <p className="font-mono text-xs text-text-muted">Primary neon color</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {accentColors.map((accent) => (
                        <motion.button
                          key={accent.id}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onChange("accentColor", accent.id)}
                          className={`relative w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                            settings.accentColor === accent.id
                              ? "border-white scale-110 shadow-lg"
                              : "border-border-primary hover:border-neon-cyan/50"
                          }`}
                          style={{
                            background: accent.color,
                            boxShadow: settings.accentColor === accent.id ? `0 0 15px ${accent.glow}` : "none",
                          }}
                          title={accent.name}
                        />
                      ))}
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                        <Zap className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-text-primary">Animation Intensity</p>
                        <p className="font-mono text-xs text-text-muted">Performance vs visual quality</p>
                      </div>
                    </div>
                    <select
                      value={settings.animationIntensity}
                      onChange={(e) => onChange("animationIntensity", e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-primary text-text-primary font-mono text-xs focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan"
                    >
                      <option value="low">LOW - Maximum Performance</option>
                      <option value="medium">MEDIUM - Balanced</option>
                      <option value="high">HIGH - Full Effects</option>
                    </select>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                        <Globe className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-text-primary">Language</p>
                        <p className="font-mono text-xs text-text-muted">Interface language</p>
                      </div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => onChange("language", e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-primary text-text-primary font-mono text-xs focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan"
                    >
                      <option value="sk">SLOVENČINA</option>
                      <option value="en">ENGLISH</option>
                    </select>
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-4 pt-4 border-t border-border-primary"
              >
                <h3 className="font-display text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-neon-orange" />
                  OVERLAY WIDGETS
                </h3>

                <div className="space-y-3">
                  {[
                    { key: "showFps", label: "FPS Counter", desc: "Show frames per second", icon: <Monitor className="w-5 h-5" /> },
                    { key: "showCpu", label: "CPU Monitor", desc: "Processor usage graph", icon: <Cpu className="w-5 h-5" /> },
                    { key: "showRam", label: "RAM Monitor", desc: "Memory usage graph", icon: <Database className="w-5 h-5" /> },
                    { key: "showNetwork", label: "Network Latency", desc: "Ping and connection quality", icon: <Wifi className="w-5 h-5" /> },
                  ].map((widget) => (
                    <label key={widget.key} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center group-hover:border-neon-cyan/30 transition-colors">
                          {widget.icon}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium text-text-primary">{widget.label}</p>
                          <p className="font-mono text-xs text-text-muted">{widget.desc}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange(widget.key as keyof typeof settings, !settings[widget.key as keyof typeof settings])}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                          settings[widget.key as keyof typeof settings]
                            ? "bg-neon-cyan shadow-glow-cyan"
                            : "bg-bg-tertiary border border-border-primary"
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings[widget.key as keyof typeof settings] ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </motion.button>
                    </label>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 pt-4 border-t border-border-primary"
              >
                <h3 className="font-display text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neon-purple" />
                  BEHAVIOR
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                        <MousePointer2 className="w-5 h-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-text-primary">Click-Through Mode</p>
                        <p className="font-mono text-xs text-text-muted">Allow clicks to pass through overlay</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onChange("clickThrough", !settings.clickThrough)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        settings.clickThrough
                          ? "bg-neon-pink shadow-glow-pink"
                          : "bg-bg-tertiary border border-border-primary"
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.clickThrough ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                      />
                    </motion.button>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center">
                          <Sun className="w-5 h-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium text-text-primary">Overlay Opacity</p>
                          <p className="font-mono text-xs text-text-muted">Background transparency</p>
                        </div>
                      </div>
                      <span className="font-display text-sm font-bold text-neon-cyan" style={{ textShadow: "0 0 10px #00F0FF" }}>
                        {settings.opacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.opacity}
                      onChange={(e) => onChange("opacity", Number(e.target.value))}
                      className="w-full h-2 appearance-none bg-bg-tertiary rounded-full accent-neon-cyan cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="p-4 border-t border-border-primary bg-bg-secondary/50 flex items-center justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="px-6 py-2.5 rounded-xl font-mono text-sm font-medium bg-bg-tertiary border border-border-primary text-text-secondary hover:border-neon-orange/50 hover:text-neon-orange hover:shadow-[0_0_15px_#ff6b00] transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                RESET DEFAULTS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                className="px-6 py-2.5 rounded-xl font-mono text-sm font-medium bg-neon-cyan text-bg-primary hover:shadow-glow-cyan transition-all duration-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                SAVE SETTINGS
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}