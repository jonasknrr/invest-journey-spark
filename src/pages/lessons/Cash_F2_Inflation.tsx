import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 6;

/* ── Price data for the basket slide ── */
const products = [
  { icon: '☕', name: 'Coffee', start: 3.5, end: 5.2 },
  { icon: '🍞', name: 'Bread', start: 2.8, end: 3.9 },
  { icon: '🚌', name: 'Bus ticket', start: 2.2, end: 3.2 },
  { icon: '💇', name: 'Haircut', start: 35.0, end: 55.0 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ── Quiz config ── */
interface QuizConfig {
  label: string;
  question: string;
  answers: { id: string; text: string }[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
}

const quiz1: QuizConfig = {
  label: 'Question 1 of 3',
  question:
    'You have CHF 10\'000 in an account with no interest. Inflation is 2% per year. What happens after 10 years?',
  answers: [
    { id: 'a', text: 'I still have the same purchasing power' },
    { id: 'b', text: 'I have more purchasing power because the money is safe' },
    { id: 'c', text: 'I can buy less than today' },
    { id: 'd', text: 'The money completely disappears from the account' },
  ],
  correctId: 'c',
  correctFeedback:
    'Correct! The number CHF 10\'000 stays the same — but 2% inflation per year means about 18% less purchasing power after 10 years.',
  wrongFeedback:
    'Close! The money is still there — but inflation silently eats away at purchasing power. After 10 years at 2% inflation, you can buy about 18% less.',
};

const quiz2: QuizConfig = {
  label: 'Question 2 of 3',
  question: 'What is the best strategy to fight loss of purchasing power?',
  answers: [
    { id: 'a', text: 'Put money under the mattress — it\'s safe there' },
    { id: 'b', text: 'Spend everything immediately before it loses value' },
    { id: 'c', text: 'Invest money so that returns beat inflation' },
    { id: 'd', text: 'Simply save in a different currency' },
  ],
  correctId: 'c',
  correctFeedback:
    'Exactly! Those who invest wisely and earn returns higher than the inflation rate keep their purchasing power — or even increase it.',
  wrongFeedback:
    'Close! Spending or hiding doesn\'t solve the problem. The only real solution is a return that\'s higher than inflation.',
};

const quiz3: QuizConfig = {
  label: 'Question 3 of 3',
  question: 'In simple terms, what does an inflation rate of 2% mean for your everyday life?',
  answers: [
    { id: 'a', text: 'Your salary will automatically increase by exactly 2% every year.' },
    { id: 'b', text: 'A typical basket of groceries costing 100 today will cost about 102 next year.' },
    { id: 'c', text: 'The bank will charge a 2% penalty fee on your savings account.' },
    { id: 'd', text: 'The value of your stock portfolio will drop by 2%.' },
  ],
  correctId: 'b',
  correctFeedback: 'Exactly! A 2% inflation rate means prices rise on average by 2% per year — so what costs CHF 100 today will cost about CHF 102 next year.',
  wrongFeedback: 'Not quite. Inflation means prices rise — a 2% rate means a CHF 100 basket of goods will cost about CHF 102 a year later.',
};

/* ── Component ── */
const Cash_F2_Inflation = () => {
  const navigate = useNavigate();
  const { updateLessonProgress, completeLesson } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);

  // Step 1 — slider
  const [sliderYear, setSliderYear] = useState(2004);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const DURATION_MS = 4000; // 4 seconds for full sweep

  const stopAutoPlay = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    setIsAutoPlaying(false);
  }, []);

  const startAutoPlay = useCallback(() => {
    setSliderYear(2004);
    setIsAutoPlaying(true);
    startTimeRef.current = null;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      // ease-out curve for smoother feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const year = 2004 + eased * 20;
      setSliderYear(year);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setSliderYear(2024);
        stopAutoPlay();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopAutoPlay]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Step 2 — quiz 1
  const [q1Answer, setQ1Answer] = useState<string | null>(null);

  // Step 3 — quiz 2
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — quiz 3
  const [q3Answer, setQ3Answer] = useState<string | null>(null);

  // Step 5 — completion star anim
  const [starsShown, setStarsShown] = useState(0);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('festgeld-f2', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
  }, [currentStep]);

  // No hearts effect
  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen('showing');
      try { navigator.vibrate?.([300, 100, 300]); } catch {}
    }
  }, [hearts]);

  // Completion effect
  useEffect(() => {
    if (currentStep === TOTAL_STEPS - 1 && !completionResult) {
      const r = completeLesson('festgeld-f2', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const showCTA = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return sliderYear >= 2020;
    if (currentStep === 2) return !!q1Answer;
    if (currentStep === 3) return !!q2Answer;
    if (currentStep === 4) return !!q3Answer;
    if (currentStep === 5) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      navigate('/category/festgeld');
      return;
    }
    setCurrentStep(s => s + 1);
    // Trigger star animation on completion slide
    if (currentStep === 4) {
      setTimeout(() => setStarsShown(1), 300);
      setTimeout(() => setStarsShown(2), 600);
      setTimeout(() => setStarsShown(3), 900);
    }
  };

  const handleQuizAnswer = (
    quizConfig: QuizConfig,
    answerId: string,
    currentAnswer: string | null,
    setAnswer: (id: string) => void,
  ) => {
    if (currentAnswer) return;
    setAnswer(answerId);
    if (answerId !== quizConfig.correctId) setHearts(h => Math.max(0, h - 1));
  };

  // Slider interpolation
  const t = (sliderYear - 2004) / (2024 - 2004);
  const currentPrices = useMemo(
    () => products.map(p => lerp(p.start, p.end, t)),
    [t],
  );
  const basketTotal = useMemo(
    () => currentPrices.reduce((s, v) => s + v, 0),
    [currentPrices],
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/category/festgeld')}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <FiX className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: BLUE }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <FiHeart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* STEP 0 — Story */}
        {currentStep === 0 && (
          <motion.div
            key="s0"
            className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-sm mx-auto w-full flex flex-col items-center text-center">
              <span className="mb-4" style={{ fontSize: 64 }}>📉</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-5">
                Your money loses value — without you even noticing
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Imagine you put CHF 10'000 under your pillow. 10 years later you take it out — the number is still the same, but you can buy less with it. That's inflation.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Inflation means prices rise — and your money becomes worth a little less each year, even if you don't spend anything.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Basket slider */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">
              See how prices rise over time
            </h2>

            {/* Product cards */}
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto w-full mb-4">
              {products.map((p, i) => (
                <div
                  key={p.name}
                  className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center"
                >
                  <span className="text-2xl mb-1">{p.icon}</span>
                  <p className="font-body text-[11px] font-medium text-foreground mb-1">{p.name}</p>
                  <motion.p
                    key={`price-${i}-${sliderYear}`}
                    className="font-display text-sm font-bold text-foreground tabular-nums"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {currentPrices[i].toFixed(2)}
                  </motion.p>
                  <p className="font-body text-[9px] text-muted-foreground">CHF</p>
                </div>
              ))}
            </div>

            {/* Basket total */}
            <div className="text-center mb-4">
              <p className="font-body text-sm text-muted-foreground">
                Basket total:{' '}
                <span className="font-display font-bold text-foreground tabular-nums">
                  CHF {basketTotal.toFixed(2)}
                </span>
              </p>
            </div>

            {/* Year slider */}
            <div className="max-w-sm mx-auto w-full mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-body text-xs text-muted-foreground">2004</span>
                <span className="font-display text-sm font-bold text-foreground">{sliderYear}</span>
                <span className="font-body text-xs text-muted-foreground">2024</span>
              </div>
              <input
                type="range"
                min={2004}
                max={2024}
                value={sliderYear}
                onChange={e => { stopAutoPlay(); setSliderYear(Number(e.target.value)); }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted"
              />
              <div className="flex justify-center mt-3">
                <motion.button
                  onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-display text-sm font-bold transition-colors hover:bg-primary/20"
                >
                  {isAutoPlaying ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="4" height="12" rx="1" /><rect x="8" y="1" width="4" height="12" rx="1" /></svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
                      {sliderYear >= 2024 ? 'Replay' : 'Auto-play'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Orange banner at 2024 */}
            <AnimatePresence>
              {sliderYear >= 2024 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 px-4 py-3 max-w-sm mx-auto w-full"
                >
                  <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    The same basket costs 55% more today than in 2004 — your money has lost purchasing power.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2 — Quiz 1 */}
        {currentStep === 2 && (
          <motion.div
            key="s2"
            className="flex-1 flex flex-col px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 self-start mb-4">
              <span className="font-body text-xs font-semibold text-primary">{quiz1.label}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
              {quiz1.question}
            </h2>
            <div className="flex flex-col gap-3 flex-1">
              {quiz1.answers.map(a => {
                let cls = 'border-border bg-card';
                let suffix = '';
                if (q1Answer) {
                  if (a.id === quiz1.correctId) {
                    cls = 'border-green-500 bg-green-500/10';
                    suffix = ' ✅';
                  } else if (a.id === q1Answer) {
                    cls = 'border-red-500 bg-red-500/10';
                    suffix = ' ✗';
                  }
                }
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => handleQuizAnswer(quiz1, a.id, q1Answer, setQ1Answer)}
                    disabled={!!q1Answer}
                    whileTap={!q1Answer ? { scale: 0.97 } : undefined}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}
                  >
                    <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {q1Answer && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-2xl ${
                    q1Answer === quiz1.correctId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <p
                    className={`font-body text-sm leading-relaxed ${
                      q1Answer === quiz1.correctId
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {q1Answer === quiz1.correctId ? quiz1.correctFeedback : quiz1.wrongFeedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 3 — Quiz 2 */}
        {currentStep === 3 && (
          <motion.div
            key="s3"
            className="flex-1 flex flex-col px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 self-start mb-4">
              <span className="font-body text-xs font-semibold text-primary">{quiz2.label}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
              {quiz2.question}
            </h2>
            <div className="flex flex-col gap-3 flex-1">
              {quiz2.answers.map(a => {
                let cls = 'border-border bg-card';
                let suffix = '';
                if (q2Answer) {
                  if (a.id === quiz2.correctId) {
                    cls = 'border-green-500 bg-green-500/10';
                    suffix = ' ✅';
                  } else if (a.id === q2Answer) {
                    cls = 'border-red-500 bg-red-500/10';
                    suffix = ' ✗';
                  }
                }
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => handleQuizAnswer(quiz2, a.id, q2Answer, setQ2Answer)}
                    disabled={!!q2Answer}
                    whileTap={!q2Answer ? { scale: 0.97 } : undefined}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}
                  >
                    <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {q2Answer && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-2xl ${
                    q2Answer === quiz2.correctId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <p
                    className={`font-body text-sm leading-relaxed ${
                      q2Answer === quiz2.correctId
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {q2Answer === quiz2.correctId ? quiz2.correctFeedback : quiz2.wrongFeedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 4 — Quiz 3 */}
        {currentStep === 4 && (
          <motion.div
            key="s4"
            className="flex-1 flex flex-col px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 self-start mb-4">
              <span className="font-body text-xs font-semibold text-primary">{quiz3.label}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
              {quiz3.question}
            </h2>
            <div className="flex flex-col gap-3 flex-1">
              {quiz3.answers.map(a => {
                let cls = 'border-border bg-card';
                let suffix = '';
                if (q3Answer) {
                  if (a.id === quiz3.correctId) {
                    cls = 'border-green-500 bg-green-500/10';
                    suffix = ' ✅';
                  } else if (a.id === q3Answer) {
                    cls = 'border-red-500 bg-red-500/10';
                    suffix = ' ✗';
                  }
                }
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => handleQuizAnswer(quiz3, a.id, q3Answer, setQ3Answer)}
                    disabled={!!q3Answer}
                    whileTap={!q3Answer ? { scale: 0.97 } : undefined}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}
                  >
                    <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {q3Answer && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-2xl ${
                    q3Answer === quiz3.correctId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <p
                    className={`font-body text-sm leading-relaxed ${
                      q3Answer === quiz3.correctId
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {q3Answer === quiz3.correctId ? quiz3.correctFeedback : quiz3.wrongFeedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 5 — Completion */}
        {currentStep === 5 && (
          <motion.div
            key="s5"
            className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stars */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="text-4xl"
                  initial={{ opacity: 0.2, scale: 0.5 }}
                  animate={
                    i < starsShown
                      ? { opacity: 1, scale: [0.5, 1.3, 1], rotate: [0, 15, -10, 0] }
                      : { opacity: 0.2, scale: 0.5 }
                  }
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Lesson complete! 🎉
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-xs">
              You now understand what inflation is and why money that just sits there loses value every year.
            </p>

            <CompletionXP result={completionResult} hearts={hearts} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {showCTA() && (
          <motion.div
            className="px-6 pb-8 max-w-sm mx-auto w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              onClick={handleNext}
              whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm"
              style={{ backgroundColor: currentStep === 5 ? 'hsl(142, 71%, 45%)' : BLUE }}
            >
              {currentStep === 5 ? 'Next lesson →' : 'Continue →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setSliderYear(2004); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setStarsShown(0); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default Cash_F2_Inflation;
