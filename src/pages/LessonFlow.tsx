import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import StorySlide from './lessonSlides/StorySlide';
import PizzaSlide from './lessonSlides/PizzaSlide';
import ScaleSlide from './lessonSlides/ScaleSlide';
import RiskChartSlide from './lessonSlides/RiskChartSlide';
import TimeChartSlide from './lessonSlides/TimeChartSlide';
import CrashSlide from './lessonSlides/CrashSlide';
import DividendSlide from './lessonSlides/DividendSlide';
import QuizSlide from './lessonSlides/QuizSlide';
import CompletionSlide from './lessonSlides/CompletionSlide';
import CashSortSlide from './lessonSlides/CashSortSlide';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const TOTAL_STEPS = 5;

interface LessonConfig {
  story: { emoji: string; title: string; mainText: string; secondaryText: string };
  interactionType: 'pizza' | 'scale' | 'riskChart' | 'timeChart' | 'crash' | 'dividend' | 'cashSort';
  quiz1: {
    label: string;
    question: string;
    answers: { id: string; text: string }[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
  quiz2: {
    label: string;
    question: string;
    answers: { id: string; text: string }[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
  completionSubtitle: string;
}

const lessonConfigs: Record<string, LessonConfig> = {
  f1: {
    story: {
      emoji: '💵',
      title: 'Cash is king — but what exactly is cash?',
      mainText: 'Cash is everything you can spend immediately — banknotes in your pocket, money in your account, or in a savings book. It\'s the most liquid form of money: always available, always safe.',
      secondaryText: 'Cash equivalents are nearly as safe — short-term investments you can quickly convert to cash, like a call money account.',
    },
    interactionType: 'cashSort',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'You need CHF 500 tomorrow morning for an urgent repair. Which option helps you fastest?',
      answers: [
        { id: 'a', text: 'Sell your stocks' },
        { id: 'b', text: 'Sell your property' },
        { id: 'c', text: 'Withdraw money from your checking account' },
        { id: 'd', text: 'Break your fixed deposit early' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! The checking account is instantly available — no waiting, no fees, no risk.',
      wrongFeedback: 'Close! Stocks, property and fixed deposits require time or come with costs. Cash in your account is available right away.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'What distinguishes cash from a stock?',
      answers: [
        { id: 'a', text: 'Cash generates more return than stocks' },
        { id: 'b', text: 'Cash is always instantly available and doesn\'t suddenly lose significant value' },
        { id: 'c', text: 'Stocks are safer than cash' },
        { id: 'd', text: 'There is no significant difference' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Cash is stable and instantly available — stocks can fluctuate significantly and take time to sell.',
      wrongFeedback: 'Not quite — cash doesn\'t shine through returns, but through safety and instant availability. That\'s its greatest advantage.',
    },
    completionSubtitle: 'You now know what cash and cash equivalents are — and why the difference to stocks or real estate matters in everyday life.',
  },
  a1: {
    story: {
      emoji: '🏢',
      title: 'Imagine buying a piece of your favourite company',
      mainText: 'When you buy a stock, you own a small piece of a company. If the company grows in value, so does your stock — you directly benefit from its success.',
      secondaryText: 'Companies sell stocks to raise money for growth — instead of taking out a loan.',
    },
    interactionType: 'pizza',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'What happens when you buy a stock?',
      answers: [
        { id: 'a', text: 'You lend the company money' },
        { id: 'b', text: 'You become a co-owner of the company' },
        { id: 'c', text: 'You receive a fixed monthly payment' },
        { id: 'd', text: 'The company belongs entirely to you' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! As a shareholder you\'re a co-owner — the company\'s success is also your success.',
      wrongFeedback: 'Close! A stock makes you a co-owner — not a creditor or sole owner.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'AlphaFirma AG\'s valuation rises this year. What happens to your stock?',
      answers: [
        { id: 'a', text: 'Nothing — that doesn\'t affect me' },
        { id: 'b', text: 'It becomes more valuable' },
        { id: 'c', text: 'I have to pay more for it' },
        { id: 'd', text: 'The stock disappears' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! The company\'s valuation rises, and so does your share — you directly benefit as a co-owner.',
      wrongFeedback: 'Close! You\'re a co-owner — their gain is also your gain. The price rises when the company does well.',
    },
    completionSubtitle: 'You now know what a stock is and why it makes you a co-owner of a company.',
  },
  a2: {
    story: {
      emoji: '📈',
      title: 'Your money works for you',
      mainText: 'A return is the profit you make on your investment. With stocks, it comes in two ways: the stock price rises — or the company regularly pays you part of its profits, called a dividend.',
      secondaryText: 'Historically, stocks have almost always gained value over the long term — because companies grow.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'How is the price of a stock determined?',
      answers: [
        { id: 'a', text: 'The company sets it' },
        { id: 'b', text: 'The government determines it' },
        { id: 'c', text: 'Supply and demand from buyers and sellers' },
        { id: 'd', text: 'It always stays the same' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! Millions of transactions every second determine the price — nobody sets it alone.',
      wrongFeedback: 'Not quite — no single entity determines the price. It\'s created by the interplay of buyers and sellers.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'A well-known company announces a revolutionary new product. What likely happens to the stock price?',
      answers: [
        { id: 'a', text: 'It drops — the company spent money' },
        { id: 'b', text: 'It stays the same' },
        { id: 'c', text: 'It rises — more people want to buy the stock' },
        { id: 'd', text: 'The exchange closes' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Good news creates more demand — and more demand drives the price up.',
      wrongFeedback: 'Close! Good news means more buyers. More buyers = higher price. That\'s how the market reacts every day.',
    },
    completionSubtitle: 'You now understand how returns are generated and why a stock\'s price constantly fluctuates.',
  },
  a3: {
    story: {
      emoji: '⚠️',
      title: 'Higher potential — but also higher risk',
      mainText: 'Stocks can rise in value — but also fall. These fluctuations are called volatility. The greater the potential return, the greater the risk usually is.',
      secondaryText: 'A young startup stock can double or go to zero. A large established company fluctuates much more steadily.',
    },
    interactionType: 'riskChart',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'What does high volatility mean for a stock?',
      answers: [
        { id: 'a', text: 'The stock always rises' },
        { id: 'b', text: 'The price fluctuates strongly — up and down' },
        { id: 'c', text: 'The stock is very safe' },
        { id: 'd', text: 'The company pays high dividends' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Volatility means strong fluctuations — it can be an opportunity or a risk, depending on timing.',
      wrongFeedback: 'Not quite — volatility describes how strongly a price fluctuates, not whether it rises or falls.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'You need your money back in exactly 1 year. Which stock do you choose?',
      answers: [
        { id: 'a', text: 'RocketStartup AG — could double' },
        { id: 'b', text: 'StableBank AG — steady trajectory' },
        { id: 'c', text: 'Both, half and half' },
        { id: 'd', text: 'Better not to invest at all' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfect! When you need the money soon, stability matters more than maximum upside.',
      wrongFeedback: 'Careful — RocketStartup could be at -60% in a year. High risk also means high potential for loss.',
    },
    completionSubtitle: 'You now understand the difference between high-risk and stable stocks.',
  },
  a4: {
    story: {
      emoji: '💰',
      title: 'Earn money just by holding',
      mainText: 'Some companies regularly distribute part of their profits to shareholders — that\'s called a dividend. You don\'t need to sell anything, do nothing — just hold the stock and you automatically receive payouts.',
      secondaryText: 'Not all companies pay dividends — large, established companies do it more often than young growth companies.',
    },
    interactionType: 'dividend',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'What is a dividend?',
      answers: [
        { id: 'a', text: 'A loan the company gives you' },
        { id: 'b', text: 'A portion of the company\'s profit paid to shareholders' },
        { id: 'c', text: 'The price you pay for a stock' },
        { id: 'd', text: 'A penalty when the price drops' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Dividends are your share of the company\'s profit — simply because you\'re a shareholder.',
      wrongFeedback: 'Close! A dividend is not a debt or a price — it\'s your share of the company\'s profit, paid simply because you hold the stock.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'You hold a stock that pays 4% dividend per year. What do you need to do to receive the dividend?',
      answers: [
        { id: 'a', text: 'Sell the stock at the right time' },
        { id: 'b', text: 'Buy more every month' },
        { id: 'c', text: 'Nothing — just hold the stock' },
        { id: 'd', text: 'Ask the company for a payout' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Dividends are paid automatically — you just need to be a shareholder and hold the stock.',
      wrongFeedback: 'Close! You don\'t need to do anything — dividends are automatically paid to all shareholders, simply by holding the stock.',
    },
    completionSubtitle: 'You now know what dividends are and how passive income is generated simply by holding stocks.',
  },
  a6: {
    story: {
      emoji: '⏳',
      title: 'Time is your greatest advantage',
      mainText: 'Stocks fluctuate daily — sometimes strongly. But the longer you stay invested, the more these fluctuations even out. Historically, broadly diversified portfolios have almost always achieved positive returns over long periods.',
      secondaryText: 'Time in the market almost always beats timing the market.',
    },
    interactionType: 'timeChart',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'What does the AlphaIndex chart show over a period of 20 years?',
      answers: [
        { id: 'a', text: 'The price always fell' },
        { id: 'b', text: 'The price was always stable without fluctuations' },
        { id: 'c', text: 'Despite crashes, a long-term upward trend is visible' },
        { id: 'd', text: 'There was no change' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! In the short term the market is unpredictable — in the long term it tends upward.',
      wrongFeedback: 'Look at the 20-year chart again — despite significant crashes, a clear upward trend is visible.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'The market just crashed 30%. You don\'t need the money for 15 years. What do you do?',
      answers: [
        { id: 'a', text: 'Sell everything immediately — before it gets worse' },
        { id: 'b', text: 'Stay invested and wait patiently' },
        { id: 'c', text: 'Buy even more on credit' },
        { id: 'd', text: 'Convert everything to gold' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfect! Losses only become real when you sell. With a 15-year horizon, the market almost always has time to recover.',
      wrongFeedback: 'That\'s the most expensive mistake — panic selling realises the loss. Time is your greatest advantage as an investor.',
    },
    completionSubtitle: 'You now know why patience is one of the most important qualities of a good investor.',
  },
  a5: {
    story: {
      emoji: '🥚',
      title: 'Don\'t put all your eggs in one basket',
      mainText: 'If you invest everything in a single stock, you depend entirely on that one company. If you spread your money across many different stocks from different sectors, your risk decreases significantly — because they don\'t all fall at the same time.',
      secondaryText: 'Diversification is the only free risk reduction that exists.',
    },
    interactionType: 'crash',
    quiz1: {
      label: 'Question 1 of 2',
      question: 'Why does diversification protect your portfolio?',
      answers: [
        { id: 'a', text: 'Because you have more money' },
        { id: 'b', text: 'Because different sectors don\'t all fall at the same time' },
        { id: 'c', text: 'Because you receive more dividends' },
        { id: 'd', text: 'Because the market then becomes more stable' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Different sectors react differently to crises — that reduces your overall risk.',
      wrongFeedback: 'Close! The key is that different sectors react independently — if one falls, others can remain stable.',
    },
    quiz2: {
      label: 'Question 2 of 2',
      question: 'Which portfolio survives a crash in the technology sector best?',
      answers: [
        { id: 'a', text: '100% Apple shares' },
        { id: 'b', text: '50% Apple, 50% Microsoft' },
        { id: 'c', text: '20% each in Tech, Healthcare, Energy, Consumer and Finance' },
        { id: 'd', text: 'Sell all stocks and wait' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Apple and Microsoft fall together when tech crashes — true diversification means different sectors.',
      wrongFeedback: 'Watch out! Apple and Microsoft are both tech stocks — they usually fall together. Different sectors are the key.',
    },
    completionSubtitle: 'You now know how to significantly reduce your risk through diversification — without sacrificing returns.',
  },
};

const LessonFlow = () => {
  const { categoryId, lessonId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();

  const config = lessonConfigs[lessonId ?? 'a1'] ?? lessonConfigs.a1;
  const lessonStoreId = `${categoryId}-${lessonId}`;

  useEffect(() => {
    if (currentStep === 0 || currentStep === 4) {
      setCanAdvance(true);
    }
  }, [currentStep]);

  useEffect(() => {
    updateLessonProgress(lessonStoreId, Math.min(currentStep / 4, 1));
  }, [currentStep]);

  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen('showing');
      try { navigator.vibrate?.([300, 100, 300]); } catch {}
    }
  }, [hearts]);

  useEffect(() => {
    if (currentStep === 4 && !completionResult) {
      const r = completeLesson(lessonStoreId, hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const goBack = () => navigate(`/category/${categoryId}`);

  const handleNext = () => {
    if (!canAdvance) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCanAdvance(false);
      setCurrentStep(prev => prev + 1);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  const handleWrongAnswer = () => {
    setHearts(h => Math.max(0, h - 1));
  };

  const renderInteraction = () => {
    if (config.interactionType === 'scale') {
      return <ScaleSlide key="scale" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'riskChart') {
      return <RiskChartSlide key="riskChart" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'timeChart') {
      return <TimeChartSlide key="timeChart" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'crash') {
      return <CrashSlide key="crash" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'dividend') {
      return <DividendSlide key="dividend" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'cashSort') {
      return <CashSortSlide key="cashSort" onComplete={() => setCanAdvance(true)} />;
    }
    return <PizzaSlide key="pizza" onComplete={() => setCanAdvance(true)} />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart key={i} className={`w-5 h-5 transition-all ${
              i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
            }`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <StorySlide
            key="story"
            emoji={config.story.emoji}
            title={config.story.title}
            mainText={config.story.mainText}
            secondaryText={config.story.secondaryText}
          />
        )}
        {currentStep === 1 && renderInteraction()}
        {currentStep === 2 && (
          <QuizSlide
            key="quiz1"
            label={config.quiz1.label}
            question={config.quiz1.question}
            answers={config.quiz1.answers}
            correctId={config.quiz1.correctId}
            correctFeedback={config.quiz1.correctFeedback}
            wrongFeedback={config.quiz1.wrongFeedback}
            onAnswered={() => setCanAdvance(true)}
            onWrongAnswer={handleWrongAnswer}
          />
        )}
        {currentStep === 3 && (
          <QuizSlide
            key="quiz2"
            label={config.quiz2.label}
            question={config.quiz2.question}
            answers={config.quiz2.answers}
            correctId={config.quiz2.correctId}
            correctFeedback={config.quiz2.correctFeedback}
            wrongFeedback={config.quiz2.wrongFeedback}
            onAnswered={() => setCanAdvance(true)}
            onWrongAnswer={handleWrongAnswer}
          />
        )}
        {currentStep === 4 && (
          <motion.div key="completion" className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-xs">{config.completionSubtitle}</p>
            <CompletionXP result={completionResult} hearts={hearts} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        {!(currentStep === 1 && !canAdvance) && (
          <motion.button
            onClick={handleNext}
            disabled={!canAdvance}
            whileTap={canAdvance ? { scale: 0.96 } : undefined}
            className={`w-full h-14 rounded-full font-display text-lg font-bold transition-opacity ${
              canAdvance
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {currentStep < TOTAL_STEPS - 1 ? 'Continue' : 'Finish'}
          </motion.button>
        )}
      </div>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setCanAdvance(false); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setCanAdvance(false); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default LessonFlow;
