import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Bucket = 'cash' | 'equivalent' | 'nein';

interface CardItem {
  id: string;
  emoji: string;
  label: string;
  correctBucket: Bucket;
}

const CARDS: CardItem[] = [
  { id: 'bargeld', emoji: '💵', label: 'Cash', correctBucket: 'cash' },
  { id: 'girokonto', emoji: '🏦', label: 'Checking account', correctBucket: 'cash' },
  { id: 'sparbuch', emoji: '📗', label: 'Savings book', correctBucket: 'equivalent' },
  { id: 'tagesgeld', emoji: '💰', label: 'Call money account', correctBucket: 'equivalent' },
  { id: 'immobilie', emoji: '🏠', label: 'Real estate', correctBucket: 'nein' },
  { id: 'aktien', emoji: '📈', label: 'Stocks', correctBucket: 'nein' },
];

const BUCKETS: { id: Bucket; label: string; emoji: string }[] = [
  { id: 'cash', label: 'Cash', emoji: '💵' },
  { id: 'equivalent', label: 'Cash Equivalent', emoji: '🏦' },
  { id: 'nein', label: 'No Cash', emoji: '❌' },
];

interface Props {
  onComplete: () => void;
}

const CashSortGame = ({ onComplete }: Props) => {
  const [unsorted, setUnsorted] = useState<CardItem[]>(() =>
    [...CARDS].sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [sorted, setSorted] = useState<Record<Bucket, CardItem[]>>({
    cash: [],
    equivalent: [],
    nein: [],
  });
  const [flash, setFlash] = useState<{ id: string; correct: boolean } | null>(null);
  const [allDone, setAllDone] = useState(false);

  const handleSelectCard = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleDropIntoBucket = useCallback(
    (bucket: Bucket) => {
      if (!selected) return;
      const card = unsorted.find((c) => c.id === selected);
      if (!card) return;

      if (card.correctBucket === bucket) {
        // Correct
        setFlash({ id: card.id, correct: true });
        setTimeout(() => {
          setUnsorted((prev) => prev.filter((c) => c.id !== card.id));
          setSorted((prev) => {
            const next = { ...prev, [bucket]: [...prev[bucket], card] };
            const totalSorted =
              next.cash.length + next.equivalent.length + next.nein.length;
            if (totalSorted === CARDS.length) {
              setTimeout(() => setAllDone(true), 400);
            }
            return next;
          });
          setSelected(null);
          setFlash(null);
        }, 500);
      } else {
        // Wrong
        setFlash({ id: card.id, correct: false });
        setTimeout(() => {
          setSelected(null);
          setFlash(null);
        }, 600);
      }
    },
    [selected, unsorted]
  );

  return (
    <div className="flex-1 flex flex-col px-5 py-4 overflow-y-auto">
      <h2 className="font-display text-lg font-bold text-foreground text-center mb-4">
        Sort the cards into the correct buckets
      </h2>

      {/* Unsorted cards */}
      <div className="flex flex-wrap gap-2 justify-center mb-5 min-h-[80px]">
        <AnimatePresence>
          {unsorted.map((card) => {
            const isSelected = selected === card.id;
            const isFlashing = flash?.id === card.id;
            const flashCorrect = isFlashing && flash?.correct;
            const flashWrong = isFlashing && !flash?.correct;

            return (
              <motion.button
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: flashWrong ? [1, 1.05, 0.95, 1] : 1,
                  x: flashWrong ? [0, -6, 6, -4, 4, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
                onClick={() => !isFlashing && handleSelectCard(card.id)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
                  transition-colors border-2
                  ${flashCorrect
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : flashWrong
                      ? 'bg-red-100 border-red-400 text-red-800'
                      : isSelected
                        ? 'bg-primary/10 border-primary text-foreground shadow-md'
                        : 'bg-card border-border text-foreground'
                  }
                `}
              >
                <span className="text-xl">{card.emoji}</span>
                {card.label}
                {flashCorrect && <span className="ml-1">✅</span>}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Buckets */}
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => handleDropIntoBucket(bucket.id)}
            className={`
              w-full rounded-2xl border-2 border-dashed p-3 text-center transition-all
              ${selected
                ? 'border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                : 'border-border bg-muted/30 cursor-default'
              }
            `}
          >
            <p className="font-display text-sm font-bold text-foreground mb-1.5">
              {bucket.emoji} {bucket.label}
            </p>
            {sorted[bucket.id].length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {sorted[bucket.id].map((card) => (
                  <span
                    key={card.id}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >
                    {card.emoji} {card.label} ✅
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-sm mx-auto w-full"
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
              <p className="font-display text-sm font-bold text-green-800">
                🎉 Perfect! You now know the difference.
              </p>
            </div>
            <motion.button
              onClick={onComplete}
              whileTap={{ scale: 0.96 }}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm"
            >
              Weiter
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CashSortGame;
