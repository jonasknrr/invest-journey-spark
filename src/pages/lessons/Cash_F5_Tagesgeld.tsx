import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

const pillars = [
  { emoji: '🏦', label: 'Girokonto', rate: 0.0001, tagColor: 'text-red-600 dark:text-red-400 bg-red-500/10', tag: 'Kaum Wachstum' },
  { emoji: '💰', label: 'Tagesgeld', rate: 0.01, tagColor: 'text-green-600 dark:text-green-400 bg-green-500/10', tag: 'Solide Rendite + flexibel' },
  { emoji: '🔒', label: 'Festgeld', rate: 0.02, tagColor: 'text-green-600 dark:text-green-400 bg-green-500/10', tag: 'Mehr Rendite — aber gebunden' },
];

const durations = [
  { label: '1 Jahr', years: 1, values: [10001, 10100, 10200] },
  { label: '3 Jahre', years: 3, values: [10003, 10303, 10612] },
  { label: '5 Jahre', years: 5, values: [10005, 10510, 11041] },
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
  label: 'Frage 1 von 2',
  question: 'Was unterscheidet Tagesgeld von Festgeld?',
  answers: [
    { id: 'a', text: 'Tagesgeld bringt immer mehr Zinsen als Festgeld' },
    { id: 'b', text: 'Tagesgeld ist täglich verfügbar — Festgeld ist für eine feste Laufzeit gebunden' },
    { id: 'c', text: 'Festgeld kann täglich abgehoben werden' },
    { id: 'd', text: 'Es gibt keinen Unterschied — beide sind gleich flexibel' },
  ],
  correctId: 'b',
  correctFeedback: 'Richtig! Tagesgeld ist flexibel aber der Zins kann sich ändern. Festgeld hat einen fixen Zins aber du kommst nicht ran. Jedes hat seinen Platz.',
  wrongFeedback: 'Fast! Der Hauptunterschied ist die Flexibilität — Tagesgeld ist täglich verfügbar, Festgeld ist gebunden. Dafür ist der Festgeldzins meist höher und garantiert.',
};

const quiz2: QuizConfig = {
  label: 'Frage 2 von 2',
  question: 'Du hast CHF 8\'000 als Notfallreserve. Du weisst nicht wann du es brauchst — vielleicht morgen, vielleicht nie. Wo parkst du es am sinnvollsten?',
  answers: [
    { id: 'a', text: 'Girokonto — da ist es am sichersten' },
    { id: 'b', text: 'Festgeld für 3 Jahre — maximale Zinsen' },
    { id: 'c', text: 'Tagesgeld — verfügbar wenn nötig, trotzdem Zinsen' },
    { id: 'd', text: 'In Aktien investieren — mehr Rendite' },
  ],
  correctId: 'c',
  correctFeedback: 'Perfekt! Eine Notfallreserve muss immer sofort verfügbar sein — Tagesgeld ist dafür ideal. Mehr Zins als das Girokonto und trotzdem täglich abrufbar.',
  wrongFeedback: 'Vorsicht! Eine Notfallreserve muss sofort verfügbar sein. Festgeld ist gebunden, Aktien können im falschen Moment im Minus sein. Tagesgeld ist die richtige Wahl.',
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

  // Step 4 — stars
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
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      navigate('/category/festgeld');
      return;
    }
    setCurrentStep(s => s + 1);
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
                Flexibel sparen — mit mehr Zins als das Girokonto
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Tagesgeld ist das Beste aus beiden Welten — du bekommst mehr Zinsen als auf dem Girokonto, kannst aber trotzdem jeden Tag auf dein Geld zugreifen. Kein Warten, keine Strafe, keine feste Laufzeit.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Der Zinssatz beim Tagesgeld kann sich täglich ändern — die Bank kann ihn jederzeit anpassen. Das ist der Unterschied zu Festgeld wo der Zins für die gesamte Laufzeit fix ist.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Tagesgeld eignet sich perfekt als Notfallreserve oder für Geld das du mittelfristig brauchst aber trotzdem arbeiten lassen willst.
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
              Vergleiche wie dein Geld wächst
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
                    💰 Tagesgeld: mehr als Girokonto — und trotzdem jeden Tag verfügbar. Der ideale Mittelweg.
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
              Du weisst jetzt was Tagesgeld ist, wie es sich von Festgeld und Girokonto unterscheidet — und warum es die perfekte Heimat für deine Notfallreserve ist.
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
              {currentStep === 4 ? 'Zurück zur Übersicht →' : 'Weiter →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cash_F5_Tagesgeld;
