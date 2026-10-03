import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  ChatOverlayState,
  ChatOverlaySettings,
} from "../types";
import { db } from "../services/dbService";

// �─ Simulated Discord message generators ───────────────────────
const SIMULATED_USERS: Array<{
  user: string;
  badge: string;
  color: string;
  platform: "discord" | "steam";
}> = [
  { user: "CyberGamer99", badge: "MEMBER", color: "text-cyan-400", platform: "discord" },
  { user: "ViperMain", badge: "MOD", color: "text-emerald-400", platform: "discord" },
  { user: "PixelQueen", badge: "VIP", color: "text-purple-400", platform: "discord" },
  { user: "NeonRider", badge: "BOOSTER", color: "text-amber-400", platform: "discord" },
  { user: "ShadowWolf", badge: "FOUNDER", color: "text-rose-400", platform: "discord" },
  { user: "GlitchHunter", badge: "MOD", color: "text-orange-400", platform: "discord" },
  { user: "TurboSniper", badge: "ADMIN", color: "text-blue-400", platform: "discord" },
  { user: "SteamLord", badge: "STEAM", color: "text-sky-400", platform: "steam" },
];

const SIMULATED_TEXTS = [
  "That clutch was insane! 🔥",
  "GGWP everyone",
  "First time here, love the stream!",
  "How's the K/D looking today?",
  "Let's gooo! 🚀",
  "That aim is so cracked",
  "CastOverlay juristnie na 240 FPS 🎮",
  "Made me laugh out loud",
  "Stacking wins rn, ngl",
  "What settings are you using?",
  "Chat is popping off right now",
  "Insane play, 10/10",
  "Bro really did that 😂",
  "Nice highlight incoming",
  "This is the best stream on the platform",
];

let msgIdCounter = 100;

function randomSimulatedMessage(): Omit<ChatMessage, "id" | "timestamp"> {
  const user = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
  const text = SIMULATED_TEXTS[Math.floor(Math.random() * SIMULATED_TEXTS.length)];
  return { user: user.user, badge: user.badge, color: user.color, text, platform: user.platform };
}

// ── Default settings ───────────────────────────────────────────
const DEFAULT_SETTINGS: ChatOverlaySettings = {
  fadeMode: true,
  fadeOutSec: 8,
  maxVisible: 12,
  position: "bottom-right",
  overlayOpacity: 0.88,
  platforms: [
    { platform: "discord", connected: true, channel: "castoverlay", enabled: true },
    { platform: "steam", connected: false, channel: "", enabled: true },
  ],
};

const MAX_MESSAGES = 60;

export const useChatOverlayStore = create<ChatOverlayState>()(
  persist(
    (set, get) => ({
      messages: [],
      lastMessageTime: null,
      isVisible: false,
      settings: DEFAULT_SETTINGS,

      pushMessage: (msg) => {
        const now = Date.now();
        const fullMsg: ChatMessage = {
          ...msg,
          id: ++msgIdCounter,
          timestamp: new Date(now).toISOString(),
        };
        set((state) => ({
          messages: [fullMsg, ...state.messages].slice(0, MAX_MESSAGES),
          lastMessageTime: now,
          isVisible: true,
        }));
      },

      pruneMessages: () => {
        const { settings } = get();
        set((state) => ({
          messages: state.messages.slice(0, settings.maxVisible),
        }));
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      togglePlatform: (platform) => {
        set((state) => ({
          settings: {
            ...state.settings,
            platforms: state.settings.platforms.map((p) =>
              p.platform === platform ? { ...p, enabled: !p.enabled } : p
            ),
          },
        }));
      },

      setChannel: (platform, channel) => {
        set((state) => ({
          settings: {
            ...state.settings,
            platforms: state.settings.platforms.map((p) =>
              p.platform === platform ? { ...p, channel } : p
            ),
          },
        }));
      },

      connectPlatform: (platform) => {
        set((state) => ({
          settings: {
            ...state.settings,
            platforms: state.settings.platforms.map((p) =>
              p.platform === platform ? { ...p, connected: true } : p
            ),
          },
        }));
      },

      disconnectPlatform: (platform) => {
        set((state) => ({
          settings: {
            ...state.settings,
            platforms: state.settings.platforms.map((p) =>
              p.platform === platform ? { ...p, connected: false } : p
            ),
          },
        }));
      },
    }),
    {
      name: "castoverlay-chat-overlay",
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);

// ── Simulation helper — start a fake message feed ──────────────
export function startChatSimulation(intervalMs = 3500) {
  const store = useChatOverlayStore;
  const interval = setInterval(() => {
    const s = store.getState();
    // Only push if at least one platform is enabled & connected
    const anyEnabled = s.settings.platforms.some(
      (p) => p.enabled && p.connected
    );
    if (!anyEnabled) return;
    const msg = randomSimulatedMessage();
    // Only push if this platform is enabled (filter out disconnected)
    const enabledPlatforms = new Set(
      s.settings.platforms.filter((p) => p.enabled && p.connected).map((p) => p.platform as string)
    );
    if (msg.platform && !enabledPlatforms.has(msg.platform)) return;
    s.pushMessage(msg);
  }, intervalMs);

  return () => clearInterval(interval);
}
