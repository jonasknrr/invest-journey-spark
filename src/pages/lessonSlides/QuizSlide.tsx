import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Answer {
  id: string;
  text: string;
}

interface Props {
  label: string;
  question: string;
  answers: Answer[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
  onAnswered: () => void;
}

const QuizSlide = ({ label, question, answers, correctId, correctFeedback, wrongFeedback, onAnswered }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    onAnswered();
  };

  const isCorrect = selected === correctId;

  return (
    <motion.div
      className="flex-1 flex flex-col px-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </span>
      <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
        {question}
      </h2>

      <div className="flex flex-col gap-3 flex-1">
        {answers.map((a) => {
          let cardClass = 'border-border bg-card';
          if (selected) {
            if (a.id === correctId) cardClass = 'border-green-500 bg-green-500/10';
            else if (a.id === selected) cardClass = 'border-red-500 bg-red-500/10';
          }

          return (
            <motion.button
              key={a.id}
              onClick={() => handleSelect(a.id)}
              disabled={!!selected}
              whileTap={!selected ? { scale: 0.97 } : undefined}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cardClass}`}
            >
              <span className="font-body text-[15px] text-foreground">{a.text}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-2xl ${
              isCorrect
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-orange-500/10 border border-orange-500/30'
            }`}
          >
            <p className={`font-body text-sm leading-relaxed ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
              {isCorrect ? correctFeedback : wrongFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizSlide;
