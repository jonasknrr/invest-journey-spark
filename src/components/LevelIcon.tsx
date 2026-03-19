import {
  Vault,
  PiggyBank,
  RocketLaunch,
  Ticket,
  Compass,
  Globe,
  Diamond,
  House,
  ChartLineUp,
  type IconProps,
} from '@phosphor-icons/react';
import type { ForwardRefExoticComponent } from 'react';

const iconMap: Record<string, ForwardRefExoticComponent<IconProps>> = {
  Vault,
  PiggyBank,
  RocketLaunch,
  Ticket,
  Compass,
  Globe,
  Diamond,
  House,
  ChartLineUp,
};

interface LevelIconProps {
  name: string;
  size?: number;
  className?: string;
}

const LevelIcon = ({ name, size = 36, className = '' }: LevelIconProps) => {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon size={size} weight="fill" className={`text-primary-foreground ${className}`} />;
};

export default LevelIcon;
