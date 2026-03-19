import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import { levels } from '@/data/levels';
import LevelIcon from '@/components/LevelIcon';
import { useProgressStore } from '@/hooks/useProgressStore';

const bgMap: Record<string, string> = {
  festgeld: 'bg-level-festgeld',
  tagesgeld: 'bg-level-tagesgeld',
  aktien: 'bg-level-aktien',
  etfs: 'bg-level-etfs',
  anleihen: 'bg-level-anleihen',
  waehrungen: 'bg-level-waehrungen',
  krypto: 'bg-level-krypto',
  gold: 'bg-level-gold',
  immobilien: 'bg-level-immobilien',
};

const hslMap: Record<string, string> = {
  festgeld: 'hsl(150,60%,45%)',
  tagesgeld: 'hsl(140,70%,75%)',
  aktien: 'hsl(215,90%,60%)',
  etfs: 'hsl(225,85%,55%)',
  anleihen: 'hsl(185,80%,45%)',
  waehrungen: 'hsl(35,95%,55%)',
  krypto: 'hsl(265,85%,65%)',
  gold: 'hsl(45,100%,50%)',
  immobilien: 'hsl(15,70%,55%)',
};

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const level = levels.find(l => l.id === id);
  const { getLessonResult, store } = useProgressStore();

  if (!level) return null;

  const isEtf = level.id === 'etfs';
  const completedSubs = level.subLevels.filter(s => s.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Colored header */}
      <motion.div
        className={`relative ${bgMap[level.colorKey]} px-6 pt-12 pb-10 rounded-b-[2.5rem]`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate('/learn')}
          className="absolute top-6 left-5 w-10 h-10 rounded-full bg-card/20 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>

        <div className="text-center max-w-sm mx-auto">
          <motion.div
            className="block mb-4 flex justify-center"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <LevelIcon name={level.iconName} size={56} />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">{level.title}</h1>
          <p className="text-primary-foreground/80 mt-1 text-base">{level.subtitle}</p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <ProgressRing progress={level.progress} size={44} strokeWidth={4} color="white" />
            <span className="text-primary-foreground font-display font-bold text-lg tabular-nums">
              {level.progress}%
            </span>
            <span className="text-primary-foreground/70 text-sm">
              · {completedSubs}/{level.subLevels.length} Lektionen
            </span>
          </div>

          {isEtf && store.currentStreak >= 2 && (
            <motion.div
              className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs font-semibold text-amber-200">
                🔥 {store.currentStreak} Lektion Streak
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="max-w-sm mx-auto px-5 mt-4 pb-20 space-y-3">
        {level.subLevels.map((sub, i) => {
          const lessonId = `${level.id}-${sub.id}`;
          const result = getLessonResult(lessonId);
          const isCompleted = result?.completed === true;
          const progress = isCompleted ? 1 : (result?.progress ?? 0);
          const isCurrent = sub.status === 'current';
          const isLocked = sub.status === 'locked';

          const radius = 16;
          const circumference = 2 * Math.PI * radius;

          const handleClick = () => {
            if (isLocked) return;
            if (level.id === 'festgeld' && ['f1', 'f2', 'f3', 'f4', 'f5'].includes(sub.id)) {
              navigate(`/lesson/${level.id}/${sub.id}`, { state: { fromSubPage: true } });
            } else if (level.id === 'etfs') {
              navigate(`/lesson/etfs/${sub.id}`);
            } else {
              navigate(`/lesson-flow/${level.id}/${sub.id}`);
            }
          };

          return (
            <motion.button
              key={sub.id}
              onClick={handleClick}
              disabled={isLocked}
              className={`w-full text-left p-5 rounded-3xl bg-card shadow-card transition-all
                ${isLocked ? 'opacity-60' : 'hover:shadow-lg'}
              `}
              whileTap={!isLocked ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-display text-base font-bold ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {sub.title}
                  </h4>
                  <p className={`text-sm mt-1 ${isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                    {sub.description}
                  </p>
                  {progress > 0 && !isCompleted && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {Math.round(progress * 100)}% abgeschlossen
                    </span>
                  )}
                  <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full
                    ${isCompleted ? 'bg-primary/10 text-primary' : isLocked ? 'bg-muted text-muted-foreground/50' : 'bg-muted text-muted-foreground'}`}>
                    ⏱ {sub.duration}
                  </span>
                </div>

                <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-1">
                  {isCompleted && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                      </div>
                      {result && (
                        <>
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map(h => (
                              <div
                                key={h}
                                className={`w-2 h-2 rounded-full ${
                                  h < (result.heartsRemaining ?? 0) ? 'bg-destructive' : 'bg-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            +{result.xpEarned} XP
                          </span>
                          {result.perfect && (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">⭐</span>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {isCurrent && !isCompleted && progress > 0 && (
                    <svg width="40" height="40">
                      <circle
                        cx="20" cy="20" r={radius}
                        stroke="hsl(var(--muted))"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="20" cy="20" r={radius}
                        stroke="hsl(var(--primary))"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                      />
                    </svg>
                  )}
                  {isCurrent && !isCompleted && progress === 0 && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground" fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">Starten</span>
                    </>
                  )}
                  {isLocked && (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDetail;
