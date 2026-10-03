import React from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Shield,
  Headphones,
  Megaphone,
  ExternalLink,
  Users,
  UserPlus,
  Settings,
  MessageCircle,
  Radio,
  Cpu,
  Gamepad2,
} from "lucide-react";
import { useChatOverlayStore } from "../../stores/chatOverlayStore";
import { useSocialStore } from "../../stores/socialStore";
import { useAuthStore } from "../../stores/authStore";
import { localeFor, useTranslation } from "../../i18n";
import { useSettingsStore } from "../../stores/settingsStore";

const DISCORD_URL = "https://discord.com/channels/1554464065500483584/";

/** Colored Discord role badges */
const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  FOUNDER: { label: "FOUNDER", className: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  ADMIN: { label: "ADMIN", className: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  MOD: { label: "MOD", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  BOOSTER: { label: "BOOSTER", className: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  VIP: { label: "VIP", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  MEMBER: { label: "MEMBER", className: "bg-slate-700/40 text-slate-400 border-white/10" },
  STEAM: { label: "STEAM", className: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
};

/** Online member dots for the community panel */
const ONLINE_DOT_COLORS = ["bg-emerald-400", "bg-blue-400", "bg-rose-400", "bg-amber-400", "bg-purple-400"];

export const StreamChatView: React.FC = () => {
  const { settings, pushMessage } = useChatOverlayStore();
  const { discordUrl, onlineMembers, totalMembers, isOfficialLive } = useSocialStore();
  const { user } = useAuthStore();
  const t = useTranslation();
  const language = useSettingsStore((state) => state.language);

  const [copied, setCopied] = React.useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(discordUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Discord Community Hero ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/10 via-slate-900/80 to-slate-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-[#5865F2]/10"
      >
        {/* Discord blur orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:justify-between">
            {/* Left: Discord branding */}
            <div className="flex items-center space-x-4">
              {/* Discord logo */}
              <div className="p-3 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 shadow-lg shadow-[#5865F2]/20">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#5865F2]" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">CastOverlay</h2>
                  <span className="text-[10px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t("header.live")}</span>
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Oficiálna komunita · Podpora · Tipy · Aktualizácie
                </p>
              </div>
            </div>

            {/* Right: Join button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyInvite}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-[11px] font-semibold hover:bg-white/10 transition flex items-center space-x-1.5"
                title="Kopírovať odkaz"
              >
                {copied ? (
                  <>
                    <span className="text-emerald-400">✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Kopírovať odkaz</span>
                  </>
                )}
              </button>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-sm shadow-lg shadow-[#5865F2]/30 transition transform active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span>Pripojiť sa</span>
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#5865F2]" />
                <span className="text-2xl font-black font-mono text-white">{totalMembers.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Členov spolu</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-2xl font-black font-mono text-emerald-400">{onlineMembers}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Online teraz</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-purple-400" />
                <span className="text-2xl font-black font-mono text-purple-400">24/7</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Podpora</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="text-2xl font-black font-mono text-cyan-400">v2.1</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Verzia platform</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Discord Community Channels ───────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <Hash className="h-5 w-5 text-[#5865F2]" />
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Komunitné kanály</h3>
            <p className="text-[11px] text-slate-500">Najobľúbenejšie kanály na našom Discordi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* #oldajnovosti */}
          <button
            onClick={() => window.open(`${discordUrl}oldajnovosti`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-white/10 bg-slate-950/60 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/5 transition text-left"
          >
            <div className="p-2 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30">
              <Megaphone className="h-4 w-4 text-[#5865F2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#oldajnovosti</p>
              <p className="text-[10px] text-slate-500 truncate">Aktuálne verzie, patch notes a ohlásenia</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-[#5865F2] transition shrink-0" />
          </button>

          {/* #podpora */}
          <button
            onClick={() => window.open(`${discordUrl}podpora`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition text-left"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Headphones className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#podpora</p>
              <p className="text-[10px] text-slate-500 truncate">Priame spojenie s tímom – riešenie problémov</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-emerald-400 transition shrink-0" />
          </button>

          {/* #game-lobby */}
          <button
            onClick={() => window.open(`${discordUrl}game-lobby`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition text-left"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Gamepad2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#game-lobby</p>
              <p className="text-[10px] text-slate-500 truncate">Hľadaj tím, LFG a zostavy pre VR</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-purple-400 transition shrink-0" />
          </button>

          {/* #feedback */}
          <button
            onClick={() => window.open(`${discordUrl}feedback`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition text-left"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Settings className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#feedback</p>
              <p className="text-[10px] text-slate-500 truncate">Návrhy a postrehy od komunity</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-amber-400 transition shrink-0" />
          </button>

          {/* #screenshoty */}
          <button
            onClick={() => window.open(`${discordUrl}screenshoty`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 transition text-left"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Radio className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#screenshoty</p>
              <p className="text-[10px] text-slate-500 truncate">Zdieľaj svoje momenty z CastOverlay</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition shrink-0" />
          </button>

          {/* #steam-integrations */}
          <button
            onClick={() => window.open(`${discordUrl}steam-integrations`, "_blank")}
            className="group flex items-center space-x-3 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40 transition text-left"
          >
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
              <Shield className="h-4 w-4 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">#steam-integrations</p>
              <p className="text-[10px] text-slate-500 truncate">Rich Presence, kamaráti a herná knižnica</p>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-sky-400 transition shrink-0" />
          </button>
        </div>
      </div>

      {/* ── Live Community Feed ──────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">Komunitný feed</h3>
              <p className="text-[11px] text-slate-500">Pohľady od členov komunity</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Simulated community posts */}
        <div className="space-y-2">
          {(
            [
              { user: "CyberGamer99", badge: "FOUNDER", color: "text-rose-400", text: "Presný upgrade pre v2.1! Discordové momenty fungujú perfekt na 144 FPS monitor." },
              { user: "ViperMain", badge: "MOD", color: "text-emerald-400", text: "Tip: Vytvor si vlastné HUD/panel cez Layout Studio a zdieľaj preset v #screenshoty." },
              { user: "PixelQueen", badge: "BOOSTER", color: "text-amber-400", text: "Steam Rich Presence konečne funguje s CS2! Teraz môžem zobrazovať stav kamarátom." },
              { user: "NeonRider", badge: "VIP", color: "text-purple-400", text: "Kde beru hlas pre HUD Soundboard? V nastavení zvukových effectov stačí nahrát polohy." },
              { user: "ShadowWolf", badge: "MEMBER", color: "text-cyan-400", text: "Auto-detection hry fakt funguje! Spustím Valorant a CastOverlay to hneď zachytí." },
              { user: "TurboSniper", badge: "ADMIN", color: "text-blue-400", text: "Najbližší patch prinesie nové témy pre overlay. Všetky návrhy do #feedback! 🎨" },
            ] as const
          ).map((post, i) => {
            const badgeInfo = ROLE_BADGES[post.badge] ?? ROLE_BADGES.MEMBER;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start space-x-3"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center shrink-0 shadow-md shadow-[#5865F2]/20">
                  <span className="text-[11px] font-black text-white">{post.user[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap mb-0.5">
                    <span className={`text-xs font-bold ${post.color}`}>{post.user}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${badgeInfo.className}`}>
                      {badgeInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{post.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30 text-[11px] font-bold hover:bg-[#5865F2]/25 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Pripojiť sa na Discord</span>
          </a>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/25 transition"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Žiadať o podporu</span>
          </a>
          <button
            onClick={handleCopyInvite}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{copied ? "Copied!" : "Kopírovať odkaz"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
