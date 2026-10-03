import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Lock,
  Unlock,
  Crosshair,
  Volume2,
  VolumeX,
  Flame,
  Trophy,
  Users,
  Layers,
  LayoutDashboard,
  Gamepad2,
  Sliders,
  Radio,
  RefreshCw,
  Sparkles,
  LogOut,
  User as UserIcon,
  Film,
  Wallet,
} from "lucide-react";
import LogoIcon from "../../assets/icons/icon.svg";
import { useGameStore } from "../../stores/gameStore";
import { useOverlayStore } from "../../stores/overlayStore";
import { useAuthStore } from "../../stores/authStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useAppStore } from "../../stores/appStore";
import { useSocialStore } from "../../stores/socialStore";
import type { TabId, HeroAnimationMode } from "../../types";
import { HeroTitle } from "../titles/HeroTitle";
import { useTranslation } from "../../i18n";


interface PlatformHeaderProps {
  onLaunchOverlay: () => void;
}

export const PlatformHeader: React.FC<PlatformHeaderProps> = ({
  onLaunchOverlay,
}) => {
  const { activeTab, setActiveTab, openAuthModal } = useAppStore();
  const {
    selectedGame,
    stressMode,
    setStressMode,
    triggerVictory,
    triggerDefeat,
  } = useGameStore();
  const {
    isLocked,
    setLocked,
    isClickThrough,
    setClickThrough,
    soundEnabled,
    setSoundEnabled,
  } = useOverlayStore();
  const {
    user,
    isAuthenticated,
    logout,
    syncSettings,
    isLoading: authLoading,
  } = useAuthStore();
  const { isOfficialLive, checkOfficial } =
    useSocialStore();
  const { ui, updateUISetting, paymentMethod, steamWalletBalance } = useSettingsStore();
  const payMethod: string = paymentMethod as string;
  const t = useTranslation();

  const [userDropdown, setUserDropdown] = React.useState(false);
  const steamId = user?.steam?.steamId;

  // Fetch Steam wallet balance whenever Steam payment is selected
  React.useEffect(() => {
    if (payMethod !== "steam" || !steamId) return;
    let cancelled = false;
    import("../../services/steamService").then(({ getExactSteamBalance }) =>
      getExactSteamBalance(steamId),
    ).then((balance) => {
      if (!cancelled && balance != null) {
        useSettingsStore.getState().setSteamWalletBalance(balance);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [payMethod, steamId]);

  // Check official live status on mount
  React.useEffect(() => {
    checkOfficial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "library",
      label: t("nav.library"),
      icon: <Gamepad2 className="h-4 w-4" />,
    },
    {
      id: "soundboard",
      label: t("nav.soundboard"),
      icon: <Volume2 className="h-4 w-4" />,
    },
    {
      id: "replay",
      label: t("nav.replay"),
      icon: <Film className="h-4 w-4" />,
    },
    { id: "chat", label: t("nav.chat"), icon: <Radio className="h-4 w-4" /> },
    {
      id: "club",
      label: t("nav.club"),
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: t("nav.settings"),
      icon: <Sliders className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300"
      style={{ opacity: ui.windowOpacity }}
    >
      {/* Top System Bar */}
      {/* CastOverlay Official Channels Strip */}
      <div className="border-b border-white/10 bg-slate-950/60">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase shrink-0">
            {t("header.official")}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.open("https://discord.com/channels/1554464065500483584/", "_blank")}
              className="px-3 py-1 rounded-lg text-[10px] font-bold border transition flex items-center space-x-1.5 bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/40 hover:bg-[#5865F2]/30"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.419 2.157-2.419 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.419 2.1569-2.419 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419Z" />
              </svg>
              <span>Discord</span>
            </button>
            {/* Live badge */}
            <span
              className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[10px] font-bold ${
                isOfficialLive
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-800/40 text-slate-500 border-white/10"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isOfficialLive ? "bg-rose-400 animate-pulse" : "bg-slate-600"}`} />
              <span>{isOfficialLive ? t("header.live") : t("header.offline")}</span>
            </span>
          </div>
          {/* Discord button placeholder where Twitch embed was removed */}
        </div>
      </div>

      {/* Top Bar – Controls & User */}
      <div className="bg-slate-950/90 px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Branding & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
              <img src={LogoIcon} alt="CastOverlay logo" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <HeroTitle Hero_animationMode="idle" />
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                TAURI v2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center space-x-2">
              <span>
                {t("common.activeGame")}{" "}
                <strong className="text-white">{selectedGame.name}</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">
                0.02% CPU OVERHEAD
              </span>
            </p>
          </div>
        </div>

        {/* Quick Controls & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* Opacity Slider */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/60 px-3 py-1 rounded-lg border border-white/5">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">{t("common.opacity")}</span>
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.05"
              value={ui.windowOpacity}
              onChange={(e) =>
                updateUISetting("windowOpacity", parseFloat(e.target.value))
              }
              className="w-16 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-[11px] w-8 text-cyan-300">
              {Math.round(ui.windowOpacity * 100)}%
            </span>
          </div>

          {/* Lock Button */}
          <button
            onClick={() => setLocked(!isLocked)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold transition ${
              isLocked
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700"
            }`}
          >
            {isLocked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isLocked ? t("common.locked") : t("common.unlocked")}
            </span>
          </button>

          {/* Click-through Button */}
          <button
            onClick={() => setClickThrough(!isClickThrough)}
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold transition ${
              isClickThrough
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700"
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{isClickThrough ? t("common.clickThroughOn") : t("common.inputActive")}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              soundEnabled
                ? "bg-slate-800/80 border-white/10 text-cyan-400 hover:bg-slate-700"
                : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
            }`}
            title={t("common.uiSounds")}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          {/* User Profile / Auth Area */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-slate-800/90 py-1 px-2.5 transition hover:border-cyan-400"
                >
                  {/* Steam avatar (if linked) */}
                  {user.steam && (
                    <div className="flex items-center space-x-1 bg-slate-950/80 border border-cyan-500/30 rounded-lg px-1.5 py-0.5" title={user.steam.personaName}>
                      <img
                        src={user.steam.avatarUrl}
                        alt="Steam"
                        className="h-4 w-4 rounded-sm object-cover"
                      />
                      <span className="text-[9px] font-bold text-cyan-300 max-w-[60px] truncate">
                        {user.steam.personaName}
                      </span>
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 rounded px-1 border border-emerald-500/30">
                        L{user.steam.level}
                      </span>
                    </div>
                  )}
                  {payMethod === "steam" && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void import("../../services/steamService").then(({ openSteamClient }) => openSteamClient());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          void import("../../services/steamService").then(({ openSteamClient }) => openSteamClient());
                        }
                      }}
                      title="Steam Wallet Balance"
                      className="walletColumn cursor-pointer flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 rounded-lg px-1.5 py-0.5 hover:bg-amber-500/20 transition"
                    >
                      <Wallet className="h-3 w-3 text-amber-400" />
                      <span className="text-[9px] font-bold text-amber-300">
                        {steamWalletBalance != null
                          ? `€${(steamWalletBalance / 100).toFixed(2)}`
                          : "Steam Wallet"}
                      </span>
                    </span>
                  )}
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-6 w-6 rounded-full border border-cyan-400 object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=CastOverlay";
                    }}
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-bold leading-none text-white">
                      {user.username}
                    </p>
                    <p className="text-[9px] font-semibold uppercase text-cyan-400">
                      {user.tier}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                    >
                      <div className="border-b border-white/10 p-2">
                        <p className="text-xs font-bold text-white">
                          {user.username}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {user.email}
                        </p>
                        <div className="mt-1.5 flex items-center space-x-1 rounded bg-cyan-950/60 px-1.5 py-0.5 border border-cyan-500/30">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          <span className="text-[10px] font-bold text-cyan-300">
                            {user.tier} {t("header.plan")}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            syncSettings();
                            setUserDropdown(false);
                          }}
                          disabled={authLoading}
                          className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${authLoading ? "animate-spin" : ""}`}
                          />
                          <span>{t("common.syncCloud")}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("settings");
                            setUserDropdown(false);
                          }}
                          className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>{t("common.profileSettings")}</span>
                        </button>
                      </div>

                      <div className="border-t border-white/10 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdown(false);
                          }}
                          className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{t("common.logout")}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 font-bold text-black text-xs shadow-md shadow-cyan-500/20 hover:brightness-110"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>{t("common.login")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={selectedGame.bannerUrl}
          alt={selectedGame.name}
          className="w-full h-full object-cover object-center opacity-40 transition-all duration-700 transform scale-105"
          onError={(e) => {
            const t = e.currentTarget;
            t.onerror = null;
            t.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&q=60";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={selectedGame.coverUrl}
              alt="Game Cover"
              className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg object-cover border border-white/20 shadow-xl"
              onError={(e) => {
                const t = e.currentTarget;
                t.onerror = null;
                t.src = "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=60";
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  {selectedGame.badge}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{selectedGame.activePlayers}</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide mt-1">
                {selectedGame.name}
              </h2>
              <p className="text-xs text-slate-300">
                {selectedGame.genre} • Kategória: {selectedGame.category}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Launch Overlay Button */}
            <button
              onClick={onLaunchOverlay}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Layers className="h-4 w-4" />
              <span>{t("common.launchHud")}</span>
            </button>

            {/* Victory Simulation Button */}
            <button
              onClick={triggerVictory}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center space-x-1.5"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>{t("common.simulateWin")}</span>
            </button>

            {/* Defeat Simulation Button */}
            <button
              onClick={triggerDefeat}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 transition transform active:scale-95 flex items-center space-x-1.5"
              title={t("common.simulateLoss")}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{t("common.simulateLoss")}</span>
            </button>

            {/* Stress Telemetry Mode */}
            <button
              onClick={() => setStressMode(!stressMode)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
                stressMode
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{stressMode ? t("common.stressOn") : t("common.stressTest")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-t border-white/10 bg-slate-950/70 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
