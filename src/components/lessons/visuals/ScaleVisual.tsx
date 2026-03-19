import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { pageVariants } from '../LessonShared';

const ScaleVisual = ({ onNext }: { onNext: () => void }) => {
  const [value, setValue] = useState([50]);
  const [hasMoved, setHasMoved] = useState(false);

  const handleChange = useCallback((v: number[]) => {
    setValue(v);
    if (!hasMoved) setHasMoved(true);
  }, [hasMoved]);

  const ratio = value[0] / 100;
  const price = Math.round(65 + ratio * 80);
  const tilt = (ratio - 0.5) * 30;

  return (
    <motion.div key="scale" variants={pageVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col px-6 pb-8">
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">
        The price is determined by supply and demand
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <motion.div className="mb-6 bg-card border border-border rounded-2xl px-6 py-3 shadow-card"
          animate={{ scale: hasMoved ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }}>
          <p className="font-display text-3xl font-bold text-foreground tabular-nums">CHF {price}</p>
        </motion.div>

        <svg width="260" height="140" viewBox="0 0 260 140" className="mb-2">
          <polygon points="115,130 145,130 130,90" fill="hsl(var(--muted-foreground) / 0.2)" />
          <motion.g animate={{ rotate: tilt }} style={{ transformOrigin: '130px 90px' }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
            <rect x="30" y="87" width="200" height="6" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="30" y="78" width="60" height="24" rx="12" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} stroke="hsl(0, 72%, 51%)" strokeWidth="2" />
            <text x="60" y="94" textAnchor="middle" fontSize="11" fill="hsl(0, 72%, 51%)" className="font-display font-bold">Sellers 🔴</text>
            <rect x="170" y="78" width="60" height="24" rx="12" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} stroke="hsl(142, 71%, 45%)" strokeWidth="2" />
            <text x="200" y="94" textAnchor="middle" fontSize="11" fill="hsl(142, 71%, 45%)" className="font-display font-bold">Buyers 🟢</text>
          </motion.g>
        </svg>

        <AnimatePresence>
          {hasMoved && ratio > 0.6 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 mb-4">
              <p className="text-primary text-sm font-body font-medium">↑ More demand = higher price</p>
            </motion.div>
          )}
          {hasMoved && ratio < 0.4 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-2 mb-4">
              <p className="text-destructive text-sm font-body font-medium">↓ Less demand = lower price</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full mt-2">
          <Slider value={value} onValueChange={handleChange} min={0} max={100} step={1} />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground font-body">Many sellers</span>
            <span className="text-xs text-muted-foreground font-body">Many buyers</span>
          </div>
        </div>

        <AnimatePresence>
          {hasMoved && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-foreground font-body text-[15px] leading-relaxed text-center mt-6 max-w-xs">
              This is exactly how the stock market works — millions of buyers and sellers determine the price every second.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasMoved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full mt-4">
            <motion.button onClick={onNext} whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft">
              Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScaleVisual;
