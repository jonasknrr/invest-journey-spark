import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Interest rates by duration ── */
const durations = [
  { label: '3 Monate', months: 3, rate: 0.75 },
  { label: '1 Jahr', months: 12, rate: 1.5 },
  { label: '3 Jahre', months: 36, rate: 2.25 },
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
  label: 'Frage 1 von 2',
  question: 'Warum zahlt Festgeld mehr Zinsen als ein normales Girokonto?',
  answers: [
    { id: 'a', text: 'Weil Festgeld risikoreicher ist als ein Girokonto' },
    { id: 'b', text: 'Weil die Bank mehr Zeit hat mit deinem Geld zu planen da es fest angelegt ist' },
    { id: 'c', text: 'Weil der Staat Festgeld subventioniert' },
    { id: 'd', text: 'Weil Festgeld nur für reiche Leute ist' },
  ],
  correctId: 'b',
  correctFeedback:
    'Richtig! Die Bank weiss genau wie lange sie dein Geld nutzen kann — das ist ihr mehr wert und dafür belohnt sie dich mit höheren Zinsen.',
  wrongFeedback:
    'Fast! Festgeld ist nicht riskanter — die Bank bekommt einfach Planungssicherheit weil sie weiss wie lange sie dein Geld nutzen kann. Dafür zahlt sie mehr.',
};

const quiz2: QuizConfig = {
  label: 'Frage 2 von 2',
  question:
    "Du weisst dass du in 6 Monaten CHF 5'000 für eine Reise brauchst. Ist ein 2-Jahres-Festgeld sinnvoll?",
  answers: [
    { id: 'a', text: 'Ja — mehr Zinsen ist immer besser' },
    { id: 'b', text: 'Ja — die Bank macht eine Ausnahme wenn ich es erkläre' },
    { id: 'c', text: 'Nein — das Geld ist 2 Jahre gebunden und ich brauche es in 6 Monaten' },
    { id: 'd', text: 'Egal — Festgeld und Girokonto sind gleich flexibel' },
  ],
  correctId: 'c',
  correctFeedback:
    'Perfekt! Festgeld immer nur für Geld das du in der Laufzeit sicher nicht brauchst. Für die Reise wäre ein 3-Monats-Festgeld oder Tagesgeld die richtige Wahl.',
  wrongFeedback:
    'Vorsicht! Banken machen keine Ausnahmen — Festgeld ist bis zum Ende gebunden. Wer früher raus will zahlt eine Strafe oder verliert die Zinsen komplett.',
};

/* ── Component ── */
const Cash_F4_Festgeld = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);

  // Step 1 — calculator
  const [amount, setAmount] = useState(10000);
  const [durationIdx, setDurationIdx] = useState(1);
  const [amountTouched, setAmountTouched] = useState(false);
  const [durationTouched, setDurationTouched] = useState(false);

  // Step 2 — quiz 1
  const [q1Answer, setQ1Answer] = useState<string | null>(null);

  // Step 3 — quiz 2
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — stars
  const [starsShown, setStarsShown] = useState(0);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const bothTouched = amountTouched && durationTouched;

  const showCTA = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return bothTouched;
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
  const dateStr = availableDate.toLocaleDateString('de-CH', {
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
              <span className="mb-4" style={{ fontSize: 64 }}>🔒</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-5">
                Mehr Zins — aber dein Geld ist gebunden
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Festgeld ist wie ein Versprechen an die Bank — du gibst ihr dein Geld für eine feste Zeit, und sie zahlt dir dafür mehr Zinsen als auf dem normalen Konto. Je länger du wartest, desto mehr bekommst du.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Der Haken: während der Laufzeit kommst du nicht an dein Geld. Wer früher raus will zahlt eine Strafe — oder bekommt gar nichts.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Festgeld eignet sich deshalb nur für Geld das du in der nächsten Zeit sicher nicht brauchst.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Zins-Rechner */}
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
              Sieh wie Laufzeit und Betrag deinen Gewinn beeinflussen
            </h2>

            <div className="max-w-sm mx-auto w-full space-y-5">
              {/* Amount slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm text-muted-foreground">Dein Betrag</span>
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
                <p className="font-body text-sm text-muted-foreground mb-2">Laufzeit</p>
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
                  <span className="font-body text-sm text-muted-foreground">Zinssatz</span>
                  <span className="font-display text-base font-bold text-foreground">{dur.rate}% p.a.</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Zinsgewinn</span>
                  <span className="font-display text-base font-bold text-green-600 dark:text-green-400">
                    CHF {interest.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Endwert</span>
                  <span className="font-display text-lg font-bold text-foreground">
                    CHF {endValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Verfügbar ab</span>
                  <span className="font-display text-sm font-bold text-foreground">{dateStr}</span>
                </div>
              </motion.div>

              {/* Warning */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 px-4 py-2.5">
                <p className="font-body text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Während dieser Zeit ist dein Geld gesperrt
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
                      Längere Laufzeit = mehr Zinsen — aber auch weniger Flexibilität. Das ist der klassische Trade-off.
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
              Du weisst jetzt was Festgeld ist, warum es mehr Zinsen bringt als ein Girokonto — und wann es sinnvoll ist und wann nicht.
            </p>
            <motion.div
              className="inline-flex flex-col items-center gap-0.5 px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
            >
              <motion.span
                className="font-display text-xl font-bold text-green-600 dark:text-green-400"
                animate={{
                  textShadow: [
                    '0 0 0px hsl(142,71%,45%)',
                    '0 0 16px hsl(142,71%,45%)',
                    '0 0 0px hsl(142,71%,45%)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                +50 XP
              </motion.span>
              <span className="font-body text-xs text-green-600/70 dark:text-green-400/70">verdient</span>
            </motion.div>
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
  );
};

export default Cash_F4_Festgeld;
