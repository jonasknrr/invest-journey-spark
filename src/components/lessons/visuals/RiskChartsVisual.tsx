import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from '@phosphor-icons/react';
import { pageVariants } from '../LessonShared';

const stablePath = 'M 0 80 Q 20 78, 40 75 Q 60 72, 80 70 Q 100 73, 120 68 Q 140 65, 160 62 Q 180 60, 200 58 Q 220 55, 240 50 Q 260 48, 280 45 Q 300 43, 320 40';
const rocketPath = 'M 0 80 Q 20 60, 40 85 Q 60 40, 80 90 Q 100 30, 120 75 Q 140 95, 160 50 Q 180 20, 200 60 Q 220 45, 240 30 Q 260 50, 280 15 Q 300 25, 320 10';

const MiniChart = ({ path, label, sublabel, color, played }: { path: string; label: string; sublabel: string; color: string; played: boolean }) => (
  <div className="flex-1 bg-card border border-border rounded-3xl p-4 shadow-card">
    <p className="font-display font-bold text-foreground text-sm mb-1">{label}</p>
    <svg viewBox="0 0 320 100" className="w-full h-20 mb-2">
      <motion.path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: played ? 1 : 0 }}
        transition={{ duration: 3, ease: 'easeInOut' }} />
    </svg>
    <p className={`text-xs font-body font-medium ${color === 'hsl(142, 71%, 45%)' ? 'text-primary' : 'text-[hsl(35,95%,50%)]'}`}>{sublabel}</p>
  </div>
);

const RiskChartsVisual = ({ onNext }: { onNext: () => void }) => {
  const [played, setPlayed] = useState(false);

  return (
    <motion.div key="riskCharts" variants={pageVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col px-6 pb-8">
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-6">Nicht alle Aktien sind gleich riskant</h2>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="flex gap-3 w-full mb-6">
          <MiniChart path={stablePath} label="StableBank AG" sublabel="Wenig Risiko · Solide Rendite" color="hsl(142, 71%, 45%)" played={played} />
          <MiniChart path={rocketPath} label="RocketStartup AG" sublabel="Hohes Risiko · Hohe Chance" color="hsl(35, 95%, 50%)" played={played} />
        </div>

        <div className="flex gap-3 w-full text-center mb-4">
          <div className="flex-1 bg-muted/50 rounded-2xl py-2">
            <p className="text-xs text-muted-foreground font-body">Start</p>
            <p className="font-display font-bold text-foreground text-sm">CHF 10'000</p>
          </div>
          <div className="flex-1 bg-primary/10 rounded-2xl py-2">
            <p className="text-xs text-muted-foreground font-body">StableBank</p>
            <p className="font-display font-bold text-primary text-sm">CHF 16'000</p>
          </div>
          <div className="flex-1 bg-[hsl(35,95%,55%)]/10 rounded-2xl py-2">
            <p className="text-xs text-muted-foreground font-body">Rocket</p>
            <p className="font-display font-bold text-[hsl(35,95%,50%)] text-sm">CHF 40'000</p>
          </div>
        </div>

        {!played && (
          <motion.button onClick={() => setPlayed(true)} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 h-12 px-6 rounded-full bg-card border border-border shadow-card font-display font-bold text-foreground text-sm">
            <Play size={18} weight="fill" className="text-primary" /> Animation starten
          </motion.button>
        )}

        <AnimatePresence>
          {played && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.2 }}
              className="text-foreground font-body text-[15px] leading-relaxed text-center mt-4 max-w-xs">
              Beide können profitabel sein — aber der Weg dorthin ist sehr unterschiedlich. Deine Risikotoleranz bestimmt welche für dich passt.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {played && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }} className="max-w-sm mx-auto w-full mt-4">
            <motion.button onClick={onNext} whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft">Weiter</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RiskChartsVisual;
