import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  HudElementConfig,
  HudLayoutProfile,
  LayoutStudioState,
} from "../types";
import { db } from "../services/dbService";

const LAYOUT_DB_KEY = "layout:elements";

/** Mirror HUD layout to the encrypted global db (fire-and-forget). */
function persistLayout(elements: HudElementConfig[]) {
  void db.set(LAYOUT_DB_KEY, elements).catch(() => {});
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ── Default element positions (percent-based) ──────────────────
const DEFAULT_ELEMENTS: HudElementConfig[] = [
  {
    id: "topbar",
    label: "Hlavný panel",
    x: 2,
    y: 2,
    w: 38,
    h: 6,
    opacity: 0.92,
    visible: true,
    z: 10,
  },
  {
    id: "metrics",
    label: "HUD Metriky",
    x: 60,
    y: 8,
    w: 38,
    h: 55,
    opacity: 0.92,
    visible: true,
    z: 10,
  },
  {
    id: "score1",
    label: "Stav 1",
    x: 60,
    y: 65,
    w: 9,
    h: 12,
    opacity: 0.92,
    visible: true,
    z: 20,
  },
  {
    id: "score2",
    label: "Stav 2",
    x: 70.5,
    y: 65,
    w: 9,
    h: 12,
    opacity: 0.92,
    visible: true,
    z: 20,
  },
  {
    id: "score3",
    label: "Stav 3",
    x: 60,
    y: 78,
    w: 9,
    h: 12,
    opacity: 0.92,
    visible: true,
    z: 20,
  },
  {
    id: "score4",
    label: "Stav 4",
    x: 70.5,
    y: 78,
    w: 9,
    h: 12,
    opacity: 0.92,
    visible: true,
    z: 20,
  },
];

export const useLayoutStudioStore = create<LayoutStudioState>()(
  persist(
    (set, get) => ({
      elements: DEFAULT_ELEMENTS.map((e) => ({ ...e })),
      selectedId: null,
      isEditing: false,

      setEditing: (v) => set({ isEditing: v }),
      selectElement: (id) => set({ selectedId: id }),

      moveElement: (id, x, y) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id
              ? {
                  ...el,
                  x: clamp(x, 0, 100 - el.w),
                  y: clamp(y, 0, 100 - el.h),
                }
              : el
          ),
        })),
      // Mirror moved layout to the encrypted global db
      // (throttled by persist option below would be ideal, but we only
      // write after the action completes to avoid per-frame db traffic).
      onBlurElements: () => persistLayout(get().elements),

      resizeElement: (id, w, h) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id
              ? {
                  ...el,
                  w: clamp(w, 4, 100 - el.x),
                  h: clamp(h, 3, 100 - el.y),
                }
              : el
          ),
        })),

      updateOpacity: (id, opacity) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, opacity: clamp(opacity, 0.1, 1) } : el
          ),
        })),

      toggleVisibility: (id) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, visible: !el.visible } : el
          ),
        })),

      resetLayout: () =>
        set({ elements: DEFAULT_ELEMENTS.map((e) => ({ ...e })) }),

      exportProfile: () => {
        const { elements } = get();
        const profile: HudLayoutProfile = {
          name: "CastOverlay HUD Profile",
          author: "user",
          exportedAt: new Date().toISOString(),
          elements: elements.map((e) => ({ ...e })),
        };
        return JSON.stringify(profile, null, 2);
      },

      importProfile: (json: string) => {
        try {
          const parsed = JSON.parse(json) as HudLayoutProfile;
          if (!Array.isArray(parsed.elements)) return false;

          const validIds = new Set<string>(DEFAULT_ELEMENTS.map((e) => e.id));
          const validElements: HudElementConfig[] = [];

          for (const el of parsed.elements) {
            if (
              el &&
              typeof el.id === "string" &&
              validIds.has(el.id) &&
              typeof el.x === "number" &&
              typeof el.y === "number" &&
              typeof el.w === "number" &&
              typeof el.h === "number"
            ) {
              // Find default to get the label
              const def = DEFAULT_ELEMENTS.find((d) => d.id === el.id);
              if (!def) continue;
              validElements.push({
                ...def,
                x: clamp(el.x, 0, 96),
                y: clamp(el.y, 0, 97),
                w: clamp(el.w, 4, 100),
                h: clamp(el.h, 3, 100),
                opacity: clamp(
                  typeof el.opacity === "number" ? el.opacity : 0.92,
                  0.1,
                  1
                ),
                visible: typeof el.visible === "boolean" ? el.visible : true,
                z: typeof el.z === "number" ? el.z : 10,
              });
            }
          }

          if (validElements.length > 0) {
            set({ elements: validElements });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "castoverlay-layout-studio",
      partialize: (state) => ({
        elements: state.elements,
      }),
    }
  )
);
