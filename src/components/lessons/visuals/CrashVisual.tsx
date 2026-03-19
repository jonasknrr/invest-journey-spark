import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import { pageVariants } from '../LessonShared';

const sectors = [
  { icon: '💻', name: 'Technology' },
  { icon: '🏥', name: 'Healthcare' },
  { icon: '⚡', name: 'Energy' },
  { icon: '🛒', name: 'Consumer' },
  { icon: '🏦', name: 'Finance' },
];

const CrashVisual = ({ onNext }: { onNext: () => void }) => {
  const [crashed, setCrashed] = useState(false);
  const [crashIdx, setCrashIdx] = useState(-1);

  const handleCrash = useCallback(() => {
    setCrashIdx(Math.floor(Math.random() * 5));
    setCrashed(true);
  }, []);

  const crashedValue = 1200;
  const totalAfter = 4 * 2000 + crashedValue;

  return (
    <motion.div key="crash" variants={pageVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col px-6 pb-8">
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">What happens when a sector crashes?</h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="flex gap-2 w-full mb-4">
          {sectors.map((s, i) => {
            const isCrashed = crashed && i === crashIdx;
            return (
              <motion.div key={i}
                animate={isCrashed ? { scale: [1, 0.9, 1], borderColor: 'hsl(0, 72%, 51%)' } : {}}
                className={`flex-1 rounded-2xl border-2 p-3 text-center transition-colors ${isCrashed ? 'border-destructive bg-destructive/8' : 'border-border bg-card'}`}>
                <span className="text-2xl">{s.icon}</span>
                <p className="font-display font-bold text-[11px] text-foreground mt-1 leading-tight">{s.name}</p>
                <motion.p key={`val-${i}-${crashed}`} initial={isCrashed ? { scale: 1.2 } : {}} animate={{ scale: 1 }}
                  className={`font-display font-bold text-xs mt-1 tabular-nums ${isCrashed ? 'text-destructive' : 'text-primary'}`}>
                  {isCrashed ? `CHF ${crashedValue.toLocaleString('de-CH')}` : "CHF 2'000"}
                </motion.p>
                {isCrashed && <p className="text-[10px] text-destructive font-bold">-40%</p>}
              </motion.div>
            );
          })}
        </div>

        <div className="w-full bg-muted/50 rounded-2xl p-4 text-center mb-4">
          <p className="text-xs text-muted-foreground font-body">Total portfolio</p>
          <motion.p key={crashed ? 'after' : 'before'} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="font-display text-2xl font-bold text-foreground tabular-nums">
            CHF {crashed ? totalAfter.toLocaleString('de-CH') : "10'000"}
          </motion.p>
          {crashed && <p className="text-xs text-muted-foreground font-body mt-1">only -8% loss</p>}
        </div>

        {!crashed && (
          <motion.button onClick={handleCrash} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 h-12 px-6 rounded-full bg-destructive/10 border border-destructive/20 font-display font-bold text-destructive text-sm">
            <FiZap size={18} /> Trigger market crash 💥
          </motion.button>
        )}

        <AnimatePresence>
          {crashed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-2 mt-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
                <p className="font-body text-sm text-destructive">🔴 All in one stock: <span className="font-bold">-40% = CHF 6'000</span></p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
                <p className="font-body text-sm text-primary">🟢 Spread across 5 sectors: <span className="font-bold">-8% = CHF 9'200</span></p>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-foreground font-body text-[15px] leading-relaxed text-center mt-2">
                Same crash — but thanks to diversification you only lose a fraction.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {crashed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="max-w-sm mx-auto w-full mt-4">
            <motion.button onClick={onNext} whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft">Continue</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CrashVisual;
