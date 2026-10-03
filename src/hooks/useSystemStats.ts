import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type {
  SystemStats,
  GameInfo,
  StreamInfo,
  StreamSession,
} from "../types";

interface UseSystemStatsReturn {
  systemStats: SystemStats;
  gameInfo: GameInfo;
  streamInfo: StreamInfo;
  score: StreamSession;
  error: string | null;
}

export function useSystemStats(): UseSystemStatsReturn {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpuUsage: 0,
    ramUsed: 0,
    ramTotal: 0,
    fps: 0,
  });
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    isInGame: false,
    gameName: "",
    fps: 0,
    ping: 0,
    cpuUsage: 0,
    ramUsage: 0,
  });
  const [streamInfo, setStreamInfo] = useState<StreamInfo>({
    isLive: false,
    viewers: 0,
    followers: 0,
    chatMessages: 0,
    streamTitle: "",
    streamCategory: "",
    uptime: 0,
  });
  const [score, setScore] = useState<StreamSession>({
    id: "session-1",
    startTime: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);

  const handleSystemStats = useCallback((event: { payload: SystemStats }) => {
    setSystemStats(event.payload);
  }, []);

  const handleGameInfo = useCallback((event: { payload: GameInfo }) => {
    setGameInfo(event.payload);
  }, []);

  const handleStreamInfo = useCallback((event: { payload: StreamInfo }) => {
    setStreamInfo(event.payload);
  }, []);

  const handleScoreUpdate = useCallback((event: { payload: StreamSession }) => {
    setScore(event.payload);
  }, []);

  useEffect(() => {
    let unlistenStats: (() => void) | null = null;
    let unlistenGame: (() => void) | null = null;
    let unlistenStream: (() => void) | null = null;
    let unlistenScore: (() => void) | null = null;

    const setupListeners = async () => {
      try {
        unlistenStats = await listen<SystemStats>(
          "system-stats",
          handleSystemStats,
        );
        unlistenGame = await listen<GameInfo>("game-info", handleGameInfo);
        unlistenStream = await listen<StreamInfo>(
          "stream-info",
          handleStreamInfo,
        );
        unlistenScore = await listen<StreamSession>(
          "score-update",
          handleScoreUpdate,
        );
      } catch (err) {
        setError("Failed to initialize event listeners");
        console.error("Event listener setup failed:", err);
      }
    };

    setupListeners();

    return () => {
      unlistenStats?.();
      unlistenGame?.();
      unlistenStream?.();
      unlistenScore?.();
    };
  }, [handleSystemStats, handleGameInfo, handleStreamInfo, handleScoreUpdate]);

  useEffect(() => {
    const fetchInitialStats = async () => {
      try {
        const stats = await invoke<SystemStats>("get_system_stats");
        setSystemStats(stats);
      } catch (err) {
        console.error("Failed to fetch initial system stats:", err);
      }
    };

    fetchInitialStats();
  }, []);

  return { systemStats, gameInfo, streamInfo, score, error };
}
