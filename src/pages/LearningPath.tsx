import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { levels } from '@/data/levels';
import LevelNode from '@/components/LevelNode';
import { Sparkles } from 'lucide-react';

const LearningPath = () => {
  const navigate = useNavigate();
  const completedCount = levels.filter(l => l.status === 'completed').length;
  const totalProgress = Math.round((completedCount / levels.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-6 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Dein Lernpfad</h2>
            <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">{totalProgress}% geschafft</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-sm font-bold text-primary tabular-nums">{completedCount}/{levels.length}</span>
          </div>
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
