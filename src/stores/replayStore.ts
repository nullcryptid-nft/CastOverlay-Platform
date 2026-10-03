import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReplayFrame, ReplayClip, ReplayFormat, ReplayState } from "../types";

const RING_BUFFER_MAX_FRAMES = 180; // ~30 s at 6 fps
const SAVE_DURATION_SEC = 30;

/**
 * Stable in-memory ring buffer persisted across renders.
 * localStorage is NOT used for raw frames (too large), only clip metadata.
 */
export const useReplayStore = create<ReplayState>()(
  persist(
    (set, get) => ({
      frames: [],
      isCapturing: false,
      lastClip: null,
      ringDurationSec: SAVE_DURATION_SEC,

      pushFrame: (frame: ReplayFrame) => {
        set((state) => {
          const frames = [...state.frames, frame];
          // Drop oldest frames beyond ring capacity
          while (frames.length > RING_BUFFER_MAX_FRAMES) frames.shift();
          return { frames };
        });
      },

      pruneFrames: () => {
        const { ringDurationSec } = get();
        const cutoff = Date.now() - ringDurationSec * 1000 - 1000;
        set((state) => ({
          frames: state.frames.filter((f) => f.timestamp >= cutoff),
        }));
      },

      captureNow: (gameName = "Neznáma hra") => {
        const { frames, ringDurationSec } = get();
        if (frames.length < 2) return null;

        // Take last N seconds worth of frames
        const oldestKeep =
          frames[frames.length - 1].timestamp - ringDurationSec * 1000;
        const capturedFrames = frames.filter((f) => f.timestamp >= oldestKeep);

        if (capturedFrames.length === 0) return null;

        // Build a simple data URI "video" representation (base64 frame stack).
        // In a production Tauri build this would call the Rust backend (FFmpeg).
        const frameB64s = capturedFrames.map((f) => f.jpeg);
        const videoData = btoa(
          JSON.stringify({
            gameName,
            capturedAt: new Date().toISOString(),
            duration: ringDurationSec,
            frameCount: capturedFrames.length,
            frames: frameB64s,
          }),
        );

        const clip: ReplayClip = {
          id: crypto.randomUUID(),
          gameName,
          duration: ringDurationSec,
          format: "mp4",
          filePath: `replay/${videoData.length}b`,
          thumb: capturedFrames[0]?.jpeg,
          capturedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set({ lastClip: clip });

        // Clear ring after capture to avoid re-saving same content
        set({ frames: [] });

        return clip;
      },

      setLastClip: (clip: ReplayClip | null) => set({ lastClip: clip }),
      setCapturing: (v: boolean) => set({ isCapturing: v }),
      setRingDurationSec: (v: number) =>
        set({ ringDurationSec: Math.max(5, Math.min(120, v)) }),
      clearRing: () => set({ frames: [] }),
    }),
    {
      name: "castoverlay-replay",
      partialize: (state) => ({
        lastClip: state.lastClip,
        ringDurationSec: state.ringDurationSec,
      }),
    },
  ),
);

/**
 * Hook that hooks frame capture into the existing telemetry loop.
 * Call inside a useEffect in App or OverlayHUD.
 */
export function useReplayFrameCapture(enabled = true) {
  const pushFrame = useReplayStore((s) => s.pushFrame);
  const pruneFrames = useReplayStore((s) => s.pruneFrames);
  const isCapturing = useReplayStore((s) => s.isCapturing);

  return {
    pushFrame,
    pruneFrames,
    isCapturing,
    enabled,
  };
}

/** Export so App/Overlay can call captureNow directly */
export function captureReplay(
  gameName?: string,
  format: string | ReplayFormat = "mp4",
): ReplayClip | null {
  const store = useReplayStore.getState();
  store.pruneFrames();
  const clip = store.captureNow(gameName);
  if (clip) clip.format = format;
  if (clip) useReplayStore.getState().setLastClip(clip);
  return clip;
}