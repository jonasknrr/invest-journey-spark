import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Level } from '@/data/levels';
import LevelIcon from './LevelIcon';

interface LevelNodeProps {
  level: Level;
  index: number;
  onClick: () => void;
  align?: 'left' | 'right';
  progress?: number; // 0–100
}

const colorMap: Record<string, string> = {
  festgeld: 'bg-level-festgeld',
  tagesgeld: 'bg-level-tagesgeld',
  aktien: 'bg-level-aktien',
  anleihen: 'bg-level-anleihen',
  etfs: 'bg-level-etfs',
  currencies: 'bg-level-currencies',
  crypto: 'bg-level-crypto',
  metals: 'bg-level-metals',
  realestate: 'bg-level-realestate',
};

const shadowMap: Record<string, string> = {
  festgeld: '0 10px 25px -5px hsla(150,60%,45%,0.35)',
  tagesgeld: '0 10px 25px -5px hsla(140,70%,75%,0.35)',
  aktien: '0 10px 25px -5px hsla(215,90%,60%,0.35)',
  anleihen: '0 10px 25px -5px hsla(185,80%,45%,0.35)',
  etfs: '0 10px 25px -5px hsla(225,85%,55%,0.35)',
  currencies: '0 10px 25px -5px hsla(35,95%,55%,0.35)',
  crypto: '0 10px 25px -5px hsla(265,85%,65%,0.35)',
  metals: '0 10px 25px -5px hsla(45,100%,50%,0.35)',
  realestate: '0 10px 25px -5px hsla(15,70%,55%,0.35)',
};

/** High-contrast ring colors against each level's background */
const ringColorMap: Record<string, string> = {
  festgeld: '#065F46',   // dark emerald vs green bg
  tagesgeld: '#064E3B',
  aktien: '#1E3A8A',     // dark blue vs blue bg
  anleihen: '#9CA3AF',   // grey
  etfs: '#312E81',       // dark indigo vs indigo bg
  currencies: '#92400E', // dark amber vs amber bg
  crypto: '#4C1D95',     // dark violet vs purple bg
  metals: '#78350F',     // dark amber vs metals bg
  realestate: '#7C2D12', // dark orange vs warm bg
};

const RING_SIZE = 88; // outer ring diameter
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const LevelNode = ({ level, index, onClick, align = 'left', progress = 0 }: LevelNodeProps) => {
  const isCompleted = level.status === 'completed';
  const isCurrent = level.status === 'current';
  const isLocked = level.status === 'locked';
  const isRight = align === 'right';

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = RING_CIRCUMFERENCE - (clampedProgress / 100) * RING_CIRCUMFERENCE;
  const ringColor = isLocked ? '#D1D5DB' : (ringColorMap[level.colorKey] || '#6B7280');

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
      {/* Icon circle with progress ring */}
      <div className="relative flex-shrink-0 z-10" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* SVG progress ring */}
        <svg
          className="absolute inset-0"
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          {/* Background track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={RING_STROKE}
          />
          {/* Progress arc */}
          {clampedProgress > 0 && (
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.8, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          )}
        </svg>

        {/* Inner icon circle */}
        <div
          className={`absolute rounded-full flex items-center justify-center text-3xl
            ${isLocked ? 'opacity-50 grayscale bg-muted' : ''}
            ${isCurrent ? 'animate-pulse-soft' : ''}
            ${!isLocked ? colorMap[level.colorKey] : ''}
          `}
          style={{
            top: RING_STROKE + 1,
            left: RING_STROKE + 1,
            width: RING_SIZE - (RING_STROKE + 1) * 2,
            height: RING_SIZE - (RING_STROKE + 1) * 2,
            boxShadow: isLocked ? 'none' : shadowMap[level.colorKey],
          }}
        >
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-soft">
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </div>
          )}
          <LevelIcon name={level.iconName} size={34} />
        </div>
      </div>

      {/* Text */}
      <div className={`flex-1 min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
        <h3 className={`font-display text-lg font-bold leading-tight ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
          {level.title}
        </h3>
        <p className={`text-sm mt-0.5 ${isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
          {level.subtitle}
        </p>
        {isLocked && (
          <p className="text-xs mt-1 text-muted-foreground/50 font-medium">🔒 Unlocks soon</p>
        )}
      </div>
    </motion.button>
  );
};

export default LevelNode;
