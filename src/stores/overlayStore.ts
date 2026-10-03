import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OverlayState, HardwareMetrics } from '../types';

const defaultHardware: HardwareMetrics = {
  cpu: 28,
  ramUsed: 8.4,
  ramTotal: 32.0,
  fps: 240,
  gpuTemp: 58,
};

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set) => ({
      isOverlayMode: false,
      isLocked: false,
      isClickThrough: false,
      soundEnabled: true,
      hardware: defaultHardware,

      setOverlayMode: (enabled: boolean) => {
        set({ isOverlayMode: enabled });
      },

      setLocked: (locked: boolean) => {
        set({ isLocked: locked });
      },

      setClickThrough: (enabled: boolean) => {
        set({ isClickThrough: enabled });
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },

      updateHardware: (metrics: Partial<HardwareMetrics>) => {
        set((state) => ({
          hardware: { ...state.hardware, ...metrics },
        }));
      },
    }),
    {
      name: 'castoverlay-overlay',
      partialize: (state) => ({
        isLocked: state.isLocked,
        isClickThrough: state.isClickThrough,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);