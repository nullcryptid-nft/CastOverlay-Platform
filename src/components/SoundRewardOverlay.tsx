import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Zap } from "lucide-react";

export interface RewardEvent {
  id: string;
  user: string;
  soundName: string;
  points: number;
}

export const SoundRewardOverlay: React.FC<{ reward: RewardEvent | null; onClear: () => void }> = ({
  reward,
  onClear,
}) => {
  if (!reward) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(8px)" }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9996] pointer-events-none"
    >
      <div
        className="relative flex items-center space-x-3 px-5 py-3 rounded-2xl border backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, rgba(168,85,247,0.95) 0%, rgba(6,182,212,0.95) 100%)`,
          borderColor: "rgba(255,255,255,0.3)",
          boxShadow:
            "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(6,182,212,0.3), 0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Sparkles animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 0.8, times: [0, 0.5, 1] }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 0 20px rgba(255,255,255,0.3) inset" }}
        >
          <Gift className="w-5 h-5 text-white" />
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs font-black text-white uppercase tracking-wider"
          >
            {reward.user}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-[11px] font-bold text-white/90 flex items-center space-x-1.5"
          >
            <Zap className="w-3 h-3" />
            <span>
              activated <strong className="text-white">{reward.soundName}</strong>!
            </span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {reward.points} pts
            </span>
          </motion.p>
        </div>

        {/* Sound wave bars */}
        <div className="flex items-end space-x-0.5 ml-1">
          {[0.3, 0.6, 1, 0.7, 0.4].map((h, i) => (
            <motion.span
              key={i}
              animate={{ height: [4, 12 * h, 4] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              className="w-1 bg-white/70 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Simulated incoming reward events (for dev / demo)
export function useSoundRewardSimulation(): [RewardEvent | null, () => void] {
  const [reward, setReward] = useState<RewardEvent | null>(null);
  const [idCounter, setIdCounter] = useState(0);

  const simulateReward = () => {
    const sounds = ["Victory Sound", "Horn Blast", "Laser Zap", "Crowd Cheer", "Fanfare"];
    const users = ["NinjaShroud", "PixelWolf", "GhostByte", "NeonStriker", "VoidRunner"];
    const points = Math.floor(Math.random() * 400) + 100;
    const event: RewardEvent = {
      id: `reward-${Date.now()}-${idCounter}`,
      user: users[Math.floor(Math.random() * users.length)],
      soundName: sounds[Math.floor(Math.random() * sounds.length)],
      points,
    };
    setIdCounter((c) => c + 1);
    setReward(event);
    setTimeout(() => setReward(null), 4000);
  };

  return [reward, simulateReward];
}