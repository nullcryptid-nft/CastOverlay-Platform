import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "./stores/appStore";
import { useGameStore } from "./stores/gameStore";
import { RichPresenceCard } from "./components/RichPresenceCard";
import { useOverlayStore } from "./stores/overlayStore";
import { useClubStore } from "./stores/clubStore";
import { useAuthStore, initSteamAuthEventBridge } from "./stores/authStore";
import { useSocialStore } from "./stores/socialStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useSoundStore } from "./stores/soundStore";
import { captureReplay } from "./stores/replayStore";
import { autoGenerateRecap } from "./stores/coachStore";
import { PlatformHeader } from "./components/ui/PlatformHeader";
import { AuthModal } from "./components/ui/AuthModal";
import { PlatformLandingView } from "./components/views/PlatformLandingView";
import { GameLibraryView } from "./components/views/GameLibraryView";
import { ClubView } from "./components/views/ClubView";
import { SoundboardView } from "./components/views/SoundboardView";
import { StreamChatView } from "./components/views/StreamChatView";
import { ReplayView } from "./components/views/ReplayView";
import { SettingsView } from "./components/views/SettingsView";
import { OverlayHUD } from "./components/overlay/OverlayHUD";
import { TiltMeter, TiltRestBanner } from "./components/TiltMeter";
import { CoachRecapModal } from "./components/CoachRecapModal";
import { BootupScreen } from "./components/BootupScreen";
import { ParticleBackground } from "./components/ParticleBackground";
import {
  NotificationToast,
  type ToastItem,
} from "./components/NotificationToast";
import {
  SoundRewardOverlay,
  useSoundRewardSimulation,
} from "./components/SoundRewardOverlay";
import { SafeZoneGrid } from "./components/SafeZoneGrid";
import { TopLevelButtons } from "./components/ui/TopLevelButtons";
import { useAutoGameDetection } from "./hooks/useAutoGameDetection";
import type { GameProfile } from "./types";
import { useTranslation } from "./i18n";

/** Global X in the top-right corner to quit the app / window */
function GlobalQuitButton(): React.ReactElement {
  const t = useTranslation();
  return (
    <button
      title={t("common.quit")}
      onClick={() => {
        const w = window as unknown as {
          __TAURI__?: {
            core?: {
              window?: { getCurrent?: () => { close: () => Promise<void> } };
            };
            webviewWindow?: {
              getCurrent?: () => { close: () => Promise<void> };
            };
            event?: { emit: (e: string) => Promise<void> };
          };
        };
        const win =
          w.__TAURI__?.core?.window?.getCurrent?.() ??
          w.__TAURI__?.webviewWindow?.getCurrent?.();
        if (win) {
          win.close().catch(() => window.close());
        } else {
          window.close();
        }
      }}
      className="fixed top-3 right-3 z-[9989] w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-sm font-bold hover:bg-rose-600/80 hover:text-white hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-200"
    >
      <span className="text-base leading-none">�</span>
    </button>
  );
}

/**
 * Left-top back arrow that appears only when the user is signed in via Steam.
 * Tapping it returns to the dashboard (exits overlay mode).
 */
function SteamBackArrow({
  onBack,
}: {
  onBack: () => void;
}): React.ReactElement | null {
  const { isAuthenticated, user } = useAuthStore();
  const t = useTranslation();
  if (!isAuthenticated || !user?.steam?.steamId) return null;
  return (
    <button
      onClick={onBack}
      title={t("common.back")}
      className="fixed top-3 left-3 z-[99999] flex items-center gap-2 px-3 h-9 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wide backdrop-blur-sm hover:bg-cyan-500/25 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 -translate-x-0.5"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span className="whitespace-nowrap">{t("common.back")}</span>
    </button>
  );
}

function App() {
  const { activeTab, setActiveTab } = useAppStore();
  const t = useTranslation();
  const { selectedGame, setSelectedGame, stressMode, victoryBanner } =
    useGameStore();
  const { isOverlayMode, setOverlayMode, updateHardware } = useOverlayStore();
  const { performance } = useSettingsStore();
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<"boot" | "app">("boot");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [safeZoneOpen, setSafeZoneOpen] = useState(false);
  const [reward, simulateReward] = useSoundRewardSimulation();

  // Add/dismiss toast
  const addToast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      5000,
    );
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Auto game detection → auto-switch profile + toast
  useAutoGameDetection(
    useCallback(
      (info) => {
        addToast({
          title: t("toast.gameDetected").replace("{game}", info.displayName),
          description: t("toast.hudReady"),
          icon: "game",
        });
      },
      [addToast, t],
    ),
  );

  // ── Steam auth success: register Tauri event bridge + show toast ──
  useEffect(() => {
    // Register the one-shot Tauri "steam-auth-success" listener (no-op in browser)
    initSteamAuthEventBridge();

    // Listen for the DOM CustomEvent dispatched by the store's handler
    const onSteamSuccess = () => {
      addToast({
        title: t("toast.steamSuccess"),
        description: t("toast.steamConnected"),
        icon: "game",
      });
    };
    window.addEventListener("castoverlay:steam-auth-success", onSteamSuccess);
    return () =>
      window.removeEventListener(
        "castoverlay:steam-auth-success",
        onSteamSuccess,
      );
  }, [addToast, t]);

  // Simulated soundboard reward (Twitch/Kick style)
  useEffect(() => {
    if (bootPhase === "boot") return;
    const t = setInterval(() => simulateReward(), 12000);
    return () => clearInterval(t);
  }, [bootPhase, simulateReward]);

  // Simulated live telemetry loop (works seamlessly in browser & Tauri v2)
  useEffect(() => {
    const interval = setInterval(() => {
      const targetFps = selectedGame?.targetFps || 240;
      const cpuDelta = stressMode
        ? Math.random() * 25 + 65
        : Math.random() * 10 + 20;
      const ramDelta = stressMode ? 14.2 : 8.4 + Math.random() * 0.4;
      const fpsDelta = stressMode
        ? Math.floor(targetFps * 0.6 + Math.random() * 20)
        : Math.floor(targetFps - 5 + Math.random() * 10);
      const tempDelta = stressMode
        ? 76 + Math.floor(Math.random() * 5)
        : 56 + Math.floor(Math.random() * 4);

      updateHardware({
        cpu: Math.round(cpuDelta),
        ramUsed: parseFloat(ramDelta.toFixed(1)),
        ramTotal: 32.0,
        fps: fpsDelta,
        gpuTemp: tempDelta,
      });
    }, performance.updateIntervalMs || 1000);

    return () => clearInterval(interval);
  }, [stressMode, selectedGame, performance.updateIntervalMs, updateHardware]);

  // ── Alt+C global keyboard shortcut – Instant Replay �───────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyC" && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        const gameName = useGameStore.getState().selectedGame?.name;
        const clip = captureReplay(gameName);
        if (clip) {
          // Show a brief notification if supported
          if (typeof navigator !== "undefined" && "notification" in navigator) {
            try {
              new Notification("CastOverlay", {
                body: `Replay captured – ${clip.duration}s`,
              });
            } catch {
              /* ignore */
            }
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Soundboard global shortcut handler (F1–F6, Alt+D1, etc.) ─────
  const { items: soundItems } = useSoundStore();
  const { soundEnabled: soundOn } = useOverlayStore();

  useEffect(() => {
    const isTyping = (el: EventTarget | null) =>
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement;

    const norm = (ev: KeyboardEvent): string => {
      const p: string[] = [];
      if (ev.altKey) p.push("ALT");
      if (ev.ctrlKey) p.push("CTRL");
      if (ev.shiftKey) p.push("SHIFT");
      p.push(ev.key.length === 1 ? ev.key.toUpperCase() : ev.key.toUpperCase());
      return p.join("+").replace(/\s+/g, "");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || !soundOn) return;
      const keyNow = norm(e);
      const match = soundItems.find(
        (i) => i.shortcut.replace(/\s+/g, "").toUpperCase() === keyNow,
      );
      if (match) {
        e.preventDefault();
        if (match.audioDataUrl) {
          const a = new Audio(match.audioDataUrl);
          a.volume = 0.85;
          a.play().catch(() => {});
        } else {
          // Let SoundboardView's Web Audio handler play the synth sound
          window.dispatchEvent(
            new CustomEvent("castoverlay:play-sound", {
              detail: { id: match.id },
            }),
          );
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [soundItems, soundOn]);

  // ━ Check-in klub (bodo, streak, rebríček) pri spustení overlaye ━─────────
  const { checkIn, refreshLeaderboard } = useClubStore();
  const { user: clubUser } = useAuthStore();
  const { checkOfficial } = useSocialStore();
  useEffect(() => {
    if (isOverlayMode) {
      checkIn();
      if (clubUser) {
        refreshLeaderboard(clubUser.username, clubUser.avatarUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverlayMode]);

  // Check official stream availability on app mount
  useEffect(() => {
    checkOfficial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // �─ Ctrl+Shift+B – manual boot dismiss (debug) ────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.shiftKey &&
        e.code === "KeyB" &&
        bootPhase === "boot"
      ) {
        e.preventDefault();
        console.log("[BootupScreen] Ctrl+Shift+B – manual dismiss");
        setBootPhase("app");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bootPhase]);

  const handleLaunchOverlay = () => {
    setOverlayMode(true);
  };

  const handleLaunchOverlayForGame = (game: GameProfile) => {
    setSelectedGame(game);
    setOverlayMode(true);
  };

  const handleReturnToDashboard = () => {
    setOverlayMode(false);
    setActiveTab("dashboard");
  };

  // ── Stable boot-complete callback so BootupScreen's effect isn't
  //    re-triggered on every App re-render (prevents the 0→32% loop).
  const handleBootComplete = useCallback(() => {
    setBootPhase("app");
  }, []);

  // If still booting, render the boot screen inside AnimatePresence (mode="wait")
  // so the exit fade-out animation is honored before the screen unmounts.
  if (bootPhase === "boot") {
    return (
      <div className="min-h-screen bg-[#04060a]">
        <AnimatePresence mode="wait">
          <BootupScreen key="boot" onComplete={handleBootComplete} />
        </AnimatePresence>
      </div>
    );
  }

  if (isOverlayMode) {
    // Hide generic TopLevelButtons back when the Steam-specific one is shown
    const steam = useAuthStore.getState();
    const steamLogin = steam.isAuthenticated && !!steam.user?.steam?.steamId;

    return (
      <div className="min-h-screen bg-transparent text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black relative overflow-hidden">
        <TopLevelButtons
          onBack={handleReturnToDashboard}
          backLabel="Back"
          hideBack={steamLogin}
        />
        <SteamBackArrow onBack={handleReturnToDashboard} />
        <GlobalQuitButton />
        <AnimatePresence>
          {reward && (
            <SoundRewardOverlay reward={reward} onClear={simulateReward} />
          )}
        </AnimatePresence>
        <OverlayHUD
          onReturnToDashboard={handleReturnToDashboard}
          onToggleSafeZone={() => setSafeZoneOpen((v) => !v)}
        />
        {/* Safe Zone Grid overlay */}
        <SafeZoneGrid
          open={safeZoneOpen}
          gameId={selectedGame?.id || ""}
          onClose={() => setSafeZoneOpen(false)}
        />
        {/* Toast notifications */}
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  if (activeTab === "dashboard") {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
        <TopLevelButtons hideBack />
        <PlatformLandingView />
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black relative overflow-x-hidden pb-12">
      {/* Live Particle Background – neon dust + synthwave grid */}
      <ParticleBackground />

      {/* Ambient Mesh Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 opacity-30 blur-3xl z-0"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${selectedGame?.glowColor || "rgba(6, 182, 212, 0.4)"}, transparent 70%)`,
        }}
      />

      {/* Top-level controls – back to main menu visible on non-dashboard tabs */}
      <TopLevelButtons
        onBack={() => setActiveTab("dashboard")}
        backLabel="Back"
      />
      <SteamBackArrow onBack={handleReturnToDashboard} />
      <GlobalQuitButton />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 relative z-10">
        {/* Top Platform Header Shell */}
        <PlatformHeader onLaunchOverlay={handleLaunchOverlay} />

        {/* AI Coach Tilt Meter Row */}
        <div className="flex items-center justify-between space-x-2 mt-2">
          <TiltMeter />
          <button
            onClick={() => {
              autoGenerateRecap(selectedGame?.name || "Unknown Game").catch(
                () => {},
              );
              setCoachModalOpen(true);
            }}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-white/10 bg-slate-800/80 text-slate-300 text-[11px] font-semibold hover:bg-slate-700 transition"
            title="Show AI Game Coach post-match recap"
          >
            🤖
            <span>AI Coach Recap</span>
          </button>
        </div>

        {/* Tilt Rest Banner (appears when player is tilted) */}
        <TiltRestBanner />

        {/* Victory Celebration Banner */}
        <AnimatePresence>
          {victoryBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-black font-black flex items-center justify-between shadow-2xl shadow-emerald-500/30 border border-emerald-300"
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="text-lg tracking-wider uppercase font-black">
                    VICTORY RECORDED!
                  </h3>
                  <p className="text-xs font-medium text-emerald-950">
                    Match Win recorded for {selectedGame?.name} • Sound effect
                    activated
                  </p>
                </div>
              </div>
              <div className="text-2xl font-black font-mono bg-black/20 px-4 py-1 rounded-xl">
                MATCH WIN!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Tab View Rendering */}
        <div className="mt-6">
          {activeTab === "library" && (
            <>
              <div className="mx-1 mb-6">
                <RichPresenceCard />
              </div>
              <GameLibraryView
                onLaunchOverlayForGame={handleLaunchOverlayForGame}
              />
            </>
          )}
          {activeTab === "chat" && <StreamChatView />}
          {activeTab === "soundboard" && <SoundboardView />}
          {activeTab === "replay" && <ReplayView />}
          {activeTab === "club" && <ClubView />}
          {activeTab === "profile" && <ClubView />}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </div>

      {/* Notification Toast – visible in dashboard mode too */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* Authentication Modal */}
      <AuthModal />

      {/* AI Coach Recap Modal */}
      <CoachRecapModal
        open={coachModalOpen}
        onClose={() => setCoachModalOpen(false)}
      />
    </div>
  );
}

export default App;
