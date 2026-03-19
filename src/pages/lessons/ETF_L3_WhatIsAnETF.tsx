import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

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
    title: 'Physisch (voll)',
    description: 'Kauft jede Aktie im Index exakt nach.',
    greenTag: '✓ Transparent',
    redTag: '✗ Teuer bei grossen Indizes',
  },
  {
    id: 1,
    icon: '🎯',
    title: 'Physisch (Sampling)',
    description: 'Kauft eine repräsentative Auswahl, nicht alle Aktien.',
    greenTag: '✓ Günstiger',
    yellowTag: '~ Leichter Tracking-Fehler möglich',
  },
  {
    id: 2,
    icon: '🔄',
    title: 'Synthetisch',
    description: 'Kauft keine Aktien — nutzt einen Swap-Vertrag mit einer Bank.',
    greenTag: '✓ Sehr geringer Tracking-Fehler',
    redTag: '✗ Gegenparteirisiko',
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
  question: 'Was ist der Hauptunterschied zwischen einem ETF und einem klassischen Investmentfonds?',
  answers: [
    { id: 'a', text: 'ETFs verfolgen immer einen Index, Fonds nie' },
    { id: 'b', text: 'ETFs werden den ganzen Tag an der Börse gehandelt, Fonds nur einmal täglich zum Schlusskurs' },
    { id: 'c', text: 'ETFs sind nur für institutionelle Anleger' },
    { id: 'd', text: 'Fonds haben immer niedrigere Gebühren als ETFs' },
  ],
  correctId: 'b',
  correctFeedback:
    'Genau! Beide können passiv (index-folgend) oder aktiv sein. Der strukturelle Unterschied ist der Intraday-Handel — ETFs handeln wie Aktien, Fonds werden einmal täglich zum NAV abgerechnet.',
  wrongFeedback:
    'Der Kernunterschied ist die Handelbarkeit: ETFs handeln an der Börse den ganzen Tag wie Aktien. Fonds werden einmal täglich zum Schlusskurs abgerechnet.',
};

/* ── Component ── */
const ETF_L3_WhatIsAnETF = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
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
                    Der Index war da — aber unerreichbar.
                  </h2>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full mb-4">
                    {/* Left — Index */}
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">📋</span>
                      <p className="font-display text-sm font-bold text-foreground">S&P 500 Index</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">existiert seit 1957</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 font-body text-[10px] font-semibold">
                        ❌ Nicht kaufbar
                      </span>
                    </div>
                    {/* Arrow */}
                    <span className="text-2xl text-muted-foreground">→</span>
                    {/* Right — ETF */}
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#EFF6FF' }}>
                      <span className="text-3xl mb-2">📦</span>
                      <p className="font-display text-sm font-bold text-foreground">S&P 500 ETF</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">seit 1993 handelbar</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-[10px] font-semibold">
                        ✅ Kaufbar
                      </span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    36 Jahre lang konnte man nur zuschauen.
                  </p>
                  <div className="flex justify-end w-full">
                    <button onClick={() => setStorySlide(1)}
                      className="font-display text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors">
                      Nächste →
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
                    Spotify hat die Playlist zugänglich gemacht.
                  </h2>
                  <div className="w-full rounded-2xl border border-border overflow-hidden mb-4">
                    {/* Row 1 — Spotify */}
                    <div className="bg-muted p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">🎵</span>
                        <span className="font-display text-sm font-bold text-foreground flex-1">Top 50 Playlist</span>
                        <span className="text-lg text-muted-foreground">→</span>
                        <span className="font-display text-sm font-bold text-foreground">Spotify Abo</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">Existierte schon • Spotify macht sie hörbar</p>
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
                      <p className="font-body text-xs text-muted-foreground">Existierte schon • ETF macht ihn kaufbar</p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    Index = Rezept 📋 &nbsp; ETF = Fertiggericht 🍱
                  </p>
                  <div className="flex justify-end w-full">
                    <button onClick={() => setStorySlide(2)}
                      className="font-display text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors">
                      Nächste →
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
                    1 Kauf. 500 Unternehmen.
                  </h2>
                  <div className="w-full rounded-2xl p-5 text-white mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-sm text-white/70 text-center mb-3">Du kaufst 1 ETF-Anteil</p>
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
                        <span className="font-body text-[10px] text-white/70">492 mehr...</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-body text-xs font-semibold">
                        Alles in einer Transaktion ✓
                      </span>
                    </div>
                  </div>
                  <div className="w-full rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      💡 Die jährliche Gebühr (TER) ist oft günstiger als ein Netflix-Abo.
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
              500 Aktien kaufen — oder 1 ETF?
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-4">
              {/* LEFT — Manual */}
              <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden flex flex-col">
                <div className="bg-red-500/15 px-3 py-2 text-center">
                  <span className="font-display text-sm font-bold text-red-700 dark:text-red-300">😩 Manuell kaufen</span>
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
                    {showETFReveal ? 'Genug! 😤' : '📈 Aktie kaufen'}
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
                      Transaktionen:{' '}
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
                      Gebühren:{' '}
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
                        Das würde Stunden dauern. Es gibt einen besseren Weg. →
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
                      <p className="font-body text-xs text-muted-foreground">Erst links tippen...</p>
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
                        <span className="font-display text-sm font-bold text-green-700 dark:text-green-300">😌 ETF kaufen</span>
                      </div>
                      <div className="p-3 flex flex-col items-center gap-2">
                        <span style={{ fontSize: 48 }}>✅</span>
                        <p className="font-display text-sm font-bold text-foreground">iShares Core S&P 500</p>
                        <div className="space-y-1 w-full">
                          <p className="font-body text-xs text-muted-foreground">🔢 1 Transaktion</p>
                          <p className="font-body text-xs text-muted-foreground">🏢 500 Unternehmen</p>
                          <p className="font-body text-xs text-muted-foreground">💶 Gebühr: CHF 1</p>
                        </div>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-xs font-semibold">
                          Fertig. ✓
                        </span>

                        {/* Comparison box */}
                        <div className="w-full mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 p-2.5 text-left">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="font-body text-[10px] text-amber-700 dark:text-amber-300 font-semibold mb-0.5">Du:</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">CHF {buyCount} Gebühren</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">{buyCount} Transaktionen</p>
                            </div>
                            <div>
                              <p className="font-body text-[10px] text-amber-700 dark:text-amber-300 font-semibold mb-0.5">ETF:</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">CHF 1 Gebühr</p>
                              <p className="font-body text-[10px] text-amber-800 dark:text-amber-200">1 Transaktion</p>
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
                    Nur noch 495 Aktien... 😅
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
                    💡 Der ETF macht genau das — automatisch, täglich, für ~0.07% pro Jahr.
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
              Du bist ETF-Manager. Wie kopierst du den Index?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Wähle eine Methode — und sieh was passiert
            </p>

            <div className="space-y-3 max-w-sm mx-auto w-full">
              {/* Card 1 — Alles kaufen */}
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
                      <p className="font-display text-base font-bold text-foreground">Alles kaufen</p>
                      <p className="font-body text-xs text-muted-foreground">Du kaufst jede einzelne Aktie im Index — alle 500</p>
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
                    <p className="font-body text-sm text-foreground">✅ Dein ETF spiegelt den Index perfekt</p>
                    <p className="font-body text-sm text-foreground">✅ Anleger vertrauen dir — alles transparent</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ Aber: Bei 3.000 Aktien (MSCI World) wirst du zum Vollzeitjob</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-body text-xs font-semibold">
                      Gut für grosse, liquide Indizes wie S&P 500
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 2 — Die Wichtigsten kaufen */}
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
                      <p className="font-display text-base font-bold text-foreground">Die Wichtigsten kaufen</p>
                      <p className="font-body text-xs text-muted-foreground">Du kaufst nur die 200 grössten Aktien — die anderen lässt du weg</p>
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
                    <p className="font-body text-sm text-foreground">✅ Günstig und machbar</p>
                    <p className="font-body text-sm text-foreground">✅ Deckt ~95% des Index ab</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ Kleiner Unterschied zum echten Index möglich — aber minimal</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-xs font-semibold">
                      Meistgenutzt für grosse Indizes wie MSCI World
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 3 — Vertrag mit einer Bank */}
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
                      <p className="font-display text-base font-bold text-foreground">Vertrag mit einer Bank</p>
                      <p className="font-body text-xs text-muted-foreground">Du kaufst gar keine Aktien — eine Bank verspricht dir die Index-Rendite</p>
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
                    <p className="font-body text-sm text-foreground">✅ Günstigste Methode</p>
                    <p className="font-body text-sm text-foreground">✅ Folgt dem Index extrem genau</p>
                    <p className="font-body text-sm text-amber-700 dark:text-amber-300">⚠️ Problem: Was wenn die Bank pleitegeht?</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-body text-xs font-semibold">
                      Seltener — erkennbar am 'SWAP' im ETF-Namen
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
                      💡 In der echten Welt nutzen die meisten ETFs Methode 2 — günstig genug und nah genug am Index. Methode 1 für kleinere Indizes. Methode 3 erkennst du am Wort 'SWAP' im ETF-Namen — dann weisst du Bescheid.
                    </p>
                  </div>
                  <button
                    onClick={() => setChosenMethod(null)}
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Andere Methode ansehen
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lektion abgeschlossen!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5">
              Du weisst jetzt was ein ETF ist und wie er funktioniert.
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
              Tiefer eintauchen 📖
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
              {currentStep === 4 ? 'Zur nächsten Lektion →' : 'Weiter →'}
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Was ist ein ETF? 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Ein ETF ist ein gepooltes Anlageinstrument das als offener Fonds oder Unit Investment Trust registriert ist und an einer regulierten Börse gehandelt wird. Der NAV (Net Asset Value) wird kontinuierlich als iNAV berechnet. Der AP-Mechanismus (Authorised Participants) hält den ETF-Preis durch Arbitrage nah am iNAV: Bei Aufschlag kaufen APs die Aktien, liefern sie an den ETF-Anbieter, erhalten neue ETF-Anteile und verkaufen sie — das schliesst die Lücke.
              </p>
              <button
                onClick={() => setShowDeepDive(false)}
                className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm"
              >
                Schliessen
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
