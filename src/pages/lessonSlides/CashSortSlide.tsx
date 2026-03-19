import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CashSortSlideProps {
  onComplete: () => void;
}

interface CardItem {
  id: string;
  emoji: string;
  label: string;
  correctBucket: 'cash' | 'equivalent' | 'none';
}

const CARDS: CardItem[] = [
  { id: 'bargeld', emoji: '💵', label: 'Bargeld', correctBucket: 'cash' },
  { id: 'girokonto', emoji: '🏦', label: 'Girokonto', correctBucket: 'cash' },
  { id: 'sparbuch', emoji: '📗', label: 'Sparbuch', correctBucket: 'equivalent' },
  { id: 'immobilie', emoji: '🏠', label: 'Immobilie', correctBucket: 'none' },
  { id: 'aktien', emoji: '📈', label: 'Aktien', correctBucket: 'none' },
  { id: 'tagesgeld', emoji: '💰', label: 'Tagesgeldkonto', correctBucket: 'equivalent' },
];

const BUCKETS = [
  { id: 'cash' as const, label: 'Cash 💵' },
  { id: 'equivalent' as const, label: 'Cash Equivalent 🏦' },
  { id: 'none' as const, label: 'Kein Cash ❌' },
];

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CashSortSlide = ({ onComplete }: CashSortSlideProps) => {
  const [shuffledCards] = useState(() => shuffle(CARDS));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const completedRef = useRef(false);

  const unplacedCards = shuffledCards.filter(c => !placed[c.id]);

  const handleDrop = (cardId: string, bucketId: string) => {
    const card = CARDS.find(c => c.id === cardId);
    if (!card) return;

    if (card.correctBucket === bucketId) {
      const newPlaced = { ...placed, [cardId]: bucketId };
      setPlaced(newPlaced);
      setDraggedCard(null);

      // Check if all placed
      if (Object.keys(newPlaced).length === CARDS.length && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => {
          setAllCorrect(true);
          onComplete();
        }, 400);
      }
    } else {
      setWrongFlash(cardId);
      try { navigator.vibrate?.(100); } catch {}
      setTimeout(() => {
        setWrongFlash(null);
        setDraggedCard(null);
      }, 400);
    }
  };

  // Touch/click-based: tap card to select, tap bucket to place
  const handleCardTap = (cardId: string) => {
    if (placed[cardId]) return;
    setDraggedCard(prev => prev === cardId ? null : cardId);
  };

  const handleBucketTap = (bucketId: string) => {
    if (!draggedCard) return;
    handleDrop(draggedCard, bucketId);
  };

  const getBucketCards = (bucketId: string) =>
    CARDS.filter(c => placed[c.id] === bucketId);

  return (
    <motion.div
      key="cashSort"
      className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
        Sortiere die Karten in die richtigen Töpfe
      </h2>
      <p className="font-body text-sm text-muted-foreground text-center mb-5">
        Tippe eine Karte an, dann den passenden Topf
      </p>

      <div className="max-w-sm mx-auto w-full space-y-4">
        {/* Unplaced cards */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
          <AnimatePresence>
            {unplacedCards.map(card => (
              <motion.button
                key={card.id}
                layout
                onClick={() => handleCardTap(card.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  borderColor: draggedCard === card.id
                    ? 'hsl(var(--primary))'
                    : wrongFlash === card.id
                    ? 'hsl(0, 72%, 51%)'
                    : 'hsl(var(--border))',
                  backgroundColor: wrongFlash === card.id
                    ? 'hsl(0, 72%, 51%, 0.1)'
                    : draggedCard === card.id
                    ? 'hsl(var(--primary) / 0.08)'
                    : 'hsl(var(--card))',
                }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-2xl border-2 font-display text-sm font-bold text-foreground flex items-center gap-2 transition-shadow"
                style={{
                  boxShadow: draggedCard === card.id ? '0 0 0 3px hsl(var(--primary) / 0.2)' : 'none',
                }}
              >
                <span className="text-lg">{card.emoji}</span>
                {card.label}
              </motion.button>
            ))}
          </AnimatePresence>
          {unplacedCards.length === 0 && !allCorrect && (
            <p className="text-sm text-muted-foreground font-body">Alle Karten platziert!</p>
          )}
        </div>

        {/* Buckets */}
        <div className="space-y-3">
          {BUCKETS.map(bucket => {
            const bucketCards = getBucketCards(bucket.id);
            const isTarget = draggedCard !== null;
            return (
              <motion.button
                key={bucket.id}
                onClick={() => handleBucketTap(bucket.id)}
                disabled={!isTarget}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-colors ${
                  isTarget
                    ? 'border-primary/50 bg-primary/5 cursor-pointer'
                    : 'border-border bg-card'
                }`}
                whileTap={isTarget ? { scale: 0.98 } : undefined}
              >
                <p className="font-display text-sm font-bold text-foreground mb-2">
                  {bucket.label}
                </p>
                {bucketCards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {bucketCards.map(c => (
                      <motion.span
                        key={c.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 font-display text-xs font-bold"
                      >
                        {c.emoji} {c.label} ✅
                      </motion.span>
                    ))}
                  </div>
                )}
                {bucketCards.length === 0 && (
                  <p className="font-body text-xs text-muted-foreground/60">
                    Karten hierhin sortieren
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Success banner */}
        {allCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center"
          >
            <p className="font-display font-bold text-green-700 dark:text-green-300">
              Perfekt! Du kennst jetzt den Unterschied. 🎉
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CashSortSlide;
