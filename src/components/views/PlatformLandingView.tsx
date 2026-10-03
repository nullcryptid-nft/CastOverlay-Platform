import { useState, useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  Gamepad2,
  Layers3,
  MessageCircle,
  Radio,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import LogoIcon from "../../assets/icons/icon.svg";
import { useAppStore } from "../../stores/appStore";
import { LANGUAGES, useTranslation } from "../../i18n";
import { useSettingsStore } from "../../stores/settingsStore";
import { GAME_PROFILES } from "../../data/games";

type PreviewTheme = "cyberpunk" | "emerald" | "crimson";

const themes: Array<{
  id: PreviewTheme;
  label: string;
  note: string;
  swatch: string;
}> = [
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    note: "Cyan / purple",
    swatch: "bg-cyan-300",
  },
  {
    id: "emerald",
    label: "Emerald",
    note: "Green / black",
    swatch: "bg-emerald-400",
  },
  {
    id: "crimson",
    label: "Crimson",
    note: "Red / white",
    swatch: "bg-rose-400",
  },
];

const platforms = ["TWITCH", "YOUTUBE", "KICK", "STEAM"];

export const PlatformLandingView: React.FC = () => {
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const t = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const [theme, setTheme] = useState<PreviewTheme>("cyberpunk");

  return (
    <div className="landing-shell min-h-screen overflow-hidden bg-[#07090e] text-slate-100">
      <div className="landing-ambient" aria-hidden="true" />
      <header className="landing-header sticky top-0 z-50 border-b border-white/[0.06] bg-[#080a10]/75 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1320px] items-center justify-between gap-5 px-5 sm:px-8 xl:px-10">
          <a
            className="landing-brand"
            href="#home"
            aria-label="CastOverlay home"
          >
            <span className="landing-brand-mark">
              <img src={LogoIcon} alt="" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-[-0.04em] text-white">
                CAST<span className="text-cyan-300">OVERLAY</span>
              </span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.22em] text-slate-500">
                PLAY ABOVE THE GAME
              </span>
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            <a className="landing-nav-link landing-nav-current" href="#home">
              {t("landing.home")}
            </a>
            <a className="landing-nav-link" href="#about">
              {t("landing.about")}
            </a>
            <a className="landing-nav-link" href="#contacts">
              {t("landing.contacts")}
            </a>
            <a className="landing-nav-link" href="#blog">
              {t("landing.blog")}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="landing-language">{t("language.label")}</label>
            <select
              id="landing-language"
              aria-label={t("language.label")}
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="max-w-[120px] rounded-lg border border-white/10 bg-slate-900/80 px-2 py-2 text-[10px] font-semibold text-slate-300 outline-none focus:border-cyan-300/50"
            >
              {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="landing-login rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-white sm:px-4"
            >
              {t("landing.login")}
            </button>
            <a
              className="landing-contact rounded-lg px-3.5 py-2.5 text-xs font-bold sm:px-4"
              href="#contacts"
            >
              {t("landing.contactUs")} <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-[1320px] gap-6 overflow-x-auto px-5 pb-3 md:hidden"
        >
          <a className="landing-nav-link landing-nav-current" href="#home">
            Home
          </a>
          <a className="landing-nav-link" href="#about">
            About
          </a>
          <a className="landing-nav-link" href="#contacts">
            Contacts
          </a>
          <a className="landing-nav-link" href="#blog">
            Blog
          </a>
        </nav>
      </header>

      <main>
        <section
          id="home"
          className="landing-hero relative mx-auto grid max-w-[1320px] items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:min-h-[690px] lg:grid-cols-[0.94fr_1.06fr] lg:gap-7 lg:px-10 lg:pb-28 lg:pt-14"
        >
          <div className="relative z-10 max-w-[620px]">
            <div className="landing-eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
              {t("landing.eyebrow")}
            </div>
            <h1 className="max-w-[650px] font-display text-[clamp(2.4rem,5.5vw,5.2rem)] font-bold leading-[0.91] tracking-[-0.075em] text-white">
              {t("landing.nextGen")}
              <br />
              <span className="landing-title-gradient">{t("landing.heroTitle1")}</span>
              <br />
              {t("landing.heroTitle2")}<span className="text-cyan-300">.</span>
            </h1>
            <h2 className="mt-7 max-w-[520px] font-display text-sm font-bold uppercase leading-6 tracking-[0.17em] text-slate-300 sm:text-base">
              {t("landing.subtitle")}
            </h2>
            <p className="mt-4 max-w-[490px] text-sm leading-7 text-slate-400 sm:text-[15px]">
              {t("landing.description")}
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => setActiveTab("library")}
                className="landing-primary-cta group rounded-xl px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.08em]"
              >
                <Gamepad2 className="mr-2.5 inline h-4 w-4 transition-transform group-hover:scale-110" />
                {t("landing.openApp") ?? "Otvoriť aplikáciu"}
              </button>
              <span className="text-[11px] leading-5 text-slate-500">
                {t("landing.platformsNote") ?? "Windows desktop · Steam integrated"}
              </span>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> {t("landing.steamAvailable")}
              </span>
              <span className="hidden h-3 w-px bg-white/10 sm:block" />
              <span className="inline-flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-300" /> {t("landing.builtWith")}
              </span>
            </div>
          </div>

          <div className="landing-hud-stage relative mx-auto w-full max-w-[690px] lg:ml-auto">
            <div className="hud-orbit hud-orbit-one" aria-hidden="true" />
            <div className="hud-orbit hud-orbit-two" aria-hidden="true" />
            <div className="hud-float-label hud-label-left">
              <span className="hud-live-dot" /> {t("landing.preview")}{" "}
              <span className="text-slate-600">/</span> MATCH 09
            </div>
            <div className="hud-float-label hud-label-right">
              <Radio className="h-3.5 w-3.5 text-violet-300" /> {t("landing.multiChat")}
            </div>
            <div className="landing-hud-panel relative z-10 overflow-hidden rounded-[22px] border border-white/10 bg-[#0d121b]/90 shadow-[0_35px_110px_rgba(0,0,0,.55),0_0_70px_rgba(34,211,238,.12)] backdrop-blur-2xl">
              <div className="hud-topline flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="hud-game-mark flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.09]">
                    <Gamepad2 className="h-4 w-4 text-cyan-200" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold tracking-[0.14em] text-white">
                      {t("landing.matchOverview")}
                    </span>
                    <span className="mt-1 block text-[9px] font-medium tracking-[0.15em] text-slate-500">
                      COMPETITIVE · DUST II
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-emerald-300">
                  <span className="hud-live-dot" /> MATCH UI
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/[0.07] px-5 py-5 sm:px-8 sm:py-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[9px] font-bold tracking-[0.16em] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{" "}
                    COUNTER-TERRORISTS
                  </div>
                  <div className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    13
                  </div>
                </div>
                <div className="px-3 text-center">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                    VS
                  </span>
                  <div className="mt-2 font-mono text-[11px] text-slate-300">
                    23:41
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-2 flex items-center justify-end gap-2 text-[9px] font-bold tracking-[0.16em] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />{" "}
                    TERRORISTS
                  </div>
                  <div className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    09
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1.13fr_.87fr] sm:p-6">
                <div className="rounded-xl border border-white/[0.06] bg-[#090d14] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-[0.15em] text-slate-400">
                      {t("landing.performance")}
                    </span>
                    <span className="font-mono text-[9px] text-emerald-300">
                      STABLE
                    </span>
                  </div>
                  <div
                    className="hud-chart"
                    aria-label="Illustrative stable performance graph"
                  >
                    <div className="hud-chart-line" />
                    <div className="hud-chart-bars">
                      {[
                        27, 43, 34, 55, 44, 62, 49, 70, 56, 78, 67, 88, 72, 96,
                        76, 91, 69, 84, 72, 97, 81, 100, 78, 93,
                      ].map((height, index) => (
                        <span key={index} style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[8px] tracking-[0.1em] text-slate-600">
                    <span>20:00</span>
                    <span>20:15</span>
                    <span>20:30</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                  <div className="hud-stat">
                    <span className="hud-stat-icon text-cyan-200">
                      <Activity className="h-3.5 w-3.5" />
                    </span>
                    <span className="hud-stat-label">FRAME RATE</span>
                    <strong>
                      238 <small>FPS</small>
                    </strong>
                    <span className="hud-stat-foot text-emerald-300">
                      ● CONSISTENT
                    </span>
                  </div>
                  <div className="hud-stat">
                    <span className="hud-stat-icon text-violet-200">
                      <Cpu className="h-3.5 w-3.5" />
                    </span>
                    <span className="hud-stat-label">SYSTEM LOAD</span>
                    <strong>
                      LOW <small>IMPACT</small>
                    </strong>
                    <span className="hud-stat-foot text-slate-500">
                      LIGHTWEIGHT MODE
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.07] bg-white/[0.018] px-5 py-3.5 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span className="text-[9px] font-semibold tracking-[0.11em] text-slate-400">
                    {t("landing.chatLayer")}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-slate-600">
                  CASTOVERLAY HUD
                </span>
              </div>
            </div>
            <div className="hud-mini-card absolute -bottom-7 -left-2 z-20 flex items-center gap-3 rounded-xl border border-white/10 bg-[#111722]/95 px-4 py-3 shadow-2xl sm:-left-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-200">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[9px] font-bold tracking-[0.12em] text-white">
                  ONE CHAT. EVERYWHERE.
                </span>
                <span className="mt-1 block text-[9px] text-slate-500">
                  Twitch · YouTube · Kick
                </span>
              </span>
              <span className="ml-1 flex -space-x-1">
                <i className="h-2 w-2 rounded-full border border-[#111722] bg-violet-300" />
                <i className="h-2 w-2 rounded-full border border-[#111722] bg-rose-400" />
                <i className="h-2 w-2 rounded-full border border-[#111722] bg-emerald-300" />
              </span>
            </div>
            <div className="hud-coordinate absolute -right-1 -top-8 hidden font-mono text-[9px] tracking-[0.2em] text-slate-600 sm:block">
              40°42'51.2"N &nbsp; 74°00'21.7"W
            </div>
          </div>
          <a
            className="hero-scroll absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] font-bold tracking-[0.21em] text-slate-600 lg:flex"
            href="#about"
          >
            SCROLL TO EXPLORE <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </section>

        <section
          className="landing-platforms border-y border-white/[0.06] bg-white/[0.015]"
          aria-label="Supported platforms"
        >
          <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-5 px-5 py-7 sm:flex-row sm:px-8 lg:px-10">
            <span className="text-[9px] font-bold tracking-[0.2em] text-slate-600">
              YOUR STREAMING STACK, IN ONE VIEW
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
              {platforms.map((platform) => (
                <span className="platform-wordmark" key={platform}>
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-28 lg:px-10"
        >
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
            <div>
              <span className="landing-section-kicker">
                {t("landing.aboutKicker")}
              </span>
              <h2 className="landing-section-heading mt-4">
                {t("landing.aboutTitle")}
                <br />
                <span className="text-slate-500">{t("landing.aboutTitle2")}</span>
              </h2>
            </div>
            <p className="max-w-[370px] pb-1 text-sm leading-6 text-slate-400">
              {t("landing.purposeTools")}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="landing-feature-card group rounded-2xl border border-white/[0.075] bg-[#0c1018] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 sm:p-7">
              <div className="feature-icon feature-icon-cyan">
                <Zap className="h-5 w-5" />
              </div>
              <span className="landing-card-index">01 — ENGINE</span>
              <h3>
                {t("landing.feature1")}
              </h3>
              <p>
                {t("landing.feature1Text")}
              </p>
              <div className="feature-bottom">
                <span>TAURI V2</span>
                <span>RUST CORE</span>
                <span>DESKTOP</span>
              </div>
            </article>
            <article className="landing-feature-card group rounded-2xl border border-white/[0.075] bg-[#0c1018] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25 sm:p-7">
              <div className="feature-icon feature-icon-violet">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="landing-card-index">02 — COMMUNITY</span>
              <h3>
                {t("landing.feature2")}
              </h3>
              <p>
                {t("landing.feature2Text")}
              </p>
              <div className="feature-bottom">
                <span>TWITCH</span>
                <span>YOUTUBE</span>
                <span>KICK</span>
                <span>STEAM</span>
              </div>
            </article>
            <article className="landing-feature-card group rounded-2xl border border-white/[0.075] bg-[#0c1018] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 sm:p-7">
              <div className="feature-icon feature-icon-green">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <span className="landing-card-index">03 — GAME AWARE</span>
              <h3>
                {t("landing.feature3")}
              </h3>
              <p>
                {t("landing.feature3Text")}
              </p>
              <div className="feature-bottom">
                <span>GAME DETECTION</span>
                <span>RICH PRESENCE</span>
              </div>
            </article>
          </div>
        </section>

        <section
          id="visuals"
          data-theme={theme}
          className="landing-visuals relative border-y border-white/[0.07] bg-[#0a0d13]"
        >
          <div className="visuals-glow" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:gap-16 lg:px-10 lg:py-28">
            <div>
              <span className="landing-section-kicker">{t("landing.visualsKicker")}</span>
              <h2 className="landing-section-heading mt-4">
                {t("landing.visualsTitle")}
                <br />
                <span className="text-slate-500">{t("landing.visualsTitle2")}</span>
              </h2>
              <p className="mt-5 max-w-[390px] text-sm leading-7 text-slate-400">
                {t("landing.visualsText")}
              </p>
              <div
                className="mt-8 space-y-2"
                role="group"
                aria-label="Choose a HUD theme"
              >
                {themes.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={theme === option.id}
                    onClick={() => setTheme(option.id)}
                    className={`theme-choice flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${theme === option.id ? "theme-choice-active" : "border-white/[0.07] bg-white/[0.015] hover:border-white/15"}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${option.swatch} shadow-[0_0_12px_currentColor]`}
                    />
                    <span className="flex-1">
                      <span className="block text-xs font-bold text-slate-100">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500">
                        {option.note}
                      </span>
                    </span>
                    <span className="font-mono text-[9px] text-slate-600">
                      0{index + 1}
                    </span>
                    {theme === option.id && (
                      <Check className="h-4 w-4 text-cyan-200" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-5 text-slate-600">
                {t("landing.themePreview")}
              </p>
            </div>
            <div className="theme-preview" data-theme={theme}>
              <div className="arena-scene relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,.45)]">
                <div className="arena-vignette" />
                <div className="arena-skyline" />
                <div className="arena-floor" />
                <div className="arena-grid" />
                <div className="arena-topline">
                  <span className="flex items-center gap-2">
                    <span className="arena-dot" /> MATCH IN PROGRESS
                  </span>
                  <span>MAP · DUST II</span>
                </div>
                <div className="arena-round">
                  <span className="arena-team">BLUE TEAM</span>
                  <strong>
                    13 <i>:</i> 09
                  </strong>
                  <span className="arena-team arena-team-right">RED TEAM</span>
                  <small>ROUND 23 &nbsp;·&nbsp; 0:42</small>
                </div>
                <div className="arena-crosshair" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <div className="arena-bottom-left">
                  <div className="arena-player">CO</div>
                  <div>
                    <span>PLAYER ONE</span>
                    <strong>
                      100 <small>HP</small> &nbsp; 100 <small>ARMOR</small>
                    </strong>
                  </div>
                </div>
                <div className="arena-bottom-right">
                  <span className="arena-weapon">AK</span>
                  <span>
                    <strong>
                      30 <small>/ 90</small>
                    </strong>
                    <em>RIFLE · PRIMARY</em>
                  </span>
                </div>
                <div className="arena-vertical">
                  CASTOVERLAY &nbsp; / &nbsp; LIVE HUD
                </div>
              </div>
              <div className="preview-caption flex items-center justify-between gap-3 pt-4">
                <span className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5 text-cyan-300" /> INTERFACE
                  PREVIEW
                </span>
                <span className="font-mono text-[9px] text-slate-600">
                  THEME: {theme.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="blog"
          className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <span className="landing-section-kicker">
                {t("landing.blogKicker")}
              </span>
              <h2 className="landing-section-heading mt-4">
                {t("landing.blogTitle")}
                <br />
                <span className="text-slate-500">{t("landing.blogTitle2")}</span>
              </h2>
            </div>
            <article className="landing-journal-card grid gap-5 rounded-2xl border border-white/[0.08] bg-[#0d1119] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.16em] text-cyan-200">
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.07] px-2.5 py-1">
                    PRODUCT UPDATE
                  </span>
                  <span className="text-slate-600">VERSION 2.4</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  The match is moving. Your HUD moves with it.
                </h3>
                <p className="mt-2 max-w-[590px] text-sm leading-6 text-slate-400">
                  {t("landing.blogText")}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("library")}
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-200 transition hover:text-white"
              >
                {t("landing.openApp") ?? "Otvoriť aplikáciu"} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          </div>
        </section>

        <section
          id="contacts"
          className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="contact-panel relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d121b] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="contact-panel-glow" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="landing-section-kicker">
                  {t("landing.contactsKicker")}
                </div>
                <h2 className="mt-4 max-w-[700px] font-display text-3xl font-bold tracking-[-0.055em] text-white sm:text-5xl">
                  {t("landing.community")}
                </h2>
                <p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-400">
                  {t("landing.communityText")}
                </p>
              </div>
              <button
                type="button"
                disabled
                title={t("landing.inviteSoon")}
                className="discord-cta inline-flex cursor-not-allowed items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-xs font-extrabold uppercase tracking-[0.08em] opacity-75"
              >
                <MessageCircle className="h-4 w-4" /> {t("landing.discord")}{" "}
                <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] tracking-normal text-violet-200/70">
                  {t("landing.inviteSoon")}
                </span>
              </button>
            </div>
            <div className="contact-divider relative my-9 h-px bg-white/[0.08]" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-white">
                  {t("landing.question")}
                </span>{" "}
                {t("landing.getInTouch")}
              </p>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="inline-flex w-fit items-center gap-2 text-xs font-bold text-cyan-200 transition hover:text-white"
              >
                {t("landing.login")} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] bg-[#06080c]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <a className="landing-brand w-fit" href="#home">
            <span className="landing-brand-mark landing-brand-mark-small">
              <img src={LogoIcon} alt="" />
            </span>
            <span className="text-xs font-bold tracking-[-0.03em] text-slate-200">
              CAST<span className="text-cyan-300">OVERLAY</span>
            </span>
          </a>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-slate-500"
          >
            <a className="transition hover:text-white" href="#about">
              {t("landing.about")}
            </a>
            <a className="transition hover:text-white" href="#blog">
              {t("landing.blog")}
            </a>
            <a className="transition hover:text-white" href="#contacts">
              Contact
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className="text-[10px] font-semibold text-slate-500 transition hover:text-cyan-200"
            >
              {t("landing.openPlatform")}
            </button>
            <span className="text-[10px] text-slate-600">
              {t("landing.copyright")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
