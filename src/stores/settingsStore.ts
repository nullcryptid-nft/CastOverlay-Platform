import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SettingsState,
  UISettings,
  PerformanceSettings,
  SystemSettings,
} from "../types";
import { db } from "../services/dbService";
import type { AppLanguage } from "../i18n";

const defaultUISettings: UISettings = {
  windowOpacity: 0.92,
  hudScale: 1.0,
  theme: "cyberpunk",
  glassmorphismBlur: 16,
  accentColor: "cyan",
};

const defaultPerformanceSettings: PerformanceSettings = {
  updateIntervalMs: 1000,
  lowLatencyMode: true,
  hardwareAcceleration: true,
  fpsLimit: 240,
};

const defaultSystemSettings: SystemSettings = {
  autoStart: false,
  minimizeToTray: true,
  audioOutputDevice: "default",
  globalHotkeys: [
    { action: "Stat 1 +1 (Win/Kill)", defaultKey: "Alt + NumPad 1" },
    { action: "Stat 2 +1 (Loss/Death)", defaultKey: "Alt + NumPad 2" },
    { action: "Toggle Overlay Visibility", defaultKey: "Alt + Shift + O" },
    { action: "Toggle Click-Through", defaultKey: "Alt + Shift + C" },
    { action: "Play Victory Fanfare", defaultKey: "Alt + F1" },
    { action: "Instant Replay (reset last 30 s)", defaultKey: "Alt + C" },
  ],
};

export type PaymentMethod = "steam" | "card" | "paypal" | "apple" | "google";
const DEFAULT_PAYMENT: PaymentMethod = "steam";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ui: defaultUISettings,
      performance: defaultPerformanceSettings,
      system: defaultSystemSettings,
      language: "en",
      paymentMethod: DEFAULT_PAYMENT as any,
      steamWalletBalance: null,
      setSteamWalletBalance: (balance: number | null) => set({ steamWalletBalance: balance }),
      cardData: { number: "", expiry: "", cvc: "" },
      setCardData: (data) => set({ cardData: data }),
      paypalData: { email: "", password: "" },
      setPaypalData: (data) => set({ paypalData: data }),
      setLanguage: (language: AppLanguage) => set({ language }),
      setPaymentMethod: (method: any) => {
        set({ paymentMethod: method });
        void db.set("settings:payment", method).catch(() => {});
      },

      updateUISetting: <K extends keyof UISettings>(
        key: K,
        value: UISettings[K],
      ) => {
        set((state) => {
          const ui = { ...state.ui, [key]: value };
          // Mirror to the encrypted global db (fire-and-forget).
          void db.set("settings:ui", ui).catch(() => {});
          return { ui };
        });
      },

      updatePerformanceSetting: <K extends keyof PerformanceSettings>(
        key: K,
        value: PerformanceSettings[K],
      ) => {
        set((state) => {
          const performance = { ...state.performance, [key]: value };
          void db.set("settings:performance", performance).catch(() => {});
          return { performance };
        });
      },

      updateSystemSetting: <K extends keyof SystemSettings>(
        key: K,
        value: SystemSettings[K],
      ) => {
        set((state) => {
          const system = { ...state.system, [key]: value };
          void db.set("settings:system", system).catch(() => {});
          return { system };
        });
      },

      resetToDefaults: () => {
        set({
          ui: defaultUISettings,
          performance: defaultPerformanceSettings,
          system: defaultSystemSettings,
        });
        void db.set("settings:ui", defaultUISettings).catch(() => {});
        void db.set("settings:performance", defaultPerformanceSettings).catch(() => {});
        void db.set("settings:system", defaultSystemSettings).catch(() => {});
      },
    }),
    {
      name: "castoverlay-settings",
    },
  ),
);
