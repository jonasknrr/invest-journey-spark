import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../LessonShared';

function generatePath(points: number[], width: number, height: number, maxVal: number): string {
  const step = width / (points.length - 1);
  return points.map((v, i) => {
    const x = i * step;
    const y = height - (v / maxVal) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

const chart1Y = [10000, 9200, 11500, 8800, 10200, 9500, 11000, 8500, 10800, 11200, 9800, 10500];
const chart5Y = [10000, 9500, 11000, 10500, 12000, 11200, 13500, 12800, 14200, 13000, 15000, 14500, 16000];
const chart20Y = [10000, 9000, 11000, 8500, 12000, 14000, 11000, 16000, 18000, 15000, 20000, 22000, 19000, 25000, 28000, 24000, 32000, 35000, 30000, 40000, 45000];

const timeframes = [
  { label: '1 Jahr', data: chart1Y, endVal: 10500, max: 13000, text: 'Kurzfristig: unvorhersehbar', color: 'text-muted-foreground' },
  { label: '5 Jahre', data: chart5Y, endVal: 16000, max: 18000, text: 'Mittelfristig: ein Trend zeichnet sich ab', color: 'text-foreground' },
  { label: '20 Jahre', data: chart20Y, endVal: 45000, max: 50000, text: 'Langfristig: Zeit arbeitet für dich', color: 'text-primary' },
] as const;

const TimeChartVisual = ({ onNext }: { onNext: () => void }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setVisited((prev) => new Set(prev).add(idx));
  };

  const allVisited = visited.size === 3;
  const tf = timeframes[activeIdx];
  const path = useMemo(() => generatePath(tf.data as unknown as number[], 300, 120, tf.max), [activeIdx]);

  return (
    <motion.div key="timeChart" variants={pageVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col px-6 pb-8">
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">Sieh selbst was Zeit bewirkt</h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="w-full bg-card border border-border rounded-3xl p-5 shadow-card mb-4">
          <p className="font-display font-bold text-foreground text-sm mb-3">AlphaIndex</p>
          <svg viewBox="0 0 300 120" className="w-full h-28">
            <motion.path key={activeIdx} d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
          </svg>
          <motion.p key={`label-${activeIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-body font-medium mt-2 ${tf.color}`}>
            {tf.text}
          </motion.p>
        </div>

        <div className="flex gap-2 w-full mb-4">
          {timeframes.map((t, i) => (
            <button key={i} onClick={() => handleSelect(i)}
              className={`flex-1 h-11 rounded-2xl font-display font-bold text-sm transition-colors ${i === activeIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full bg-muted/50 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground font-body">Gestartet mit CHF 10'000 — heute:</p>
          <motion.p key={`val-${activeIdx}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="font-display text-2xl font-bold text-foreground tabular-nums">
            CHF {tf.endVal.toLocaleString('de-CH')}
          </motion.p>
        </div>
      </div>

      <AnimatePresence>
        {allVisited && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full mt-4">
            <motion.button onClick={onNext} whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft">Weiter</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimeChartVisual;
