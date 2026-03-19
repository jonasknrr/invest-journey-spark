import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

/* ── Sort game events ── */
interface SortEvent {
  emoji: string;
  title: string;
  context: string;
  answer: 'specific' | 'systematic';
}

const sortEvents: SortEvent[] = [
  { emoji: '💼', title: 'CEO of a company gets arrested', context: 'The company loses 60% in one day', answer: 'specific' },
  { emoji: '📉', title: 'Global financial crisis 2008', context: 'All markets worldwide collapse', answer: 'systematic' },
  { emoji: '🚗', title: 'Major product recall at a car manufacturer', context: 'Millions of cars must be recalled', answer: 'specific' },
  { emoji: '🦠', title: 'Global pandemic breaks out', context: 'Lockdowns on all continents', answer: 'systematic' },
  { emoji: '📊', title: 'Accounting scandal at a corporation', context: 'Years of financial fraud uncovered', answer: 'specific' },
  { emoji: '🏦', title: 'Central banks raise interest rates worldwide', context: 'Cost of capital rises everywhere simultaneously', answer: 'systematic' },
];

/* ── Correlation data ── */
const assets = ['S&P 500', 'NASDAQ', 'MSCI EM', 'Bonds', 'Gold'];

type MarketPhase = 'normal' | 'crisis2008' | 'crisis2020';

const correlations: Record<MarketPhase, number[][]> = {
  normal: [
    [1.0, 0.92, 0.70, -0.20, 0.05],
    [0.92, 1.0, 0.65, -0.25, 0.02],
    [0.70, 0.65, 1.0, -0.15, 0.10],
    [-0.20, -0.25, -0.15, 1.0, 0.30],
    [0.05, 0.02, 0.10, 0.30, 1.0],
  ],
  crisis2008: [
    [1.0, 0.97, 0.88, -0.40, -0.10],
    [0.97, 1.0, 0.85, -0.42, -0.12],
    [0.88, 0.85, 1.0, -0.30, -0.05],
    [-0.40, -0.42, -0.30, 1.0, 0.55],
    [-0.10, -0.12, -0.05, 0.55, 1.0],
  ],
  crisis2020: [
    [1.0, 0.95, 0.82, -0.35, -0.05],
    [0.95, 1.0, 0.80, -0.38, -0.08],
    [0.82, 0.80, 1.0, -0.25, 0.05],
    [-0.35, -0.38, -0.25, 1.0, 0.50],
    [-0.05, -0.08, 0.05, 0.50, 1.0],
  ],
};

const cellColor = (val: number, isDiag: boolean) => {
  if (isDiag) return 'bg-blue-900 text-white';
  if (val < 0) return 'bg-[#065F46] text-white';
  if (val <= 0.3) return 'bg-[#ECFDF5] text-[#065F46]';
  if (val <= 0.6) return 'bg-[#FFFBEB] text-amber-700';
  if (val <= 0.8) return 'bg-[#FFF7ED] text-orange-700';
  return 'bg-[#FEF2F2] text-red-700';
};

/* ── Quiz ── */
const quiz = {
  question: 'MSCI World holds 1,500 companies from 23 countries and still fell 34% in March 2020. What does that teach us?',
  answers: [
    { id: 'a', text: 'The ETF didn\'t replicate its index correctly' },
    { id: 'b', text: 'More ETFs would have prevented the loss' },
    { id: 'c', text: 'Even maximum stock diversification doesn\'t protect against a global systematic shock' },
    { id: 'd', text: 'ETFs are safer than individual stocks in all markets' },
  ],
  correctId: 'c',
  correctFeedback: 'Exactly. MSCI World = maximum stock diversification. Still -34% because COVID hit all stock markets simultaneously. Only uncorrelated assets (bonds, gold) offered partial protection.',
  wrongFeedback: 'MSCI World = maximum diversification in stocks. Still -34% in the COVID crash. Systematic shocks hit everything simultaneously — only truly different asset classes help then.',
};

/* ── Component ── */
const ETF_L6_Risk = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [storySlide, setStorySlide] = useState(0);

  // Story slide 0 animation
  const [scandalRevealed, setScandalRevealed] = useState(false);

  // Step 1 — Sort game
  const [sortIndex, setSortIndex] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortDone, setSortDone] = useState(false);
  const [sortFeedback, setSortFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Step 2 — Correlation
  const [activeMarket, setActiveMarket] = useState<MarketPhase>('normal');

  // Step 3 — Quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4 — Deep dive
  const [showDeepDive, setShowDeepDive] = useState(false);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e6', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('etfs-e6', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  const handleSort = (choice: 'specific' | 'systematic') => {
    if (sortFeedback || sortDone) return;
    const ev = sortEvents[sortIndex];
    if (choice === ev.answer) {
      setSortFeedback('correct');
      setSortScore(s => s + 1);
      setTimeout(() => {
        setSortFeedback(null);
        if (sortIndex + 1 >= sortEvents.length) { setSortDone(true); }
        else { setSortIndex(i => i + 1); }
      }, 600);
    } else {
      setSortFeedback('wrong');
      setHearts(h => Math.max(0, h - 1));
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setSortFeedback(null), 800);
    }
  };

  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return sortDone;
    if (currentStep === 2) return true;
    if (currentStep === 3) return !!selectedAnswer;
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) { navigate('/category/etfs'); return; }
    setCurrentStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/category/etfs')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: BLUE }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart key={i} className={`w-5 h-5 transition-all ${i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">

        {/* ═══ STEP 0 — Story ═══ */}
        {currentStep === 0 && (
          <motion.div key="s0" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === storySlide ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* SLIDE 0 — Taylor Swift */}
              {storySlide === 0 && (
                <motion.div key="ss0" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>🎵</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">10 playlists, all by Taylor Swift.</h2>
                  <div className="w-full rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-[10px] text-white/60 mb-3">Your Portfolio</p>
                    <div className="space-y-2 mb-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div key={i} className="flex items-center gap-2">
                          <span className="text-sm">🎵</span>
                          <span className="font-body text-xs text-white flex-1">Taylor Swift — Playlist {i}</span>
                          <motion.span
                            animate={scandalRevealed ? { scale: [1, 1.3, 1], opacity: 1 } : {}}
                            transition={{ delay: scandalRevealed ? i * 0.2 : 0 }}
                          >
                            {scandalRevealed ? '❌' : '✓'}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      {!scandalRevealed ? (
                        <button
                          onClick={() => setScandalRevealed(true)}
                          className="w-full py-2 rounded-lg bg-red-500/20 text-red-300 font-body text-xs font-semibold"
                        >
                          ⚡ Trigger scandal
                        </button>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                          <p className="font-body text-xs text-red-300 text-center">⚡ Taylor Swift Scandal</p>
                          <p className="font-body text-[10px] text-red-300/70 text-center mt-1">All 5 playlists — empty at once</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">5 ETFs, all US tech = same problem</p>
                  <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Next →</button>
                </motion.div>
              )}

              {/* SLIDE 1 — Specific vs Systematic */}
              {storySlide === 1 && (
                <motion.div key="ss1" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">ETFs protect against one thing — not everything.</h2>
                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#ECFDF5' }}>
                      <span className="text-3xl mb-2">✅</span>
                      <p className="font-display text-sm font-bold text-foreground mb-1">Specific Risk</p>
                      <p className="font-body text-xs text-foreground/80 mb-1">One company goes bankrupt</p>
                      <p className="font-body text-[10px] text-muted-foreground mb-2">Wirecard Scandal 2020</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 font-body text-[10px] font-semibold">ETF protects you ✓</span>
                    </div>
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#FEF2F2' }}>
                      <span className="text-3xl mb-2">⚠️</span>
                      <p className="font-display text-sm font-bold text-foreground mb-1">Systematic Risk</p>
                      <p className="font-body text-xs text-foreground/80 mb-1">The entire market crashes</p>
                      <p className="font-body text-[10px] text-muted-foreground mb-2">COVID March 2020: -34%</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 font-body text-[10px] font-semibold">ETF does NOT protect ✗</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center mb-4">MSCI World — 1,500 companies, 23 countries — still fell 34% in 6 weeks.</p>
                  <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Next →</button>
                </motion.div>
              )}

              {/* SLIDE 2 — Real Diversification */}
              {storySlide === 2 && (
                <motion.div key="ss2" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">Real diversification needs different worlds.</h2>
                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#FEF2F2' }}>
                      <span className="text-3xl mb-2">❌</span>
                      <p className="font-display text-sm font-bold text-foreground mb-2">Fake Diversification</p>
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {['S&P 500 🇺🇸', 'NASDAQ 🇺🇸', 'US Small Cap 🇺🇸', 'US Dividenden 🇺🇸', 'US Value 🇺🇸'].map(b => (
                          <span key={b} className="inline-block px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 font-body text-[9px]">{b}</span>
                        ))}
                      </div>
                      <p className="font-body text-[10px] text-red-600">5 playlists, 1 artist</p>
                    </div>
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#ECFDF5' }}>
                      <span className="text-3xl mb-2">✅</span>
                      <p className="font-display text-sm font-bold text-foreground mb-2">Real Diversification</p>
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {[
                          { t: 'MSCI World 🌍', c: 'bg-blue-500/10 text-blue-700' },
                          { t: 'Anleihen 📊', c: 'bg-green-500/10 text-green-700' },
                          { t: 'Gold 🥇', c: 'bg-amber-500/10 text-amber-700' },
                          { t: 'Immobilien 🏠', c: 'bg-purple-500/10 text-purple-700' },
                        ].map(b => (
                          <span key={b.t} className={`inline-block px-1.5 py-0.5 rounded-full ${b.c} font-body text-[9px]`}>{b.t}</span>
                        ))}
                      </div>
                      <p className="font-body text-[10px] text-green-600">4 different worlds</p>
                    </div>
                  </div>
                  <div className="w-full rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-2">
                    <p className="font-body text-xs text-amber-700 text-center">💡 More ETFs ≠ more safety. It\'s about correlation.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ STEP 1 — Sort Game ═══ */}
        {currentStep === 1 && (
          <motion.div key="s1" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">Specific or Systematic?</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Tap the correct category for each event</p>

            {!sortDone ? (
              <div className="max-w-sm mx-auto w-full">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSort('specific')} className="py-3 rounded-2xl border-2 border-blue-500 text-blue-700 font-display text-sm font-bold">
                    🏢 Specific
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSort('systematic')} className="py-3 rounded-2xl border-2 border-blue-500 text-blue-700 font-display text-sm font-bold">
                    🌍 Systematic
                  </motion.button>
                </div>

                <p className="font-body text-xs text-muted-foreground text-center mb-3">{sortScore}/{sortEvents.length}</p>

                <motion.div
                  key={sortIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: sortFeedback === 'correct' ? '#ECFDF5' : sortFeedback === 'wrong' ? '#FEF2F2' : 'hsl(var(--card))',
                  }}
                  className="rounded-2xl border border-border shadow-sm p-6 text-center"
                >
                  <span className="text-4xl mb-3 block">{sortEvents[sortIndex].emoji}</span>
                  <p className="font-display text-base font-bold text-foreground mb-2">{sortEvents[sortIndex].title}</p>
                  <p className="font-body text-xs text-muted-foreground">{sortEvents[sortIndex].context}</p>
                  {sortFeedback === 'correct' && (
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 text-green-600 font-display text-sm font-bold">✅ Correct!</motion.p>
                  )}
                  {sortFeedback === 'wrong' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-red-600 font-body text-xs">Not quite — try again</motion.p>
                  )}
                </motion.div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full">
                <div className={`rounded-2xl p-5 text-center mb-4 ${sortScore >= 6 ? 'bg-green-500/10 border border-green-500/20' : sortScore >= 4 ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                  <p className="font-display text-lg font-bold text-foreground mb-2">
                    {sortScore >= 6 ? '🎯 Perfect! You recognize both risk types.' : sortScore >= 4 ? '👍 Good! Almost all correct.' : '💪 Practice makes perfect!'}
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground mb-3">{sortScore}/{sortEvents.length}</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4">
                  <p className="font-body text-xs text-foreground mb-1"><strong>Specific</strong> = ETF protects ✓</p>
                  <p className="font-body text-xs text-foreground"><strong>Systematic</strong> = no one protects ✗</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══ STEP 2 — Correlation Lab ═══ */}
        {currentStep === 2 && (
          <motion.div key="s2" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">How do assets move together?</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Switch between market phases</p>

            <div className="flex rounded-full bg-muted p-1 max-w-sm mx-auto w-full mb-4">
              {([
                { key: 'normal' as MarketPhase, label: '📈 Normal' },
                { key: 'crisis2008' as MarketPhase, label: '💥 Crisis 2008' },
                { key: 'crisis2020' as MarketPhase, label: '🦠 Crisis 2020' },
              ]).map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveMarket(m.key)}
                  className={`flex-1 py-2 rounded-full font-body text-[10px] font-semibold transition-colors ${activeMarket === m.key ? 'text-white' : 'text-muted-foreground'}`}
                  style={activeMarket === m.key ? { backgroundColor: BLUE } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="max-w-sm mx-auto w-full overflow-x-auto mb-3">
              <div className="grid" style={{ gridTemplateColumns: `60px repeat(${assets.length}, 1fr)`, gap: '2px' }}>
                <div />
                {assets.map(a => (
                  <div key={a} className="font-body text-[8px] text-muted-foreground text-center py-1 truncate">{a}</div>
                ))}
                {assets.map((row, ri) => (
                  <>
                    <div key={`h-${ri}`} className="font-body text-[8px] text-muted-foreground flex items-center truncate pr-1">{row}</div>
                    {assets.map((_, ci) => {
                      const val = correlations[activeMarket][ri][ci];
                      const isDiag = ri === ci;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`rounded-md text-center py-1.5 font-body text-[10px] font-semibold transition-colors duration-500 ${cellColor(val, isDiag)}`}
                        >
                          {val.toFixed(1)}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center mb-3">
              <span className="font-body text-[10px] text-muted-foreground">🟢 Low = good for diversification</span>
              <span className="font-body text-[10px] text-muted-foreground">🔴 High = moves together</span>
            </div>

            <div className={`max-w-sm mx-auto w-full rounded-xl p-3 ${activeMarket === 'normal' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <p className="font-body text-xs text-foreground text-center">
                {activeMarket === 'normal'
                  ? 'Bonds and gold often move opposite to stocks — good buffers.'
                  : '⚠️ See how everything turns redder? In crises, almost all stock assets fall simultaneously. That\'s exactly when diversification fails the most.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══ STEP 3 — Quiz ═══ */}
        {currentStep === 3 && (
          <motion.div key="s3" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-2">Quiz time! 🧠</h2>
            <p className="font-body text-sm text-foreground text-center mb-5">{quiz.question}</p>
            <div className="space-y-3 max-w-sm mx-auto w-full mb-4">
              {quiz.answers.map(a => {
                const chosen = selectedAnswer === a.id;
                const correct = a.id === quiz.correctId;
                const revealed = !!selectedAnswer;
                let borderColor = 'border-border';
                if (revealed && correct) borderColor = 'border-green-500 bg-green-500/5';
                else if (revealed && chosen && !correct) borderColor = 'border-red-500 bg-red-500/5';
                return (
                  <motion.button
                    key={a.id}
                    whileTap={!revealed ? { scale: 0.97 } : {}}
                    onClick={() => handleQuizAnswer(a.id)}
                    className={`w-full text-left rounded-2xl border-2 ${borderColor} p-4 transition-colors`}
                  >
                    <p className="font-body text-sm text-foreground">{a.text}</p>
                  </motion.button>
                );
              })}
            </div>
            {selectedAnswer && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`max-w-sm mx-auto w-full rounded-xl p-3 ${selectedAnswer === quiz.correctId ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                <p className="font-body text-xs text-foreground">{selectedAnswer === quiz.correctId ? quiz.correctFeedback : quiz.wrongFeedback}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══ STEP 4 — Completion ═══ */}
        {currentStep === 4 && (
          <motion.div key="s4" className="flex-1 flex flex-col items-center justify-center px-6 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-4">
              {[0, 1, 2].map(i => (
                <motion.span key={i} className="text-5xl" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.3, type: 'spring', stiffness: 300, damping: 15 }} style={{ filter: 'drop-shadow(0 0 8px hsl(45, 100%, 50%, 0.5))' }}>⭐</motion.span>
              ))}
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete! 🎉</h2>
            <p className="font-body text-sm text-muted-foreground max-w-xs text-center mb-5">You now understand real diversification.</p>

            <div className="w-full max-w-sm rounded-2xl bg-green-500/10 border border-green-500/20 p-4 mb-4 space-y-2">
              <p className="font-body text-xs text-foreground">✅ Specific = one company, eliminable through ETFs</p>
              <p className="font-body text-xs text-foreground">✅ Systematic = entire market, always remains</p>
              <p className="font-body text-xs text-foreground">✅ 5 US ETFs = not diversified (same artist)</p>
              <p className="font-body text-xs text-foreground">✅ Correlations rise in crises — dangerous precisely then</p>
            </div>

            <CompletionXP result={completionResult} hearts={hearts} />

            <button onClick={() => setShowDeepDive(true)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2.5 hover:bg-muted transition-colors">
              Deeper Dive 📖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {showCTA() && (
          <motion.div className="px-6 pb-8 max-w-sm mx-auto w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.button onClick={handleNext} whileTap={{ scale: 0.96 }} className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm" style={{ backgroundColor: currentStep === 4 ? 'hsl(142, 71%, 45%)' : BLUE }}>
              {currentStep === 4 ? 'Next lesson →' : 'Continue →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {showDeepDive && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeepDive(false)}>
            <motion.div className="bg-card rounded-t-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Modern Portfolio Theory 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Modern Portfolio Theory (Markowitz, 1952): Unsystematic risk decreases quickly with more holdings. At ~20 uncorrelated stocks it approaches zero. What remains is Beta — market sensitivity.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Correlation instability: In crisis times, correlations converge towards 1.0 — the diversification benefit erodes precisely when it\'s needed most.
              </p>
              <button onClick={() => setShowDeepDive(false)} className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setScandalRevealed(false); setSortIndex(0); setSortScore(0); setSortDone(false); setSortFeedback(null); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L6_Risk;
