import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  RefreshCcw,
  Eye,
  EyeOff,
  X,
  Move,
} from "lucide-react";
import { useLayoutStudioStore } from "../stores/layoutStudioStore";

export const LayoutStudioPanel: React.FC = () => {
  const {
    elements,
    updateOpacity,
    resetLayout,
    exportProfile,
    importProfile,
  } = useLayoutStudioStore();

  const [showPanel, setShowPanel] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const json = exportProfile();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `castoverlay-hud-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportProfile]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (importProfile(text)) {
          setImportError(null);
          setImportOpen(false);
          setImportJson("");
        } else {
          setImportError("Neplatný formát profilu. Skúste znovu.");
        }
      };
      reader.readAsText(file);
    },
    [importProfile]
  );

  const handleImportJsonSubmit = useCallback(() => {
    if (!importJson.trim()) return;
    if (importProfile(importJson.trim())) {
      setImportError(null);
      setImportOpen(false);
      setImportJson("");
    } else {
      setImportError("Neplatný formát profilu. Skúste znovu.");
    }
  }, [importJson, importProfile]);

  return (
    <>
      {/* Tail toggle */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed bottom-4 left-4 z-[9999] flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/95 backdrop-blur-xl text-xs font-bold text-cyan-300 hover:border-cyan-400 shadow-2xl shadow-cyan-500/10 transition"
          title="Otvoriť Layout Studio"
        >
          <Move className="h-3.5 w-3.5" />
          <span>LAYOUT STUDIO</span>
        </button>
      )}

      {showPanel && (
        <motion.div
          initial={{ opacity: 0, x: -280 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -280 }}
          className="fixed left-0 top-0 bottom-0 w-72 z-[9998] bg-slate-950/98 backdrop-blur-2xl border-r border-white/10 flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <Move className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-black tracking-wider text-white uppercase">
                Layout Studio
              </span>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            // ── Export / Import ──────────────────────────────
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Profil rozloženia
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => {
                    setImportError(null);
                    setImportOpen(true);
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/25 transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import</span>
                </button>
              </div>
              <button
                onClick={resetLayout}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Reset na predvolené</span>
              </button>
            </div>

            {/* ── Element list ─────────────────────────────── */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Prvky
              </p>
              {elements.map((el) => {
                return (
                  <div
                    key={el.id}
                    className="rounded-lg border border-white/8 bg-slate-900/60 px-3 py-2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        {el.label}
                      </span>
                      <button
                        onClick={() =>
                          useLayoutStudioStore
                            .getState()
                            .toggleVisibility(el.id)
                        }
                        className={`p-1 rounded ${
                          el.visible
                            ? "text-cyan-400 hover:bg-cyan-500/10"
                            : "text-slate-600 hover:bg-white/5"
                        }`}
                        title={el.visible ? "Skryť" : "Zobraziť"}
                      >
                        {el.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Position labels */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-500">
                      <span>X: {el.x.toFixed(1)}%</span>
                      <span>Y: {el.y.toFixed(1)}%</span>
                      <span>W: {el.w.toFixed(1)}%</span>
                      <span>H: {el.h.toFixed(1)}%</span>
                    </div>

                    {/* Opacity slider */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 w-10">
                        Opačnosť
                      </span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={Math.round(el.opacity * 100)}
                        onChange={(e) =>
                          updateOpacity(el.id, parseInt(e.target.value) / 100)
                        }
                        className="flex-1 h-1 accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-cyan-300 w-8 text-right">
                        {Math.round(el.opacity * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Tips ─────────────────────────────────────── */}
            <div className="rounded-lg border border-white/5 bg-slate-900/40 p-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tipy
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Pre ťahanie prvkov kliknite do Overlay režimu (odkiaľ nútka
                &ldquo;Launch Overlay&rdquo;) – prvky sa môžu priamo presúvať
                myšou. Tu upravujete parametre.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Import Modal ───────────────────────────────────── */}
      {showPanel && importOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 rounded-2xl border border-white/15 bg-slate-950 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Importovať HUD profil
              </h3>
              <button
                onClick={() => setImportOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* File upload */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-cyan-300 transition"
            >
              Vybrať JSON súbor…
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] text-slate-500">alebo</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='Vložte JSON profil sem…'
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-slate-900 p-3 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />

            {importError && (
              <p className="text-[11px] text-rose-400">{importError}</p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setImportOpen(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Zrušiť
              </button>
              <button
                onClick={handleImportJsonSubmit}
                disabled={!importJson.trim()}
                className="flex-1 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition disabled:opacity-40"
              >
                Importovať
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
