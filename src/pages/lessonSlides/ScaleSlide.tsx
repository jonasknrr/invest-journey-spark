import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

const ScaleSlide = ({ onComplete }: { onComplete: () => void }) => {
  const [value, setValue] = useState([50]);
  const [hasMoved, setHasMoved] = useState(false);

  const handleChange = useCallback((v: number[]) => {
    setValue(v);
    if (!hasMoved) {
      setHasMoved(true);
      onComplete();
    }
  }, [hasMoved, onComplete]);

  const ratio = value[0] / 100;
  const price = Math.round(65 + ratio * 80);
  const tilt = (ratio - 0.5) * 30;

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">
        Der Preis entsteht durch Angebot und Nachfrage
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Price label */}
        <motion.div
          className="mb-6 bg-card border border-border rounded-2xl px-6 py-3 shadow-sm"
          animate={{ scale: hasMoved ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-display text-3xl font-bold text-foreground tabular-nums">CHF {price}</p>
        </motion.div>

        {/* Scale SVG */}
        <svg width="260" height="140" viewBox="0 0 260 140" className="mb-2">
          {/* Triangle base */}
          <polygon points="115,130 145,130 130,90" fill="hsl(var(--muted-foreground) / 0.2)" />
          {/* Beam */}
          <motion.g
            animate={{ rotate: tilt }}
            style={{ transformOrigin: '130px 90px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <rect x="30" y="87" width="200" height="6" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            {/* Left side — Verkäufer */}
            <rect x="30" y="78" width="60" height="24" rx="12" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} stroke="hsl(0, 72%, 51%)" strokeWidth="2" />
            <text x="60" y="94" textAnchor="middle" fontSize="11" fill="hsl(0, 72%, 51%)" className="font-display font-bold">Verkäufer 🔴</text>
            {/* Right side — Käufer */}
            <rect x="170" y="78" width="60" height="24" rx="12" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} stroke="hsl(142, 71%, 45%)" strokeWidth="2" />
            <text x="200" y="94" textAnchor="middle" fontSize="11" fill="hsl(142, 71%, 45%)" className="font-display font-bold">Käufer 🟢</text>
          </motion.g>
        </svg>

        {/* Contextual labels */}
        <AnimatePresence>
          {hasMoved && ratio > 0.6 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 mb-4">
              <p className="text-primary text-sm font-body font-medium">↑ Mehr Nachfrage = höherer Preis</p>
            </motion.div>
          )}
          {hasMoved && ratio < 0.4 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-2 mb-4">
              <p className="text-destructive text-sm font-body font-medium">↓ Weniger Nachfrage = niedrigerer Preis</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider */}
        <div className="w-full mt-2">
          <Slider value={value} onValueChange={handleChange} min={0} max={100} step={1} />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground font-body">Viele Verkäufer</span>
            <span className="text-xs text-muted-foreground font-body">Viele Käufer</span>
          </div>
        </div>

        {/* Explanatory text after interaction */}
        <AnimatePresence>
          {hasMoved && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-foreground font-body text-[15px] leading-relaxed text-center mt-6 max-w-xs"
            >
              Genau so funktioniert die Börse — Millionen von Käufern und Verkäufern bestimmen den Preis jede Sekunde neu.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ScaleSlide;
