import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// StableBank: gentle upward trend with small wiggles → ~16000
const stableData = [
  10000,10200,10350,10300,10500,10650,10600,10800,10950,11000,
  11100,11050,11200,11350,11300,11500,11600,11550,11700,11850,
  11900,12000,12100,12050,12200,12350,12400,12500,12600,12550,
  12700,12850,12900,13000,13100,13050,13200,13350,13400,13500,
  13600,13700,13650,13800,13900,14000,14100,14200,14300,14400,
  14500,14600,14700,14800,14900,15000,15200,15400,15600,15800,16000,
];

// RocketStartup: wild swings with one huge crash (~-60%) then recovery to 40000
const rocketData = [
  10000,11000,12500,13000,11500,10000,8500,7000,5500,4500,
  4000,4200,5000,5500,4800,5200,6000,7500,8000,7000,
  6000,5500,7000,9000,10000,11500,13000,12000,14000,16000,
  15000,17000,19000,18000,20000,22000,21000,24000,26000,25000,
  27000,29000,28000,30000,31000,33000,32000,34000,35000,36000,
  34000,35000,37000,36000,38000,37000,38000,39000,39500,40000,40000,
];

const WIDTH = 140;
const HEIGHT = 80;

function toPath(data: number[], progress: number): string {
  const count = Math.max(2, Math.floor(data.length * progress));
  const subset = data.slice(0, count);
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  return subset
    .map((v, i) => {
      const x = (i / (data.length - 1)) * WIDTH;
      const y = HEIGHT - ((v - min) / range) * HEIGHT;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const RiskChartSlide = ({ onComplete }: { onComplete: () => void }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const DURATION = 3000;

  const play = () => {
    if (playing || done) return;
    setPlaying(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / DURATION);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDone(true);
        onComplete();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const stableEnd = stableData[Math.floor((stableData.length - 1) * Math.max(0.03, progress))];
  const rocketEnd = rocketData[Math.floor((rocketData.length - 1) * Math.max(0.03, progress))];

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">
        Nicht alle Aktien sind gleich riskant
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Two mini charts side by side */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          {/* StableBank */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center">
            <p className="font-display text-sm font-bold text-foreground mb-1">StableBank AG</p>
            <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mb-2">
              {progress > 0 && (
                <path
                  d={toPath(stableData, progress)}
                  fill="none"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <p className="font-display text-lg font-bold text-foreground tabular-nums">
              CHF {(progress > 0 ? stableEnd : 10000).toLocaleString('de-CH')}
            </p>
            {done && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-body font-medium mt-1"
                style={{ color: 'hsl(142, 71%, 45%)' }}
              >
                Wenig Risiko · Solide Rendite
              </motion.span>
            )}
          </div>

          {/* RocketStartup */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center">
            <p className="font-display text-sm font-bold text-foreground mb-1">RocketStartup AG</p>
            <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mb-2">
              {progress > 0 && (
                <path
                  d={toPath(rocketData, progress)}
                  fill="none"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <p className="font-display text-lg font-bold text-foreground tabular-nums">
              CHF {(progress > 0 ? rocketEnd : 10000).toLocaleString('de-CH')}
            </p>
            {done && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-body font-medium mt-1"
                style={{ color: 'hsl(25, 95%, 53%)' }}
              >
                Hohes Risiko · Hohe Chance
              </motion.span>
            )}
          </div>
        </div>

        {/* Play button */}
        {!playing && !done && (
          <motion.button
            onClick={play}
            whileTap={{ scale: 0.96 }}
            className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-sm mb-4"
          >
            ▶ Abspielen
          </motion.button>
        )}

        {/* Post-animation text */}
        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-foreground font-body text-[15px] leading-relaxed text-center mt-2 max-w-xs"
            >
              Beide können profitabel sein — aber der Weg dorthin ist sehr unterschiedlich.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RiskChartSlide;
