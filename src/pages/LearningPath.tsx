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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-6 pt-5 pb-4">
        {/* Top row: Avatar + Name | Streak + XP */}
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
        {/* Title row */}
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground">Investify</h1>
          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">{totalProgress}% geschafft</p>
        </div>
        {/* Total progress bar */}
        <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden max-w-sm mx-auto">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Path */}
      <div className="relative max-w-sm mx-auto px-6 pt-10">
        {/* Dashed path line */}
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-full pointer-events-none" preserveAspectRatio="none">
          <line x1="4" y1="0" x2="4" y2="100%" stroke="hsl(var(--border))" strokeWidth="4" strokeDasharray="12 8" />
        </svg>

        <div className="relative space-y-10">
          {levels.map((level, index) => (
            <div key={level.id}>
              <LevelNode
                level={level}
                index={index}
                onClick={() => navigate(`/category/${level.id}`)}
              />
              {/* Milestone tree between levels */}
              {index < levels.length - 1 && (
                <div className="flex justify-center my-4">
                  <motion.span
                    className="text-xl select-none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.08, type: 'spring', stiffness: 300 }}
                  >
                    {index < completedCount ? '🌳' : index === completedCount ? '🌱' : '·'}
                  </motion.span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* End flag */}
        <div className="flex justify-center mt-10 mb-6">
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
