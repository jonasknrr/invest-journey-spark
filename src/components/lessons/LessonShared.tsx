import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

/* ─── Shared page transition variants ─── */
export const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
  exit: { opacity: 0, x: -60, transition: { duration: 0.2 } },
};

/* ─── Step dots ─── */
export const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2.5 rounded-full transition-all duration-300 ${
          i === current
            ? 'w-7 bg-primary'
            : i < current
              ? 'w-2.5 bg-primary/40'
              : 'w-2.5 bg-muted-foreground/20'
        }`}
      />
    ))}
  </div>
);

/* ─── Completion overlay ─── */
export const CompletionOverlay = ({ onDone }: { onDone: () => void }) => (
  <motion.div
    className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-4 mb-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.25, type: 'spring', stiffness: 300, damping: 15 }}
        >
          <FiStar
            size={i === 1 ? 64 : 48}
            className="text-[hsl(45,100%,50%)]"
            style={{ filter: 'drop-shadow(0 0 12px hsl(45 100% 50% / 0.5))' }}
          />
        </motion.div>
      ))}
    </div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="text-center"
    >
      <p
        className="font-display text-4xl font-bold text-primary mb-2"
        style={{ textShadow: '0 0 20px hsl(142 71% 45% / 0.3)' }}
      >
        +50 XP
      </p>
      <p className="font-body text-muted-foreground text-base">Lesson complete!</p>
    </motion.div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-10">
      <motion.button
        onClick={onDone}
        whileTap={{ scale: 0.96 }}
        className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm shadow-soft"
      >
        Continue learning
      </motion.button>
    </motion.div>
  </motion.div>
);
