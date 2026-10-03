import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, X } from "lucide-react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  icon?: "game" | "info" | "warning";
  color?: string;
}

export const NotificationToast: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9998] space-y-2 pointer-events-none">
      {toasts.map((toast, i) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 100, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.08 }}
          className="pointer-events-auto flex items-center space-x-3 min-w-[280px] max-w-[360px] p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl"
          style={{
            background: "rgba(2,6,16,0.92)",
            borderColor: "rgba(6,182,212,0.3)",
            boxShadow: "0 0 30px rgba(6,182,212,0.15), 0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0"
            style={{ boxShadow: "0 0 16px rgba(6,182,212,0.2)" }}
          >
            {toast.icon === "game" ? (
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{toast.title}</p>
            {toast.description && (
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};