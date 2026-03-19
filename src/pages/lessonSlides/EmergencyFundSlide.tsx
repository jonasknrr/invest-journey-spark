import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const events = [
  { id: 0, icon: '🔧', label: 'Car repair', cost: 'CHF 2,400' },
  { id: 1, icon: '🏥', label: 'Hospital bill', cost: 'CHF 1,800' },
  { id: 2, icon: '💼', label: 'Job loss', cost: '3 months' },
  { id: 3, icon: '🏠', label: 'Broken heater', cost: 'CHF 3,500' },
];

const EmergencyFundSlide = ({ onComplete }: Props) => {
  const [month, setMonth] = useState(0);
  const [shielded, setShielded] = useState<Set<number>>(new Set());
  const [fundSize, setFundSize] = useState(100);

  const visibleEvent = events[month % events.length];
  const isShielded = shielded.has(month);

  const handleShield = () => {
    if (isShielded) return;
    setShielded(prev => new Set(prev).add(month));
    setFundSize(prev => Math.max(20, prev - 20));
  };

  useEffect(() => {
    if (shielded.size >= 3) {
      onComplete();
    }
  }, [shielded, onComplete]);

  return (
    <motion.div
      key="emergencyFund"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-2 text-center">
        Life throws curveballs 🎯
      </h3>
      <p className="font-body text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Slide through the months and shield each event with your emergency fund.
      </p>

      {/* Timeline slider */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex justify-between mb-1">
          <span className="font-body text-xs text-muted-foreground">Month {month + 1}</span>
          <span className="font-body text-xs text-muted-foreground">{12} months</span>
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Event card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={month}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-xs rounded-2xl border-2 p-5 text-center transition-colors ${
            isShielded
              ? 'border-primary/30 bg-primary/5'
              : 'border-destructive/30 bg-destructive/5'
          }`}
        >
          <span className="text-4xl block mb-2">{visibleEvent.icon}</span>
          <p className="font-display text-base font-bold text-foreground">{visibleEvent.label}</p>
          <p className="font-body text-sm text-muted-foreground">{visibleEvent.cost}</p>

          {isShielded ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10"
            >
              <span className="text-lg">🛡️</span>
              <span className="font-display text-xs font-bold text-primary">Goals protected!</span>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleShield}
              whileTap={{ scale: 0.95 }}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-display text-sm font-bold"
            >
              <span>🐷</span> Use Emergency Fund
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Fund indicator */}
      <div className="mt-5 w-full max-w-xs">
        <div className="flex justify-between mb-1">
          <span className="font-body text-xs text-muted-foreground">Emergency Fund</span>
          <span className="font-body text-xs font-semibold text-foreground">{fundSize}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${fundSize}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <p className="font-body text-[10px] text-muted-foreground mt-3 text-center max-w-xs">
        Tip: 3–6 months of essential expenses in a secure, liquid account
      </p>
    </motion.div>
  );
};

export default EmergencyFundSlide;
