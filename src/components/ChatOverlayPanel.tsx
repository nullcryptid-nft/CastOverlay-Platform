import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Hash } from "lucide-react";
import { useChatOverlayStore } from "../stores/chatOverlayStore";
import { useAuthStore } from "../stores/authStore";
import type { ChatMessage } from "../types";
import { useTranslation } from "../i18n";

// ── Platform badge config ──────────────────────────────────────
const PLATFORM_META: Record<
  "discord" | "steam",
  { label: string; dotClass: string; textClass: string }
> = {
  discord: {
    label: "DISCORD",
    dotClass: "bg-[#5865F2]",
    textClass: "text-[#5865F2]",
  },
  steam: {
    label: "STEAM",
    dotClass: "bg-sky-400",
    textClass: "text-sky-300",
  },
};

/**
 * Transparent floating chat panel rendered inside OverlayHUD.
 * Shows unified messages from Twitch / YouTube / Kick / Steam with fade-in/out.
 * Authorization gate: public chat + live features require a linked Steam +
 * stream platform (see useAuthStore.isAuthorized).
 */
export const ChatOverlayPanel: React.FC<{ position?: string }> = () => {
  const { messages, settings, lastMessageTime, updateSettings } =
    useChatOverlayStore();
  const isAuthorized = useAuthStore((s) => s.user && s.isAuthorized());
  const t = useTranslation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const enabledPlatforms = settings.platforms.filter((p) => p.enabled);
  const connectedCount = enabledPlatforms.filter((p) => p.connected).length;

  // Fade-out logic in fadeMode: hide when no recent messages
  const [fadedOut, setFadedOut] = React.useState(false);

  useEffect(() => {
    if (!settings.fadeMode) return;
    if (lastMessageTime == null) {
      setFadedOut(true);
      return;
    }
    const deadline = lastMessageTime + settings.fadeOutSec * 1000;
    const check = setInterval(() => {
      if (Date.now() > deadline) setFadedOut(true);
      else setFadedOut(false);
    }, 500);
    return () => clearInterval(check);
  }, [lastMessageTime, settings.fadeMode, settings.fadeOutSec]);

  useEffect(() => {
    if (!fadedOut) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Position mapping
  const posClasses: Record<string, string> = {
    "top-left": "top-20 left-4",
    "top-right": "top-20 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };
  const pos = posClasses[settings.position] ?? posClasses["bottom-right"];

  if (fadedOut) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`absolute ${pos} z-30 w-80 max-h-[50vh] flex flex-col rounded-2xl border border-white/12 bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden`}
      style={{ opacity: fadedOut ? 0 : settings.overlayOpacity }}
    >
      {/* Panel header */}
      <div className="px-3 py-2 bg-white/5 border-b border-white/8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Radio className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-black tracking-wider text-slate-200 uppercase">
            {t("chat.unified")}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          {enabledPlatforms.map((p) => {
            const meta = PLATFORM_META[p.platform];
            return (
              <span
                key={p.platform}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono border ${
                  p.connected
                    ? `${meta.textClass} border-white/15 bg-white/5`
                    : "text-slate-600 border-white/8 bg-transparent"
                }`}
              >
                <span>{meta.label}</span>
                {!p.connected && (
                  <span className="text-[8px] text-slate-500">OFF</span>
                )}
              </span>
            );
          })}
          <span className="text-[9px] font-mono text-emerald-400 font-bold ml-1">
            {connectedCount}/{enabledPlatforms.length}
          </span>
        </div>
      </div>

      {/* Messages area — authorization gate for public chat + live features */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {!isAuthorized ? (
          <div className="m-1 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 text-[11px] leading-relaxed">
            {t("chat.authorizationGate")}
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.slice(0, settings.maxVisible).map((msg) => (
                <ChatRow key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Quick position/Fade controls (compact) */}
      <div className="px-2 py-1.5 bg-white/3 border-t border-white/6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          {(
            Object.keys(posClasses) as Array<keyof typeof posClasses>
          ).map((key) => (
            <button
              key={key}
              onClick={() =>
                updateSettings({ position: key as "top-left" | "top-right" | "bottom-left" | "bottom-right" })
              }
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition ${
                settings.position === key
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800/60 text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
              title={`${t("chat.position")}: ${key}`}
            >
              {key.split("-").map((p) => p[0].toUpperCase()).join("")}
            </button>
          ))}
        </div>
        <button
          onClick={() => updateSettings({ fadeMode: !settings.fadeMode })}
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition ${
            settings.fadeMode
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-slate-800/60 text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          FADE {settings.fadeMode ? "ON" : "OFF"}
        </button>
      </div>
    </motion.div>
  );
};

// ── Single chat message row ────────────────────────────────────
const ChatRow: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const meta = msg.platform ? (PLATFORM_META as Record<string, typeof PLATFORM_META["discord"]>)[msg.platform] : null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="px-2 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] leading-snug"
    >
      <div className="flex items-center space-x-1.5 mb-0.5">
        {meta && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}
            title={meta.label}
          />
        )}
        <span className={`font-bold ${msg.color}`}>{msg.user}</span>
        <span className="text-[8px] font-mono font-bold bg-slate-800 text-slate-400 px-1 py-px rounded border border-white/8 uppercase">
          {msg.badge}
        </span>
      </div>
      <p className="text-slate-300">{msg.text}</p>
    </motion.div>
  );
};
