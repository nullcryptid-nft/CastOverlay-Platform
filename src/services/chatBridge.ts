import { useChatOverlayStore } from "../stores/chatOverlayStore";
import { useAuthStore } from "../stores/authStore";
import { MOCK_CHAT } from "../mockData/mockChat";
import type { ChatMessage, Platform } from "../types";

type DisconnectFn = () => void;

/** CSS accent color per platform (used in the chat feed) */
export const PLATFORM_ACCENT: Record<Platform, string> = {
  discord: "#5865F2",
  steam: "#1A9FFF",
};

const ROLE_BADGE: Record<NonNullable<ChatMessage["role"]>, string> = {
  mod: "â…",
  sub: "â­",
  vip: "đź’Ž",
  friend: "đź‘Ą",
  user: "âś¦",
};

const ROLE_COLOR: Record<NonNullable<ChatMessage["role"]>, string> = {
  mod: "text-purple-400",
  sub: "text-amber-400",
  vip: "text-cyan-400",
  friend: "text-emerald-400",
  user: "text-slate-300",
};

export { ROLE_COLOR, ROLE_BADGE };

function randomDelay(): number {
  return 3000 + Math.floor(Math.random() * 2000);
}

/**
 * Creates a mock chat-bridge for a given platform.
 * In production this would use a real transport:
 *   - Discord: Gateway WebSocket
 *   - Steam:   Steam Hub / ISteamUser (poll 8 s)
 * For now samples from MOCK_CHAT at 3â€“5 s.
 */
function createMockBridge(platform: Platform): DisconnectFn {
  let idx = Math.floor(Math.random() * MOCK_CHAT.length);

  const doTick = () => {
    const store = useChatOverlayStore.getState();

    const cfg = store.settings.platforms.find((p) => p.platform === platform);
    if (!cfg || !cfg.connected || !cfg.enabled) return;

    const src = MOCK_CHAT[idx % MOCK_CHAT.length];
    idx++;

    store.pushMessage({
      user: src.user,
      badge: ROLE_BADGE[src.role ?? "user"] ?? "âś¦",
      color: src.color,
      text: src.text,
      platform: src.platform,
      role: src.role,
    });
  };

  const tickInterval = setInterval(doTick, randomDelay());
  setTimeout(doTick, 400 + Math.random() * 800);

  return () => clearInterval(tickInterval);
}

/**
 * Add a real transport for a platform's live feed.
 *   - Discord: Gateway WebSocket
 *   - Steam:   ISteamUser / Hub polling
 */
export function registerPlatformTransport(
  platform: Platform,
  factory: () => DisconnectFn
): void {
  realTransports[platform] = factory;
}

const realTransports: Partial<Record<Platform, () => DisconnectFn>> = {};

const forPlatform = (platform: Platform): DisconnectFn =>
  realTransports[platform]
    ? realTransports[platform]!()
    : createMockBridge(platform);

// â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Authorization gate: Discord / Steam chat feeds are only available
 * once the user has linked Steam (see useAuthStore.isAuthorized).
 */
function authorizedForChat(): boolean {
  try {
    return useAuthStore.getState().isAuthorized();
  } catch {
    return false;
  }
}

export function connectDiscord(): DisconnectFn {
  const store = useChatOverlayStore.getState();
  if (!authorizedForChat()) return () => {};
  store.connectPlatform("discord");
  return forPlatform("discord");
}

export function connectSteam(): DisconnectFn {
  const store = useChatOverlayStore.getState();
  if (!authorizedForChat()) return () => {};
  store.connectPlatform("steam");
  return forPlatform("steam");
}

const activeDiscon: DisconnectFn[] = [];

export function disconnectAll(): void {
  activeDiscon.forEach((d) => d());
  activeDiscon.length = 0;
}

/** Register a connect fn so disconnectAll can reach it. */
export function trackBridge(fn: DisconnectFn): void {
  activeDiscon.push(fn);
}
