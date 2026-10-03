import { motion } from "framer-motion";
import { Activity, Users, MessageSquare, Clock, Zap, Target, TrendingUp, Settings } from "lucide-react";

interface StreamInfoWidgetProps {
  isLive: boolean;
  viewers: number;
  followers: number;
  chatMessages: number;
  streamTitle?: string;
  streamCategory?: string;
  uptime?: number;
}

export function StreamInfoWidget({
  isLive,
  viewers,
  followers,
  chatMessages,
  streamTitle,
  streamCategory,
  uptime,
}: StreamInfoWidgetProps) {
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.5 }}
      className="card-cyber rounded-2xl p-6 bg-grid-pattern relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-purple" />
          STREAM INFO
        </h2>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              `0 0 10px ${isLive ? "#FF006E" : "#555566"}60`,
              `0 0 20px ${isLive ? "#FF006E" : "#555566"}`,
              `0 0 10px ${isLive ? "#FF006E" : "#555566"}60`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`relative px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLive
              ? "bg-neon-pink/15 text-neon-pink border border-neon-pink/30"
              : "bg-bg-tertiary text-text-muted border border-border-primary"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-neon-pink animate-pulse-glow" : "bg-text-muted"}`} />
          {isLive ? "LIVE" : "OFFLINE"}
        </motion.div>
      </div>

      {isLive && streamTitle && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary"
        >
          <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-1">STREAM TITLE</p>
          <p className="font-display text-base font-medium text-text-primary truncate">{streamTitle}</p>
          {streamCategory && (
            <p className="font-mono text-xs text-neon-purple mt-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              {streamCategory}
            </p>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-cyan/30 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-cyan" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">VIEWERS</span>
          </div>
          <motion.div
            className="flex items-baseline gap-1"
          >
            <motion.span
              key={viewers}
              className="font-display text-3xl font-bold text-text-primary"
              style={{ textShadow: "0 0 15px #00F0FF" }}
            >
              {viewers.toLocaleString()}
            </motion.span>
          </motion.div>
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-3 right-3 text-neon-cyan/30"
          >
            <TrendingUp className="w-5 h-5" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-green/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neon-green" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">FOLLOWERS</span>
          </div>
          <motion.span
            key={followers}
            className="font-display text-3xl font-bold text-text-primary"
            style={{ textShadow: "0 0 15px #00FF85" }}
          >
            {followers.toLocaleString()}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-purple/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-neon-purple" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">CHAT</span>
          </div>
          <motion.span
            key={chatMessages}
            className="font-display text-3xl font-bold text-text-primary"
            style={{ textShadow: "0 0 15px #7000FF" }}
          >
            {chatMessages.toLocaleString()}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-orange/30 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-neon-orange" />
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">UPTIME</span>
          </div>
          <motion.span
            key={uptime}
            className="font-display text-2xl font-bold text-text-primary font-mono"
            style={{ textShadow: "0 0 15px #FF6B00" }}
          >
            {uptime !== undefined ? formatUptime(uptime) : "--:--:--"}
          </motion.span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ delay: 0.7 }}
        className="pt-6 border-t border-border-primary"
      >
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-cyan/30 hover:bg-neon-cyan/10 transition-all duration-300 flex flex-col items-center gap-2"
          >
            <Zap className="w-5 h-5 text-neon-cyan" />
            <span className="font-mono text-xs text-text-secondary">ALERTS</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-purple/30 hover:bg-neon-purple/10 transition-all duration-300 flex flex-col items-center gap-2"
          >
            <Settings className="w-5 h-5 text-neon-purple" />
            <span className="font-mono text-xs text-text-secondary">OVERLAYS</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-primary hover:border-neon-green/30 hover:bg-neon-green/10 transition-all duration-300 flex flex-col items-center gap-2"
          >
            <Target className="w-5 h-5 text-neon-green" />
            <span className="font-mono text-xs text-text-secondary">GOALS</span>
          </motion.button>
        </div>
      </motion.div>

      {!isLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
          className="mt-6 p-6 rounded-xl bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20 text-center"
        >
          <Activity className="w-12 h-12 mx-auto text-neon-purple/50 mb-3" />
          <p className="font-display text-lg font-bold text-text-primary mb-1">STREAM OFFLINE</p>
          <p className="font-mono text-sm text-text-muted">Go live to activate stream widgets</p>
        </motion.div>
      )}
    </motion.section>
  );
}