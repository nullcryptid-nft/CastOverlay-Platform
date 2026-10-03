import { Icon, IconRegistry } from "./index";

export function IconExample() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Icon name="Zap" size={32} className="text-neon-cyan" />
      <Icon name="Cpu" size={32} className="text-neon-purple" />
      <Icon name="Settings" size={24} strokeWidth={1.5} />
      <IconRegistry.Zap className="text-neon-green" size={28} />
      <IconRegistry.Cpu className="text-neon-orange" size={28} />
    </div>
  );
}

export { Icon, IconRegistry, type IconWrapperProps } from "./index";
