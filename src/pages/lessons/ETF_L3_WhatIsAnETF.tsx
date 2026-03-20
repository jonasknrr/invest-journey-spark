import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Manual-buy stock list ── */
const manualStocks = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL',
  'META', 'TSLA', 'JPM', 'BRK.B', 'NESN', 'SAP', 'ASML',
  'SHEL', 'LVMH', 'SAMSUNG', 'ALIBABA', 'BHP', 'MODERNA',
  'NIKE', 'VISA', 'MASTERCARD', 'DISNEY', 'NETFLIX',
  'BOEING', 'SIEMENS',
];

/* ── Replication cards ── */
interface ReplicationCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  greenTag: string;
  redTag?: string;
  yellowTag?: string;
}

const replicationCards: ReplicationCard[] = [
  {
    id: 0,
    icon: '📦',
    title: 'Physical (full)',
    description: 'Buys every stock in the index exactly.',
    greenTag: '✓ Transparent',
    redTag: '✗ Expensive for large indexes',
  },
  {
    id: 1,
    icon: '🎯',
    title: 'Physical (sampling)',
    description: 'Buys a representative sample, not all stocks.',
    greenTag: '✓ Cheaper',
    yellowTag: '~ Slight tracking error possible',
  },
  {
    id: 2,
    icon: '🔄',
    title: 'Synthetic',
    description: 'Doesn\'t buy stocks — uses a swap contract with a bank.',
    greenTag: '✓ Very low tracking error',
    redTag: '✗ Counterparty risk',
  },
];

/* ── Quiz ── */
interface QuizConfig {
  question: string;
  answers: { id: string; text: string }[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
}

const quiz: QuizConfig = {
  question: 'What is the main difference between an ETF and a traditional mutual fund?',
  answers: [
    { id: 'a', text: 'ETFs always track an index, funds never do' },
    { id: 'b', text: 'ETFs trade on the exchange all day, funds only once daily at the closing price' },
    { id: 'c', text: 'ETFs are only for institutional investors' },
    { id: 'd', text: 'Funds always have lower fees than ETFs' },
  ],
  correctId: 'b',
  correctFeedback:
    'Exactly! Both can be passive (index-tracking) or active. The structural difference is intraday trading — ETFs trade like stocks, funds settle once daily at NAV.',
  wrongFeedback:
    'The key difference is tradability: ETFs trade on the exchange all day like stocks. Funds settle once daily at the closing price.',
};

/* ── Component ── */
const ETF_L3_WhatIsAnETF = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number; unlocked: boolean } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();

  // Step 1 — manual buy
  const [buyCount, setBuyCount] = useState(0);
  const [showETFReveal, setShowETFReveal] = useState(false);

  // Step 2 — replication method choice
  const [chosenMethod, setChosenMethod] = useState<null | 'voll' | 'sampling' | 'swap'>(null);

  // Step 3 — quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4 — deep dive
  const [showDeepDive, setShowDeepDive] = useState(false);

  // Step 0 — story slides
  const [storySlide, setStorySlide] = useState(0);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e3', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
    if (currentStep === 4 && !completionResult) {
      const r = completeLesson('etfs-e3', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  const handleBuy = () => {
    if (showETFReveal) return;
    const next = buyCount + 1;
    setBuyCount(next);
    if (navigator.vibrate) navigator.vibrate(30);
    if (next >= 8) setShowETFReveal(true);
  };




  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return showETFReveal;
    if (currentStep === 2) return !!chosenMethod;
    if (currentStep === 3) return !!selectedAnswer;
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      if (completionResult?.unlocked === false) {
        setCurrentStep(0); setHearts(3); setStorySlide(0); setBuyCount(0); setShowETFReveal(false); setChosenMethod(null); setSelectedAnswer(null); setCompletionResult(null);
        return;
      }
      navigate('/category/etfs');
      return;
    }
    setCurrentStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/category/etfs')}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <FiX className="w-5 h-5 text-foreground" />
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
            <FiHeart
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
        {/* STEP 0 — Story (3 mini-slides) */}
        {currentStep === 0 && (
          <motion.div
            key="s0"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === storySlide ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* SLIDE 0 */}
              {storySlide === 0 && (
                <motion.div key="ss0" className="flex flex-col items-center max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>📋</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">
                    The index was there — but unreachable.
                  </h2>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full mb-4">
                    {/* Left — Index */}
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">📋</span>
                      <p className="font-display text-sm font-bold text-foreground">S&P 500 Index</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">exists since 1957</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 font-body text-[10px] font-semibold">
                        ❌ Not buyable
                      </span>
                    </div>
                    {/* Arrow */}
                    <span className="text-2xl text-muted-foreground">→</span>
                    {/* Right — ETF */}
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#EFF6FF' }}>
                      <span className="text-3xl mb-2">📦</span>
                      <p className="font-display text-sm font-bold text-foreground">S&P 500 ETF</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">tradable since 1993</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-[10px] font-semibold">
                        ✅ Buyable
                      </span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    For 36 years, you could only watch.
                  </p>
                  <div className="flex justify-end w-full">
                    <button onClick={() => setStorySlide(1)}
                      className="font-display text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors">
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 1 */}
              {storySlide === 1 && (
                <motion.div key="ss1" className="flex flex-col items-center max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">
                    Spotify made the playlist accessible.
                  </h2>
                  <div className="w-full rounded-2xl border border-border overflow-hidden mb-4">
                    {/* Row 1 — Spotify */}
                    <div className="bg-muted p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">🎵</span>
                        <span className="font-display text-sm font-bold text-foreground flex-1">Top 50 Playlist</span>
                        <span className="text-lg text-muted-foreground">→</span>
                        <span className="font-display text-sm font-bold text-foreground">Spotify Sub</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">Already existed • Spotify makes it listenable</p>
                    </div>
                    {/* Dashed separator */}
                    <div className="border-t-2 border-dashed border-border" />
                    {/* Row 2 — ETF */}
                    <div className="p-4" style={{ backgroundColor: '#EFF6FF' }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">📋</span>
                        <span className="font-display text-sm font-bold text-foreground flex-1">S&P 500 Index</span>
                        <span className="text-lg text-muted-foreground">→</span>
                        <span className="font-display text-sm font-bold text-foreground">ETF</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">Already existed • ETF makes it buyable</p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Index = Recipe 📋 &nbsp; ETF = Ready meal 🍱
                  </p>
                  <div className="flex justify-end w-full">
                    <button onClick={() => setStorySlide(2)}
                      className="font-display text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors">
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2 */}
              {storySlide === 2 && (
                <motion.div key="ss2" className="flex flex-col items-center max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">
                    1 purchase. 500 companies.
                  </h2>
                  <div className="w-full rounded-2xl p-5 text-white mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-sm text-white/70 text-center mb-3">You buy 1 ETF share</p>
                    <div className="flex justify-center mb-3">
                      <span className="text-3xl">➜</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      {[
                        ['🍎', 'Apple'], ['💻', 'Microsoft'], ['⚡', 'Tesla'],
                        ['📦', 'Amazon'], ['🔍', 'Google'], ['💬', 'Meta'],
                        ['🏦', 'JPMorgan'], ['🚗', 'Ford'],
                      ].map(([emoji, name]) => (
                        <div key={name} className="flex flex-col items-center gap-0.5">
                          <span className="text-xl">{emoji}</span>
                          <span className="font-body text-[10px] text-white/70">{name}</span>
                        </div>
                      ))}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xl">➕</span>
                        <span className="font-body text-[10px] text-white/70">492 more...</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-body text-xs font-semibold">
                        All in one transaction ✓
                      </span>
                    </div>
                  </div>
                  <div className="w-full rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      💡 The annual fee (TER) is often cheaper than a Netflix subscription.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 1 — Shopping comparison */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">
              Buy 500 stocks — or 1 ETF?
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-4">
              {/* LEFT — Manual */}
              <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden flex flex-col">
                <div className="bg-red-500/15 px-3 py-2 text-center">
                  <span className="font-display text-sm font-bold text-red-700 dark:text-red-300">😩 Buy manually</span>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <motion.button
                    onClick={handleBuy}
                    disabled={showETFReveal}
                    whileTap={!showETFReveal ? { scale: 0.92 } : undefined}
                    className={`w-full py-2.5 rounded-xl font-body text-sm font-bold transition-colors ${
                      showETFReveal
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {showETFReveal ? 'Enough! 😤' : '📈 Buy stock'}
                  </motion.button>

                  {/* Bought list */}
                  <div className="max-h-[180px] overflow-y-auto space-y-1">
                    {Array.from({ length: buyCount }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-body text-xs text-green-700 dark:text-green-400"
                      >
                        ✓ {manualStocks[(buyCount - 1 - i) % manualStocks.length]}
                      </motion.div>
                    ))}
                  </div>

                  {/* Counter */}
                  <div className="space-y-0.5 mt-auto pt-2">
                    <p className="font-body text-xs text-muted-foreground">
                      Transaction:{' '}
                      <motion.span
                        key={`tc-${buyCount}`}
                        className="font-bold text-red-600 dark:text-red-400 inline-block"
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {buyCount}
                      </motion.span>
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Charge:{' '}
                      <motion.span
                        key={`gc-${buyCount}`}
                        className="font-bold text-red-600 dark:text-red-400 inline-block"
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        ~CHF {buyCount}
                      </motion.span>
                    </p>
                  </div>

                  {/* Warning at 8 */}
                  <AnimatePresence>
                    {showETFReveal && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-body text-xs text-red-600 dark:text-red-400 font-semibold leading-snug"
                      >
                        This would take hours. There\'s a better way. →
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT — ETF */}
              <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  {!showETFReveal ? (
                    <motion.div
                      key="locked"
                      className="p-3 flex-1 flex flex-col items-center justify-center text-center gap-2 min-h-[200px] opacity-40"
                      exit={{ opacity: 0 }}
                    >
                      <span className="text-4xl">❓</span>
                      <p className="font-body text-xs text-muted-foreground">Tap left first...</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed"
                      className="flex flex-col"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    >
                      <div className="bg-green-500/15 px-3 py-2 text-center">
                        <span className="font-display text-sm font-bold text-green-700 dark:text-green-300">😌 Buy ETF</span>
                      </div>
                      <div className="p-3 flex flex-col items-center gap-2">
                        <span style={{ fontSize: 48 }}>✅</span>
                        <p className="font-display text-sm font-bold text-foreground">iShares Core S&P 500</p>
                        <div className="space-y-1 w-full">
                          <p className="font-body text-xs text-muted-foreground">🔢 1 transaction</p>
                          <p className="font-body text-xs text-muted-foreground">🏢 500 companies</p>
                          <p className="font-body text-xs text-muted-foreground">💶 Fee: CHF 1</p>
                        </div>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-xs font-semibold">
                          Done. ✓
                        </span>

                        {/* Comparison box */}
                        <div className="w-full mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 p-2.5 text-left">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="font-body text-[10px] text-amber-700 dark:text-amber-300 font-semibold mb-0.5">You:</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">CHF {buyCount} Charge</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">{buyCount} Transactions</p>
                            </div>
                            <div>
                              <p className="font-body text-[10px] text-amber-700 dark:text-amber-300 font-semibold mb-0.5">ETF:</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">CHF 1 Charge</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">1 Transaction</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Toast at buyCount === 5 */}
            <AnimatePresence>
              {buyCount >= 5 && buyCount < 8 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 px-4 py-2.5 max-w-sm mx-auto w-full mb-3"
                >
                  <p className="font-body text-sm text-amber-800 dark:text-amber-200 text-center">
                    Only 495 stocks left... 😅
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Blue info box after reveal */}
            <AnimatePresence>
              {showETFReveal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 max-w-sm mx-auto w-full"
                >
                  <p className="font-body text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    💡 The ETF does exactly that — automatically, daily, for ~0.07% per year.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2 — Replication Method Choice */}
        {currentStep === 2 && (
          <motion.div
            key="s2"
            className="flex-1 flex flex-col px-5 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
              You\'re an ETF manager. How do you copy the index?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Choose a method — and see what happens
            </p>

            <div className="space-y-3 max-w-sm mx-auto w-full">
              {/* Card 1 — Buy everything */}
              <motion.button
                onClick={() => setChosenMethod('voll')}
                className="w-full text-left"
                animate={chosenMethod === 'voll' ? { scale: 1.02 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`rounded-2xl border-2 p-4 transition-colors ${
                  chosenMethod === 'voll'
                    ? 'border-blue-400 dark:border-blue-500'
                    : 'border-border bg-card'
                }`} style={chosenMethod === 'voll' ? { backgroundColor: '#EFF6FF' } : undefined}>
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontSize: 32 }}>🛒</span>
                    <div>
                      <p className="font-display text-base font-bold text-foreground">Buy everything</p>
                      <p className="font-body text-xs text-muted-foreground">You buy every single stock in the index — all 500</p>
                    </div>
                  </div>
                </div>
              </motion.button>
              <AnimatePresence>
                {chosenMethod === 'voll' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-blue-300/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2"
                  >
                    <p className="font-body text-sm text-foreground">✅ Your ETF mirrors the index perfectly</p>
                    <p className="font-body text-sm text-foreground">✅ Investors trust you — fully transparent</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ But: With 3,000 stocks (MSCI World) it becomes a full-time job</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-body text-xs font-semibold">
                      Good for large, liquid indexes like S&P 500
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 2 — Buy the most important ones */}
              <motion.button
                onClick={() => setChosenMethod('sampling')}
                className="w-full text-left"
                animate={chosenMethod === 'sampling' ? { scale: 1.02 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`rounded-2xl border-2 p-4 transition-colors ${
                  chosenMethod === 'sampling'
                    ? 'border-green-400 dark:border-green-500'
                    : 'border-border bg-card'
                }`} style={chosenMethod === 'sampling' ? { backgroundColor: '#F0FDF4' } : undefined}>
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontSize: 32 }}>🎯</span>
                    <div>
                      <p className="font-display text-base font-bold text-foreground">Buy the most important ones</p>
                      <p className="font-body text-xs text-muted-foreground">You only buy the 200 largest stocks — you skip the rest</p>
                    </div>
                  </div>
                </div>
              </motion.button>
              <AnimatePresence>
                {chosenMethod === 'sampling' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-green-300/40 bg-green-50/50 dark:bg-green-950/20 p-4 space-y-2"
                  >
                    <p className="font-body text-sm text-foreground">✅ Affordable and doable</p>
                    <p className="font-body text-sm text-foreground">✅ Covers ~95% of the index</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ Small difference from the real index possible — but minimal</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-xs font-semibold">
                      Most commonly used for large indexes like MSCI World
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 3 — Contract with a bank */}
              <motion.button
                onClick={() => setChosenMethod('swap')}
                className="w-full text-left"
                animate={chosenMethod === 'swap' ? { scale: 1.02 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`rounded-2xl border-2 p-4 transition-colors ${
                  chosenMethod === 'swap'
                    ? 'border-amber-400 dark:border-amber-500'
                    : 'border-border bg-card'
                }`} style={chosenMethod === 'swap' ? { backgroundColor: '#FFFBEB' } : undefined}>
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontSize: 32 }}>🤝</span>
                    <div>
                      <p className="font-display text-base font-bold text-foreground">Contract with a bank</p>
                      <p className="font-body text-xs text-muted-foreground">You don\'t buy any stocks — a bank promises you the index return</p>
                    </div>
                  </div>
                </div>
              </motion.button>
              <AnimatePresence>
                {chosenMethod === 'swap' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2"
                  >
                    <p className="font-body text-sm text-foreground">✅ Cheapest method</p>
                    <p className="font-body text-sm text-foreground">✅ Follows the index extremely closely</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ Problem: What if the bank goes bankrupt?</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-body text-xs font-semibold">
                      Less common — recognizable by 'SWAP' in the ETF name
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info box + reset after choice */}
            <AnimatePresence>
              {chosenMethod && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-sm mx-auto w-full mt-4 space-y-3"
                >
                  <div className="rounded-xl border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
                    <p className="font-body text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      💡 In the real world, most ETFs use Method 2 — cheap enough and close enough to the index. Method 1 for smaller indexes. Method 3 is recognizable by the word 'SWAP' in the ETF name — then you know.
                    </p>
                  </div>
                  <button
                    onClick={() => setChosenMethod(null)}
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← View other method
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 3 — Quiz */}
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
              <span className="font-body text-xs font-semibold text-primary">Quiz time! 🧠</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">
              {quiz.question}
            </h2>
            <div className="flex flex-col gap-3 flex-1">
              {quiz.answers.map(a => {
                let cls = 'border-border bg-card';
                let suffix = '';
                if (selectedAnswer) {
                  if (a.id === quiz.correctId) {
                    cls = 'border-green-500 bg-green-500/10';
                    suffix = ' ✅';
                  } else if (a.id === selectedAnswer) {
                    cls = 'border-red-500 bg-red-500/10';
                    suffix = ' ✗';
                  }
                }
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => handleQuizAnswer(a.id)}
                    disabled={!!selectedAnswer}
                    whileTap={!selectedAnswer ? { scale: 0.97 } : undefined}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}
                  >
                    <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-2xl ${
                    selectedAnswer === quiz.correctId
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <p
                    className={`font-body text-sm leading-relaxed ${
                      selectedAnswer === quiz.correctId
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {selectedAnswer === quiz.correctId ? quiz.correctFeedback : quiz.wrongFeedback}
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
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5">
              You now know what an ETF is and how it works.
            </p>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 max-w-xs w-full mb-4 text-left space-y-1">
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Index = Rezept, ETF = das investierbare Produkt</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ 1 ETF-Kauf = Anteile an hunderten Unternehmen</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ 3 Replikationsarten: physisch, Sampling, synthetisch</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ ETFs handeln wie Aktien an der Börse</p>
            </div>

            <CompletionXP result={completionResult} hearts={hearts} />

            <button
              onClick={() => setShowDeepDive(true)}
              className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2.5 hover:bg-muted transition-colors"
            >
              Deeper Dive 📖
            </button>
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

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {showDeepDive && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeepDive(false)}
          >
            <motion.div
              className="bg-card rounded-t-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-3">What is an ETF? 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                An ETF is a pooled investment vehicle registered as an open-end fund or unit investment trust, traded on a regulated exchange. The NAV (Net Asset Value) is continuously calculated as iNAV. The AP mechanism (Authorised Participants) keeps the ETF price close to the iNAV through arbitrage: when there's a premium, APs buy the underlying stocks, deliver them to the ETF provider, receive new ETF shares, and sell them — closing the gap.
              </p>
              <button
                onClick={() => setShowDeepDive(false)}
                className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setBuyCount(0); setShowETFReveal(false); setChosenMethod(null); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L3_WhatIsAnETF;
