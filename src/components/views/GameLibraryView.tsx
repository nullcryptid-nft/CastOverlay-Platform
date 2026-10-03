import React, { useEffect, useState } from "react";
import { Search, Users, Zap, Layers, Clock, Gamepad2, ShoppingBag, Library, Play, Crosshair, ExternalLink, CreditCard, Trophy, Cpu, MemoryStick, ArrowLeft } from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { useAuthStore } from "../../stores/authStore";
import { localeFor, useTranslation } from "../../i18n";
import { useSettingsStore } from "../../stores/settingsStore";
import { GAME_CATEGORIES, GAME_PROFILES } from "../../data/games";
import {
  enrichAllGames,
  getAllSteamApps,
  launchGameLocally,
  searchSteamStore,
  steamBannerUrl,
  steamStoreUrl,
  iThereAnyDealUrl,
  ggDealsUrl,
} from "../../services/steamService";
import type { GameProfile } from "../../types";
import { TiltCard } from "../../components/ScoreWidget";
import { buyOnSteam } from "../../services/steamService";

interface GameLibraryViewProps {
  onLaunchOverlayForGame: (game: GameProfile) => void;
}

type LibraryTab = "owned" | "catalog";

export const GameLibraryView: React.FC<GameLibraryViewProps> = ({
  onLaunchOverlayForGame,
}) => {
  const {
    selectedGame,
    setSelectedGame,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshSteamLibrary,
    ownedGames,
    ownedAppIds,

  } = useGameStore();

  const [libraryTab, setLibraryTab] = useState<LibraryTab>("owned");
  const [enrichedGames, setEnrichedGames] = useState<GameProfile[]>([]);
  const [storeResults, setStoreResults] = useState<GameProfile[]>([]);
  const [allSteamApps, setAllSteamApps] = useState<GameProfile[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const steamId = useAuthStore((state) => state.user?.steam?.steamId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginWithSteam = useAuthStore((state) => state.loginWithSteam);
  const t = useTranslation();
  const language = useSettingsStore((state) => state.language);

  // Dynamic Steam library detection (GetOwnedGames / local scan / mock fallback)
  // (sec. 2 + 5); mock catalog used only when detection fails to keep UI alive
  // on offline/white-screen scenarios.
  useEffect(() => {
    let cancelled = false;
    refreshSteamLibrary().then(() => {
      const store = useGameStore.getState();
      // Prefer the in-store, ownership-accurate catalog (tailored to the user's
      // real Steam library when available) ; fall back to local enrichment so
      // the UI works even before the refresh resolves.
      const canonical = store.catalogGames ?? GAME_PROFILES;
      enrichAllGames(canonical).then((enriched) => {
        if (!cancelled) setEnrichedGames(enriched);
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSteamLibrary]);

  // Fetch ALL Steam apps when catalog tab is active
  useEffect(() => {
    if (libraryTab !== "catalog") return;
    if (allSteamApps.length > 0) return; // already loaded
    let cancelled = false;
    setCatalogLoading(true);
    getAllSteamApps().then((apps) => {
      if (cancelled) return;
      setCatalogLoading(false);
      const base = GAME_PROFILES[0];
      setAllSteamApps(
        apps.map((a) => ({
          ...base,
          id: `steam-db-${a.appid}`,
          name: a.name,
          genre: "Steam DB",
          category: "All",
          badge: "STEAM DB",
          bannerUrl: steamBannerUrl(a.appid),
          steamAppId: String(a.appid),
          inSteamLibrary: ownedAppIds?.includes(a.appid) ?? false,
          targetFps: 144,
          activePlayers: 0,
        }) as unknown as GameProfile),
      );
    }).catch(() => setCatalogLoading(false));
    return () => { cancelled = true; };
  }, [libraryTab, ownedAppIds]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (libraryTab !== "catalog" || query.length < 2) {
      setStoreResults([]);
      return;
    }

    let cancelled = false;
    setStoreResults([]);
    const timeout = window.setTimeout(() => {
      searchSteamStore(query, localeFor(language).slice(0, 2)).then((results) => {
        if (cancelled) return;
        setStoreResults(
          results.map((result) => {
            const knownGame = GAME_PROFILES.find(
              (game) => Number(game.steamAppId) === result.appid,
            );
            return {
              ...(knownGame ?? GAME_PROFILES[0]),
              id: `steam-store-${result.appid}`,
              name: result.name,
              genre: knownGame?.genre ?? "Steam Game",
              category: knownGame?.category ?? "All",
              badge: "STEAM STORE",
              bannerUrl: knownGame?.bannerUrl ?? steamBannerUrl(result.appid),
              steamAppId: String(result.appid),
              inSteamLibrary: ownedAppIds?.includes(result.appid) ?? false,
            };
          }),
        );
      });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [libraryTab, searchQuery]);

  const { ownedList, catalogList } = React.useMemo(() => {
    if (ownedAppIds === null) {
      return { ownedList: enrichedGames, catalogList: enrichedGames };
    }
    const ownedSet = new Set(ownedAppIds);
    return {
      ownedList: ownedGames,
      catalogList: enrichedGames.filter((game) => {
        const appId = Number(game.steamAppId) || 0;
        return appId !== 0 && !ownedSet.has(appId);
      }),
    };
  }, [enrichedGames, ownedGames, ownedAppIds]);

  const tabList = libraryTab === "owned" ? ownedList : catalogList;

  const filteredGames = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tabList.filter((game: GameProfile) => {
      const matchesSearch =
        game.name.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "All" || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, tabList]);

  const visibleGames = React.useMemo(() => {
    const ownedSet = ownedAppIds ? new Set(ownedAppIds) : null;
    const baseList =
      libraryTab === "catalog" ? [...catalogList, ...allSteamApps] : filteredGames;
    const filtered = baseList
      // In the Store (catalog) tab, show only games the user does NOT yet
      // own — owned titles stay in "My Library" (owned tab).
      .filter((g) => {
        if (libraryTab === "catalog" && ownedSet) {
          const aid = Number(g.steamAppId) || 0;
          if (aid !== 0 && ownedSet.has(aid)) return false;
        }
        const q = searchQuery.toLowerCase();
        const inCat = selectedCategory === "All" || g.category === selectedCategory;
        return g.name.toLowerCase().includes(q) && inCat;
      });
    // Deduplicate by appId
    const seen = new Set<number>();
    const deduped = filtered.filter((g) => {
      const aid = Number(g.steamAppId) || 0;
      if (aid && seen.has(aid)) return false;
      if (aid) seen.add(aid);
      return true;
    });
    if (libraryTab !== "catalog") return deduped;
    // Merge in store-search results — only titles not already in the list
    // and not already owned.
    return [
      ...deduped,
      ...storeResults.filter(
        (game) =>
          !seen.has(Number(game.steamAppId)) &&
          !ownedAppIds?.includes(Number(game.steamAppId)),
      ),
    ];
  }, [filteredGames, catalogList, allSteamApps, storeResults, ownedAppIds, libraryTab, selectedCategory, searchQuery]);

  const isUnowned = (game: GameProfile) =>
    ownedAppIds !== null && libraryTab === "catalog" && !game.inSteamLibrary;
  const handleLaunchSteamGame = async (game: GameProfile) => {
    const appId = Number(game.steamAppId);
    if (!appId) return;
    setLaunchError(null);
    try {
      // Prefer the locally-installed executable (found by scanning
      // <Program Files>\Steam\steamapps\common\<Name>\… — spawns the game
      // directly). On failure (game not installed / no match) the Rust
      // side falls back to `steam://run/<appId>` opened by the installed
      // Steam client.
      await launchGameLocally(game.name, appId);
    } catch {
      setLaunchError(`Could not launch ${game.name}.`);
    }
  };
  const storeUrlFor = (g: GameProfile) =>
    g.steamAppId ? steamStoreUrl(g.steamAppId) : undefined;

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Back button */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="shrink-0 p-2.5 rounded-xl bg-slate-800/70 border border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("library.search")}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Smart Library Tabs (sec. 2): Moja Knižnica / Preskúmať & Obchod */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setLibraryTab("owned")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              libraryTab === "owned"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md shadow-emerald-500/20"
                : "bg-slate-800/70 text-slate-300 border border-white/5 hover:bg-slate-700"
            }`}
          >
            <Library className="h-3.5 w-3.5" />
            <span>{t("library.owned")}</span>
          </button>
          <button
            onClick={() => setLibraryTab("catalog")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              libraryTab === "catalog"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md shadow-amber-500/20"
                : "bg-slate-800/70 text-slate-300 border border-white/5 hover:bg-slate-700"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{t("library.explore")}</span>
          </button>
        </div>
      </div>

      {launchError && (
        <div role="status" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {launchError}
        </div>
      )}
      {libraryTab === "owned" && steamId && ownedAppIds === null && (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {t("library.loadError")}
        </div>
      )}

      {/* Categories Bar (secondary row) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {GAME_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? "bg-slate-700 text-white border border-white/15"
                  : "bg-slate-800/40 text-slate-400 border border-white/5 hover:bg-slate-700/50"
              }`}
            >
              {t(`category.${cat}`)}
            </button>
          );
        })}
      </div>

      {/* Game Catalog Grid or Empty State */}
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="text-6xl opacity-30">🎮</div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Welcome to CastOverlay</h2>
            <p className="text-sm text-slate-400 max-w-md">
              Log in with Steam to see your game library, or create a free account and get 3 free games!
            </p>
          </div>
          <button
            onClick={() => void loginWithSteam()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.95 0 3.76-.54 5.32-1.45l-3.38-3.38h4.55v-.55H16l-2.72-2.72 2.72-2.72h-2.38v-.55h-2.5v.55h1.55l-2.72 2.72 2.72 2.72-2.72 2.72h2.38v.55h1.55l3.38 3.38A10 10 0 0 0 12 2Zm-4.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/>
            </svg>
            Log in with Steam
          </button>
        </div>
      ) : libraryTab === "catalog" && catalogLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading full Steam catalog…</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleGames.map((game: GameProfile) => {
          const isSelected = selectedGame.id === game.id;

          return (
            <TiltCard
              key={game.id}
              className={`rounded-2xl overflow-hidden bg-slate-900/90 backdrop-blur-md flex flex-col justify-between shadow-xl ${
                isSelected
                  ? "ring-2 ring-cyan-500/40 shadow-cyan-500/10"
                  : ""
              }`}
              glowColor={game.glowColor || "rgba(6,182,212,0.4)"}
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                <img
                  src={game.bannerUrl}
                  alt={game.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x400/07090E/06B6D4?text=No+Image";
                  }}
                  className="w-full h-full object-cover object-center opacity-70 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="text-[9px] font-black tracking-widest text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40 uppercase">
                    {game.badge}
                  </span>
                  {game.inSteamLibrary && (
                    <span className="text-[9px] font-black tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 uppercase flex items-center space-x-1">
                      <Gamepad2 className="h-3 w-3" />
                      <span>{t("library.ownedSteam")}</span>
                    </span>
                  )}
                  {isUnowned(game) && (
                    <span className="text-[9px] font-black tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 uppercase flex items-center space-x-1">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{t("library.unowned")}</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{game.activePlayers}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                    {game.targetFps} FPS {t("library.target")}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {game.genre} •{" "}
                    <span className="text-cyan-400">{game.category}</span>
                  </p>

                  {/* Steam enrichment details */}
                  {(game.hoursPlayed != null ||
                    game.developer != null ||
                    game.systemRequirements != null) && (
                    <div className="mt-2 space-y-1.5">
                      {game.hoursPlayed != null && (
                        <div className="flex items-center space-x-1.5 text-[10px] text-amber-300">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {t("library.playingFor")} <strong>{game.hoursPlayed.toLocaleString(localeFor(language))}h</strong>
                          </span>
                        </div>
                      )}
                      {game.developer && (
                        <div className="text-[10px] text-slate-400">
                          {game.developer}
                          {game.releaseDate && (
                            <span className="text-slate-500"> • {game.releaseDate}</span>
                          )}
                        </div>
                      )}
                      {game.systemRequirements && (
                        <details className="group">
                          <summary className="cursor-pointer text-[10px] text-cyan-400 hover:text-cyan-300 select-none">
                            {t("library.requirements")}
                          </summary>
                          <div className="mt-1 grid grid-cols-1 gap-0.5 text-[10px]">
                            <div className="text-slate-300 font-semibold text-[9px] uppercase tracking-wider text-cyan-500 mt-1">
                              {t("library.minimum")}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">CPU:</strong>{" "}
                              {game.systemRequirements.min.cpu || "N/A"}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">RAM:</strong>{" "}
                              {game.systemRequirements.min.ram}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">GPU:</strong>{" "}
                              {game.systemRequirements.min.gpu}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">Disk:</strong>{" "}
                              {game.systemRequirements.min.disk}
                            </div>
                            <div className="text-slate-300 font-semibold text-[9px] uppercase tracking-wider text-cyan-500 mt-1.5">
                              {t("library.recommended")}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">CPU:</strong>{" "}
                              {game.systemRequirements.rec.cpu || "N/A"}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">RAM:</strong>{" "}
                              {game.systemRequirements.rec.ram}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">GPU:</strong>{" "}
                              {game.systemRequirements.rec.gpu}
                            </div>
                            <div className="text-slate-400 truncate">
                              <strong className="text-slate-300">Disk:</strong>{" "}
                              {game.systemRequirements.rec.disk}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Default Preset Labels */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-white/5 text-[10px] text-slate-400">
                    <div>
                      Stat 1:{" "}
                      <strong className="text-white">
                        {game.defaultStats.stat1Label}
                      </strong>
                    </div>
                    <div>
                      Stat 2:{" "}
                      <strong className="text-white">
                        {game.defaultStats.stat2Label}
                      </strong>
                    </div>
                    <div>
                      Stat 3:{" "}
                      <strong className="text-white">
                        {game.defaultStats.stat3Label}
                      </strong>
                    </div>
                    <div>
                      Stat 4:{" "}
                      <strong className="text-white">
                        {game.defaultStats.stat4Label}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedGame(game)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{isSelected ? t("library.active") : isUnowned(game) ? t("library.exploreGame") : t("library.selectGame")}</span>
                  </button>

                  {game.inSteamLibrary && (
                    <button
                      onClick={() => handleLaunchSteamGame(game)}
                      className="p-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:brightness-110 shadow-md shadow-emerald-500/20 transition"
                      title={t("library.playSteam")}
                      aria-label={t("library.playSteam")}
                      data-game-name={game.name}
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}

                  {/* Buy on Steam — opens the installed Steam client directly
                      in the checkout cart for this title. */}
                  {isUnowned(game) && game.steamAppId && (
                    <button
                      onClick={() => void buyOnSteam(game.steamAppId!)}
                      className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-black hover:brightness-110 shadow-md shadow-blue-500/20 transition cursor-pointer"
                      title="Add to cart in Steam"
                      aria-label={`Add ${game.name} to cart in Steam`}
                    >
                      <CreditCard className="h-4 w-4" />
                    </button>
                  )}

                  {/* Compare Prices (ITAD) */}
                  {game.steamAppId && (
                    <a
                      href={iThereAnyDealUrl(game.steamAppId)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:brightness-110 shadow-md shadow-amber-500/20 transition"
                      title={`Compare prices (${game.name})`}
                      aria-label={`Compare prices for ${game.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              </TiltCard>
          );
        })}
      </div>
      )}
    </div>
  );
};
