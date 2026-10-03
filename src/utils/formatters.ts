export function getRamPercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((used / total) * 100, 100);
}

export function getStatusColor(percentage: number): string {
  if (percentage < 60) return "text-neon-green";
  if (percentage < 85) return "text-amber-400";
  return "text-neon-pink";
}

export function getStatusBgColor(percentage: number): string {
  if (percentage < 60) return "bg-neon-green/20 border-neon-green/30";
  if (percentage < 85) return "bg-amber-400/20 border-amber-400/30";
  return "bg-neon-pink/20 border-neon-pink/30";
}

export function getGlowColor(percentage: number): string {
  if (percentage < 60) return "#00FF85";
  if (percentage < 85) return "#FFB800";
  return "#FF0055";
}

export function formatUptime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toLocaleString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}