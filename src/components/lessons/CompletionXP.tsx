import { motion } from 'framer-motion';

interface CompletionResult {
  xpEarned: number;
  streakBonus: number;
  isFirstCompletion: boolean;
  newStreak: number;
}

interface CompletionXPProps {
  result: CompletionResult | null;
  hearts: number;
}

const CompletionXP = ({ result, hearts }: CompletionXPProps) => {
  if (!result) return null;

  if (!result.isFirstCompletion) {
    return (
      <div className="w-full max-w-xs rounded-2xl bg-muted border border-border p-4 text-center mb-5">
        <p className="font-display text-sm font-bold text-foreground mb-1">Du hast diese Lektion bereits abgeschlossen.</p>
        <p className="font-body text-xs text-muted-foreground mb-2">+0 XP · Keine XP für Wiederholungen</p>
        <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-700 font-body text-xs font-semibold">✓ XP bereits verdient</span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="inline-flex flex-col items-center gap-0.5 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <motion.span
          className="font-display text-xl font-bold text-amber-600 dark:text-amber-400"
          animate={{ textShadow: ['0 0 0px hsl(38,92%,50%)', '0 0 16px hsl(38,92%,50%)', '0 0 0px hsl(38,92%,50%)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          +{result.xpEarned} XP
        </motion.span>
        <span className="font-body text-xs text-amber-600/70 dark:text-amber-400/70">verdient</span>
      </motion.div>

      {result.streakBonus > 0 && (
        <motion.div
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="font-body text-xs font-semibold text-green-700 dark:text-green-400">
            🔥 {result.newStreak}er Streak! +{result.streakBonus} Bonus-XP
          </span>
        </motion.div>
      )}

      {hearts === 3 && (
        <motion.div
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <span className="font-body text-xs font-semibold text-blue-700 dark:text-blue-400">⭐ Perfekt abgeschlossen!</span>
        </motion.div>
      )}
    </>
  );
};

export default CompletionXP;
