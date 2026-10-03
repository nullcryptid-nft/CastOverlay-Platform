import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useGameStore } from "../stores/gameStore";
import type { GameProfile } from "../types";

const PROCESS_TO_GAME: Record<string, { id: string; name: string; displayName: string }> = {
  "cs2.exe": { id: "cs2", name: "Counter-Strike 2", displayName: "CS2" },
  "csgo.exe": { id: "cs2", name: "Counter-Strike 2", displayName: "CS2" },
  "valorant.exe": { id: "valorant", name: "VALORANT", displayName: "VALORANT" },
  "leagueoflegends.exe": { id: "lol", name: "League of Legends", displayName: "LoL" },
  "dota2.exe": { id: "dota2", name: "Dota 2", displayName: "Dota 2" },
  "apexlegends.exe": { id: "apex", name: "Apex Legends", displayName: "Apex" },
  "overwatch.exe": { id: "ow2", name: "Overwatch 2", displayName: "OW2" },
  "ow2.exe": { id: "ow2", name: "Overwatch 2", displayName: "OW2" },
  "fortnite": { id: "fortnite", name: "Fortnite", displayName: "Fortnite" },
  "pubg.exe": { id: "pubg", name: "PUBG", displayName: "PUBG" },
};

export type GameDetectedListener = (info: { id: string; name: string; displayName: string }) => void;

/**
 * Subscribes to Tauri `game-info` events and auto-switches the game profile
 * when a known game process is detected. Fires a callback when a game is
 * first detected so the caller can show a toast notification.
 */
export function useAutoGameDetection(onGameDetected: GameDetectedListener): void {
  const detectedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const handleEvent = async () => {
      try {
        const un = await import("@tauri-apps/api/event");
        unlisten = await un.listen("game-info", (event) => {
          const data = event.payload as { is_in_game?: boolean; game_name?: string | null; gameName?: string | null } | null;
          let procName: string | undefined;
          if (data) {
            procName = data.is_in_game
              ? (data.game_name || data.gameName) || undefined
              : undefined;
          }
          if (!procName) return;

          const key = procName.toLowerCase().replace(/\.(exe)$/, "");
          const match = Object.entries(PROCESS_TO_GAME).find(([p]) =>
            key.includes(p.replace(".exe", ""))
          );

          if (match) {
            const [, gameDef] = match;
            if (!detectedRef.current.has(gameDef.id)) {
              detectedRef.current.add(gameDef.id);
              const game = useGameStore.getState().ownedGames.find((g) => g.id === gameDef.id);
              if (game) {
                useGameStore.getState().setSelectedGame(game);
              }
              onGameDetected(gameDef);
            }
          }
        });
      } catch {
        // Not in Tauri — no background process detection (browser mode)
      }
    };

    handleEvent();

    return () => {
      unlisten?.();
    };
  }, [onGameDetected]);
}