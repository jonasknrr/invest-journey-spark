import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Star } from "@phosphor-icons/react";
import CashSortGame from "@/components/lessons/CashSortGame";
import { useProgressStore } from "@/hooks/useProgressStore";
import NoHeartsOverlay from "@/components/lessons/NoHeartsOverlay";
import CompletionXP from "@/components/lessons/CompletionXP";

const BLUE = "#1A56DB";
const TOTAL_STEPS = 6;
const LESSON_ID = "festgeld-f1";

/* ── Quiz data ── */
const QUIZ_1 = {
  label: "Question 1 of 3",
  question: "You need CHF 500 tomorrow morning for an urgent repair. Which option helps you the fastest?",
  answers: [
    { id: "a", text: "Sell your stocks" },
    { id: "b", text: "Sell your property" },
    { id: "c", text: "Withdraw money from your checking account" },
    { id: "d", text: "Break your fixed deposit early" },
  ],
  correctId: "c",
  correctFeedback: "Correct! Your checking account is instantly available — no waiting, no fees, no risk.",
  wrongFeedback:
    "Close! Stocks, property, and fixed deposits take time or incur costs. Cash in your account is available immediately.",
};

const QUIZ_2 = {
  label: "Question 2 of 3",
  question: "What distinguishes cash from a stock?",
  answers: [
    { id: "a", text: "Cash earns higher returns than stocks" },
    {
      id: "b",
      text: "Cash is always instantly available and doesn't suddenly lose significant value",
    },
    { id: "c", text: "Stocks are safer than cash" },
    { id: "d", text: "There is no significant difference" },
  ],
  correctId: "b",
  correctFeedback:
    "Exactly! Cash is stable and instantly available, on the other side stocks can fluctuate and take some time to sell.",
  wrongFeedback:
    "Not quite — cash doesn't shine through returns, but through safety and instant availability. That's its greatest advantage.",
};

const QUIZ_3 = {
  label: "Question 3 of 3",
  question:
    "Besides physical banknotes and coins, which of the following is also considered a highly liquid 'cash equivalent'?",
  answers: [
    { id: "a", text: "A long-term real estate investment" },
    { id: "b", text: "A volatile cryptocurrency" },
    { id: "c", text: "A call money account (savings account)" },
    { id: "d", text: "A 10-year government bond" },
  ],
  correctId: "c",
  correctFeedback: "Correct! A call money account is highly liquid and safe — making it a classic cash equivalent.",
  wrongFeedback:
    "Not quite — real estate, crypto, and long-term bonds are not easily or quickly convertible to cash without risk. A call money account is the closest to cash.",
};

/* ── Quiz slide component ── */
const QuizSlide = ({
  quiz,
  onComplete,
  onWrongAnswer,
}: {
  quiz: typeof QUIZ_1;
  onComplete: () => void;
  onWrongAnswer: () => void;
}) => {
  const [chosen, setChosen] = useState<string | null>(null);
  const isCorrect = chosen === quiz.correctId;

  const handleChoose = (id: string) => {
    if (chosen) return;
    setChosen(id);
    if (id !== quiz.correctId) {
      onWrongAnswer();
    }
  };

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
      <h2 className="font-display text-lg font-bold text-foreground mb-5 leading-snug">{quiz.question}</h2>

      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full mb-5">
        {quiz.answers.map((a) => {
          const wasChosen = chosen === a.id;
          const correct = a.id === quiz.correctId;
          const showResult = chosen !== null;

          return (
            <button
              key={a.id}
              disabled={!!chosen}
              onClick={() => handleChoose(a.id)}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl border-2 font-body text-sm transition-all
                ${
                  showResult && correct
                    ? "border-green-500 bg-green-50 text-green-900"
                    : showResult && wasChosen && !correct
                      ? "border-red-400 bg-red-50 text-red-900"
                      : showResult
                        ? "border-border bg-muted/30 text-muted-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                }
              `}
            >
              {a.text}
              {showResult && correct && " ✅"}
              {showResult && wasChosen && !correct && " ❌"}
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
              isCorrect ? "border-l-green-500 bg-green-50" : "border-l-orange-400 bg-orange-50"
            }`}
          >
            <p className={`font-body text-sm leading-relaxed ${isCorrect ? "text-green-800" : "text-orange-800"}`}>
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
            Next →
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

/* ── Main lesson ── */
const Cash_F1_WhatIsCash = () => {
  const navigate = useNavigate();
  const { updateLessonProgress, completeLesson } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<"none" | "showing">("none");
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number;
    streakBonus: number;
    isFirstCompletion: boolean;
    newStreak: number;
  } | null>(null);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress(LESSON_ID, Math.min(currentStep / (TOTAL_STEPS - 1), 1));
  }, [currentStep]);

  // No hearts
  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen("showing");
      try {
        navigator.vibrate?.([300, 100, 300]);
      } catch {}
    }
  }, [hearts]);

  // Completion
  useEffect(() => {
    if (currentStep === TOTAL_STEPS - 1 && !completionResult) {
      const r = completeLesson(LESSON_ID, hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const handleWrongAnswer = () => {
    setHearts((h) => Math.max(0, h - 1));
  };

  const handleNext = () => {
    if (currentStep >= TOTAL_STEPS - 1) {
      navigate("/category/festgeld");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* No hearts overlay */}
      {noHeartsScreen === "showing" && (
        <NoHeartsOverlay
          onRestart={() => {
            setHearts(3);
            setCurrentStep(0);
            setNoHeartsScreen("none");
          }}
          onQuizOnly={() => {
            setHearts(3);
            setCurrentStep(2);
            setNoHeartsScreen("none");
          }}
          onContinue={() => {
            setNoHeartsScreen("none");
          }}
        />
      )}

      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/category/festgeld")}
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
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        {/* ── Slide 1: Explanation ── */}
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
                Cash is king — but what exactly is cash?
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <p className="font-body text-[15px] leading-relaxed text-foreground mb-5">
                Cash is everything you can spend immediately — banknotes in your pocket, money in your account, or in a
                savings book. It is the most liquid form of money: always available, always safe.
              </p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Cash equivalents are almost as safe — short-term investments you can quickly convert into cash, like a
                call money account.
              </p>
            </div>

            <div className="max-w-sm mx-auto w-full mt-6">
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base"
              >
                Continue
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
          <QuizSlide key="s2" quiz={QUIZ_1} onComplete={handleNext} onWrongAnswer={handleWrongAnswer} />
        )}

        {/* ── Slide 4: Quiz 2 ── */}
        {currentStep === 3 && (
          <QuizSlide key="s3" quiz={QUIZ_2} onComplete={handleNext} onWrongAnswer={handleWrongAnswer} />
        )}

        {/* ── Slide 5: Quiz 3 ── */}
        {currentStep === 4 && (
          <QuizSlide key="s4" quiz={QUIZ_3} onComplete={handleNext} onWrongAnswer={handleWrongAnswer} />
        )}

        {/* ── Slide 6: Completion ── */}
        {currentStep === 5 && (
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
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <Star
                    size={i === 1 ? 64 : 48}
                    weight="fill"
                    className="text-[hsl(45,100%,50%)]"
                    style={{
                      filter: "drop-shadow(0 0 12px hsl(45 100% 50% / 0.5))",
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center flex flex-col items-center"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete! 🎉</h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto mb-4 leading-relaxed">
                You now know what cash and cash equivalents are — and why the difference to stocks or real estate
                matters in everyday life.
              </p>
              <CompletionXP result={completionResult} hearts={hearts} />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-10">
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm"
              >
                Continue learning
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cash_F1_WhatIsCash;
