import { motion } from "framer-motion";
import { Cpu, Database, Monitor, Activity } from "lucide-react";

interface GaugeData {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  color: "cyan" | "purple" | "emerald" | "orange";
  unit?: string;
}

const colorConfig = {
  cyan: { primary: "#00F0FF", glow: "0 0 20px #00F0FF, 0 0 40px #00F0FF80", bg: "rgba(0, 240, 255, 0.1)" },
  purple: { primary: "#7000FF", glow: "0 0 20px #7000FF, 0 0 40px #7000FF80", bg: "rgba(112, 0, 255, 0.1)" },
  emerald: { primary: "#00FF85", glow: "0 0 20px #00FF85, 0 0 40px #00FF8580", bg: "rgba(0, 255, 133, 0.1)" },
  orange: { primary: "#FF6B00", glow: "0 0 20px #FF6B00, 0 0 40px #FF6B0080", bg: "rgba(255, 107, 0, 0.1)" },
};

function getColorForValue(value: number, max: number, color: keyof typeof colorConfig) {
  const percentage = value / max;
  if (percentage < 0.5) return colorConfig[color];
  if (percentage < 0.8) return colorConfig.orange;
  return { primary: "#FF0044", glow: "0 0 20px #FF0044, 0 0 40px #FF004480", bg: "rgba(255, 0, 68, 0.1)" };
}

interface CircularGaugeProps {
  data: GaugeData;
  index: number;
}

function CircularGauge({ data, index }: CircularGaugeProps) {
  const { label, value, max, icon, color, unit = "%" } = data;
  const percentage = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - percentage);
  const colors = getColorForValue(value, max, color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.1 + 0.2 }}
      className="group relative flex flex-col items-center"
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
            </linearGradient>
            <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 80, damping: 12, duration: 1.5 }}
            style={{ filter: `url(#glow-${label})` }}
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-baseline gap-1"
          >
            <span className="font-display text-3xl font-bold text-text-primary" style={{ textShadow: `0 0 10px ${colors.primary}` }}>
              {Math.round(value)}
            </span>
            <span className="font-mono text-xs text-text-muted">{unit}</span>
          </motion.div>
        </div>

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-transparent border-t-[var(--color)] rounded-full opacity-20"
          style={{ "--color": colors.primary } as React.CSSProperties}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.5 }}
        className="mt-3 text-center"
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="w-5 h-5 flex items-center justify-center text-text-secondary">{icon}</span>
          <span className="font-display text-sm font-semibold text-text-primary tracking-wider">{label}</span>
        </div>
        <motion.div
          key={percentage}
          className="w-24 h-1.5 bg-bg-tertiary rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.primary}33, ${colors.primary})`,
              boxShadow: `0 0 10px ${colors.primary}`,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface PerformanceGaugeProps {
  cpu: number;
  ram: number;
  fps: number;
  network?: number;
}

export function PerformanceGauge({ cpu, ram, fps, network }: PerformanceGaugeProps) {
  const metrics: GaugeData[] = [
    { label: "CPU", value: cpu, max: 100, icon: <Cpu className="w-4 h-4" />, color: "cyan" },
    { label: "RAM", value: ram, max: 100, icon: <Database className="w-4 h-4" />, color: "purple" },
    { label: "FPS", value: fps, max: 144, icon: <Monitor className="w-4 h-4" />, color: "emerald", unit: "fps" },
    { label: "NET", value: network ?? 0, max: 100, icon: <Activity className="w-4 h-4" />, color: "orange", unit: "ms" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
      className="card-cyber rounded-2xl p-6 bg-grid-pattern relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-cyan" />
          ENGINE DASHBOARD
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse-glow" />
          <span className="font-mono text-xs text-text-muted">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((metric, index) => (
          <CircularGauge key={metric.label} data={metric} index={index} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-6 border-t border-border-primary grid grid-cols-4 gap-4 text-center"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-lg bg-bg-tertiary/50 border border-border-primary hover:border-neon-cyan/30 transition-all duration-300"
          >
            <div className="font-mono text-xs text-text-muted uppercase tracking-wider mb-1">{metric.label} USAGE</div>
            <div className="font-display text-lg font-bold text-text-primary" style={{ textShadow: `0 0 10px ${colorConfig[metric.color].primary}` }}>
              {Math.round(metric.value)}{metric.unit === "fps" ? "" : metric.unit === "ms" ? "ms" : "%"}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}