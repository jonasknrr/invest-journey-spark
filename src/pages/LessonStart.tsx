import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Target } from 'lucide-react';
import { levels } from '@/data/levels';
import LevelIcon from '@/components/LevelIcon';

const bgMap: Record<string, string> = {
  festgeld: 'bg-level-festgeld',
  tagesgeld: 'bg-level-tagesgeld',
  aktien: 'bg-level-aktien',
  anleihen: 'bg-level-anleihen',
  currencies: 'bg-level-currencies',
  crypto: 'bg-level-crypto',
  metals: 'bg-level-metals',
  realestate: 'bg-level-realestate',
  etfs: 'bg-level-etfs',
};

const lessonContent: Record<string, { bullets: { icon: typeof BookOpen; text: string }[] }> = {
  a3: {
    bullets: [
      { icon: Target, text: 'Understand why prices fluctuate' },
      { icon: BookOpen, text: 'Learn why volatility is not the enemy' },
      { icon: Clock, text: 'Discover how time reduces risk' },
    ],
  },
};

const defaultBullets = [
  { icon: Target, text: 'Clear learning goals for each lesson' },
  { icon: BookOpen, text: 'Simple explanations, no jargon' },
  { icon: Clock, text: 'Completed in just a few minutes' },
];

const LessonStart = () => {
  const { categoryId, lessonId } = useParams();
  const navigate = useNavigate();

  const level = levels.find(l => l.id === categoryId);
  const subLevel = level?.subLevels.find(s => s.id === lessonId);

  if (!level || !subLevel) return null;

  const bullets = lessonContent[subLevel.id]?.bullets || defaultBullets;
  const categoryProgress = level.progress;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top progress bar */}
      <div className="h-1.5 bg-muted">
        <motion.div
          className={`h-full ${bgMap[level.colorKey]}`}
          initial={{ width: 0 }}
          animate={{ width: `${categoryProgress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Back button */}
      <div className="px-5 pt-5">
        <button
          onClick={() => navigate(`/category/${level.id}`)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <motion.div
          className="max-w-sm w-full text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            className="block mb-6 flex justify-center"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          >
            <LevelIcon name={level.iconName} size={56} />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-foreground text-balance leading-tight">
            {subLevel.title}
          </h1>

          <p className="mt-3 text-muted-foreground text-base leading-relaxed">
            {subLevel.description}
          </p>

          {/* Bullet points */}
          <div className="mt-8 space-y-3 text-left">
            {bullets.map((bullet, i) => {
              const Icon = bullet.icon;
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 bg-card rounded-2xl px-5 py-4 shadow-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className={`w-9 h-9 rounded-xl ${bgMap[level.colorKey]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                  </div>
                  <span className="font-body font-medium text-foreground text-sm">{bullet.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        <motion.button
          className={`w-full h-16 ${bgMap[level.colorKey]} text-primary-foreground font-display text-lg font-bold rounded-full`}
          style={{
            boxShadow: `0 10px 25px -5px hsla(var(${level.colorVar}), 0.4)`,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17, delay: 0.6 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            if (categoryId === 'festgeld' && lessonId === 'f2') {
              navigate('/lesson/festgeld/f2');
            } else if (categoryId === 'festgeld' && lessonId === 'f3') {
              navigate('/lesson/festgeld/f3');
            } else if (categoryId === 'festgeld' && lessonId === 'f4') {
              navigate('/lesson/festgeld/f4');
            } else if (categoryId === 'etfs' && lessonId === 'e1') {
              navigate('/lesson/etfs/e1');
            } else if (categoryId === 'etfs' && lessonId === 'e2') {
              navigate('/lesson/etfs/e2');
            } else if (categoryId === 'etfs' && lessonId === 'e3') {
              navigate('/lesson/etfs/e3');
            } else if (categoryId === 'etfs' && lessonId === 'e4') {
              navigate('/lesson/etfs/e4');
            } else if (categoryId === 'etfs' && lessonId === 'e5') {
              navigate('/lesson/etfs/e5');
            } else if (categoryId === 'etfs' && lessonId === 'e6') {
              navigate('/lesson/etfs/e6');
            } else if (categoryId === 'etfs' && lessonId === 'e7') {
              navigate('/lesson/etfs/e7');
            } else if (categoryId === 'etfs' && lessonId === 'e8') {
              navigate('/lesson/etfs/e8');
            } else if (categoryId === 'etfs' && lessonId === 'e9') {
              navigate('/lesson/etfs/e9');
            } else {
              navigate(`/lesson-flow/${categoryId}/${lessonId}`);
            }
          }}
        >
          Start lesson · {subLevel.duration}
        </motion.button>
      </div>
    </div>
  );
};

export default LessonStart;
