import { useEffect, useRef, useCallback } from 'react';
import { useGameStore, useOverlayStore } from '@/stores';

interface HardwareMetrics {
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  gpu_percent: number | null;
  gpu_temp: number | null;
  cpu_name: string;
  gpu_name: string;
}

async function fetchRealMetrics(): Promise<HardwareMetrics | null> {
  if (!(window as any).__TAURI__) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return (await invoke<HardwareMetrics>('get_hardware_metrics'));
  } catch {
    return null;
  }
}

export function useHardwareMonitoring() {
  const { stressMode, selectedGame } = useGameStore();
  const { hardware, updateHardware } = useOverlayStore();
  const intervalRef = useRef<number | null>(null);

  const generateMetrics = useCallback(() => {
    const targetFps = selectedGame?.targetFps || 240;

    if (stressMode) {
      return {
        cpu: Math.round(Math.random() * 25 + 65),
        ramUsed: parseFloat((14.2 + Math.random() * 2).toFixed(1)),
        ramTotal: 32.0,
        fps: Math.floor(targetFps * 0.6 + Math.random() * 20),
        gpuTemp: 76 + Math.floor(Math.random() * 5),
      };
    }

    return {
      cpu: Math.round(Math.random() * 15 + 15),
      ramUsed: parseFloat((8.4 + Math.random() * 1.5).toFixed(1)),
      ramTotal: 32.0,
      fps: Math.floor(targetFps - 5 + Math.random() * 10),
      gpuTemp: 56 + Math.floor(Math.random() * 6),
    };
  }, [stressMode, selectedGame]);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const real = await fetchRealMetrics();
      if (cancelled) return;
      if (real) {
        updateHardware({
          cpu: Math.round(real.cpu_percent),
          ramUsed: parseFloat(real.ram_used_gb.toFixed(1)),
          ramTotal: parseFloat(real.ram_total_gb.toFixed(1)),
          fps: Math.floor((selectedGame?.targetFps || 144) * 0.8),
          gpuTemp: real.gpu_temp ?? 55,
        });
      } else {
        updateHardware(generateMetrics());
      }
    };

    update();
    intervalRef.current = window.setInterval(update, 1000);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stressMode, selectedGame, updateHardware, generateMetrics]);

  return hardware;
}

export function useVictoryEffect() {
  const { triggerVictory, victoryBanner } = useGameStore();

  const trigger = useCallback(() => {
    triggerVictory();
  }, [triggerVictory]);

  const dismiss = useCallback(() => {
    useGameStore.setState({ victoryBanner: false });
  }, []);

  return { victoryBanner, trigger, dismiss };
}