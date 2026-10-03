import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, Radio, Mic, MicOff,
  Trash2, Pencil, Keyboard, Smartphone, Plus,
} from "lucide-react";
import { useOverlayStore } from "../../stores/overlayStore";
import { useSoundStore } from "../../stores/soundStore";
import type { SoundboardItem } from "../../types";
import { useTranslation } from "../../i18n";

const PHONE_WS = "ws://localhost:8791";
const PHONE_UI = "http://localhost:8791";

const playSynth = (item: SoundboardItem, onDone: () => void) => {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const pf = (freq: number, type: OscillatorType, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    if (item.id === "victory" || item.soundType === "victory") {
      [440, 554.37, 659.25, 880].forEach((f, i) => pf(f, "triangle", i * 0.12, 0.4, 0.2));
      setTimeout(onDone, 1900);
    } else if (item.id === "headshot" || item.soundType === "ping") {
      pf(1200, "sine", 0, 0.2, 0.25);
      setTimeout(onDone, 250);
    } else if (item.id === "airhorn" || item.soundType === "horn") {
      [280, 290, 310].forEach((f) => pf(f, "sawtooth", 0, 0.5, 0.12));
      setTimeout(onDone, 550);
    } else if (item.id === "fail" || item.soundType === "fail") {
      [330, 311, 293, 261].forEach((f, i) => pf(f, "sawtooth", i * 0.2, 0.25, 0.15));
      setTimeout(onDone, 1200);
    } else {
      pf(800, "sine", 0, 0.35, 0.2);
      setTimeout(onDone, 400);
    }
  } catch {
    onDone();
  }
};

const playDataUrl = (url: string, onDone: () => void) => {
  const a = new Audio(url);
  a.volume = 0.85;
  a.onended = a.onerror = onDone;
  a.play().catch(onDone);
};

export const SoundboardView: React.FC = () => {
  const { soundEnabled, setSoundEnabled } = useOverlayStore();
  const t = useTranslation();
  const {
    items, isRecording, addSound, removeSound, renameSound, setShortcut, setRecording,
  } = useSoundStore();

  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const [recentPlays, setRecentPlays] = React.useState<string[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [recName, setRecName] = React.useState("");
  const [recSecs, setRecSecs] = React.useState(0);
  const [editScId, setEditScId] = React.useState<string | null>(null);
  const [scVal, setScVal] = React.useState("");
  const [showPhone, setShowPhone] = React.useState(false);

  const recRef = React.useRef<MediaRecorder | null>(null);
  const chRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startStopRec = React.useCallback(async () => {
    if (isRecording) {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chRef.current, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          const id = `custom_${Date.now()}`;
          addSound({
            id,
            name: recName.trim() || `Moj zvuk ${new Date().toLocaleTimeString()}`,
            icon: "🎙️",
            shortcut: `Alt+D${items.length + 1}`,
            audioDataUrl: reader.result as string,
            soundType: "cheer",
          });
        };
        reader.readAsDataURL(blob);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setRecSecs(0);
      timerRef.current = setInterval(() => {
        setRecSecs((s) => {
          if (s >= 30) {
            recRef.current?.stop();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      /* mic permission denied */
    }
  }, [isRecording, recName, items.length, addSound, setRecording]);

  React.useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recRef.current?.stop();
    },
    []
  );

  const play = (item: SoundboardItem) => {
    if (!soundEnabled) return;
    setPlayingId(item.id);
    setRecentPlays((p) => [item.name, ...p.slice(0, 4)]);
    const done = () => setPlayingId((c) => (c === item.id ? null : c));
    if (item.audioDataUrl) playDataUrl(item.audioDataUrl, done);
    else playSynth(item, done);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide">
              {t("soundboard.title")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("soundboard.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={startStopRec}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              isRecording
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
            }`}
            title={isRecording ? t("soundboard.stop") : t("soundboard.record")}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span>{isRecording ? `${t("soundboard.stop")} (${recSecs}s)` : t("soundboard.record")}</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              soundEnabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundEnabled ? t("soundboard.active") : t("soundboard.muted")}</span>
          </button>
        </div>
      </div>

      {/* ── Recording banner ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-900/20 border border-rose-500/30 flex flex-wrap items-center gap-3"
          >
            <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-rose-300">{t("soundboard.recording")}</span>
            <input
              value={recName}
              onChange={(e) => setRecName(e.target.value)}
              placeholder={t("soundboard.namePlaceholder")}
              className="flex-1 min-w-[160px] bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
            <span className="text-[10px] font-mono text-rose-400">{t("soundboard.maxDuration")}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Soundboard Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isPlaying = playingId === item.id;
          const isEditing = editingId === item.id;
          const isEditingSc = editScId === item.id;
          const isCustom = !!item.audioDataUrl;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3 ${
                isPlaying
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border-cyan-400 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/80 border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl filter drop-shadow">{item.icon}</span>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      isCustom
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                    }`}
                  >
                    {isCustom ? t("soundboard.custom") : t("soundboard.synth")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title={t("soundboard.rename")}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSound(item.id);
                    }}
                    className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                    title={t("soundboard.remove")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editName.trim()) {
                        renameSound(item.id, editName.trim());
                        setEditingId(null);
                        setEditName("");
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (editName.trim()) renameSound(item.id, editName.trim());
                      setEditingId(null);
                      setEditName("");
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <h3 onClick={() => play(item)} className="text-sm font-black text-white">
                  {item.name}
                </h3>
              )}

              {isCustom && item.audioDataUrl && !isEditing && (
                <audio
                  src={item.audioDataUrl}
                  controls
                  className="w-full h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <div className="flex items-center justify-between mt-1">
                {isEditingSc ? (
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={scVal}
                      onChange={(e) => setScVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && scVal.trim()) {
                          setShortcut(item.id, scVal.trim());
                          setEditScId(null);
                          setScVal("");
                        }
                        if (e.key === "Escape") setEditScId(null);
                      }}
                      placeholder="Alt+D1"
                      className="w-20 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (scVal.trim()) setShortcut(item.id, scVal.trim());
                        setEditScId(null);
                        setScVal("");
                      }}
                      className="text-[10px] font-bold text-emerald-400"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditScId(item.id);
                      setScVal(item.shortcut);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-950 border border-white/10 text-cyan-300 hover:border-cyan-500/40 transition group"
                    title={t("soundboard.changeShortcut")}
                  >
                    <Keyboard className="h-3 w-3 text-cyan-400" />
                    <span>{item.shortcut}</span>
                    <Pencil className="h-2.5 w-2.5 text-slate-500 group-hover:text-cyan-300" />
                  </button>
                )}
                <span
                  className={`text-[9px] font-bold uppercase ${
                    isPlaying ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {isPlaying ? t("soundboard.playing") : t("soundboard.clickToPlay")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom: History + Phone Bridge �────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent plays */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>{t("soundboard.recent")}</span>
          </h4>
          {recentPlays.length === 0 ? (
            <p className="text-xs text-slate-500">
              {t("soundboard.noRecent")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentPlays.map((playName, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-xl border border-white/5 text-slate-300"
                >
                  <span className="font-semibold text-white">{playName}</span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {t("soundboard.sent")}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-white/5">
            <span className="text-[11px] text-slate-400 font-mono">{t("soundboard.audioBuffer")}</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              128 samples (2.6ms)
            </span>
          </div>
        </div>

        {/* Phone / Stream Deck bridge */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <span>{t("soundboard.phoneBridge")}</span>
          </h4>
          <p className="text-xs text-slate-400 mb-3 flex-1">
            {t("soundboard.phoneDescription")}
          </p>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-[11px] text-slate-400 font-mono">WebSocket:</span>
              <span className="text-[11px] font-mono text-purple-300 font-bold">{PHONE_WS}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-[11px] text-slate-400 font-mono">UI:</span>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">{PHONE_UI}</span>
            </div>
          </div>
          <button
            onClick={() => setShowPhone(!showPhone)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition border bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>{showPhone ? t("soundboard.hideDetails") : t("soundboard.showDetails")}</span>
          </button>
          <AnimatePresence>
            {showPhone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 mt-3 rounded-xl bg-slate-950 border border-white/5">
                  <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside">
                    <li>
                      Spustite Tauri aplikáciu (
                      <code className="text-cyan-300">tauri dev</code>).
                    </li>
                    <li>
                      Na telefóne otvorte:{" "}
                      <span className="font-mono text-cyan-300">{PHONE_UI}</span>
                    </li>
                    <li>
                      Každé kliknutie odošle WebSocket správu{" "}
                      <span className="font-mono text-purple-300">
                        {"{ action:'play', id:'…' }"}
                      </span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
