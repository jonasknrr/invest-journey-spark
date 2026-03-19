import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sectors = [
  { icon: '💻', label: 'Technology', base: 2000 },
  { icon: '🏥', label: 'Healthcare', base: 2000 },
  { icon: '⚡', label: 'Energy', base: 2000 },
  { icon: '🛒', label: 'Consumer', base: 2000 },
  { icon: '🏦', label: 'Finance', base: 2000 },
];

const CrashSlide = ({ onComplete }: { onComplete: () => void }) => {
  const [crashed, setCrashed] = useState(false);
  const [crashedIndex, setCrashedIndex] = useState(0);

  const handleCrash = () => {
    if (crashed) return;
    const idx = Math.floor(Math.random() * sectors.length);
    setCrashedIndex(idx);
    setCrashed(true);
    onComplete();
  };

  const crashedValue = 1200;
  const totalAfter = 4 * 2000 + crashedValue;

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-5">
        What happens when a sector crashes?
      </h2>

      <div className="flex-1 flex flex-col items-center max-w-sm mx-auto w-full">
        <div className="grid grid-cols-5 gap-2 w-full mb-4">
          {sectors.map((s, i) => {
            const isCrashed = crashed && i === crashedIndex;
            const value = isCrashed ? crashedValue : s.base;
            return (
              <motion.div
                key={s.label}
                animate={isCrashed ? { scale: [1, 0.9, 1], x: [0, -4, 4, -2, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`rounded-2xl p-2 flex flex-col items-center border-2 transition-colors ${
                  isCrashed
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-green-500/30 bg-green-500/5'
                }`}
              >
                <span className="text-xl mb-1">{s.icon}</span>
                <span className="font-body text-[9px] text-muted-foreground leading-tight text-center">{s.label}</span>
                <span className={`font-display text-xs font-bold mt-1 tabular-nums ${isCrashed ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                  {value.toLocaleString('de-CH')}
                </span>
                {isCrashed && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-display text-xs font-bold text-red-600 dark:text-red-400 mt-0.5"
                  >
                    -40%
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-2xl px-5 py-3 w-full text-center mb-5">
          <p className="text-xs text-muted-foreground font-body mb-0.5">Portfolio</p>
          <motion.p
            key={crashed ? 'after' : 'before'}
            initial={crashed ? { scale: 1.1 } : {}}
            animate={{ scale: 1 }}
            className="font-display text-2xl font-bold text-foreground tabular-nums"
          >
            CHF {crashed ? totalAfter.toLocaleString('de-CH') : '10\'000'}
          </motion.p>
        </div>

        {!crashed && (
          <motion.button
            onClick={handleCrash}
            whileTap={{ scale: 0.96 }}
            className="h-12 px-8 rounded-full bg-red-500 text-white font-display font-bold text-sm shadow-sm mb-5"
          >
            Trigger market crash 💥
          </motion.button>
        )}

        <AnimatePresence>
          {crashed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-3"
            >
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="font-body text-sm text-foreground">
                    All in one stock: <span className="font-bold text-red-600 dark:text-red-400">-40% → CHF 6'000</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                  <p className="font-body text-sm text-foreground">
                    Spread across 5 sectors: <span className="font-bold text-green-600 dark:text-green-400">-8% → CHF 9'200</span>
                  </p>
                </div>
              </div>
              <p className="font-body text-[15px] text-foreground leading-relaxed text-center">
                Same crash — but thanks to diversification you only lose a fraction.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CrashSlide;
