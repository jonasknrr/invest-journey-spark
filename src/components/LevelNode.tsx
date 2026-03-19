import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Level } from '@/data/levels';
import LevelIcon from './LevelIcon';

interface LevelNodeProps {
  level: Level;
  index: number;
  onClick: () => void;
  align?: 'left' | 'right';
}

const colorMap: Record<string, string> = {
  festgeld: 'bg-level-festgeld',
  tagesgeld: 'bg-level-tagesgeld',
  aktien: 'bg-level-aktien',
  anleihen: 'bg-level-anleihen',
  etfs: 'bg-level-etfs',
  waehrungen: 'bg-level-waehrungen',
  krypto: 'bg-level-krypto',
  gold: 'bg-level-gold',
  immobilien: 'bg-level-immobilien',
};

const shadowMap: Record<string, string> = {
  festgeld: '0 10px 25px -5px hsla(150,60%,45%,0.35)',
  tagesgeld: '0 10px 25px -5px hsla(140,70%,75%,0.35)',
  aktien: '0 10px 25px -5px hsla(215,90%,60%,0.35)',
  anleihen: '0 10px 25px -5px hsla(185,80%,45%,0.35)',
  etfs: '0 10px 25px -5px hsla(225,85%,55%,0.35)',
  waehrungen: '0 10px 25px -5px hsla(35,95%,55%,0.35)',
  krypto: '0 10px 25px -5px hsla(265,85%,65%,0.35)',
  gold: '0 10px 25px -5px hsla(45,100%,50%,0.35)',
  immobilien: '0 10px 25px -5px hsla(15,70%,55%,0.35)',
};

const LevelNode = ({ level, index, onClick, align = 'left' }: LevelNodeProps) => {
  const isCompleted = level.status === 'completed';
  const isCurrent = level.status === 'current';
  const isLocked = level.status === 'locked';
  const isRight = align === 'right';

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-4 max-w-[280px] w-full
        ${isRight ? 'flex-row-reverse self-end' : 'flex-row self-start'}
      `}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Icon circle */}
      <div
        className={`relative flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-3xl
          ${isLocked ? 'opacity-50 grayscale' : ''}
          ${isCurrent ? 'animate-pulse-soft' : ''}
          ${colorMap[level.colorKey]}
        `}
        style={{
          boxShadow: isLocked ? 'none' : shadowMap[level.colorKey],
        }}
      >
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-soft">
            <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
        <LevelIcon name={level.iconName} size={36} />
      </div>

      {/* Text */}
      <div className={`flex-1 min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
        <h3 className={`font-display text-lg font-bold leading-tight ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
          {level.title}
        </h3>
        <p className={`text-sm mt-0.5 ${isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
          {level.subtitle}
        </p>
        {!isLocked && (
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden w-full">
            <motion.div
              className={`h-full rounded-full ${colorMap[level.colorKey]}`}
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        )}
        {isLocked && (
          <p className="text-xs mt-1 text-muted-foreground/50 font-medium">🔒 Wird freigeschaltet</p>
        )}
      </div>
    </motion.button>
  );
};

export default LevelNode;
