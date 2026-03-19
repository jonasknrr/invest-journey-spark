import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Category Explorer data ── */
interface ETFCategory {
  id: number;
  emoji: string;
  title: string;
  playlist: string;
  examples: string;
  holdings: string;
  fee: string;
  risk: number; // 1-5
}

const categories: ETFCategory[] = [
  { id: 0, emoji: '🌍', title: 'Broad Market', playlist: 'All Music in the World', examples: 'MSCI World, S&P 500, FTSE All-World', holdings: '1,500–3,000', fee: '0.07–0.20%', risk: 1 },
  { id: 1, emoji: '🏳', title: 'Country / Region', playlist: 'Top 50 Germany', examples: 'iShares MSCI Germany, Euro Stoxx 50', holdings: '40–200', fee: '0.15–0.40%', risk: 2 },
  { id: 2, emoji: '🏭', title: 'Sector', playlist: 'Only Rock Music', examples: 'Clean Energy, Healthcare, Financials', holdings: '50–150', fee: '0.25–0.50%', risk: 3 },
  { id: 3, emoji: '💡', title: 'Thematic', playlist: 'Workout Songs', examples: 'AI & Robotics, Cybersecurity, Clean Water', holdings: '25–60', fee: '0.35–0.75%', risk: 4 },
  { id: 4, emoji: '🧲', title: 'Factor / Smart Beta', playlist: 'Only 5-Star Tracks', examples: 'MSCI World Value, Min Volatility, Momentum', holdings: '200–400', fee: '0.25–0.50%', risk: 2 },
];

const riskColor = (level: number) => {
  if (level <= 2) return 'bg-green-500';
  if (level === 3) return 'bg-amber-500';
  return 'bg-orange-500';
};

const riskInactiveColor = 'bg-muted';

/* ── Matching game ── */
interface Scenario {
  question: string;
  options: { emoji: string; label: string; correct: boolean }[];
  wrongExplanation: string;
}

const scenarios: Scenario[] = [
  {
    question: 'Maria wants to invest as broadly as possible with a single ETF. Which one does she pick?',
    options: [
      { emoji: '🌍', label: 'MSCI World', correct: true },
      { emoji: '💡', label: 'AI & Robotics ETF', correct: false },
      { emoji: '🏳', label: 'DAX ETF', correct: false },
    ],
    wrongExplanation: 'MSCI World holds ~1,500 companies from 23 countries — maximum diversification.',
  },
  {
    question: 'Tom believes cybersecurity is the future and wants to profit from it. Which ETF?',
    options: [
      { emoji: '🌍', label: 'MSCI All Country World', correct: false },
      { emoji: '💡', label: 'Cybersecurity ETF', correct: true },
      { emoji: '🏭', label: 'Healthcare Sector ETF', correct: false },
    ],
    wrongExplanation: 'A thematic ETF focuses exactly on a trend topic — but with higher risk.',
  },
  {
    question: 'Julia wants to invest cheaply and broadly in Europe.',
    options: [
      { emoji: '🏳', label: 'Euro Stoxx 50 ETF', correct: true },
      { emoji: '🧲', label: 'Momentum Faktor ETF', correct: false },
      { emoji: '💡', label: 'Clean Energy ETF', correct: false },
    ],
    wrongExplanation: 'Regional ETFs focus on a geographic zone — Euro Stoxx 50 = 50 largest European companies.',
  },
];

/* ── Quiz ── */
const quiz = {
  question: 'An investor holds 5 ETFs: S&P 500, NASDAQ-100, US Small Cap, US Dividends, US Value. How diversified is he?',
  answers: [
    { id: 'a', text: 'Very good — 5 different ETFs is always better than 1' },
    { id: 'b', text: 'Poor — all are US stocks, highly correlated, fall together in a US crash' },
    { id: 'c', text: 'Perfect — each ETF tracks a different index' },
    { id: 'd', text: 'Well diversified by sectors' },
  ],
  correctId: 'b',
  correctFeedback: 'Exactly! All 5 are US stocks — like 5 playlists from the same artist. In a US bear market, all 5 fall together. Real diversification needs other regions, other asset classes.',
  wrongFeedback: 'All 5 ETFs are US stocks — highly correlated, like 5 playlists from the same artist. More ETFs ≠ more diversification when they all react the same.',
};

/* ── Component ── */
const ETF_L4_ETFUniverse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();

  // Step 0 — playlist simulation
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<'pick' | 'shock' | 'result'>('pick');
  const [portfolioValue, setPortfolioValue] = useState(1000);
  const [shockResults, setShockResults] = useState<{ name: string; change: number; loss: number }[]>([]);
  const [showShockBtn, setShowShockBtn] = useState(false);
  const [displayValue, setDisplayValue] = useState(1000);
  const [shakeMax, setShakeMax] = useState(false);

  // Step 1 — category explorer
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Step 2 — matching game
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [matchAnswer, setMatchAnswer] = useState<number | null>(null); // index of selected option
  const [matchCompleted, setMatchCompleted] = useState(0); // how many scenarios completed

  // Step 3 — quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4 — deep dive
  const [showDeepDive, setShowDeepDive] = useState(false);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e4', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('etfs-e4', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const allExpanded = expanded.size === 5;

  const toggleCategory = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMatchSelect = (idx: number) => {
    if (matchAnswer !== null) return;
    setMatchAnswer(idx);
    const correct = scenarios[scenarioIdx].options[idx].correct;
    if (!correct) setHearts(h => Math.max(0, h - 1));
    // Auto-advance after delay
    setTimeout(() => {
      if (scenarioIdx < scenarios.length - 1) {
        setScenarioIdx(s => s + 1);
        setMatchAnswer(null);
        setMatchCompleted(c => c + 1);
      } else {
        setMatchCompleted(c => c + 1);
      }
    }, 1500);
  };

  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return gamePhase === 'result';
    if (currentStep === 1) return true;
    if (currentStep === 2) return matchCompleted >= scenarios.length;
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
        {/* STEP 0 — Playlist Simulation */}
        {currentStep === 0 && (
          <motion.div
            key="s0"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {/* PHASE: PICK */}
              {gamePhase === 'pick' && (
                <motion.div
                  key="pick"
                  className="max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                      Build your music portfolio 🎵
                    </h2>
                    <span className="text-xs font-display font-bold text-muted-foreground bg-muted rounded-full px-3 py-1">
                      {selectedPlaylists.length} / 4
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Choose up to 4 playlists to invest in
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { id: 'world', emoji: '🌍', title: 'All Music in the World', sub: 'Pop, Rock, Jazz, Classical, everything', badge: '~10,000 songs' },
                      { id: 'hiphop', emoji: '🇩🇪', title: 'German Hip-Hop', sub: 'Only one genre, one country', badge: '~200 songs' },
                      { id: 'workout', emoji: '💪', title: 'Workout Hits', sub: 'Only high-energy songs', badge: '~150 songs' },
                      { id: 'rock90', emoji: '🎸', title: '90s Rock', sub: 'Only one era, one genre', badge: '~300 songs' },
                      { id: 'taylor', emoji: '🎵', title: 'Taylor Swift Everything', sub: 'Only one artist', badge: '~200 songs' },
                      { id: 'global50', emoji: '🌐', title: 'Global Top 50', sub: 'Pop worldwide, multiple countries', badge: '~500 songs' },
                    ].map(card => {
                      const isSelected = selectedPlaylists.includes(card.id);
                      return (
                        <motion.button
                          key={card.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPlaylists(prev => prev.filter(p => p !== card.id));
                            } else if (selectedPlaylists.length < 4) {
                              setSelectedPlaylists(prev => [...prev, card.id]);
                            } else {
                              setShakeMax(true);
                              setTimeout(() => setShakeMax(false), 500);
                            }
                          }}
                          animate={shakeMax && !isSelected ? { x: [0, -4, 4, -4, 0] } : {}}
                          transition={{ duration: 0.3 }}
                          className={`rounded-2xl border-2 p-3 flex flex-col items-center text-center transition-colors relative ${
                            isSelected ? 'border-green-500 bg-green-500/5' : 'border-border bg-card'
                          }`}
                        >
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold"
                            >
                              ✓
                            </motion.span>
                          )}
                          <span className="text-2xl mb-1">{card.emoji}</span>
                          <p className="font-display text-xs font-bold text-foreground leading-tight mb-0.5">{card.title}</p>
                          <p className="font-body text-[10px] text-muted-foreground leading-tight mb-1.5">{card.sub}</p>
                          <span className="text-[10px] font-body text-muted-foreground bg-muted rounded-full px-2 py-0.5">{card.badge}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedPlaylists.length >= 2 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setGamePhase('shock');
                        setTimeout(() => setShowShockBtn(true), 1500);
                      }}
                      className="w-full h-12 rounded-full bg-green-600 text-white font-display font-bold text-sm"
                    >
                      Shock incoming! ⚡ →
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* PHASE: SHOCK */}
              {gamePhase === 'shock' && (
                <motion.div
                  key="shock"
                  className="max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <div className="rounded-2xl p-6 text-white text-center" style={{ backgroundColor: '#7F1D1D' }}>
                    <motion.span
                      className="block mb-3"
                      style={{ fontSize: 48 }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      ⚡
                    </motion.span>
                    <h2 className="font-display text-2xl font-bold mb-3">MARKET SHOCK</h2>
                    <div className="w-full h-px bg-white/20 mb-3" />
                    <p className="font-body text-sm leading-relaxed mb-1">A major artist gets cancelled.</p>
                    <p className="font-body text-sm leading-relaxed mb-3">All their playlists instantly lose 80% of their listeners.</p>
                    <div className="w-full h-px bg-white/20 mb-3" />
                    <p className="font-display text-lg font-bold">Your portfolio: CHF 1,000</p>

                    <AnimatePresence>
                      {showShockBtn && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            const lossMap: Record<string, number> = {
                              world: -5,
                              global50: -8,
                              hiphop: -45,
                              workout: -40,
                              rock90: -35,
                              taylor: -80,
                            };
                            const nameMap: Record<string, string> = {
                              world: 'All Music in the World',
                              global50: 'Global Top 50',
                              hiphop: 'German Hip-Hop',
                              workout: 'Workout Hits',
                              rock90: '90s Rock',
                              taylor: 'Taylor Swift Everything',
                            };
                            const count = selectedPlaylists.length;
                            const perSlice = 1000 / count;
                            const results = selectedPlaylists.map(id => {
                              const change = lossMap[id] ?? 0;
                              const loss = Math.round(perSlice * (change / 100));
                              return { name: nameMap[id] ?? id, change, loss };
                            });
                            const totalLoss = results.reduce((s, r) => s + r.loss, 0);
                            const finalValue = 1000 + totalLoss;
                            setShockResults(results);
                            setPortfolioValue(finalValue);
                            setGamePhase('result');
                            // Animate counter
                            let frame = 0;
                            const totalFrames = 30;
                            const interval = setInterval(() => {
                              frame++;
                              const t = frame / totalFrames;
                              setDisplayValue(Math.round(1000 + totalLoss * t));
                              if (frame >= totalFrames) clearInterval(interval);
                            }, 800 / totalFrames);
                          }}
                          className="mt-4 w-full h-12 rounded-full font-display font-bold text-sm"
                          style={{ backgroundColor: '#DC2626' }}
                        >
                          See impact →
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* PHASE: RESULT */}
              {gamePhase === 'result' && (() => {
                const totalLoss = shockResults.reduce((s, r) => s + r.loss, 0);
                const totalPct = Math.round((totalLoss / 1000) * 100);
                const severity = totalPct < -20 ? 'bad' : totalPct < -5 ? 'mid' : 'good';
                return (
                  <motion.div
                    key="result"
                    className="max-w-sm mx-auto w-full"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">
                      Your portfolio after the shock
                    </h2>

                    <div className="space-y-2.5 mb-4">
                      {shockResults.map((r, i) => {
                        const color = r.change > -10 ? 'text-green-600 dark:text-green-400' : r.change > -30 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
                        const barColor = r.change > -10 ? 'bg-green-500' : r.change > -30 ? 'bg-amber-500' : 'bg-red-500';
                        const remaining = 100 + r.change;
                        return (
                          <motion.div
                            key={r.name}
                            className="rounded-xl bg-card border border-border p-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-body text-sm text-foreground font-medium">{r.name}</span>
                              <span className={`font-display text-sm font-bold tabular-nums ${color}`}>
                                {r.change}% (CHF {r.loss})
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${barColor}`}
                                initial={{ width: '100%' }}
                                animate={{ width: `${remaining}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="w-full h-px bg-border mb-4" />

                    {/* Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`rounded-2xl p-4 mb-4 ${
                        severity === 'bad'
                          ? 'bg-red-500/10 border border-red-500/20'
                          : severity === 'mid'
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : 'bg-green-500/10 border border-green-500/20'
                      }`}
                    >
                      <p className={`font-display text-2xl font-bold tabular-nums mb-1 ${
                        severity === 'bad' ? 'text-red-600 dark:text-red-400' : severity === 'mid' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        Your portfolio: CHF {displayValue}
                      </p>
                      <p className={`font-body text-sm mb-2 ${
                        severity === 'bad' ? 'text-red-700 dark:text-red-300' : severity === 'mid' ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'
                      }`}>
                        Loss: -CHF {Math.abs(totalLoss)} ({totalPct}%)
                      </p>
                      <p className={`font-body text-sm font-medium ${
                        severity === 'bad' ? 'text-red-700 dark:text-red-300' : severity === 'mid' ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'
                      }`}>
                        {severity === 'bad' && '😬 Too concentrated — one shock hits everything.'}
                        {severity === 'mid' && 'Solid — but room for improvement.'}
                        {severity === 'good' && '🛡 Broad diversification protected you!'}
                      </p>
                    </motion.div>

                    {/* Comparison */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-2xl bg-primary/5 border border-primary/15 p-4 mb-4"
                    >
                      <p className="font-body text-sm text-primary leading-relaxed">
                        With ONLY &ldquo;All Music in the World&rdquo;:<br />
                        Loss: only -5% = -CHF 50<br />
                        <span className="font-bold">→ That's diversification.</span>
                      </p>
                    </motion.div>

                    <button
                      onClick={() => {
                        setSelectedPlaylists([]);
                        setGamePhase('pick');
                        setShockResults([]);
                        setPortfolioValue(1000);
                        setDisplayValue(1000);
                        setShowShockBtn(false);
                      }}
                      className="w-full text-center font-display text-sm font-bold text-muted-foreground py-2"
                    >
                      ← Pick again
                    </button>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 1 — Category Explorer */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
              Explore the ETF universe
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Tap on each category
            </p>
            <div className="space-y-3 max-w-sm mx-auto w-full">
              {categories.map(cat => {
                const isOpen = expanded.has(cat.id);
                return (
                  <motion.div key={cat.id} layout className="rounded-2xl border-2 border-border bg-card overflow-hidden">
                    <motion.button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-bold text-foreground">{cat.title}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">&ldquo;{cat.playlist}&rdquo;</p>
                      </div>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground text-sm"
                      >
                        ▼
                      </motion.span>
                    </motion.button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-body text-xs text-muted-foreground w-20 flex-shrink-0">Examples:</span>
                              <span className="font-body text-xs text-foreground">{cat.examples}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-body text-xs text-muted-foreground w-20 flex-shrink-0">Holdings:</span>
                              <span className="font-body text-xs text-foreground">{cat.holdings}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-body text-xs text-muted-foreground w-20 flex-shrink-0">Fee:</span>
                              <span className="font-body text-xs text-foreground">{cat.fee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-body text-xs text-muted-foreground w-20 flex-shrink-0">Risk:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(dot => (
                                  <span
                                    key={dot}
                                    className={`w-3 h-3 rounded-full ${dot <= cat.risk ? riskColor(cat.risk) : riskInactiveColor}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {allExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-sm mx-auto w-full mt-4"
                >
                  <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    You\'ve discovered all categories! 🎉
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2 — Matching game */}
        {currentStep === 2 && (
          <motion.div
            key="s2"
            className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
              Which ETF fits the goal?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Tap on the best answer for each situation
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-5">
              {scenarios.map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < matchCompleted ? 'bg-green-500' : i === scenarioIdx ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {scenarioIdx < scenarios.length && (
                <motion.div
                  key={scenarioIdx}
                  className="max-w-sm mx-auto w-full"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-body text-[15px] text-foreground leading-relaxed mb-5">
                    {scenarios[scenarioIdx].question}
                  </p>
                  <div className="space-y-3">
                    {scenarios[scenarioIdx].options.map((opt, idx) => {
                      let cls = 'border-border bg-card';
                      if (matchAnswer !== null) {
                        if (opt.correct) cls = 'border-green-500 bg-green-500/10';
                        else if (idx === matchAnswer) cls = 'border-red-500 bg-red-500/10';
                      }
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleMatchSelect(idx)}
                          disabled={matchAnswer !== null}
                          whileTap={matchAnswer === null ? { scale: 0.97 } : undefined}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-colors flex items-center gap-3 ${cls}`}
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="font-body text-[15px] text-foreground">{opt.label}</span>
                          {matchAnswer !== null && opt.correct && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-green-600 text-lg">✓</motion.span>
                          )}
                          {matchAnswer === idx && !opt.correct && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-red-500 text-lg">✗</motion.span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {matchAnswer !== null && !scenarios[scenarioIdx].options[matchAnswer].correct && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30"
                      >
                        <p className="font-body text-sm text-red-700 dark:text-red-300 leading-relaxed">
                          {scenarios[scenarioIdx].wrongExplanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {matchCompleted >= scenarios.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-l-4 border-green-400 bg-green-50 dark:bg-green-950/30 px-4 py-3 max-w-sm mx-auto w-full mt-4"
              >
                <p className="font-body text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  All scenarios solved! 🎉
                </p>
              </motion.div>
            )}
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
            <h2 className="font-display text-lg font-bold text-foreground mb-5 leading-snug max-w-sm">
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
              You now know the ETF universe.
            </p>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 max-w-xs w-full mb-4 text-left space-y-1">
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ 5 ETF categories: Broad, Country, Sector, Thematic, Factor</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ The more specific, the higher the risk</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ 5 US ETFs = not diversified</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ MSCI World = maximum diversification in a single ETF</p>
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Factor Investing & Thematic ETFs 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Factor Investing is based on academic research: Fama-French (1992) identified Size (SMB) and Value (HML) factors. Carhart (1997) added Momentum. These "Risk Premia" have historically delivered excess returns — but with periods of strong underperformance (e.g. Value 2007–2020). Thematic ETFs are typically launched at the peak of a hype cycle and on average underperform the broad market afterward.
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
          onRestart={() => { setCurrentStep(0); setHearts(3); setSelectedPlaylists([]); setGamePhase('pick'); setPortfolioValue(1000); setShockResults([]); setShowShockBtn(false); setDisplayValue(1000); setExpanded(new Set()); setScenarioIdx(0); setMatchAnswer(null); setMatchCompleted(0); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L4_ETFUniverse;
