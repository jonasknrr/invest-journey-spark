import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 6;

const pillars = [
  { emoji: '🏦', label: 'Checking account', rate: 0.0001, tagColor: 'text-red-600 dark:text-red-400 bg-red-500/10', tag: 'Barely grows' },
  { emoji: '💰', label: 'Call money', rate: 0.01, tagColor: 'text-green-600 dark:text-green-400 bg-green-500/10', tag: 'Solid return + flexible' },
  { emoji: '🔒', label: 'Fixed deposit', rate: 0.02, tagColor: 'text-green-600 dark:text-green-400 bg-green-500/10', tag: 'Higher return — but locked' },
];

const durations = [
  { label: '1 Year', years: 1, values: [10001, 10100, 10200] },
  { label: '3 Years', years: 3, values: [10003, 10303, 10612] },
  { label: '5 Years', years: 5, values: [10005, 10510, 11041] },
];

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
  question: 'What distinguishes call money from a fixed deposit?',
  answers: [
    { id: 'a', text: 'Call money always earns more interest than fixed deposits' },
    { id: 'b', text: 'Call money is available daily — fixed deposits are locked for a set term' },
    { id: 'c', text: 'Fixed deposits can be withdrawn daily' },
    { id: 'd', text: 'There is no difference — both are equally flexible' },
  ],
  correctId: 'b',
  correctFeedback: 'Correct! Call money is flexible but the rate can change. Fixed deposits have a guaranteed rate but you can\'t access the funds. Each has its place.',
  wrongFeedback: 'Close! The main difference is flexibility — call money is available daily, fixed deposits are locked. In return, fixed deposit rates are usually higher and guaranteed.',
};

const quiz2: QuizConfig = {
  label: 'Question 2 of 3',
  question: 'You have CHF 8\'000 as an emergency reserve. You don\'t know when you\'ll need it — maybe tomorrow, maybe never. Where do you park it?',
  answers: [
    { id: 'a', text: 'Checking account — it\'s safest there' },
    { id: 'b', text: 'Fixed deposit for 3 years — maximum interest' },
    { id: 'c', text: 'Call money — available when needed, still earns interest' },
    { id: 'd', text: 'Invest in stocks — higher returns' },
  ],
  correctId: 'c',
  correctFeedback: 'Perfect! An emergency reserve must always be instantly available — call money is ideal for that. More interest than a checking account and still accessible daily.',
  wrongFeedback: 'Careful! An emergency reserve must be instantly available. Fixed deposits are locked, stocks can be in the red at the wrong moment. Call money is the right choice.',
};

const quiz3: QuizConfig = {
  label: 'Question 3 of 3',
  question: 'What is a major advantage of the interest rate on a fixed deposit compared to a call money account?',
  answers: [
    { id: 'a', text: 'It automatically adjusts to beat inflation every single month.' },
    { id: 'b', text: 'It is locked in and guaranteed for the entire duration of the term.' },
    { id: 'c', text: 'It increases every time you make a withdrawal.' },
    { id: 'd', text: 'It is determined by the stock market at the end of the year.' },
  ],
  correctId: 'b',
  correctFeedback: 'Correct! A fixed deposit locks in the interest rate for the full term — unlike call money where the bank can change it anytime. That\'s the reward for giving up flexibility.',
  wrongFeedback: 'Not quite. The key advantage of fixed deposits is rate certainty — the interest rate is guaranteed and doesn\'t change for the entire term, unlike call money.',
};

const Cash_F5_Tagesgeld = () => {
  const navigate = useNavigate();
  const { updateLessonProgress, completeLesson } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);

  // Step 1 — pillars
  const [durIdx, setDurIdx] = useState(0);
  const [tappedDurations, setTappedDurations] = useState<Set<number>>(new Set([0]));
  const [showTagesgeldHint, setShowTagesgeldHint] = useState(false);

  // Step 2/3 — quizzes
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — quiz 3
  const [q3Answer, setQ3Answer] = useState<string | null>(null);

  // Step 5 — stars
  const [starsShown, setStarsShown] = useState(0);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('festgeld-f5', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('festgeld-f5', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const showCTA = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return tappedDurations.size >= 3;
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
    quizConfig: QuizConfig,
    answerId: string,
    currentAnswer: string | null,
    setAnswer: (id: string) => void,
  ) => {
    if (currentAnswer) return;
    setAnswer(answerId);
    if (answerId !== quizConfig.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const curValues = durations[durIdx].values;
  const maxVal = Math.max(...curValues);

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
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

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
              <span className="mb-4" style={{ fontSize: 64 }}>💰</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-5">
                Save flexibly — with more interest than a checking account
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Call money is the best of both worlds — you earn more interest than a checking account, but can still access your money any day. No waiting, no penalty, no fixed term.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                The interest rate on call money can change daily — the bank can adjust it at any time. That's the difference to fixed deposits where the rate is locked for the entire term.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Call money is perfect as an emergency reserve or for money you need in the medium term but still want to put to work.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Pillar comparison */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">
              Compare how your money grows
            </h2>

            {/* Duration buttons */}
            <div className="flex gap-2 justify-center mb-5">
              {durations.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDurIdx(i);
                    setTappedDurations(prev => new Set(prev).add(i));
                  }}
                  className={`px-4 py-2 rounded-full font-display text-sm font-bold transition-colors ${
                    durIdx === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Pillars */}
            <div className="flex gap-3 justify-center items-end max-w-sm mx-auto w-full mb-4" style={{ height: 200 }}>
              {pillars.map((p, i) => {
                const val = curValues[i];
                const heightPct = Math.max(20, ((val - 10000) / (maxVal - 10000)) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.p
                      key={`v-${durIdx}-${i}`}
                      className="font-display text-sm font-bold text-foreground tabular-nums"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {val.toLocaleString('de-CH')}
                    </motion.p>
                    <motion.div
                      className={`w-full rounded-xl cursor-pointer ${
                        i === 0 ? 'bg-red-400/60' : i === 1 ? 'bg-green-500' : 'bg-primary'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      onClick={() => {
                        if (i === 1) setShowTagesgeldHint(true);
                      }}
                    />
                    <span className="text-2xl">{p.emoji}</span>
                    <p className="font-body text-xs text-foreground font-medium text-center">{p.label}</p>
                    <span className={`text-[10px] font-display font-bold rounded-full px-2 py-0.5 text-center ${p.tagColor}`}>
                      {p.tag}
                    </span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {showTagesgeldHint && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-300/40 px-4 py-3 max-w-sm mx-auto w-full"
                >
                  <p className="font-body text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    💰 Call money: more than a checking account — and still available every day. The ideal middle ground.
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
                    q1Answer === quiz1.correctId ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
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
                    q2Answer === quiz2.correctId ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
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
                    q3Answer === quiz3.correctId ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
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
              You now know what call money is, how it differs from fixed deposits and checking accounts — and why it's the perfect home for your emergency reserve.
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
              {currentStep === 5 ? 'Back to overview →' : 'Continue →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setDurIdx(0); setTappedDurations(new Set([0])); setShowTagesgeldHint(false); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setStarsShown(0); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setQ1Answer(null); setQ2Answer(null); setQ3Answer(null); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default Cash_F5_Tagesgeld;
