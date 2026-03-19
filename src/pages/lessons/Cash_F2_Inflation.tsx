import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Price data for the basket slide ── */
const products = [
  { icon: '☕', name: 'Kaffee', start: 3.5, end: 5.2 },
  { icon: '🍞', name: 'Brot', start: 2.8, end: 3.9 },
  { icon: '🚌', name: 'Busticket', start: 2.2, end: 3.2 },
  { icon: '💇', name: 'Haarschnitt', start: 35.0, end: 55.0 },
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
  label: 'Frage 1 von 2',
  question:
    'Du hast CHF 10\'000 auf einem Konto ohne Zinsen. Die Inflation beträgt 2% pro Jahr. Was passiert nach 10 Jahren?',
  answers: [
    { id: 'a', text: 'Ich habe immer noch dieselbe Kaufkraft' },
    { id: 'b', text: 'Ich habe mehr Kaufkraft weil das Geld sicher ist' },
    { id: 'c', text: 'Ich kann mir weniger kaufen als heute' },
    { id: 'd', text: 'Das Geld verschwindet komplett vom Konto' },
  ],
  correctId: 'c',
  correctFeedback:
    'Richtig! Die Zahl CHF 10\'000 bleibt gleich — aber 2% Inflation pro Jahr bedeuten nach 10 Jahren rund 18% weniger Kaufkraft.',
  wrongFeedback:
    'Fast! Das Geld ist noch da — aber Inflation frisst still und leise die Kaufkraft. Nach 10 Jahren bei 2% Inflation kannst du dir etwa 18% weniger kaufen.',
};

const quiz2: QuizConfig = {
  label: 'Frage 2 von 2',
  question: 'Was ist die beste Strategie um Kaufkraftverlust zu bekämpfen?',
  answers: [
    { id: 'a', text: 'Geld unter die Matratze legen — da ist es sicher' },
    { id: 'b', text: 'Alles sofort ausgeben bevor es weniger wert wird' },
    { id: 'c', text: 'Geld so anlegen dass die Rendite die Inflation schlägt' },
    { id: 'd', text: 'Einfach in einer anderen Währung sparen' },
  ],
  correctId: 'c',
  correctFeedback:
    'Genau! Wer sein Geld klug anlegt und mehr Rendite erzielt als die Inflationsrate, behält seine Kaufkraft — oder steigert sie sogar.',
  wrongFeedback:
    'Fast! Ausgeben oder verstecken löst das Problem nicht. Die einzige echte Lösung ist eine Rendite die höher ist als die Inflation.',
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

  // Step 2 — quiz 1
  const [q1Answer, setQ1Answer] = useState<string | null>(null);

  // Step 3 — quiz 2
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — completion star anim
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
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      navigate('/category/festgeld');
      return;
    }
    setCurrentStep(s => s + 1);
    // Trigger star animation on completion slide
    if (currentStep === 3) {
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
          <X className="w-5 h-5 text-foreground" />
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
                Dein Geld wird weniger — ohne dass du es siehst
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Stell dir vor du legst CHF 10'000 unters Kopfkissen. 10 Jahre später nimmst du es raus — die Zahl ist noch gleich, aber du kannst dir weniger dafür kaufen. Das ist Inflation.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Inflation bedeutet dass Preise steigen — und dein Geld deshalb jedes Jahr etwas weniger wert wird, auch wenn du nichts ausgibst.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Warenkorb slider */}
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
              Sieh wie Preise über Zeit steigen
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
                Warenkorb gesamt:{' '}
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
                onChange={e => setSliderYear(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted"
              />
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
                    Derselbe Warenkorb kostet heute 55% mehr als 2004 — dein Geld hat Kaufkraft verloren.
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

        {/* STEP 4 — Completion */}
        {currentStep === 4 && (
          <motion.div
            key="s4"
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
              Lektion abgeschlossen! 🎉
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-xs">
              Du verstehst jetzt was Inflation ist und warum Geld das einfach nur liegt jedes Jahr an Wert verliert.
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
              style={{ backgroundColor: currentStep === 4 ? 'hsl(142, 71%, 45%)' : BLUE }}
            >
              {currentStep === 4 ? 'Zur nächsten Lektion →' : 'Weiter →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* No Hearts Overlay */}
    {noHeartsScreen === 'showing' && (
      <NoHeartsOverlay
        onRestart={() => { setCurrentStep(0); setHearts(3); setSliderYear(2004); setQ1Answer(null); setQ2Answer(null); setStarsShown(0); setNoHeartsScreen('none'); setCompletionResult(null); }}
        onQuizOnly={() => { setCurrentStep(2); setHearts(3); setQ1Answer(null); setQ2Answer(null); setNoHeartsScreen('none'); setCompletionResult(null); }}
        onContinue={() => setNoHeartsScreen('none')}
      />
    }
    </div>
  );
};

export default Cash_F2_Inflation;
