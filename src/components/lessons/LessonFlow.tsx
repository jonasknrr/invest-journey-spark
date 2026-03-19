import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import type { TopicConfig } from '@/data/topicConfig';
import { StepDots, CompletionOverlay } from './LessonShared';
import ExplanationStep from './ExplanationStep';
import QuizStep from './QuizStep';
import { visualRegistry } from './visuals';

interface Props {
  config: TopicConfig;
}

const LessonFlow = ({ config }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const VisualComponent = visualRegistry[config.visualKey];

  const quizList = config.quizzes ?? [config.quiz];
  const currentQuiz = quizList[quizIndex];
  const totalDots = 1 + 1 + quizList.length;
  const currentDot = step === 2 ? 2 + quizIndex : step;

  const handleQuizComplete = () => {
    if (quizIndex < quizList.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowCompletion(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-5 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1">
          <StepDots current={currentDot} total={totalDots} />
        </div>
        <div className="w-10" />
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <ExplanationStep
            key="s1"
            title={config.title}
            subtitle={config.subtitle}
            iconName={config.iconName}
            iconColor={config.iconColor}
            iconBgColor={config.iconBgColor}
            mainText={config.explanation.mainText}
            secondaryText={config.explanation.secondaryText}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && VisualComponent && (
          <VisualComponent key="s2" onNext={() => setStep(2)} />
        )}
        {step === 2 && currentQuiz && (
          <>
            {quizList.length > 1 && (
              <p className="font-body text-xs text-muted-foreground text-center mt-2">
                Question {quizIndex + 1} of {quizList.length}
              </p>
            )}
            <QuizStep
              key={"quiz-" + quizIndex}
              question={currentQuiz.question}
              answers={currentQuiz.answers}
              correctId={currentQuiz.correctId}
              correctFeedback={currentQuiz.correctFeedback}
              wrongFeedback={currentQuiz.wrongFeedback}
              onComplete={handleQuizComplete}
              isLastQuiz={quizIndex === quizList.length - 1}
            />
          </>
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionOverlay onDone={() => navigate(`/challenge/${config.levelId}`)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonFlow;
