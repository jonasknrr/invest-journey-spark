import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Star } from '@phosphor-icons/react';
import CashSortGame from '@/components/lessons/CashSortGame';

const BLUE = '#1A56DB';

/* ── Quiz data ── */
const QUIZ_1 = {
  label: 'Frage 1 von 2',
  question:
    'Du brauchst morgen früh CHF 500 für eine dringende Reparatur. Welche Option hilft dir am schnellsten?',
  answers: [
    { id: 'a', text: 'Deine Aktien verkaufen' },
    { id: 'b', text: 'Deine Immobilie verkaufen' },
    { id: 'c', text: 'Geld vom Girokonto abheben' },
    { id: 'd', text: 'Festgeld vorzeitig auflösen' },
  ],
  correctId: 'c',
  correctFeedback:
    'Richtig! Das Girokonto ist sofort verfügbar — kein Warten, keine Gebühren, kein Risiko.',
  wrongFeedback:
    'Fast! Aktien, Immobilien und Festgeld brauchen Zeit oder haben Kosten. Cash auf dem Konto ist sofort da.',
};

const QUIZ_2 = {
  label: 'Frage 2 von 2',
  question: 'Was unterscheidet Cash von einer Aktie?',
  answers: [
    { id: 'a', text: 'Cash bringt mehr Rendite als Aktien' },
    {
      id: 'b',
      text: 'Cash ist immer sofort verfügbar und verliert nicht plötzlich stark an Wert',
    },
    { id: 'c', text: 'Aktien sind sicherer als Cash' },
    { id: 'd', text: 'Es gibt keinen wesentlichen Unterschied' },
  ],
  correctId: 'b',
  correctFeedback:
    'Genau! Cash ist stabil und sofort verfügbar — Aktien können stark schwanken und brauchen Zeit zum Verkaufen.',
  wrongFeedback:
    'Nicht ganz — Cash glänzt nicht durch Rendite, sondern durch Sicherheit und sofortige Verfügbarkeit. Das ist sein grösster Vorteil.',
};

/* ── Quiz slide component ── */
const QuizSlide = ({
  quiz,
  onComplete,
}: {
  quiz: typeof QUIZ_1;
  onComplete: () => void;
}) => {
  const [chosen, setChosen] = useState<string | null>(null);
  const isCorrect = chosen === quiz.correctId;

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {quiz.label}
      </span>
      <h2 className="font-display text-lg font-bold text-foreground mb-5 leading-snug">
        {quiz.question}
      </h2>

      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full mb-5">
        {quiz.answers.map((a) => {
          const wasChosen = chosen === a.id;
          const correct = a.id === quiz.correctId;
          const showResult = chosen !== null;

          return (
            <button
              key={a.id}
              disabled={!!chosen}
              onClick={() => setChosen(a.id)}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl border-2 font-body text-sm transition-all
                ${
                  showResult && correct
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : showResult && wasChosen && !correct
                      ? 'border-red-400 bg-red-50 text-red-900'
                      : showResult
                        ? 'border-border bg-muted/30 text-muted-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                }
              `}
            >
              {a.text}
              {showResult && correct && ' ✅'}
              {showResult && wasChosen && !correct && ' ❌'}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {chosen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border-l-4 px-4 py-3 max-w-sm mx-auto w-full mb-5 ${
              isCorrect
                ? 'border-l-green-500 bg-green-50'
                : 'border-l-orange-400 bg-orange-50'
            }`}
          >
            <p
              className={`font-body text-sm leading-relaxed ${
                isCorrect ? 'text-green-800' : 'text-orange-800'
              }`}
            >
              {isCorrect ? quiz.correctFeedback : quiz.wrongFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {chosen && (
        <div className="flex justify-end mt-auto">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onComplete}
            whileTap={{ scale: 0.96 }}
            className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors"
          >
            Weiter →
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

/* ── Main lesson ── */
const Cash_F1_WhatIsCash = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts] = useState(3);
  const totalSteps = 5;
  const progress = (currentStep / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) {
      navigate('/category/festgeld');
      return;
    }
    setCurrentStep((s) => s + 1);
  };

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
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts
                  ? 'text-red-500 fill-red-500'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        {/* ── Slide 1: Erklärung ── */}
        {currentStep === 0 && (
          <motion.div
            key="s0"
            className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <span className="text-6xl mb-4">💵</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight max-w-xs">
                Cash ist König — aber was genau ist Cash?
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <p className="font-body text-[15px] leading-relaxed text-foreground mb-5">
                Cash ist alles was du sofort ausgeben kannst — Bargeld in deiner
                Tasche, Geld auf deinem Konto, oder auf einem Sparbuch. Es ist
                die liquideste Form von Geld: immer verfügbar, immer sicher.
              </p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Cash Equivalents sind fast genauso sicher — kurzfristige Anlagen
                die du schnell in Cash umwandeln kannst, wie ein
                Tagesgeldkonto.
              </p>
            </div>

            <div className="max-w-sm mx-auto w-full mt-6">
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base"
              >
                Weiter
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Slide 2: Drag & Drop Sort ── */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <CashSortGame onComplete={handleNext} />
          </motion.div>
        )}

        {/* ── Slide 3: Quiz 1 ── */}
        {currentStep === 2 && (
          <QuizSlide key="s2" quiz={QUIZ_1} onComplete={handleNext} />
        )}

        {/* ── Slide 4: Quiz 2 ── */}
        {currentStep === 3 && (
          <QuizSlide key="s3" quiz={QUIZ_2} onComplete={handleNext} />
        )}

        {/* ── Slide 5: Completion ── */}
        {currentStep === 4 && (
          <motion.div
            key="s4"
            className="flex-1 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-4 mb-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.25,
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <Star
                    size={i === 1 ? 64 : 48}
                    weight="fill"
                    className="text-[hsl(45,100%,50%)]"
                    style={{
                      filter: 'drop-shadow(0 0 12px hsl(45 100% 50% / 0.5))',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Lektion abgeschlossen! 🎉
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto mb-4 leading-relaxed">
                Du weisst jetzt was Cash und Cash Equivalents sind — und warum
                der Unterschied zu Aktien oder Immobilien im Alltag wichtig ist.
              </p>
              <motion.p
                className="font-display text-4xl font-bold text-primary"
                style={{
                  textShadow: '0 0 20px hsl(142 71% 45% / 0.3)',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 300 }}
              >
                +50 XP
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-10"
            >
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm"
              >
                Weiter lernen
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cash_F1_WhatIsCash;
