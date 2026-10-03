import { create } from "zustand";
import type { SocialState } from "../types";

// Official CastOverlay Discord server
const DISCORD_INVITE_CODE = "1554464065500483584";
const DISCORD_URL = `https://discord.com/channels/${DISCORD_INVITE_CODE}/`;

/**
 * Public Discord invite API – no auth required for basic invite info.
 * Returns approximate member and online counts.
 */
async function fetchDiscordInviteInfo(code: string): Promise<{
  member_count: number;
  online_member_count?: number;
} | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/invites/${code}?with_counts=true`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      member_count: data?.approximate_member_count ?? 0,
      online_member_count: data?.approximate_presence_count,
    };
  } catch {
    return null;
  }
}

export const useSocialStore = create<SocialState>()((set) => ({
  discordUrl: DISCORD_URL,
  discordInviteCode: DISCORD_INVITE_CODE,
  onlineMembers: 0,
  totalMembers: 0,
  isOfficialLive: false,
  setOfficialLive: (v: boolean) => set({ isOfficialLive: v }),

  checkOfficial: async () => {
    const inviteInfo = await fetchDiscordInviteInfo(DISCORD_INVITE_CODE);
    if (inviteInfo) {
      set({
        totalMembers: inviteInfo.member_count,
        onlineMembers: inviteInfo.online_member_count ?? 0,
        isOfficialLive: (inviteInfo.online_member_count ?? 0) > 0,
      });
    } else {
      // Offline / API blocked: simulate a healthy community
      if ((import.meta as any).env?.DEV) {
        await new Promise((r) => setTimeout(r, 800));
        set({
          totalMembers: 247,
          onlineMembers: 38,
          isOfficialLive: true,
        });
      }
    }
  },
}));