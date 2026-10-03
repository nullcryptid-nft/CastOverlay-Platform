import type { ChatMessage } from "../types";

const users = [
  { name: "CyberGamer99", color: "#F472B6", platform: "discord" as const, role: "mod" as const },
  { name: "ViperMain", color: "#A855F7", platform: "discord" as const, role: "mod" as const },
  { name: "NeonRaider", color: "#06B6D4", platform: "discord" as const, role: "vip" as const },
  { name: "pixelKnight", color: "#EF4444", platform: "discord" as const, role: "user" as const },
  { name: "savage_spartan", color: "#22C55E", platform: "discord" as const, role: "sub" as const },
  { name: "TiltMaster99", color: "#FACC15", platform: "discord" as const, role: "mod" as const },
  { name: "CastOverlayFan", color: "#3B82F6", platform: "discord" as const, role: "user" as const },
  { name: "TiltQueen", color: "#EC4899", platform: "discord" as const, role: "vip" as const },
  { name: "lan_party_42", color: "#14B8A6", platform: "discord" as const, role: "sub" as const },
  { name: "CosmicRush", color: "#F472B6", platform: "discord" as const, role: "user" as const },
  { name: "FrameDropFred", color: "#84CC16", platform: "discord" as const, role: "sub" as const },
  { name: "ModVanguard_44", color: "#6366F1", platform: "discord" as const, role: "mod" as const },
  { name: "Vanguard_01", color: "#FB923C", platform: "steam" as const, role: "friend" as const },
  { name: "EliteSniper", color: "#60A5FA", platform: "steam" as const, role: "friend" as const },
  { name: "RespAWN_twr", color: "#FBBF24", platform: "steam" as const, role: "user" as const },
];

const texts: string[] = [
  "LET'S GOOO 🔥",
  "what a play!!",
  "first time here, love the setup",
  "gg ez",
  "the recoil control is insane",
  "can you do a 1v4 clutcb next game?",
  "this aim is FEEDBACK level 🔫",
  "overwatch2 would ask 240fps right lol",
  "be nice to everyone in the intgration",
  "streamer lord day tt do tau www",
  "KILLING IT lol",
  "how many hours on this? hours",
  "GG broke the game again",
  "CS2 recoil has changed so much with new update",
  "I just hit 200 hours on this stream, legends",
  "what gpu are you running? nvidia or amd",
  "the overlay looks so clean 👍",
  "coming from Valorant, this is so smooth",
  "one more headshot and I'm done for today",
  "who's streaming next? predict",
  "NATIONS RANK UP OR KNIFE",
  "REKT their entire squadron",
  "W streamer, W content",
  "the fps counter shows 240 FPS locked, beautiful",
  "deaths to a kingdom of 4 players",
  "noob check passed 🤷♂",
  "ready to grind ranked all night",
  "the audio set up is insane, use this 4,1",
  "sub'd for 4 days straight now",
  "tenmo revised the whole loadout post",
  "THIS. IS. CONTENT.",
];

function badgeFor(role: ChatMessage["role"]): string {
  switch (role) {
    case "mod": return "�️";
    case "sub": return "⭐";
    case "vip": return "💎";
    case "friend": return "👥";
    default: return "✦";
  }
}

let id = 1000;
const now = Date.now();

export const MOCK_CHAT: ChatMessage[] = Array.from({ length: 30 }, (_, i) => {
  const u = users[i % users.length];
  const t = texts[i % texts.length];
  return {
    id: id++,
    user: u.name,
    badge: badgeFor(u.role),
    color: u.color,
    text: t,
    platform: u.platform,
    role: u.role,
    timestamp: new Date(now - i * 45_000).toISOString(),
  };
});

export default MOCK_CHAT;