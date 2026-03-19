import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 6;

/* ── Drag & Drop data ── */
interface DragItem {
  id: string;
  icon: string;
  label: string;
  correctTier: number;
  explanation: string;
}

const dragItems: DragItem[] = [
  { id: 'bargeld', icon: '💵', label: 'Cash', correctTier: 0, explanation: 'Always instantly in your pocket' },
  { id: 'tagesgeld', icon: '💰', label: 'Call money account', correctTier: 1, explanation: 'Usually available next business day' },
  { id: 'festgeld', icon: '📅', label: 'Fixed deposit (1 year)', correctTier: 2, explanation: 'Locked until maturity — otherwise penalty' },
  { id: 'immobilie', icon: '🏠', label: 'Real estate', correctTier: 3, explanation: 'Sale often takes 6–12 months' },
];

const tiers = [
  { label: 'Instantly available', icon: '⚡' },
  { label: 'Within days', icon: '📅' },
  { label: 'Weeks to months', icon: '⏳' },
  { label: 'Months to years', icon: '🐢' },
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
  question:
    "Your car breaks down and you need CHF 2'000 immediately. Your money is in a fixed deposit with 8 months remaining. What happens?",
  answers: [
    { id: 'a', text: 'I simply withdraw it — no problem' },
    { id: 'b', text: 'I have to wait until maturity or pay a penalty' },
    { id: 'c', text: 'The bank automatically gives me the money as a loan' },
    { id: 'd', text: 'Fixed deposit is just as liquid as a checking account' },
  ],
  correctId: 'b',
  correctFeedback:
    'Correct! Fixed deposit is locked — that\'s the price for the higher interest. That\'s why you should never put all your money in illiquid investments.',
  wrongFeedback:
    'Not quite — fixed deposit is locked until maturity. Getting out early usually means paying an early withdrawal penalty. Liquidity has its value!',
};

const quiz2: QuizConfig = {
  label: 'Question 2 of 3',
  question: 'Why should you always keep part of your money in liquid investments?',
  answers: [
    { id: 'a', text: 'Because liquid investments always offer the highest returns' },
    { id: 'b', text: 'Because otherwise you don\'t have to pay taxes' },
    { id: 'c', text: 'To be able to react immediately to unexpected expenses or emergencies' },
    { id: 'd', text: 'Liquidity plays no role in everyday life' },
  ],
  correctId: 'c',
  correctFeedback:
    'Exactly! An emergency buffer in liquid investments is the foundation of any solid financial plan — before you even think about investing.',
  wrongFeedback:
    'Close! Liquid investments earn less return — but their true value shows in emergencies. Without liquid money, you can quickly end up in trouble.',
};

/* ── Component ── */
const Cash_F3_Liquidity = () => {
  const navigate = useNavigate();
  const { updateLessonProgress, completeLesson } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);

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

  // Track progress
  useEffect(() => {
    updateLessonProgress('festgeld-f3', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('festgeld-f3', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

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
                How quickly can you access your money?
              </h2>
              <p className="font-body text-base text-foreground leading-relaxed mb-4">
                Liquidity describes how quickly and easily you can convert an investment into available cash. Cash is instant — selling real estate can take months.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                The more liquid an investment, the faster you can react when you suddenly need the money — for example in an emergency or an unexpected opportunity.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                The downside: more liquid investments usually earn lower returns. That's the classic trade-off.
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
              Drag each investment to the right spot
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
                      <p className="font-body text-xs text-muted-foreground/50">Drag here…</p>
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
                    Perfect! You now know the liquidity ladder. ✅
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
              Lesson complete! 🎉
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-xs">
              You now know what liquidity means and why part of your money should always be instantly available — no matter how good other investments sound.
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
              {currentStep === 4 ? 'Next lesson →' : 'Continue →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setPlaced({}); setQ1Answer(null); setQ2Answer(null); setStarsShown(0); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setQ1Answer(null); setQ2Answer(null); setNoHeartsScreen('none'); setCompletionResult(null); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
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
