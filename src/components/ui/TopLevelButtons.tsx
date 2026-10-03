import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, Plug, Check } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "../../stores/authStore";
import { useTranslation } from "../../i18n";

/**
 * Fixed top-level controls for CastOverlay:
 *  - Back  (<)     → top-left   (option: which action)
 *  - Close (X)     → top-right  (quits the Tauri app / closes the page)
 *
 * The buttons are intentionally placed OUTSIDE the React tree that gets
 * reshaped per view (dashboard ↔ overlay) so they always appear exactly
 * at the screen corners.
 */
interface TopLevelButtonsProps {
  /** What the back button should do. Keep undefined to hide the button. */
  onBack?: () => void;
  /** Hide the back button (e.g. on the initial dashboard screen). */
  hideBack?: boolean;
  /** Optional label shown on hover next to the icons. */
  backLabel?: string;
  /** Optional inline className for extra z-index/styling tweaks. */
  className?: string;
}

function isTauri() {
  try {
    // @ts-expect-error – injected by Tauri at runtime
    return !!window.__TAURI_INTERNALS__;
  } catch {
    return false;
  }
}

export const TopLevelButtons: React.FC<TopLevelButtonsProps> = ({
  onBack,
  hideBack = false,
  backLabel,
  className = "",
}) => {
  const [codebridgeActive, setCodebridgeActive] = useState(false);
  const t = useTranslation();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (history.length > 1) {
      window.history.back();
    }
  }, [onBack]);

  const handleActivateCodebridge = useCallback(() => {
    setCodebridgeActive(true);
    window.dispatchEvent(
      new CustomEvent("castoverlay:codebridge-activate", {
        detail: { active: true },
      }),
    );
  }, []);

  const handleClose = useCallback(async () => {
    if (isTauri()) {
      try {
        await invoke("quit_app");
        return;
      } catch {
        /* fall through to close the page */
      }
    }
    window.close();
    // last-resort for embedded webviews – hide everything
    document.body.innerHTML =
      `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#04060a;color:#94a3b8;font-family:monospace">${t("common.appClosed")}</div>`;
  }, []);

  return (
    <>
      {/* Back – top-left */}
      {!hideBack && (
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={handleBack}
          title={backLabel ?? t("common.back")}
          aria-label={backLabel ?? t("common.back")}
          className={`group fixed top-3 left-3 z-[9990] flex items-center gap-1.5
            h-9 pl-2 pr-3 rounded-full
            border border-white/10 bg-slate-900/80
            text-slate-200 text-xs font-bold tracking-wide shadow-lg
            hover:bg-slate-800 hover:border-cyan-400/50 hover:text-cyan-300
            focus:outline-none focus:ring-2 focus:ring-cyan-400/40
            active:scale-95 transition ${className}`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {backLabel && (
            <span className="hidden sm:inline">{backLabel}</span>
          )}
        </motion.button>
      )}

      {/* CodeBridge activate – top-right, left of close */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        onClick={handleActivateCodebridge}
        title={codebridgeActive ? "CodeBridge active" : "Activate CodeBridge"}
        aria-label={codebridgeActive ? "CodeBridge active" : "Activate CodeBridge"}
        className={`fixed top-3 right-12 z-[9990] flex items-center justify-center
          h-9 w-9 rounded-full
          backdrop-blur-md shadow-lg transition active:scale-95
          focus:outline-none focus:ring-2 focus:ring-cyan-400/50
          ${
            codebridgeActive
              ? "border border-emerald-400/60 bg-emerald-900/80 text-emerald-300 hover:bg-emerald-600/80 hover:text-white"
              : "border border-white/10 bg-slate-900/80 text-slate-200 hover:bg-cyan-600/90 hover:border-cyan-400/70 hover:text-white"
          } ${className}`}
      >
        {codebridgeActive ? (
          <Check className="h-4.5 w-4.5" aria-hidden />
        ) : (
          <Plug className="h-4.5 w-4.5" aria-hidden />
        )}
      </motion.button>

      {/* Close – top-right */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={handleClose}
        title={t("common.quit")}
        aria-label={t("common.quitApp")}
        className={`fixed top-3 right-3 z-[9990] flex items-center justify-center
          h-9 w-9 rounded-full
          border border-white/10 bg-slate-900/80 backdrop-blur-md
          text-slate-200 shadow-lg
          hover:bg-rose-600/90 hover:border-rose-400/70 hover:text-white
          focus:outline-none focus:ring-2 focus:ring-rose-400/50
          active:scale-95 transition ${className}`}
      >
        <X className="h-4.5 w-4.5" aria-hidden />
      </motion.button>
    </>
  );
};

export default TopLevelButtons;
