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

const chapterColors: Record<string, string> = {
  festgeld: '#22C55E',
  aktien: '#3B82F6',
  etfs: '#6366F1',
  anleihen: '#D1D5DB',
  waehrungen: '#D1D5DB',
  krypto: '#D1D5DB',
  gold: '#D1D5DB',
  immobilien: '#D1D5DB',
};

const chapterShortNames: Record<string, string> = {
  festgeld: 'Cash',
  aktien: 'Aktien',
  etfs: 'ETFs',
  anleihen: 'Anleihen',
  waehrungen: 'Währungen',
  krypto: 'Krypto',
  gold: 'Gold',
  immobilien: 'Immo',
};

/** Vertical spacing per node in the zigzag path (px) */
const NODE_SPACING = 180;
const NODE_VERTICAL_OFFSET = 60;

function buildZigzagPath(count: number, width: number): string {
  if (count === 0) return '';
  const leftX = width * 0.18;
  const rightX = width * 0.82;
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
    d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }
  return d;
}

const LearningPath = () => {
  const navigate = useNavigate();
  const { store } = useProgressStore();

  // Compute per-chapter progress
  const getChapterProgress = (levelId: string) => {
    const lessonIds = categoryLessonIds[levelId];
    if (!lessonIds) return { completed: 0, total: 0, percent: 0 };
    const total = lessonIds.length;
    const completed = lessonIds.filter(id => store.lessonResults[id]?.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  // Total progress across all chapters with lessons
  const allLessonIds = Object.values(categoryLessonIds).flat();
  const totalLessons = allLessonIds.length;
  const completedTotal = allLessonIds.filter(id => store.lessonResults[id]?.completed).length;
  const totalPercent = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

  const getCategoryStars = (lessonIds: string[]): number | null => {
    const completedLessons = lessonIds
      .map(id => store.lessonResults[id])
      .filter((l): l is NonNullable<typeof l> => !!l && l.completed);
    if (completedLessons.length === 0) return null;
    const totalHearts = completedLessons.reduce((sum, l) => sum + l.heartsRemaining, 0);
    return Math.ceil(totalHearts / completedLessons.length);
  };

  const pathHeight = NODE_VERTICAL_OFFSET + (levels.length - 1) * NODE_SPACING + 80;
  const svgWidth = 390;
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
              <span className="text-sm font-bold text-primary tabular-nums">{store.totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Improved overall progress */}
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-muted-foreground">Gesamtfortschritt</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalPercent}% geschafft</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Lektionen</p>
              <p className="text-base font-bold text-foreground tabular-nums">{completedTotal}/{totalLessons}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${totalPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {/* Mini chapter bars */}
          <div className="flex gap-2 mt-3">
            {levels.filter(l => categoryLessonIds[l.id]).map(level => {
              const { percent } = getChapterProgress(level.id);
              const color = chapterColors[level.id] || '#D1D5DB';
              return (
                <div key={level.id} className="flex-1 min-w-0">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">
                    {chapterShortNames[level.id] || level.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zigzag Path */}
      <div className="relative max-w-sm mx-auto" style={{ height: pathHeight }}>
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

        {levels.map((level, index) => {
          const isLeft = index % 2 === 0;
          const top = NODE_VERTICAL_OFFSET + index * NODE_SPACING - 40;
          const stars = categoryLessonIds[level.id]
            ? getCategoryStars(categoryLessonIds[level.id])
            : null;
          const { percent } = getChapterProgress(level.id);

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
                  progress={percent}
                />
                {stars && (
                  <div className={`flex gap-1 mt-1.5 ${isLeft ? 'ml-5' : 'mr-5'}`}>
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
