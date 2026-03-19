import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const periods = [
  { label: '1 Jahr', dividend: 300, total: 10300, text: 'Kleiner Anfang — aber es ist ein Start.' },
  { label: '5 Jahre', dividend: 1593, total: 11593, text: 'Der Zinseszins beginnt zu wirken.' },
  { label: '10 Jahre', dividend: 3439, total: 13439, text: 'Ohne eine einzige Aktie zu verkaufen — nur durch Halten.' },
];

const fmt = (n: number) =>
  n.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const DividendSlide = ({ onComplete }: Props) => {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const allVisited = visited.size === 3;

  const handleSelect = (i: number) => {
    setActive(i);
    const next = new Set(visited);
    next.add(i);
    setVisited(next);
    if (next.size === 3) onComplete();
  };

  const p = periods[active];

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
        Sieh wie Dividenden sich aufaddieren
      </h2>

      {/* Stock card */}
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="font-display font-bold text-foreground">StableBank AG</span>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Dividende: 3% p.a.
          </span>
        </div>
        <span className="font-body text-2xl font-bold text-foreground">CHF 10'000</span>
      </div>

      {/* Period buttons */}
      <div className="flex gap-2 mb-5">
        {periods.map((pr, i) => (
          <button
            key={pr.label}
            onClick={() => handleSelect(i)}
            className={`flex-1 py-2.5 rounded-full font-display text-sm font-bold transition-colors ${
              active === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {pr.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Dividenden kumuliert</span>
            <span className="font-display font-bold text-foreground">{fmt(p.dividend)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Gesamtwert</span>
            <span className="font-display font-bold text-lg text-primary">{fmt(p.total)}</span>
          </div>
          <p className={`font-body text-sm leading-relaxed mt-1 ${active === 2 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-muted-foreground'}`}>
            {p.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Payout line */}
      <div className="mt-5 py-3 border-t border-border">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-body text-sm text-center text-muted-foreground"
          >
            Ausgezahlt: <span className="font-bold text-foreground">{fmt(p.dividend)}</span> — nur durch Halten
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Unlock message */}
      <AnimatePresence>
        {allVisited && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <p className="font-body text-sm text-center text-foreground leading-relaxed">
              Dividenden sind wie ein passives Gehalt — dein Geld arbeitet für dich.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DividendSlide;
