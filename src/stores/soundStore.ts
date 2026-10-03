import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SoundboardItem, SoundboardState } from "../types";
import { SOUNDBOARD_ITEMS } from "../data/games";
import { db } from "../services/dbService";

const SOUNDBOARD_KEY = "soundboard:items";

export const useSoundStore = create<SoundboardState>()(
  persist(
    (set) => ({
      items: SOUNDBOARD_ITEMS,
      isRecording: false,

      addSound: (item: SoundboardItem) => {
        set((s) => {
          const items = [...s.items, item];
          void db.set(SOUNDBOARD_KEY, items).catch(() => {});
          return { items };
        });
      },

      removeSound: (id: string) => {
        set((s) => {
          const items = s.items.filter((i) => i.id !== id);
          void db.set(SOUNDBOARD_KEY, items).catch(() => {});
          return { items };
        });
      },

      renameSound: (id: string, name: string) => {
        set((s) => {
          const items = s.items.map((i) => (i.id === id ? { ...i, name } : i));
          void db.set(SOUNDBOARD_KEY, items).catch(() => {});
          return { items };
        });
      },

      setShortcut: (id: string, shortcut: string) => {
        set((s) => {
          const items = s.items.map((i) => (i.id === id ? { ...i, shortcut } : i));
          void db.set(SOUNDBOARD_KEY, items).catch(() => {});
          return { items };
        });
      },

      setRecording: (v: boolean) => {
        set({ isRecording: v });
      },
    }),
    {
      name: "castoverlay-soundboard",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);