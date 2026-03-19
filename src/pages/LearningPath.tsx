import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { levels } from '@/data/levels';
import LevelNode from '@/components/LevelNode';
import { Sparkles } from 'lucide-react';
import { useProgressStore } from '@/hooks/useProgressStore';

const categoryLessonIds: Record<string, string[]> = {
  festgeld: ['festgeld-f1', 'festgeld-f2', 'festgeld-f3', 'festgeld-f4', 'festgeld-f5'],
  aktien: ['aktien-a1', 'aktien-a2', 'aktien-a3', 'aktien-a4', 'aktien-a5', 'aktien-a6', 'aktien-a7'],
  etfs: ['etfs-e1', 'etfs-e2', 'etfs-e3', 'etfs-e4', 'etfs-e5', 'etfs-e6', 'etfs-e7', 'etfs-e8', 'etfs-e9'],
};

/** Vertical spacing per node in the zigzag path (px) */
const NODE_SPACING = 160;
const NODE_VERTICAL_OFFSET = 60; // where first node sits from SVG top

/**
 * Build a smooth cubic-bezier SVG path that zigzags between left and right,
 * passing through each node's icon centre.
 */
function buildZigzagPath(count: number, width: number): string {
  if (count === 0) return '';

  const leftX = width * 0.18;   // icon centre when aligned left
  const rightX = width * 0.82;  // icon centre when aligned right

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = i % 2 === 0 ? leftX : rightX;
    const y = NODE_VERTICAL_OFFSET + i * NODE_SPACING;
    points.push({ x, y });
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midY = (curr.y + next.y) / 2;
    // control points keep the horizontal of the current node until midway, then swing to the next
    d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }

  return d;
}

const LearningPath = () => {
  const navigate = useNavigate();
  const { store } = useProgressStore();
  const completedCount = levels.filter(l => l.status === 'completed').length;
  const totalProgress = Math.round((completedCount / levels.length) * 100);

  const getCategoryStars = (lessonIds: string[]): number | null => {
    const completedLessons = lessonIds
      .map(id => store.lessonResults[id])
      .filter((l): l is NonNullable<typeof l> => !!l && l.completed);

    if (completedLessons.length === 0) return null;

    const totalHearts = completedLessons.reduce(
      (sum, l) => sum + l.heartsRemaining, 0
    );

    return Math.ceil(totalHearts / completedLessons.length);
  };

  // Total SVG / container height
  const pathHeight = NODE_VERTICAL_OFFSET + (levels.length - 1) * NODE_SPACING + 80;
  const svgWidth = 390; // matches mobile viewport
  const pathD = buildZigzagPath(levels.length, svgWidth);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-6 pt-5 pb-4">
        <div className="flex items-center justify-between max-w-sm mx-auto mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200 shrink-0">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="50" fill="#DBEAFE"/>
                <ellipse cx="50" cy="85" rx="28" ry="20" fill="#3B82F6"/>
                <circle cx="50" cy="38" r="18" fill="#FCD34D"/>
                <ellipse cx="50" cy="24" rx="18" ry="8" fill="#1E3A5F"/>
                <ellipse cx="34" cy="32" rx="6" ry="12" fill="#1E3A5F"/>
                <ellipse cx="66" cy="32" rx="6" ry="12" fill="#1E3A5F"/>
                <circle cx="43" cy="38" r="2.5" fill="#1E293B"/>
                <circle cx="57" cy="38" r="2.5" fill="#1E293B"/>
                <path d="M 43 46 Q 50 52 57 46" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-tight">Leon's</p>
              <p className="text-base font-bold text-primary leading-tight">Investify</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
              <span className="text-orange-500 text-lg">🔥</span>
              <span className="font-bold text-orange-600 text-sm">7</span>
              <span className="text-orange-400 text-xs">Tage</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" fill="currentColor" />
              <span className="text-sm font-bold text-primary tabular-nums">{completedCount}/{levels.length}</span>
            </div>
          </div>
        </div>
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground">Investify</h1>
          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">{totalProgress}% geschafft</p>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden max-w-sm mx-auto">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Zigzag Path */}
      <div className="relative max-w-sm mx-auto" style={{ height: pathHeight }}>
        {/* Curved SVG path in background */}
        <svg
          className="absolute inset-0 w-full pointer-events-none"
          viewBox={`0 0 ${svgWidth} ${pathHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ height: pathHeight }}
        >
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="4"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
        </svg>

        {/* Nodes positioned along the path */}
        {levels.map((level, index) => {
          const isLeft = index % 2 === 0;
          const top = NODE_VERTICAL_OFFSET + index * NODE_SPACING - 40; // centre the node on the path point
          const stars = categoryLessonIds[level.id]
            ? getCategoryStars(categoryLessonIds[level.id])
            : null;

          return (
            <div
              key={level.id}
              className="absolute w-full px-3"
              style={{ top }}
            >
              <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                <LevelNode
                  level={level}
                  index={index}
                  align={isLeft ? 'left' : 'right'}
                  onClick={() => navigate(`/category/${level.id}`)}
                />
                {stars && (
                  <div className={`flex gap-1 mt-2 ${isLeft ? 'ml-4' : 'mr-4'}`}>
                    {[1, 2, 3].map(i => (
                      <span
                        key={i}
                        className={`text-lg ${i <= stars ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* End flag */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: NODE_VERTICAL_OFFSET + (levels.length - 1) * NODE_SPACING + 40 }}
        >
          <motion.span
            className="text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
          >
            🏁
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
