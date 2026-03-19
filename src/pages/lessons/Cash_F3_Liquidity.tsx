import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Drag & Drop data ── */
interface DragItem {
  id: string;
  icon: string;
  label: string;
  correctTier: number;
  explanation: string;
}

const dragItems: DragItem[] = [
  { id: 'bargeld', icon: '💵', label: 'Bargeld', correctTier: 0, explanation: 'Immer sofort in der Tasche' },
  { id: 'tagesgeld', icon: '💰', label: 'Tagesgeldkonto', correctTier: 1, explanation: 'Meist am nächsten Werktag verfügbar' },
  { id: 'festgeld', icon: '📅', label: 'Festgeld (1 Jahr)', correctTier: 2, explanation: 'Gebunden bis Laufzeitende — sonst Strafzins' },
  { id: 'immobilie', icon: '🏠', label: 'Immobilie', correctTier: 3, explanation: 'Verkauf dauert oft 6–12 Monate' },
];

const tiers = [
  { label: 'Sofort verfügbar', icon: '⚡' },
  { label: 'Innerhalb von Tagen', icon: '📅' },
  { label: 'Wochen bis Monate', icon: '⏳' },
  { label: 'Monate bis Jahre', icon: '🐢' },
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
  question:
    "Dein Auto geht kaputt und du brauchst sofort CHF 2'000. Du hast dein Geld auf einem Festgeldkonto mit noch 8 Monaten Laufzeit. Was passiert?",
  answers: [
    { id: 'a', text: 'Ich hebe einfach ab — kein Problem' },
    { id: 'b', text: 'Ich muss warten bis die Laufzeit endet oder zahle eine Strafe' },
    { id: 'c', text: 'Die Bank gibt mir das Geld automatisch als Kredit' },
    { id: 'd', text: 'Festgeld ist genauso liquide wie ein Girokonto' },
  ],
  correctId: 'b',
  correctFeedback:
    'Richtig! Festgeld ist gebunden — das ist der Preis für den höheren Zins. Deshalb sollte man nie sein gesamtes Geld in illiquide Anlagen stecken.',
  wrongFeedback:
    'Nicht ganz — Festgeld ist bis zum Laufzeitende gesperrt. Wer früher raus will zahlt meist eine Vorfälligkeitsentschädigung. Liquidität hat ihren Wert!',
};

const quiz2: QuizConfig = {
  label: 'Frage 2 von 2',
  question: 'Warum sollte man immer einen Teil seines Geldes in liquiden Anlagen halten?',
  answers: [
    { id: 'a', text: 'Weil liquide Anlagen immer die höchste Rendite bringen' },
    { id: 'b', text: 'Weil man sonst keine Steuern zahlen muss' },
    { id: 'c', text: 'Um bei unerwarteten Ausgaben oder Notfällen sofort reagieren zu können' },
    { id: 'd', text: 'Liquidität spielt im Alltag keine Rolle' },
  ],
  correctId: 'c',
  correctFeedback:
    'Genau! Ein Notfallpuffer in liquiden Anlagen ist die Basis jeder soliden Finanzplanung — bevor man überhaupt ans Investieren denkt.',
  wrongFeedback:
    'Fast! Liquide Anlagen bringen weniger Rendite — aber ihr wahrer Wert zeigt sich im Notfall. Wer kein liquides Geld hat ist schnell in der Bredouille.',
};

/* ── Component ── */
const Cash_F3_Liquidity = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);

  // Step 1 — drag & drop
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const tierRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Step 2 — quiz 1
  const [q1Answer, setQ1Answer] = useState<string | null>(null);

  // Step 3 — quiz 2
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  // Step 4 — completion stars
  const [starsShown, setStarsShown] = useState(0);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const allPlaced = Object.keys(placed).length === 4;

  const showCTA = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return allPlaced;
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

  // Find which tier a touch/pointer is over
  const findTierAtPoint = (clientY: number): number | null => {
    for (let i = 0; i < tierRefs.current.length; i++) {
      const el = tierRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) return i;
    }
    return null;
  };

  const handleDrop = (itemId: string, tierIndex: number) => {
    const item = dragItems.find(d => d.id === itemId);
    if (!item) return;
    if (tierIndex === item.correctTier) {
      setPlaced(prev => ({ ...prev, [tierIndex]: itemId }));
    } else {
      setWrongShake(itemId);
      setTimeout(() => setWrongShake(null), 500);
    }
    setDragging(null);
  };

  // Items not yet placed
  const unplacedItems = dragItems.filter(
    d => !Object.values(placed).includes(d.id),
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
              <span className="mb-4" style={{ fontSize: 64 }}>💧</span>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-5">
                Wie schnell kommst du an dein Geld?
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Liquidität beschreibt wie schnell und einfach du eine Anlage in verfügbares Geld umwandeln kannst. Bargeld ist sofort da — eine Immobilie kann Monate dauern bis du sie verkauft hast.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Je liquider eine Anlage, desto schneller kannst du reagieren wenn du das Geld plötzlich brauchst — zum Beispiel bei einem Notfall oder einer unerwarteten Chance.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Der Nachteil: liquidere Anlagen bringen meist weniger Rendite. Das ist der klassische Trade-off.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Drag & Drop Liquidity Ladder */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-4 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-lg font-bold text-foreground text-center mb-4">
              Ziehe jede Anlage an die richtige Stelle
            </h2>

            {/* Tiers */}
            <div className="space-y-2 max-w-sm mx-auto w-full mb-4">
              {tiers.map((tier, ti) => {
                const placedItemId = placed[ti];
                const placedItem = placedItemId ? dragItems.find(d => d.id === placedItemId) : null;
                return (
                  <div
                    key={ti}
                    ref={el => { tierRefs.current[ti] = el; }}
                    className={`rounded-2xl border-2 border-dashed p-3 min-h-[72px] transition-colors ${
                      placedItem
                        ? 'border-green-400 bg-green-500/5'
                        : dragging
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-card'
                    }`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const itemId = e.dataTransfer.getData('text/plain');
                      if (itemId) handleDrop(itemId, ti);
                    }}
                    onPointerUp={() => {
                      // handled via document listener in drag cards
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{tier.icon}</span>
                      <span className="font-display text-sm font-bold text-foreground">{tier.label}</span>
                    </div>
                    {placedItem ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 mt-1"
                      >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30">
                          <span className="text-lg">{placedItem.icon}</span>
                          <span className="font-body text-sm font-medium text-green-700 dark:text-green-300">{placedItem.label}</span>
                          <span className="text-green-600">✅</span>
                        </span>
                        <span className="font-body text-[11px] text-muted-foreground italic flex-1">
                          {placedItem.explanation}
                        </span>
                      </motion.div>
                    ) : (
                      <p className="font-body text-xs text-muted-foreground/50">Hierher ziehen…</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unplaced cards */}
            {unplacedItems.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto w-full mb-4">
                {unplacedItems.map(item => (
                  <DragCard
                    key={item.id}
                    item={item}
                    isShaking={wrongShake === item.id}
                    onDragStart={() => setDragging(item.id)}
                    onDragEnd={(clientY) => {
                      const tierIndex = findTierAtPoint(clientY);
                      if (tierIndex !== null) {
                        handleDrop(item.id, tierIndex);
                      }
                      setDragging(null);
                    }}
                    onNativeDragStart={() => setDragging(item.id)}
                    onNativeDragEnd={() => setDragging(null)}
                  />
                ))}
              </div>
            )}

            {/* Success banner */}
            <AnimatePresence>
              {allPlaced && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 max-w-sm mx-auto w-full text-center"
                >
                  <p className="font-body text-sm text-green-700 dark:text-green-300 font-semibold">
                    Perfekt! Du kennst jetzt die Liquiditäts-Leiter. ✅
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
              Du weisst jetzt was Liquidität bedeutet und warum ein Teil deines Geldes immer sofort verfügbar sein sollte — egal wie gut andere Anlagen klingen.
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

/* ── Drag Card sub-component ── */
interface DragCardProps {
  item: DragItem;
  isShaking: boolean;
  onDragStart: () => void;
  onDragEnd: (clientY: number) => void;
  onNativeDragStart: () => void;
  onNativeDragEnd: () => void;
}

function DragCard({ item, isShaking, onDragStart, onDragEnd, onNativeDragStart, onNativeDragEnd }: DragCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY, sx: 0, sy: 0 };
    setOffset({ x: 0, y: 0 });
    onDragStart();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    startPos.current = null;
    setOffset(null);
    onDragEnd(e.clientY);
  };

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={e => {
        (e as React.DragEvent).dataTransfer?.setData('text/plain', item.id);
        onNativeDragStart();
      }}
      onDragEnd={() => onNativeDragEnd()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
        zIndex: offset ? 50 : 1,
        touchAction: 'none',
      }}
      className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isShaking
          ? 'border-red-400 bg-red-500/10'
          : offset
            ? 'border-primary bg-primary/5 shadow-lg'
            : 'border-border bg-card shadow-card'
      }`}
    >
      <span className="text-xl">{item.icon}</span>
      <span className="font-display text-sm font-bold text-foreground">{item.label}</span>
    </div>
  );
}

export default Cash_F3_Liquidity;
