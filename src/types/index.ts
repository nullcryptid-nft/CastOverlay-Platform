export type Platform = "discord" | "steam";

/** Animation mode for the HeroTitle component — letters fly in from random positions */
export type HeroAnimationMode = "enter" | "idle" | "exit";

/** Steam profile fields (fetched via Steam OpenID + Steam Web API) */
export interface SteamProfile {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  level: number;
  status: "Online" | "In-Game" | "Away" | "Snooze" | "LastSeen";
  communityVisibilityState?: number;
}

/** A third-party platform linked to the user */
export interface LinkedPlatform {
  platform: Platform;
  connected: boolean;
  channelOrHandle?: string;
}

/** Steam-driven game detail fields */
export interface SystemRequirements {
  min: { cpu: string; ram: string; gpu: string; disk: string };
  rec: { cpu: string; ram: string; gpu: string; disk: string };
}

export interface GameProfile {
  id: string;
  name: string;
  genre: string;
  category: string;
  accentColor: string;
  glowColor: string;
  badge: string;
  activePlayers: string;
  targetFps: number;
  coverUrl: string;
  bannerUrl: string;
  defaultStats: StatPreset;

  // ── Steam enrichment (optional) ──────────────────────────────
  steamAppId?: number | string;
  logoUrl?: string;
  screenshotsUrls?: string[];
  hoursPlayed?: number;
  lastPlayed?: string;
  maxAchievementCount?: number;
  unlockedAchievementCount?: number;
  developer?: string;
  releaseDate?: string;
  systemRequirements?: SystemRequirements;
  inSteamLibrary?: boolean;
}

export interface StatPreset {
  stat1Label: string;
  stat1: number;
  stat2Label: string;
  stat2: number;
  stat3Label: string;
  stat3: number;
  stat4Label: string;
  stat4: number;
}

export interface SessionStats extends StatPreset {}

export interface SoundboardItem {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description?: string;
  soundType?: "victory" | "fail" | "horn" | "laser" | "ping" | "cheer";
  audioDataUrl?: string;
}

export interface SoundboardState {
  items: SoundboardItem[];
  isRecording: boolean;
  addSound: (item: SoundboardItem) => void;
  removeSound: (id: string) => void;
  renameSound: (id: string, name: string) => void;
  setShortcut: (id: string, shortcut: string) => void;
  setRecording: (v: boolean) => void;
}

export interface ChatMessage {
  id: number;
  user: string;
  badge: string;
  color: string;
  text: string;
  timestamp?: string;
  platform?: Platform;
  role?: "mod" | "sub" | "vip" | "friend" | "user";
}

export interface ChatPlatformConfig {
  platform: Platform;
  connected: boolean;
  channel: string;
  enabled: boolean;
}

export interface ChatOverlaySettings {
  fadeMode: boolean;
  fadeOutSec: number;
  maxVisible: number;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  overlayOpacity: number;
  platforms: ChatPlatformConfig[];
}

export interface ChatOverlayState {
  messages: ChatMessage[];
  lastMessageTime: number | null;
  isVisible: boolean;
  settings: ChatOverlaySettings;
  pushMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  pruneMessages: () => void;
  updateSettings: (partial: Partial<ChatOverlaySettings>) => void;
  togglePlatform: (platform: Platform) => void;
  setChannel: (platform: Platform, channel: string) => void;
  connectPlatform: (platform: Platform) => void;
  disconnectPlatform: (platform: Platform) => void;
}

export interface HardwareMetrics {
  cpu: number;
  ramUsed: number;
  ramTotal: number;
  fps: number;
  gpuTemp: number;
  gpuUsage?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl: string;
  tier: "Free" | "Pro" | "Pro Esports";
  createdAt: string;
  lastLogin?: string;
  settingsSynced?: boolean;
  steam?: SteamProfile;
  linkedPlatforms?: LinkedPlatform[];
  isAuthorized?: boolean;
}

export type ThemeType = "cyberpunk" | "emerald" | "crimson" | "amethyst";

export interface UISettings {
  windowOpacity: number;
  hudScale: number;
  theme: ThemeType;
  glassmorphismBlur: number;
  accentColor: string;
}

export interface PerformanceSettings {
  updateIntervalMs: number;
  lowLatencyMode: boolean;
  hardwareAcceleration: boolean;
  fpsLimit: number;
}

export interface SystemSettings {
  autoStart: boolean;
  minimizeToTray: boolean;
  audioOutputDevice: string;
  globalHotkeys: Array<{
    action: string;
    defaultKey: string;
    currentKey?: string;
  }>;
}

export interface HotkeyConfig {
  id?: string;
  label?: string;
  shortcut?: string;
  enabled?: boolean;
  action: string;
  defaultKey: string;
  currentKey?: string;
}

export type TabId =
  | "dashboard"
  | "library"
  | "club"
  | "soundboard"
  | "replay"
  | "chat"
  | "studio"
  | "profile"
  | "settings";

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<unknown>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<unknown>;
  logout: () => void;
  syncSettings: () => Promise<void>;
  syncStats: () => Promise<void>;
  loginWithSteam: () => Promise<void>;
  linkPlatform: (platform: Platform, channelOrHandle?: string) => void;
  unlinkPlatform: (platform: Platform) => void;
  isAuthorized: () => boolean;
}

export interface LiveStreamStatus {
  discord: boolean;
}

export interface DiscordMember {
  id: string;
  username: string;
  avatarUrl?: string;
  status: "online" | "idle" | "dnd" | "offline";
  isBot?: boolean;
}

export interface SocialState {
  /** Official Discord server invite URL */
  discordUrl: string;
  /** Discord invite code for display purposes */
  discordInviteCode: string;
  /** Number of members online (fetched or simulated) */
  onlineMembers: number;
  /** Total member count */
  totalMembers: number;
  isOfficialLive: boolean;
  setOfficialLive: (v: boolean) => void;
  /**
   * Ping Discord invite endpoint for community status.
   * Uses the public invite API: https://discord.com/api/v10/invites/{code}?with_counts=true
   */
  checkOfficial: () => Promise<void>;
}

export interface GameState {
  selectedGame: GameProfile | null;
  ownedGames: GameProfile[];
  /**
   * Steam-linked (owned) games, detected via GetOwnedGames / local disk scan.
   * `null` = not detected yet; if set, Library view filters to these only.
   */
  steamLibraryGames: GameProfile[] | null;
  sessionStats: StatPreset;
  selectedCategory: string;
  searchQuery: string;
  stressMode: boolean;
  victoryBanner: boolean;
  setSelectedGame: (game: GameProfile) => void;
  setOwnedGames: (games: GameProfile[]) => void;
  updateSessionStats: (stats: Partial<StatPreset>) => void;
  updateSingleStat: (key: keyof StatPreset, delta: number) => void;
  resetSessionStats: () => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setStressMode: (enabled: boolean) => void;
  triggerVictory: () => void;
  triggerDefeat: () => void;
  /**
   * Re-detect / enrich the Steam library: GetOwnedGames (API key) or local
   * install scan. Falls back to mock games in dev when online detection
   * fails (e.g. offline "White Screen" resilience, sec. 2 + 5).
   */
  refreshSteamLibrary: () => Promise<void>;
  setOwnedAppIds: (ids: number[] | null) => void;
  catalogGames: GameProfile[] | null;
  ownedAppIds: number[] | null;
}

export interface CardData {
  number: string;
  expiry: string;
  cvc: string;
}

export interface PaypalData {
  email: string;
  password: string;
}

export interface SettingsState {
  ui: UISettings;
  performance: PerformanceSettings;
  system: SystemSettings;
  language: "sk" | "en" | "de" | "es" | "fr";
  setLanguage: (language: "sk" | "en" | "de" | "es" | "fr") => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  steamWalletBalance: number | null;
  setSteamWalletBalance: (balance: number | null) => void;
  cardData: CardData;
  setCardData: (data: CardData) => void;
  paypalData: PaypalData;
  setPaypalData: (data: PaypalData) => void;
  themes?: ThemeType[];
  microphoneLevel?: number;
  hotkeys?: HotkeyConfig[];
  setMicrophoneLevel?: (level: number) => void;
  theme?: ThemeType;
  updateUISetting: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void;
  updateUiSettings?: (settings: Partial<UISettings>) => void;
  updatePerformanceSetting: <K extends keyof PerformanceSettings>(key: K, value: PerformanceSettings[K]) => void;
  updatePerformanceSettings?: (settings: Partial<PerformanceSettings>) => void;
  updateSystemSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  updateSystemSettings?: (settings: Partial<SystemSettings>) => void;
  saveTheme?: (theme: ThemeType) => void;
  resetToDefaults: () => void;
}

export interface OverlayState {
  isOverlayMode: boolean;
  isLocked: boolean;
  isClickThrough: boolean;
  soundEnabled: boolean;
  hardware: HardwareMetrics;
  isVisible?: boolean;
  isInteractive?: boolean;
  topmost?: boolean;
  blurBackground?: boolean;
  clickThrough?: boolean;
  setOverlayMode: (mode: boolean) => void;
  setLocked: (locked: boolean) => void;
  setClickThrough: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  updateHardware: (metrics: Partial<HardwareMetrics>) => void;
  setHardware?: (metrics: HardwareMetrics) => void;
  toggleVisible?: () => void;
  toggleTopmost?: () => void;
  toggleBlurBackground?: () => void;
  toggleClickThrough?: () => void;
  toggleCompact?: () => void;
}

export interface SystemStats {
  cpuUsage: number;
  ramUsed: number;
  ramTotal: number;
  fps: number;
  inputLatency?: number;
  renderTime?: number;
  memoryUsage?: number;
}

export interface GameInfo {
  isInGame: boolean;
  gameName: string;
  fps: number;
  ping: number;
  cpuUsage: number;
  ramUsage: number;
  id?: string;
  name?: string;
  category?: string;
  icon?: string;
  color?: string;
  targetFps?: number;
  currentFps?: number;
  gpuUsage?: number;
}

export interface StreamInfo {
  isLive: boolean;
  viewers: number;
  followers: number;
  chatMessages: number;
  streamTitle: string;
  streamCategory: string;
  uptime: number;
  platform?: "twitch" | "youtube";
  channelName?: string;
  channelUrl?: string;
  viewerCount?: number;
  bitrate?: number;
  gameName?: string;
}

export type ReplayFormat = string;

export interface ReplayFrame {
  id?: string;
  timestamp: number;
  format?: ReplayFormat | string;
  jpeg?: string;
  overlayData?: {
    cpu: number;
    fps: number;
    ram: number;
    stat1: number;
    stat2: number;
    capturedAt: string;
  };
}

export interface StreamSession {
  id: string;
  startTime: string;
  pageInfo?: GameInfo;
  streamUrl?: string;
  platform?: StreamInfo["platform"];
  startedAt?: number;
  endedAt?: number;
}

export interface ReplayClip {
  id: string;
  title?: string;
  gameName: string;
  duration: number;
  durationSec?: number;
  format: string | ReplayFormat;
  filePath?: string;
  createdAt?: string;
  capturedAt: string;
  frames?: ReplayFrame[];
  thumb?: string;
  thumbnail?: string;
  isFavorite?: boolean;
}

export interface ReplayState {
  frames: ReplayFrame[];
  ringDurationSec: number;
  isCapturing: boolean;
  lastClip: ReplayClip | null;
  clips?: ReplayClip[];
  pushFrame: (frame: ReplayFrame) => void;
  pruneFrames: () => void;
  captureNow: (gameName?: string) => ReplayClip | null;
  setLastClip: (clip: ReplayClip | null) => void;
  setCapturing: (v: boolean) => void;
  setRingDurationSec: (v: number) => void;
  clearRing: () => void;
}

export interface TiltMetrics {
  tiltScore?: number;
  level: number;
  lossStreak: number;
  winStreak: number;
  todayHours: number;
  lastUpdated: string;
  tiltTrend?: "up" | "down" | "stable";
  lastMatchDiff?: number;
  avgScore?: number;
  matchesCount?: number;
}

export interface MatchResult {
  id?: string;
  won: boolean;
  kills: number;
  deaths: number;
  assists: number;
  bestStreak: number;
  damageDealt: number;
  accuracy: number;
  durationMin: number;
  gameName?: string;
  finishedAt?: string;
}

export interface CoachRecap {
  matchId: string;
  overallRating: number;
  kdRatio: number;
  winRateSession: number;
  bestStreak: number;
  totalKills: number;
  totalDeaths: number;
  aiSummary: string;
  aiSuggestions: string[];
  aiGenerated: boolean;
  createdAt: string;
}

export interface CoachState {
  recaps: CoachRecap[];
  lastRecap: CoachRecap | null;
  matchHistory: MatchResult[];
  tilt: TiltMetrics;
  isTilted: boolean;
  showRestReminder: boolean;
  addMatch: (game: string, result: MatchResult) => void;
  addMatchResult: (result: MatchResult) => MatchResult;
  recordLoss: () => void;
  recordWin: () => void;
  generateRecap: (game: string) => Promise<CoachRecap>;
  updateTilt: (partial: Partial<TiltMetrics>) => void;
  updateTiltAfterMatch: (result: MatchResult) => void;
  resetTilt: () => void;
  dismissRestReminder: () => void;
  setBusy?: (v: boolean) => void;
}

export type HudElementId =
  | "topbar"
  | "metrics"
  | "score1"
  | "score2"
  | "score3"
  | "score4";

export interface HudElementConfig {
  id: string;
  type?:
    | "stat"
    | "timer"
    | "logo"
    | "bar"
    | "text"
    | "image"
    | "chat"
    | "alert"
    | "score"
    | "hardware"
    | "combo";
  label: string;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  scale?: number;
  rotation?: number;
  opacity: number;
  z: number;
  align?: "left" | "center" | "right";
  color?: string;
  size?: number;
}

export interface HudLayoutProfile {
  id?: string;
  name: string;
  gameName?: string;
  isDefault?: boolean;
  author?: string;
  exportedAt?: string;
  elements: HudElementConfig[];
  backgroundBlur?: number;
  updatedAt?: string;
}

export interface LayoutStudioState {
  elements: HudElementConfig[];
  selectedId: string | null;
  isEditing: boolean;
  profiles?: HudLayoutProfile[];
  activeProfileId?: string;
  getElement?: (type: HudElementConfig["type"]) => HudElementConfig;
  createProfile?: (name: string, gameName: string) => void;
  setActiveProfile?: (id: string) => void;
  deleteProfile?: (id: string) => void;
  updateElement?: (id: string, patch: Partial<HudElementConfig>) => void;
  addElement?: (type: HudElementConfig["type"]) => void;
  removeElement?: (id: string) => void;
  selectElement: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  updateOpacity: (id: string, opacity: number) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, w: number, h: number) => void;
  saveLayout?: () => void;
  resetLayout: () => void;
  setEditing: (v: boolean) => void;
  importProfile: (json: string) => boolean;
  exportProfile: () => string;
  setBlur?: (v: number) => void;
}

export interface Settings {
  audio: {
    masterVolume: number;
    muted: boolean;
    notifications: boolean;
    ducking: boolean;
    soundboardVolume: number;
  };
  behavior: {
    startMinimized: boolean;
    globalShortcut: string;
    instantReplayHotkey: string;
    streamingTournamentBanner: boolean;
    soundOnKill: boolean;
  };
  visuals: {
    theme: ThemeType;
    customColors: Record<string, string>;
    animationsEnabled: boolean;
    highContrast: boolean;
    showFpsOnPlayer: boolean;
    showInputPreview: boolean;
    logoGlow: boolean;
  };
}

export interface AppState {
  activeTab: TabId;
  authModalOpen: boolean;
  authMode: "login" | "register" | "steam";
  openAuthModal: (mode?: "login" | "register" | "steam") => void;
  closeAuthModal: () => void;
  setAuthModalOpen: (v: boolean) => void;
  setActiveTab: (tab: TabId) => void;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient?: string;
  points?: number;
  earnedAt?: string;
  timesEarned?: number;
}

export interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  points: number;
  streakDays: number;
  gamesPlayed: number;
  rank?: number;
}

export interface ClubState {
  points: number;
  streakDays: number;
  gamesPlayed: number;
  lastCheckIn?: string;
  lastActiveDate: string | null;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  checkIn: (opts?: { won?: boolean }) => void;
  earnPoints: (n: number) => void;
  resetProgress: () => void;
  refreshLeaderboard: (username: string, avatarUrl: string) => void;
  awardBadge: (id: string) => void;
}
