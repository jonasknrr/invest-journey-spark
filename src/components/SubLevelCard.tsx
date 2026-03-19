import { motion } from 'framer-motion';
import { FiCheck, FiLock, FiPlay } from 'react-icons/fi';
import ProgressRing from './ProgressRing';
import type { SubLevel } from '@/data/levels';

interface SubLevelCardProps {
  subLevel: SubLevel;
  index: number;
  accentColor: string;
  onClick: () => void;
}

const SubLevelCard = ({ subLevel, index, accentColor, onClick }: SubLevelCardProps) => {
  const isCompleted = subLevel.status === 'completed';
  const isCurrent = subLevel.status === 'current';
  const isLocked = subLevel.status === 'locked';

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left p-5 rounded-3xl bg-card shadow-card transition-all
        ${isLocked ? 'opacity-60' : 'hover:shadow-lg'}
      `}
      whileTap={!isLocked ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ transitionDelay: `${index * 0.06}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className={`font-display text-base font-bold ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
            {subLevel.title}
          </h4>
          <p className={`text-sm mt-1 ${isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
            {subLevel.description}
          </p>
          <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full
            ${isCompleted ? 'bg-primary/10 text-primary' : isLocked ? 'bg-muted text-muted-foreground/50' : 'bg-muted text-muted-foreground'}`}>
            ⏱ {subLevel.duration}
          </span>
        </div>

        <div className="flex-shrink-0 mt-1">
          {isCompleted && (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
            </div>
          )}
          {isCurrent && (
            <ProgressRing progress={50} size={40} strokeWidth={3.5} color={accentColor} />
          )}
          {isLocked && (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-4 h-4 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default SubLevelCard;
