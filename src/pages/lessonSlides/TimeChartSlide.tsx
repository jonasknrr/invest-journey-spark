import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WIDTH = 280;
const HEIGHT = 120;

// 1 Year: chaotic, end ~9500
const data1y = [10000,10400,9800,10200,9500,10100,9700,10300,9200,9800,10500,9600,10000,9300,9900,10400,9100,9700,10200,9500];
// 5 Years: upward with bumps, end ~16000
const data5y = [10000,10200,10800,10500,11200,11000,11800,12200,11500,12000,12800,12500,13200,12800,13500,14000,13500,14200,14800,15000,15500,15200,15800,16000];
// 20 Years: clear uptrend despite crashes, end ~45000
const data20y = [10000,10500,11500,12000,11000,9000,8000,9500,11000,12500,14000,13000,15000,16000,14500,13000,15500,17000,19000,18000,16000,18500,20000,22000,21000,23000,25000,24000,26000,28000,26000,24000,27000,30000,32000,31000,33000,35000,34000,36000,38000,37000,39000,41000,40000,42000,43000,44000,45000];

const datasets: Record<string, { data: number[]; end: number; label: string; color?: string }> = {
  '1y': { data: data1y, end: 9500, label: 'Kurzfristig: unvorhersehbar' },
  '5y': { data: data5y, end: 16000, label: 'Mittelfristig: ein Trend zeichnet sich ab' },
  '20y': { data: data20y, end: 45000, label: 'Langfristig: Zeit arbeitet für dich', color: 'hsl(142, 71%, 45%)' },
};

function toPath(data: number[]): string {
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * WIDTH;
      const y = HEIGHT - ((v - min) / range) * HEIGHT;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const TimeChartSlide = ({ onComplete }: { onComplete: () => void }) => {
  const [active, setActive] = useState<'1y' | '5y' | '20y'>('1y');
  const [visited, setVisited] = useState<Set<string>>(new Set(['1y']));

  const handleSelect = (key: '1y' | '5y' | '20y') => {
    setActive(key);
    setVisited(prev => {
      const next = new Set(prev);
      next.add(key);
      if (next.size === 3 && prev.size < 3) {
        onComplete();
      }
      return next;
    });
  };

  const current = datasets[active];
  const allVisited = visited.size === 3;

  const buttons: { key: '1y' | '5y' | '20y'; label: string }[] = [
    { key: '1y', label: '1 Jahr' },
    { key: '5y', label: '5 Jahre' },
    { key: '20y', label: '20 Jahre' },
  ];

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-5">
        Sieh selbst was Zeit bewirkt
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Period buttons */}
        <div className="flex gap-2 mb-5">
          {buttons.map(b => (
            <button
              key={b.key}
              onClick={() => handleSelect(b.key)}
              className={`px-4 py-2 rounded-full font-display text-sm font-bold transition-colors ${
                active === b.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {b.label}
              {visited.has(b.key) && active !== b.key && ' ✓'}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 w-full mb-4">
          <p className="font-display text-sm font-bold text-foreground mb-2 text-center">AlphaIndex</p>
          <AnimatePresence mode="wait">
            <motion.svg
              key={active}
              width={WIDTH}
              height={HEIGHT}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                d={toPath(current.data)}
                fill="none"
                stroke={current.color ?? 'hsl(var(--primary))'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </AnimatePresence>
        </div>

        {/* Value display */}
        <motion.p
          key={active + '-val'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-body text-sm text-muted-foreground text-center mb-3"
        >
          Gestartet mit CHF 10'000 — heute:{' '}
          <span className="font-display font-bold text-foreground">
            CHF {current.end.toLocaleString('de-CH')}
          </span>
        </motion.p>

        {/* Contextual label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active + '-label'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`font-body text-sm font-medium text-center ${
              active === '20y' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {current.label}
          </motion.p>
        </AnimatePresence>

        {/* Hint when not all visited */}
        {!allVisited && (
          <p className="font-body text-xs text-muted-foreground/60 text-center mt-4">
            Tippe alle drei Zeiträume an um weiterzukommen
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default TimeChartSlide;
