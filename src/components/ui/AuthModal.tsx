import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Mail, Shield, Sparkles, X,
  Gamepad2, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useAppStore } from "../../stores/appStore";
import type { Platform } from "../../types";
import { useTranslation } from "../../i18n";

export const AuthModal: React.FC = () => {
  const { authModalOpen, authMode, closeAuthModal, openAuthModal } =
    useAppStore();
  const {
    login, register, loginWithSteam, user, isLoading, error,
  } = useAuthStore();
  const t = useTranslation();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("demo@castoverlay.com");
  const [password, setPassword] = React.useState("demo123");
  const [localError, setLocalError] = React.useState<string | null>(null);
  // Keep-logged-in ("remember me") – persisted with the auth session itself
  const [keepLoggedIn, setKeepLoggedIn] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem("castoverlay-auth");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed?.state?.keepLoggedIn;
    } catch {
      return false;
    }
  });

  const applyKeepLoggedIn = (keep: boolean) => {
    // zustand persist serializes per `partialize`; write the equivalent here
    // so the on-disk value survives app restarts and is honored by hydration.
    if (typeof window === "undefined") return;
    try {
      try {
        window.localStorage.removeItem("castoverlay-auth");
      } catch {
        /* ignore */
      }
      if (keep) {
        const state = useAuthStore.getState();
        if (state.user) {
          window.localStorage.setItem(
            "castoverlay-auth",
            JSON.stringify({
              state: {
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                keepLoggedIn: keep,
              },
              version: 0,
            }),
          );
        }
      }
    } catch {
      /* localStorage unavailable – ignore, stay in-memory */
    }
  };

  if (!authModalOpen) return null;

  const linkedPlatforms = user?.linkedPlatforms ?? [];
  const hasSteam = !!user?.steam?.steamId || linkedPlatforms.some((p) => p.platform === "steam" && p.connected);

  const handleSteamLogin = async () => {
    setLocalError(null);
    try {
      await loginWithSteam();
      // Persist / clear the saved session based on the checkbox choice
      applyKeepLoggedIn(keepLoggedIn);
      // Close the modal — the steam-auth popup takes over from here.
      closeAuthModal();
    } catch (err: unknown) {
      if (err instanceof Error) setLocalError(err.message);
      else setLocalError("Steam prihlásenie zlyhalo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      closeAuthModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Chyba autentifikácie");
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl"
        >
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Shield className="h-6 w-6 text-black" />
            </div>
            <h2 className="text-xl font-black tracking-wide text-white">
              {authMode === "login"
                ? t("auth.loginTitle")
                : t("auth.registerTitle")}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {t("auth.description")}
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error || localError}
            </div>
          )}

          {/* Keep-logged-in – choose whether the session survives restarts */}
          <label className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 cursor-pointer select-none transition hover:bg-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {t("auth.keepLoggedIn")}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={keepLoggedIn}
              onClick={(e) => {
                e.preventDefault();
                setKeepLoggedIn((v) => !v);
              }}
              className={`relative h-5 w-10 rounded-full transition-colors duration-300 ${
                keepLoggedIn ? "bg-cyan-500/80" : "bg-slate-600/60"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-300 ${
                  keepLoggedIn ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>

          {/* Steam Login Button */}
          <button
            onClick={handleSteamLogin}
            disabled={isLoading}
            className="mb-4 flex w-full items-center justify-center space-x-2 rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 text-xs font-black uppercase tracking-wider text-sky-300 transition hover:bg-sky-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                <span>{t("auth.steamLoading")}</span>
              </>
            ) : (
              <>
                <Gamepad2 className="h-4 w-4" />
                <span>{t("auth.loginSteam")}</span>
              </>
            )}
          </button>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase">{t("auth.or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {hasSteam && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">{t("auth.connected")}</p>
                <p className="text-[10px] text-slate-500">Steam prihlásený</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  {t("auth.username")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ProGamer2024"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {authMode === "login" ? t("auth.signIn") : t("auth.createAccount")}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-slate-400">
            {authMode === "login" ? (
              <span>
                {t("auth.noAccount")}{" "}
                <button
                  onClick={() => openAuthModal("register")}
                  className="font-bold text-cyan-400 hover:underline"
                >
                  {t("auth.register")}
                </button>
              </span>
            ) : (
              <span>
                {t("auth.haveAccount")}{" "}
                <button
                  onClick={() => openAuthModal("login")}
                  className="font-bold text-cyan-400 hover:underline"
                >
                  {t("auth.login")}
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
