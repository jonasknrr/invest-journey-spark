import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 6;

/* ── Interest rates by duration ── */
const durations = [
  { label: '3 Months', months: 3, rate: 0.75 },
  { label: '1 Year', months: 12, rate: 1.5 },
  { label: '3 Years', months: 36, rate: 2.25 },
];

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
  question: 'Why does a fixed deposit pay more interest than a regular checking account?',
  answers: [
    { id: 'a', text: 'Because fixed deposits are riskier than a checking account' },
    { id: 'b', text: 'Because the bank has more time to plan with your money since it\'s locked in' },
    { id: 'c', text: 'Because the government subsidises fixed deposits' },
    { id: 'd', text: 'Because fixed deposits are only for wealthy people' },
  ],
  correctId: 'b',
  correctFeedback:
    'Correct! The bank knows exactly how long it can use your money — that\'s worth more to them and they reward you with higher interest.',
  wrongFeedback:
    'Close! Fixed deposits aren\'t riskier — the bank simply gets planning certainty because it knows how long it can use your money. That\'s why it pays more.',
};

const quiz2: QuizConfig = {
  label: 'Question 2 of 3',
  question:
    "You know you'll need CHF 5'000 for a trip in 6 months. Is a 2-year fixed deposit a good idea?",
  answers: [
    { id: 'a', text: 'Yes — more interest is always better' },
    { id: 'b', text: 'Yes — the bank will make an exception if I explain' },
    { id: 'c', text: 'No — the money is locked for 2 years and I need it in 6 months' },
    { id: 'd', text: 'Doesn\'t matter — fixed deposit and checking account are equally flexible' },
  ],
  correctId: 'c',
  correctFeedback:
    'Perfect! Only use fixed deposits for money you definitely won\'t need during the term. For the trip, a 3-month deposit or call money would be the right choice.',
  wrongFeedback:
    'Careful! Banks don\'t make exceptions — fixed deposits are locked until maturity. Getting out early means paying a penalty or losing all interest.',
};

const quiz3: QuizConfig = {
  label: 'Question 3 of 3',
  question: 'What is an important characteristic of the interest rate on a typical call money account?',
  answers: [
    { id: 'a', text: 'It is guaranteed to stay the exact same for 10 years.' },
    { id: 'b', text: 'It is variable and can be changed by the bank depending on market conditions.' },
    { id: 'c', text: 'It is legally required to always be higher than the inflation rate.' },
    { id: 'd', text: 'It is only paid out if you do not withdraw any money for a full year.' },
  ],
  correctId: 'b',
  correctFeedback: 'Correct! Call money rates are variable — the bank can adjust them anytime based on market conditions. That\'s the trade-off for flexibility.',
  wrongFeedback: 'Not quite. Call money interest rates are variable — the bank can change them at any time depending on the market. That\'s the price of staying flexible.',
};

/* ── Component ── */
const Cash_F4_Festgeld = () => {
  const navigate = useNavigate();
  const { updateLessonProgress, completeLesson } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);

  // Step 1 — calculator
  const [amount, setAmount] = useState(10000);
  const [durationIdx, setDurationIdx] = useState(1);
  const [amountTouched, setAmountTouched] = useState(false);
  const [durationTouched, setDurationTouched] = useState(false);

  // Step 2 — quiz 1
  const [q1Answer, setQ1Answer] = useState<string | null>(null);

  // Step 3 — quiz 2
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — quiz 3
  const [q3Answer, setQ3Answer] = useState<string | null>(null);

  // Step 5 — stars
  const [starsShown, setStarsShown] = useState(0);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const bothTouched = amountTouched && durationTouched;

  // Track progress
  useEffect(() => {
    updateLessonProgress('festgeld-f4', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('festgeld-f4', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const showCTA = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return bothTouched;
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
    if (currentStep === 4) {
      setTimeout(() => setStarsShown(1), 300);
      setTimeout(() => setStarsShown(2), 600);
      setTimeout(() => setStarsShown(3), 900);
    }
  };

  const handleQuizAnswer = (
    config: QuizConfig,
    answerId: string,
    current: string | null,
    setter: (id: string) => void,
  ) => {
    if (current) return;
    setter(answerId);
    if (answerId !== config.correctId) setHearts(h => Math.max(0, h - 1));
  };

  // Calculator derived values
  const dur = durations[durationIdx];
  const interest = Math.round(amount * (dur.rate / 100) * (dur.months / 12) * 100) / 100;
  const endValue = amount + interest;
  const availableDate = new Date();
  availableDate.setMonth(availableDate.getMonth() + dur.months);
  const dateStr = availableDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

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
              <span className="mb-4" style={{ fontSize: 64 }}>🔒</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-5">
                More interest — but your money is locked
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                A fixed deposit is like a promise to the bank — you give them your money for a set time, and they pay you more interest than a regular account. The longer you wait, the more you get.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                The catch: you can't access your money during the term. Getting out early means paying a penalty — or getting nothing at all.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Fixed deposits are therefore only suitable for money you definitely won't need in the near future.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Interest calculator */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-lg font-bold text-foreground text-center mb-5">
              See how term and amount affect your earnings
            </h2>

            <div className="max-w-sm mx-auto w-full space-y-5">
              {/* Amount slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm text-muted-foreground">Your amount</span>
                  <motion.span
                    key={amount}
                    className="font-display text-lg font-bold text-foreground tabular-nums"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    CHF {amount.toLocaleString('de-CH')}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={1000}
                  value={amount}
                  onChange={e => {
                    setAmount(Number(e.target.value));
                    setAmountTouched(true);
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted"
                />
                <div className="flex justify-between mt-1">
                  <span className="font-body text-[10px] text-muted-foreground">CHF 1'000</span>
                  <span className="font-body text-[10px] text-muted-foreground">CHF 20'000</span>
                </div>
              </div>

              {/* Duration buttons */}
              <div>
                <p className="font-body text-sm text-muted-foreground mb-2">Term</p>
                <div className="flex gap-2">
                  {durations.map((d, i) => (
                    <button
                      key={d.label}
                      onClick={() => {
                        setDurationIdx(i);
                        setDurationTouched(true);
                      }}
                      className={`flex-1 py-2.5 rounded-xl font-display text-sm font-bold transition-colors ${
                        i === durationIdx
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result card */}
              <motion.div
                key={`${amount}-${durationIdx}`}
                initial={{ opacity: 0.8, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Interest rate</span>
                  <span className="font-display text-base font-bold text-foreground">{dur.rate}% p.a.</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Interest earned</span>
                  <span className="font-display text-base font-bold text-green-600 dark:text-green-400">
                    CHF {interest.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Final value</span>
                  <span className="font-display text-lg font-bold text-foreground">
                    CHF {endValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Available from</span>
                  <span className="font-display text-sm font-bold text-foreground">{dateStr}</span>
                </div>
              </motion.div>

              {/* Warning */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 px-4 py-2.5">
                <p className="font-body text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Your money is locked during this period
                </p>
              </div>

              {/* Trade-off text after both touched */}
              <AnimatePresence>
                {bothTouched && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/30 px-4 py-3"
                  >
                    <p className="font-body text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      Longer term = more interest — but also less flexibility. That's the classic trade-off.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  if (a.id === quiz1.correctId) { cls = 'border-green-500 bg-green-500/10'; suffix = ' ✅'; }
                  else if (a.id === q1Answer) { cls = 'border-red-500 bg-red-500/10'; suffix = ' ✗'; }
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
                  <p className={`font-body text-sm leading-relaxed ${
                    q1Answer === quiz1.correctId
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
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
                  if (a.id === quiz2.correctId) { cls = 'border-green-500 bg-green-500/10'; suffix = ' ✅'; }
                  else if (a.id === q2Answer) { cls = 'border-red-500 bg-red-500/10'; suffix = ' ✗'; }
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
                  <p className={`font-body text-sm leading-relaxed ${
                    q2Answer === quiz2.correctId
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
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
                  if (a.id === quiz3.correctId) { cls = 'border-green-500 bg-green-500/10'; suffix = ' ✅'; }
                  else if (a.id === q3Answer) { cls = 'border-red-500 bg-red-500/10'; suffix = ' ✗'; }
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
                  <p className={`font-body text-sm leading-relaxed ${
                    q3Answer === quiz3.correctId
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
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
              You now know what a fixed deposit is, why it pays more interest than a checking account — and when it makes sense and when it doesn't.
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
          onRestart={() => { setCurrentStep(0); setHearts(3); setAmount(10000); setDurationIdx(1); setAmountTouched(false); setDurationTouched(false); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setStarsShown(0); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default Cash_F4_Festgeld;
