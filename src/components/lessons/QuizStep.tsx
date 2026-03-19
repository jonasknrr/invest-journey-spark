import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './LessonShared';
import type { QuizAnswer } from '@/data/topicConfig';

interface Props {
  question: string;
  answers: QuizAnswer[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
  onComplete: () => void;
  isLastQuiz?: boolean;
}

const QuizStep = ({ question, answers, correctId, correctFeedback, wrongFeedback, onComplete, isLastQuiz = true }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === correctId;

  return (
    <motion.div
      key="quiz"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex-1 flex flex-col px-6 pb-8"
    >
      <p className="font-display text-sm font-semibold text-muted-foreground text-center mt-2 mb-1">
        Quick question
      </p>
      <h2 className="font-display text-lg font-bold text-foreground text-center leading-snug mb-6 max-w-xs mx-auto">
        {question}
      </h2>

      {/* Answer cards */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-3">
        {answers.map((a) => {
          const isThis = selected === a.id;
          const isCorrectAnswer = a.id === correctId;
          let borderColor = 'border-border';
          let bg = 'bg-card';

          if (selected) {
            if (isCorrectAnswer) {
              borderColor = 'border-primary';
              bg = 'bg-primary/8';
            } else if (isThis) {
              borderColor = 'border-destructive';
              bg = 'bg-destructive/8';
            }
          }

          return (
            <motion.button
              key={a.id}
              onClick={() => !selected && setSelected(a.id)}
              whileTap={!selected ? { scale: 0.97 } : undefined}
              className={`w-full text-left rounded-2xl border-2 ${borderColor} ${bg} p-4 transition-colors flex items-center gap-3`}
            >
              <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-sm font-display font-bold text-muted-foreground flex-shrink-0 uppercase">
                {a.id}
              </span>
              <span className="font-body text-[15px] text-foreground">{a.text}</span>
              {selected && isCorrectAnswer && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-primary text-lg">
                  ✓
                </motion.span>
              )}
              {selected && isThis && !isCorrectAnswer && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-destructive text-lg">
                  ✗
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 mt-4 max-w-sm mx-auto w-full ${
              isCorrect
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-[hsl(35,95%,55%)]/10 border border-[hsl(35,95%,55%)]/20'
            }`}
          >
            <p
              className={`font-body text-sm leading-relaxed ${
                isCorrect ? 'text-primary' : 'text-[hsl(35,95%,45%)]'
              }`}
            >
              {isCorrect ? correctFeedback : wrongFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-sm mx-auto w-full mt-4"
          >
            <motion.button
              onClick={onComplete}
              whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft"
            >
              {isLastQuiz ? 'Complete lesson' : 'Next question →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizStep;
