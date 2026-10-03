import type { LucideIcon, LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

export interface IconWrapperProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export function Icon({
  name,
  className = "",
  size = 24,
  strokeWidth = 2,
  ...props
}: IconWrapperProps) {
  const IconComponent = LucideIcons[name] as LucideIcon | undefined;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide Icons`);
    return null;
  }

  return (
    <IconComponent
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export const icons = LucideIcons;

export function createIcon(name: IconName) {
  return (props: Omit<IconWrapperProps, "name">) => (
    <Icon name={name} {...props} />
  );
}

export const IconRegistry = {
  Zap: createIcon("Zap"),
  Cpu: createIcon("Cpu"),
  MousePointer2: createIcon("MousePointer2"),
  Minimize: createIcon("Minimize"),
  Settings: createIcon("Settings"),
  X: createIcon("X"),
  Lock: createIcon("Lock"),
  Unlock: createIcon("Unlock"),
  Database: createIcon("Database"),
  Monitor: createIcon("Monitor"),
  Activity: createIcon("Activity"),
  Trophy: createIcon("Trophy"),
  ChevronUp: createIcon("ChevronUp"),
  ChevronDown: createIcon("ChevronDown"),
  Gamepad2: createIcon("Gamepad2"),
  Layers: createIcon("Layers"),
  SlidersHorizontal: createIcon("SlidersHorizontal"),
  Palette: createIcon("Palette"),
  Save: createIcon("Save"),
  RefreshCw: createIcon("RefreshCw"),
  Sun: createIcon("Sun"),
  Globe: createIcon("Globe"),
  Wifi: createIcon("Wifi"),
  Users: createIcon("Users"),
  MessageSquare: createIcon("MessageSquare"),
  Clock: createIcon("Clock"),
  Target: createIcon("Target"),
  TrendingUp: createIcon("TrendingUp"),
  TrendingDown: createIcon("TrendingDown"),
  Plus: createIcon("Plus"),
  Minus: createIcon("Minus"),
  AlertTriangle: createIcon("AlertTriangle"),
} as const;

export type RegisteredIconName = keyof typeof IconRegistry;
