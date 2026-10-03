/**
 * Steam Rich Presence status manager (sec. 1).
 *
 * The Steam client profile status follows this exact format:
 *   Status:  "Using CastOverlay Platform"
 *   Details: "In-Game [GameName] with Live Overlay"
 *
 * Because this is a Tauri webview app (the game itself must call
 * Steam's SRPC `RichPresence` to publish on the *Steam client* profile
 * — a third-party process cannot push that), this service:
 *   1. Tracks & persists the correct status strings (SQLite via dbService).
 *   2. Exposes them to the in-app status card so the user can verify them.
 *   3. When the game itself is launched via `steam://run/<appId>`, the game
 *      inherits the steam client session; CastOverlay's overlay state
 *      (which game is selected) is what this service reports, matching the
 *      format a Steam RP payload would carry.
 */
import { db } from "./dbService";
import { getTransientSteamId } from "../stores/gameStore";

export interface RichPresenceStatus {
  status: string;      // "Using CastOverlay Platform"
  details: string;     // "In-Game [Game] with Live Overlay"
  gameName: string | null;
  updatedAt: string;
}

const PRESENCE_KEY = "steam:rich_presence";
const STATUS = "Using CastOverlay Platform";

function buildDetails(gameName: string | null): string {
  return gameName
    ? `In-Game ${gameName} with Live Overlay`
    : "Preparing Live Overlay";
}

export async function initSteamPresence(steamId: string): Promise<void> {
  void steamId; // reserved: future per-user RP key scoping
  // Hydrate presence from persistence on app boot / login.
  const existing = await db.get<RichPresenceStatus>(PRESENCE_KEY).catch(() => null);
  if (existing) {
    _presence.status = existing.status;
    _presence.details = existing.details;
    _presence.gameName = existing.gameName ?? null;
    _presence.updatedAt = existing.updatedAt;
    _notify();
  }
}

let _presence: RichPresenceStatus = {
  status: STATUS,
  details: buildDetails(null),
  gameName: null,
  updatedAt: new Date().toISOString(),
};

const _listeners = new Set<() => void>();
function _notify() {
  _listeners.forEach((fn) => fn());
}

/**
 * Set the Rich Presence game. Update the details string to the canonical
 * "In-Game [Game] with Live Overlay" format and persist it.
 */
export async function setPresenceGame(gameName: string | null): Promise<RichPresenceStatus> {
  _presence = {
    status: STATUS,
    details: buildDetails(gameName),
    gameName: gameName ?? null,
    updatedAt: new Date().toISOString(),
  };
  _notify();
  try {
    await db.set(PRESENCE_KEY, _presence);
  } catch {
    // Non-fatal: presence still in memory
  }
  _notify();
  return _presence;
}

/** Sync presence whenever the user selects a new game — call from a hook. */
export function onPresenceChange(fn: () => void): () => void {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}

/** Current in-memory presence (sync accessor for UI). */
export function getPresenceSync(): RichPresenceStatus {
  return _presence;
}

/** Convenience: steam profile URL for the linked user. */
export function steamProfileUrl(steamId?: string | null): string {
  const id = steamId ?? getTransientSteamId();
  return id ? `https://steamcommunity.com/profiles/${id}` : "https://store.steampowered.com/";
}

export default {
  initSteamPresence,
  setPresenceGame,
  onPresenceChange,
  getPresenceSync,
  steamProfileUrl,
};