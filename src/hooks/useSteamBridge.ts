import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { connectDiscord, connectSteam, disconnectAll } from "../services/chatBridge";
import { useChatOverlayStore } from "../stores/chatOverlayStore";

/**
 * useSteamBridge
 * ----------------
 * Connects enabled chat-bridge transports (Discord, Steam)
 * on mount and disconnects them on unmount. Respects authorization:
 * bridges only start when the user is authenticated AND authorized.
 * Re-connects automatically when authorization state changes.
 */
export function useSteamBridge() {
  const { isAuthenticated, user } = useAuthStore();
  const isAuthorized = user?.isAuthorized ?? false;
  const shouldConnect = isAuthenticated && isAuthorized;

  const disconnectsRef = useRef<Array<() => void>>([]);

  const disconnectAllFromRef = () => {
    disconnectsRef.current.forEach((d) => d());
    disconnectsRef.current = [];
  };

  useEffect(() => {
    if (!shouldConnect) {
      disconnectAllFromRef();
      return;
    }

    const store = useChatOverlayStore.getState();
    const enabledPlatforms = store.settings.platforms.filter((p) => p.enabled);
    const newDisconnects: Array<() => void> = [];

    for (const p of enabledPlatforms) {
      if (p.platform === "discord") {
        newDisconnects.push(connectDiscord());
      }
    }

    newDisconnects.push(connectSteam());
    disconnectsRef.current = newDisconnects;

    return () => {
      disconnectAllFromRef();
      disconnectAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldConnect]);

  useEffect(() => {
    return () => {
      disconnectAllFromRef();
      disconnectAll();
    };
  }, []);
}

export default useSteamBridge;