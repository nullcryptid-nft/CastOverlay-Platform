import { useCallback } from "react";
import { useOverlayStore } from "../stores/overlayStore";
import { useSettingsStore } from "../stores/settingsStore";

declare global {
  interface Window {
    __TAURI__?: {
      window: {
        getCurrent: () => Promise<{
          setTitle: (title: string) => Promise<void>;
          setSize: (size: { width: number; height: number }) => Promise<void>;
          setPosition: (position: { x: number; y: number }) => Promise<void>;
          setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>;
          setDecorations: (decorations: boolean) => Promise<void>;
          setVisible: (visible: boolean) => Promise<void>;
          setFocus: () => Promise<void>;
          center: () => Promise<void>;
          minimize: () => Promise<void>;
          maximize: () => Promise<void>;
          close: () => Promise<void>;
          listen: (
            event: string,
            handler: (e: unknown) => void,
          ) => Promise<() => void>;
          emit: (event: string, payload: unknown) => Promise<void>;
        }>;
        getByLabel: (label: string) => Promise<{
          setVisible: (visible: boolean) => Promise<void>;
          setPosition: (position: { x: number; y: number }) => Promise<void>;
          setSize: (size: { width: number; height: number }) => Promise<void>;
        }>;
      };
      core: {
        invoke: <T>(
          command: string,
          args?: Record<string, unknown>,
        ) => Promise<T>;
      };
      globalShortcut: {
        register: (shortcut: string, handler: () => void) => Promise<void>;
        unregister: (shortcut: string) => Promise<void>;
        unregisterAll: () => Promise<void>;
      };
      store: {
        get: <T>(key: string, storeId?: string) => Promise<T | null>;
        set: (key: string, value: unknown, storeId?: string) => Promise<void>;
      };
      dialog: {
        open: (options?: {
          directory?: boolean;
          multiple?: boolean;
          filters?: Array<{ name: string; extensions: string[] }>;
        }) => Promise<string | string[] | null>;
        save: (options?: {
          filters?: Array<{ name: string; extensions: string[] }>;
          defaultPath?: string;
        }) => Promise<string | null>;
        message: (
          message: string,
          options?: {
            title?: string;
            type?: "info" | "warning" | "error" | "question";
          },
        ) => Promise<void>;
      };
      notification: {
        send: (notification: {
          title: string;
          body: string;
          icon?: string;
        }) => Promise<void>;
        requestPermission: () => Promise<"granted" | "denied">;
      };
      os: {
        platform: () => Promise<string>;
        version: () => Promise<string>;
      };
    };
  }
}

const isTauri = () =>
  typeof window !== "undefined" && Boolean(window.__TAURI__);

export function useTauriWindow() {
  const { isOverlayMode, setOverlayMode, setClickThrough } = useOverlayStore();

  const getMainWindow = useCallback(async () => {
    if (!isTauri() || !window.__TAURI__) return null;
    return window.__TAURI__.window.getCurrent();
  }, []);

  const getOverlayWindow = useCallback(async () => {
    if (!isTauri() || !window.__TAURI__) return null;
    return window.__TAURI__.window.getByLabel("overlay");
  }, []);

  const toggleOverlayWindow = useCallback(async () => {
    if (!isTauri()) {
      setOverlayMode(!isOverlayMode);
      return;
    }

    const overlayWindow = await getOverlayWindow();
    if (overlayWindow) {
      const newMode = !isOverlayMode;
      await overlayWindow.setVisible(newMode);
      setOverlayMode(newMode);
    }
  }, [getOverlayWindow, isOverlayMode, setOverlayMode]);

  const setOverlayClickThrough = useCallback(
    async (enabled: boolean) => {
      setClickThrough(enabled);
      if (!isTauri() || !window.__TAURI__) return;
      await window.__TAURI__.core.invoke("set_window_ignore_cursor_events", {
        label: "overlay",
        ignore: enabled,
      });
    },
    [setClickThrough],
  );

  return {
    isTauri: isTauri(),
    getMainWindow,
    getOverlayWindow,
    toggleOverlayWindow,
    setOverlayClickThrough,
  };
}

export function useGlobalShortcuts() {
  const { system } = useSettingsStore();

  const registerShortcuts = useCallback(async () => {
    if (!isTauri() || !window.__TAURI__) return;
    try {
      await window.__TAURI__.globalShortcut.unregisterAll();
    } catch (e) {
      console.warn("Failed to register global shortcuts:", e);
    }
  }, [system.globalHotkeys]);

  const unregisterShortcuts = useCallback(async () => {
    if (!isTauri() || !window.__TAURI__) return;
    try {
      await window.__TAURI__.globalShortcut.unregisterAll();
    } catch (e) {
      console.warn("Failed to unregister global shortcuts:", e);
    }
  }, []);

  return {
    registerShortcuts,
    unregisterShortcuts,
  };
}
