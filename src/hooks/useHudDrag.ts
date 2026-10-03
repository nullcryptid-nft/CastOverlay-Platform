import { useCallback } from "react";
import { useLayoutStudioStore } from "../stores/layoutStudioStore";
import type { HudElementId } from "../types";

export interface HudDragState {
  onElementMouseDown: (id: HudElementId) => (e: React.MouseEvent) => void;
  onResizeMouseDown: (id: HudElementId) => (e: React.MouseEvent) => void;
}

/**
 * Returns handlers for drag-to-move and drag-to-resize of HUD elements.
 * Attach `onElementMouseDown` to the element's mousedown listener,
 * and `onResizeMouseDown` to a resize handle's mousedown.
 */
export function useHudDrag(): HudDragState {
  const onElementMouseDown = useCallback(
    (id: HudElementId) => (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const store = useLayoutStudioStore.getState();
      const el = store.elements.find((x) => x.id === id);
      if (!el) return;
      const startElX = el.x;
      const startElY = el.y;
      useLayoutStudioStore.getState().selectElement(id);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const onMouseMove = (me: MouseEvent) => {
        const dx = ((me.clientX - startX) / vw) * 100;
        const dy = ((me.clientY - startY) / vh) * 100;
        useLayoutStudioStore.getState().moveElement(id, startElX + dx, startElY + dy);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    []
  );

  const onResizeMouseDown = useCallback(
    (id: HudElementId) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const store = useLayoutStudioStore.getState();
      const el = store.elements.find((x) => x.id === id);
      if (!el) return;
      const startW = el.w;
      const startH = el.h;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const onMouseMove = (me: MouseEvent) => {
        const dw = ((me.clientX - startX) / vw) * 100;
        const dh = ((me.clientY - startY) / vh) * 100;
        useLayoutStudioStore.getState().resizeElement(id, startW + dw, startH + dh);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    []
  );

  return { onElementMouseDown, onResizeMouseDown };
}
