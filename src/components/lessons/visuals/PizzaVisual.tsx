import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../LessonShared';

const SLICES = 10;
const CX = 120;
const CY = 120;
const R = 100;

function slicePath(index: number, total: number, cx: number, cy: number, r: number) {
  const angle1 = (2 * Math.PI * index) / total - Math.PI / 2;
  const angle2 = (2 * Math.PI * (index + 1)) / total - Math.PI / 2;
  const x1 = cx + r * Math.cos(angle1);
  const y1 = cy + r * Math.sin(angle1);
  const x2 = cx + r * Math.cos(angle2);
  const y2 = cy + r * Math.sin(angle2);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

const sliceColors = [
  'hsl(215, 90%, 60%)', 'hsl(215, 90%, 55%)', 'hsl(215, 85%, 63%)',
  'hsl(215, 90%, 52%)', 'hsl(215, 85%, 58%)', 'hsl(215, 90%, 65%)',
  'hsl(215, 85%, 50%)', 'hsl(215, 90%, 62%)', 'hsl(215, 85%, 56%)',
  'hsl(215, 90%, 68%)',
];

const PizzaVisual = ({ onNext }: { onNext: () => void }) => {
  const [split, setSplit] = useState(false);
  const [sliceFlown, setSliceFlown] = useState(false);

  const handleSplit = useCallback(() => {
    setSplit(true);
    setTimeout(() => setSliceFlown(true), 800);
  }, []);

  return (
    <motion.div key="pizza" variants={pageVariants} initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col px-6 pb-8">
      <h2 className="font-display text-xl font-bold text-foreground text-center mt-2 mb-2">
        Think of a company like a pizza
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
          {!split ? (
            <motion.circle cx={CX} cy={CY} r={R} fill="hsl(215, 90%, 60%)"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }} />
          ) : (
            <>
              {Array.from({ length: SLICES }).map((_, i) => {
                if (i === 0 && sliceFlown) return null;
                return (
                  <motion.path key={i} d={slicePath(i, SLICES, CX, CY, R)} fill={sliceColors[i]}
                    stroke="hsl(var(--background))" strokeWidth={2.5}
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }} />
                );
              })}
            </>
          )}
          <text x={CX} y={CY - 6} textAnchor="middle" className="font-display font-bold" fill="white" fontSize="13">AlphaFirma</text>
          <text x={CX} y={CY + 10} textAnchor="middle" className="font-display font-semibold" fill="white" fontSize="11" opacity={0.8}>AG</text>
        </svg>

        <AnimatePresence>
          {sliceFlown && (
            <motion.div className="absolute flex flex-col items-center"
              initial={{ top: '35%', left: '55%', scale: 1, opacity: 1 }}
              animate={{ top: '80%', left: '50%', scale: 1.3, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
              <svg width="60" height="60" viewBox="0 0 240 240">
                <path d={slicePath(0, SLICES, CX, CY, R)} fill={sliceColors[0]} />
              </svg>
              <motion.span className="font-display font-bold text-primary text-base mt-1"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                +1 Share 🎉
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sliceFlown && (
          <motion.p className="text-center text-foreground font-body text-[15px] leading-relaxed mb-4 max-w-xs mx-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            You now own <span className="font-bold">1 of 10 slices</span> — that's{' '}
            <span className="font-bold">10 %</span> of the company
          </motion.p>
        )}
      </AnimatePresence>

      <div className="max-w-sm mx-auto w-full">
        <motion.button onClick={sliceFlown ? onNext : handleSplit} whileTap={{ scale: 0.96 }}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft">
          {sliceFlown ? 'Continue' : 'Take the company public'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PizzaVisual;
