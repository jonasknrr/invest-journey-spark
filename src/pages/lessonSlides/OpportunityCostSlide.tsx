import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

function cashValue(years: number) {
  return 10000 * Math.pow(1.01, years); // 1% real return
}

function investValue(years: number) {
  return 10000 * Math.pow(1.07, years); // 7% nominal return
}

const OpportunityCostSlide = ({ onComplete }: Props) => {
  const [years, setYears] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  const cash = cashValue(years);
  const invest = investValue(years);
  const gap = invest - cash;

  useEffect(() => {
    if (hasInteracted) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [hasInteracted, onComplete]);

  const maxVal = investValue(30);

  return (
    <motion.div
      key="opportunityCost"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-2 text-center">
        The cost of doing nothing 💸
      </h3>
      <p className="font-body text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Slide the time to see how opportunity cost grows over decades.
      </p>

      {/* Two-path visual */}
      <div className="w-full max-w-xs mb-5">
        {/* Investment path */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="font-body text-xs text-primary font-semibold flex items-center gap-1">
              📈 Invested (7%/yr)
            </span>
            <span className="font-display text-xs font-bold text-primary">
              CHF {invest.toLocaleString('en', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${(invest / maxVal) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Cash path */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="font-body text-xs text-muted-foreground font-semibold flex items-center gap-1">
              💵 Cash (1%/yr)
            </span>
            <span className="font-display text-xs font-bold text-muted-foreground">
              CHF {cash.toLocaleString('en', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-muted-foreground/30"
              animate={{ width: `${(cash / maxVal) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Gap highlight */}
        <motion.div
          className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-center"
          animate={{ scale: gap > 20000 ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-xs text-destructive">
            Opportunity cost after {years} year{years > 1 ? 's' : ''}:
          </p>
          <p className="font-display text-lg font-bold text-destructive">
            CHF {gap.toLocaleString('en', { maximumFractionDigits: 0 })}
          </p>
        </motion.div>
      </div>

      {/* Time slider */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between mb-1">
          <span className="font-body text-xs text-muted-foreground">Time horizon</span>
          <span className="font-display text-xs font-bold text-foreground">{years} year{years > 1 ? 's' : ''}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={years}
          onChange={e => {
            setYears(Number(e.target.value));
            setHasInteracted(true);
          }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-0.5">
          <span className="font-body text-[10px] text-muted-foreground">1 yr</span>
          <span className="font-body text-[10px] text-muted-foreground">30 yrs</span>
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityCostSlide;
