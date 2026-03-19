import { IconType } from 'react-icons';
import { FiLock, FiDollarSign, FiZap, FiTag, FiCompass, FiGlobe, FiHome, FiTrendingUp } from 'react-icons/fi';
import { BiDiamond } from 'react-icons/bi';

const iconMap: Record<string, IconType> = {
  Vault: FiLock,
  PiggyBank: FiDollarSign,
  RocketLaunch: FiZap,
  Ticket: FiTag,
  Compass: FiCompass,
  Globe: FiGlobe,
  Diamond: BiDiamond,
  House: FiHome,
  ChartLineUp: FiTrendingUp,
};

interface LevelIconProps {
  name: string;
  size?: number;
  className?: string;
}

const LevelIcon = ({ name, size = 36, className = '' }: LevelIconProps) => {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon size={size} className={`text-primary-foreground ${className}`} />;
};

export default LevelIcon;
