import React from "react";
import {
  Sliders,
  Palette,
  Cpu,
  Monitor,
  Keyboard,
  RotateCcw,
  Check,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useAuthStore } from "../../stores/authStore";
import { THEMES } from "../../data/games";
import type { ThemeType, HotkeyConfig } from "../../types";
import { LANGUAGES, useTranslation } from "../../i18n";
import { getExactSteamBalance } from "../../services/steamService";

export const SettingsView: React.FC = () => {
  const {
    ui,
    performance,
    system,
    updateUISetting,
    updatePerformanceSetting,
    updateSystemSetting,
    resetToDefaults,
    language,
    setLanguage,
  } = useSettingsStore();
  const t = useTranslation();
  const hotkeyLabels: Record<string, string> = {
    "Alt + NumPad 1": t("hotkey.stat1"),
    "Alt + NumPad 2": t("hotkey.stat2"),
    "Alt + Shift + O": t("hotkey.overlay"),
    "Alt + Shift + C": t("hotkey.clickThrough"),
    "Alt + F1": t("hotkey.victory"),
    "Alt + C": t("hotkey.replay"),
  };
  const [greetingDismissed, setGreetingDismissed] = React.useState(false);
  const now = new Date();
  const hour = now.getHours();
  const period = hour >= 4 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "evening";
  const displayName = useAuthStore((s) => s.user?.username ?? "Revolver");

  const [savedBadge, setSavedBadge] = React.useState(false);
  const payMethod = useSettingsStore((s: any) => s.paymentMethod) ?? "steam";
  const setPayMethod = useSettingsStore((s: any) => s.setPaymentMethod);
  const steamWalletBalance = useSettingsStore((s: any) => s.steamWalletBalance) as number | null;
  const setSteamWalletBalance = useSettingsStore((s: any) => s.setSteamWalletBalance);
  const steamId = useAuthStore((state) => state.user?.steam?.steamId);
  const [paymentDetails, setPaymentDetails] = React.useState<{
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    paypalEmail: string;
    paypalPassword: string;
  }>({ cardNumber: "", cardExpiry: "", cardCvc: "", paypalEmail: "", paypalPassword: "" });
  const [detailsLoaded, setDetailsLoaded] = React.useState(false);

  // Load persisted payment details once
  React.useEffect(() => {
    if (detailsLoaded) return;
    import("../../services/dbService").then(({ db }) => {
      db.get<any>("settings:paymentDetails").then((saved) => {
        if (saved) setPaymentDetails((prev) => ({ ...prev, ...saved }));
        setDetailsLoaded(true);
      }).catch(() => setDetailsLoaded(true));
    }).catch(() => setDetailsLoaded(true));
  }, [detailsLoaded]);

  const persistPaymentDetails = (updater: (prev: typeof paymentDetails) => typeof paymentDetails) => {
    setPaymentDetails((prev) => {
      const next = updater(prev);
      void import("../../services/dbService").then(({ db }) =>
        db.set("settings:paymentDetails", next),
      ).catch(() => {});
      return next;
    });
  };

  // Fetch exact Steam Wallet balance when Steam payment is selected
  React.useEffect(() => {
    if (payMethod !== "steam" || !steamId) return;
    let cancelled = false;
    getExactSteamBalance(steamId).then((balance) => {
      if (!cancelled) setSteamWalletBalance(balance);
    });
    return () => { cancelled = true; };
  }, [payMethod, steamId]);

  const PAYMENT_OPTIONS = [
    { value: "steam",  label: "Steam Wallet",      icon: "S",  color: "text-blue-300 bg-blue-500/10", desc: "Fast checkout via Steam" },
    { value: "card",   label: "Credit Card",       icon: "\u{1F4B3}", color: "text-cyan-300 bg-cyan-500/10", desc: "Visa / Mastercard / Amex" },
    { value: "paypal", label: "PayPal",            icon: "P",  color: "text-sky-300 bg-sky-500/10", desc: "Secure payment via PayPal" },
    { value: "apple",  label: "Apple Pay",         icon: "",   color: "text-white bg-white/10", desc: "One-tap Apple Pay checkout" },
    { value: "google", label: "Google Pay",        icon: "G",  color: "text-amber-300 bg-amber-500/10", desc: "One-tap Google Pay checkout" },
  ] as const;

  const handleSaveNotification = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide">
              {t("settings.title")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("settings.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {savedBadge && (
            <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 animate-pulse">
              <Check className="h-4 w-4" />
              <span>{t("settings.saved")}</span>
            </span>
          )}
          <button
            onClick={() => {
              resetToDefaults();
              handleSaveNotification();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("settings.reset")}</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: UI & VZHĽAD */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Palette className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("settings.interface")}
            </h3>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-300">{t("language.label")}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </label>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">
                {t("settings.opacity")}
              </span>
              <span className="font-mono text-cyan-400">
                {Math.round(ui.windowOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={ui.windowOpacity}
              onChange={(e) =>
                updateUISetting("windowOpacity", parseFloat(e.target.value))
              }
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* HUD Scale */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">{t("settings.hudScale")}</span>
              <span className="font-mono text-purple-400">
                {Math.round(ui.hudScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={ui.hudScale}
              onChange={(e) =>
                updateUISetting("hudScale", parseFloat(e.target.value))
              }
              className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Glassmorphism Blur */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">
                {t("settings.blur")}
              </span>
              <span className="font-mono text-emerald-400">
                {ui.glassmorphismBlur} px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
              value={ui.glassmorphismBlur}
              onChange={(e) =>
                updateUISetting("glassmorphismBlur", parseInt(e.target.value))
              }
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Themes Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              {t("settings.theme")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => {
                const isSelected = ui.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() =>
                      updateUISetting("theme", theme.id as ThemeType)
                    }
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/50"
                        : "border-white/5 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{theme.name}</span>
                    <div
                      className={`h-3.5 w-3.5 rounded-full bg-gradient-to-r ${theme.primary}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: PERFORMANCE TUNING */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("settings.performance")}
            </h3>
          </div>

          {/* Update Interval */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">
                {t("settings.refresh")}
              </span>
              <span className="font-mono text-emerald-400">
                {performance.updateIntervalMs} ms
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={performance.updateIntervalMs}
              onChange={(e) =>
                updatePerformanceSetting(
                  "updateIntervalMs",
                  parseInt(e.target.value),
                )
              }
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* FPS Limit Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">{t("settings.fpsLimit")}</span>
              <span className="font-mono text-cyan-400">
                {performance.fpsLimit} FPS
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="360"
              step="30"
              value={performance.fpsLimit}
              onChange={(e) =>
                updatePerformanceSetting("fpsLimit", parseInt(e.target.value))
              }
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
              <span className="text-xs text-slate-300 font-semibold">
                {t("settings.lowLatency")}
              </span>
              <input
                type="checkbox"
                checked={performance.lowLatencyMode}
                onChange={(e) =>
                  updatePerformanceSetting("lowLatencyMode", e.target.checked)
                }
                className="rounded accent-cyan-400 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
              <span className="text-xs text-slate-300 font-semibold">
                {t("settings.hardwareAcceleration")}
              </span>
              <input
                type="checkbox"
                checked={performance.hardwareAcceleration}
                onChange={(e) =>
                  updatePerformanceSetting(
                    "hardwareAcceleration",
                    e.target.checked,
                  )
                }
                className="rounded accent-cyan-400 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: SYSTEM INTEGRATION */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Monitor className="h-4 w-4 text-purple-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("settings.system")}
            </h3>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
            <span className="text-xs text-slate-300 font-semibold">
              {t("settings.autoStart")}
            </span>
            <input
              type="checkbox"
              checked={system.autoStart}
              onChange={(e) =>
                updateSystemSetting("autoStart", e.target.checked)
              }
              className="rounded accent-purple-400 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
            <span className="text-xs text-slate-300 font-semibold">
              {t("settings.minimize")}
            </span>
            <input
              type="checkbox"
              checked={system.minimizeToTray}
              onChange={(e) =>
                updateSystemSetting("minimizeToTray", e.target.checked)
              }
              className="rounded accent-purple-400 h-4 w-4"
            />
          </label>

          {/* Audio Output */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {t("settings.audio")}
            </label>
            <select
              value={system.audioOutputDevice}
              onChange={(e) =>
                updateSystemSetting("audioOutputDevice", e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950/90 py-2.5 px-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="default">
                {t("settings.audioDefault")}
              </option>
              <option value="virtual-cable">
                {t("settings.audioCable")}
              </option>
              <option value="headphones">{t("settings.audioHeadphones")}</option>
            </select>
          </div>
        </div>

        {/* SECTION 4: GLOBAL HOTKEYS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Keyboard className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("settings.hotkeys")}
            </h3>
          </div>

          <div className="space-y-2">
            {system.globalHotkeys.map((hotkey: HotkeyConfig, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs"
              >
                <span className="text-slate-300 font-medium">
                  {hotkeyLabels[hotkey.defaultKey] ?? hotkey.action}
                </span>
                <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/10">
                  {hotkey.currentKey || hotkey.defaultKey}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: PAYMENT METHODS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              Payment Methods
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Choose how to pay for games on CastOverlay.
          </p>

          {/* Steam Wallet balance display */}
          {payMethod === "steam" && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <span className="text-xs font-semibold text-blue-300 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Steam Wallet Balance
              </span>
              <span className="font-mono font-bold text-sm text-blue-200">
                {steamWalletBalance != null ? `€${(steamWalletBalance / 100).toFixed(2)}` : "—"}
              </span>
            </div>
          )}

          {/* PayPal details */}
          {payMethod === "paypal" && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <label className="block">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">PayPal Email</span>
                <input type="email" placeholder="you@example.com"
                  value={paymentDetails.paypalEmail}
                  onChange={(e) => persistPaymentDetails((prev) => ({ ...prev, paypalEmail: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">PayPal Password</span>
                <input type="password" placeholder="••••••••"
                  value={paymentDetails.paypalPassword}
                  onChange={(e) => persistPaymentDetails((prev) => ({ ...prev, paypalPassword: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none" />
              </label>
            </div>
          )}

          {/* Credit Card details */}
          {payMethod === "card" && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <label className="block">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Card Number</span>
                <input type="text" placeholder="1234 5678 9012 3456" inputMode="numeric"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => persistPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Expiry (MM/YY)</span>
                  <input type="text" placeholder="MM/YY"
                    value={paymentDetails.cardExpiry}
                    onChange={(e) => persistPaymentDetails((prev) => ({ ...prev, cardExpiry: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">CVC</span>
                  <input type="text" placeholder="123" inputMode="numeric" maxLength={4}
                    value={paymentDetails.cardCvc}
                    onChange={(e) => persistPaymentDetails((prev) => ({ ...prev, cardCvc: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none" />
                </label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const selected = payMethod === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setPayMethod(opt.value); handleSaveNotification(); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    selected
                      ? "border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/40"
                      : "border-white/5 bg-slate-950/60 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${opt.color}`}
                    >
                      {opt.icon}
                    </span>
                    <div>
                      <span className={`text-xs font-bold ${selected ? "text-emerald-300" : "text-slate-200"}`}>
                        {opt.label}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                  {selected && (
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: TERMINAL GREETING */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("settings.terminalGreeting")}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-300">
              {t(`greeting.${period}`)}{" "}
              <span className="font-bold text-emerald-300">{displayName}</span>
            </p>
            {!greetingDismissed && (
              <button
                onClick={() => setGreetingDismissed(true)}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wide"
              >
                {t("greeting.dismiss")}
              </button>
            )}
          </div>
        </div>

        {/* SECTION 7: APEX PLATINUM REPORTS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Cpu className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase">
              {t("reports.section")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 italic">
            {t("reports.description")}
          </p>
        </div>
      </div>
    </div>
  );
};
