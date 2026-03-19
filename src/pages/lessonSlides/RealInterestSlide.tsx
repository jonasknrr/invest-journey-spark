import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const RealInterestSlide = ({ onComplete }: Props) => {
  const [nominal, setNominal] = useState(3);
  const [inflation, setInflation] = useState(2);
  const real = nominal - inflation;
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, onComplete]);

  const handleChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(Number(e.target.value));
    setHasInteracted(true);
  };

  const maxBar = 8;

  return (
    <motion.div
      key="realInterest"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-2 text-center">
        What you see vs. what you get 🔍
      </h3>
      <p className="font-body text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Adjust the sliders to see how inflation eats into your returns.
      </p>

      {/* Visual bars */}
      <div className="flex items-end gap-4 mb-6 h-40">
        {/* Nominal bar */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-16 rounded-t-xl bg-primary/80 relative overflow-hidden"
            animate={{ height: `${(nominal / maxBar) * 140}px` }}
            transition={{ duration: 0.3 }}
          >
            {/* Inflation monster eating from top */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-destructive/40 flex items-center justify-center"
              animate={{ height: `${(inflation / maxBar) * 140}px` }}
              transition={{ duration: 0.3 }}
            >
              {inflation > 0 && <span className="text-lg">👾</span>}
            </motion.div>
          </motion.div>
          <span className="font-display text-xs font-bold text-foreground mt-1.5">
            Nominal
          </span>
          <span className="font-body text-xs text-muted-foreground">{nominal}%</span>
        </div>

        {/* Equals */}
        <div className="flex flex-col items-center justify-end pb-8">
          <span className="font-display text-lg font-bold text-muted-foreground">=</span>
        </div>

        {/* Real bar */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`w-16 rounded-t-xl ${real >= 0 ? 'bg-primary' : 'bg-destructive'}`}
            animate={{ height: `${(Math.abs(real) / maxBar) * 140}px` }}
            transition={{ duration: 0.3 }}
          />
          <span className="font-display text-xs font-bold text-foreground mt-1.5">
            Real
          </span>
          <span className={`font-body text-xs font-bold ${real >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {real > 0 ? '+' : ''}{real}%
          </span>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-muted rounded-xl px-4 py-2.5 mb-5">
        <p className="font-body text-sm text-foreground text-center">
          <span className="font-bold">{nominal}%</span> nominal
          <span className="mx-1.5">−</span>
          <span className="font-bold text-destructive">{inflation}%</span> inflation
          <span className="mx-1.5">=</span>
          <span className={`font-bold ${real >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {real > 0 ? '+' : ''}{real}%
          </span> real
        </p>
      </div>

      {/* Sliders */}
      <div className="w-full max-w-xs space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-body text-xs text-muted-foreground">Nominal interest rate</span>
            <span className="font-body text-xs font-semibold text-foreground">{nominal}%</span>
          </div>
          <input
            type="range" min={0} max={8} step={0.5} value={nominal}
            onChange={handleChange(setNominal)}
            className="w-full accent-primary"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-body text-xs text-muted-foreground">Inflation rate</span>
            <span className="font-body text-xs font-semibold text-destructive">{inflation}%</span>
          </div>
          <input
            type="range" min={0} max={8} step={0.5} value={inflation}
            onChange={handleChange(setInflation)}
            className="w-full accent-destructive"
          />
        </div>
      </div>

      {real < 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-xs text-destructive text-center mt-3 max-w-xs"
        >
          ⚠️ You're losing purchasing power — even with interest!
        </motion.p>
      )}
    </motion.div>
  );
};

export default RealInterestSlide;
