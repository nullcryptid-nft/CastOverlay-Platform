import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Monitor, Gamepad2, ExternalLink, RefreshCw, Check } from "lucide-react";
import {
  getPresenceSync as getPresence,
  onPresenceChange,
  setPresenceGame,
  steamProfileUrl,
} from "../services/steamRichPresence";
import { useGameStore } from "../stores/gameStore";
import { useAuthStore } from "../stores/authStore";
import type { RichPresenceStatus } from "../services/steamRichPresence";
import { useSettingsStore } from "../stores/settingsStore";
import { localeFor, useTranslation } from "../i18n";

/**
 * (sec. 1) Steam Rich Presence status card — shows the exact Steam-format
 * status + detail strings, syncs them to the selected game, and offers a
 * link to the user's Steam profile where the status is displayed.
 */
export const RichPresenceCard: React.FC = () => {
  const [presence, setPresenceUI] = useState<RichPresenceStatus>(() => getPresence());
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { selectedGame } = useGameStore();
  const { user } = useAuthStore();
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation();
  const steamLinked = !!(user?.steam?.steamId);

  // Subscribe to presence changes (e.g. external updates)
  useEffect(() => onPresenceChange(() => setPresenceUI(getPresence())), []);

  // (sec. 1) Status details must follow the selected game:
  // "In-Game [Game] with Live Overlay"
  const selectedName = selectedGame?.name ?? null;
  const selectedId = selectedGame?.id ?? null;

  // Re-sync when the selected game changes
  useEffect(() => {
    if (!selectedName) return;
    if (presence.gameName === selectedName) return; // already in sync
    setPresenceGame(selectedName).then((p) => {
      setPresenceUI(p);
      setLastSync(new Date());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const copyStatus = useCallback(async () => {
    const text = `Status: ${presence.status}\nDetails: ${presence.details}`;
    try {
      await navigator.clipboard.writeText(text);
      setLastSync(new Date());
    } catch {
      // ignore
    }
  }, [presence.status, presence.details]);

  const profileUrl = steamProfileUrl(user?.steam?.steamId ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-950/80 to-slate-950/90 p-4 shadow-xl"
    >
      {/* Glow accent */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="rounded-xl bg-emerald-500/15 p-2.5 border border-emerald-500/30">
            <Monitor className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-white tracking-wide">
                {t("presence.title")}
              </h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded px-1.5 py-0.5">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {steamLinked
                ? `${t("presence.linked")} ${user?.steam?.steamId}`
                : t("presence.unlinked")}
            </p>
          </div>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-1 hover:bg-emerald-500/10 transition"
          title={t("presence.openProfile")}
        >
          <span>{t("presence.openProfile")}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Status block — the exact strings Steam would show */}
      <div className="relative mt-3 rounded-xl border border-white/10 bg-black/30 p-3 min-h-[88px]">
        <div className="flex items-center space-x-2 text-emerald-400/90">
          <Gamepad2 className="h-4 w-4" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            {t("presence.status")}
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold text-white">
          {presence.status}
        </div>
        <div className="mt-2.5 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          {t("presence.details")}
        </div>
        <div className="mt-0.5 text-[12px] text-emerald-300 font-medium">
          {presence.details}
        </div>
        {lastSync && (
          <div className="absolute bottom-2 right-3 text-[9px] text-slate-500 flex items-center space-x-1">
            <Check className="h-2.5 w-2.5 text-emerald-500" />
            <span>{t("presence.synced")} {lastSync.toLocaleTimeString(localeFor(language))}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative mt-3 flex items-center justify-between gap-2">
        <button
          onClick={async () => {
            setRefreshing(true);
            try {
              const next = await setPresenceGame(selectedName);
              setPresenceUI(next);
              setLastSync(new Date());
            } finally {
              setRefreshing(false);
            }
          }}
          disabled={refreshing || !selectedName}
          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl py-2 transition flex items-center justify-center space-x-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{selectedName ? t("presence.resync") : t("presence.selectGame")}</span>
        </button>
        <button
          onClick={copyStatus}
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 font-bold text-xs rounded-xl py-2 px-3 transition"
          title={t("presence.copyTitle")}
        >
          {t("presence.copy")}
        </button>
      </div>
    </motion.div>
  );
};

export default RichPresenceCard;
