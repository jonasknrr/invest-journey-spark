import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 6;

/* ── Matching game data ── */
const methods = ['Market Cap', 'Price', 'Equal Weight'] as const;
const descriptions: Record<string, { id: string; text: string }> = {
  A: { id: 'A', text: 'Every stock counts the same — whether Apple or a small startup' },
  B: { id: 'B', text: 'A $400 stock has 4× more influence than a $100 stock — regardless of company size' },
  C: { id: 'C', text: 'Larger companies have more influence — Apple moves the index more than a small company' },
};
const correctMatches: Record<string, string> = {
  'Market Cap': 'C',
  'Price': 'B',
  'Equal Weight': 'A',
};

/* ── Quiz data ── */
interface QuizConfig {
  question: string;
  answers: { id: string; text: string }[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
}

const quiz1: QuizConfig = {
  question: 'Tesla (1.7% of the S&P 500) falls 40% in one day. How much does the S&P 500 move due to Tesla alone?',
  answers: [
    { id: 'a', text: '40% down — the index mirrors Tesla' },
    { id: 'b', text: '0% — indexes ignore individual stocks' },
    { id: 'c', text: 'About -0.68% (40% × 1.7% weight)' },
    { id: 'd', text: 'Exactly -1.7% — equal to Tesla\'s weight' },
  ],
  correctId: 'c',
  correctFeedback: 'Exactly! Market cap weighting means: impact is proportional. 40% × 1.7% = 0.68%. The other 499 stocks continue to move independently.',
  wrongFeedback: 'With market cap weighting, influence is proportional to weight. Tesla at 1.7% falling 40%: 40% × 0.017 = 0.68% drag on the index.',
};

const quiz2: QuizConfig = {
  question: 'Why is the Dow Jones (DJIA) often criticized as a poor market barometer?',
  answers: [
    { id: 'a', text: 'It uses price weighting — a $400 stock has 4× more influence than a $100 stock, regardless of size' },
    { id: 'b', text: 'It tracks too many sectors' },
    { id: 'c', text: 'It\'s recalculated too infrequently' },
    { id: 'd', text: 'It only contains non-American companies' },
  ],
  correctId: 'a',
  correctFeedback: 'Correct! Price weighting is arbitrary — a stock split halves the price and would distort the index. That\'s why financial experts prefer market-cap-weighted indexes.',
  wrongFeedback: 'The DJIA uses price weighting: a $400 stock has 4× more influence than a $100 stock — even if the $100 company is actually larger. This is widely considered flawed.',
};

/* ── Main Component ── */
const ETF_L2_HowIndexesAreBuilt = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [storySlide, setStorySlide] = useState(0);
  const [appleMove, setAppleMove] = useState([0]);
  const [teslaMove, setTeslaMove] = useState([0]);
  const [matchAnswers, setMatchAnswers] = useState<{ marktKap: string | null; preis: string | null; gleich: string | null }>({
    marktKap: null, preis: null, gleich: null,
  });
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const allMatched = matchAnswers.marktKap === 'C' && matchAnswers.preis === 'B' && matchAnswers.gleich === 'A';
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);

  // Matching game correct answers: marktKap→C, preis→B, gleich→A
  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e2', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
  }, [currentStep]);
  const correctMap: Record<string, string> = { marktKap: 'C', preis: 'B', gleich: 'A' };

  const handleMatchTap = (cardId: string, method: 'marktKap' | 'preis' | 'gleich') => {
    if (matchAnswers[method] !== null) return; // already answered
    const isCorrect = correctMap[method] === cardId;
    if (isCorrect) {
      setMatchAnswers(prev => ({ ...prev, [method]: cardId }));
    } else {
      setHearts(h => Math.max(0, h - 1));
      setWrongFlash(cardId);
      try { navigator.vibrate?.(100); } catch {}
      setTimeout(() => setWrongFlash(null), 300);
    }
  };

  const handleQuizAnswer = (id: string, quiz: QuizConfig) => {
    if (quizAnswer) return;
    setQuizAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return true;
    if (currentStep === 2) return allMatched;
    if (currentStep === 3 || currentStep === 4) return !!quizAnswer;
    if (currentStep === 5) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === 5) { navigate('/category/etfs'); return; }
    setQuizAnswer(null);
    setCurrentStep(s => s + 1);
  };

  const progress = (currentStep / 5) * 100;

  // No hearts effect
  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen('showing');
      try { navigator.vibrate?.([300, 100, 300]); } catch {}
    }
  }, [hearts]);

  // Completion effect
  useEffect(() => {
    if (currentStep === 5 && !completionResult) {
      const r = completeLesson('etfs-e2', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/category/etfs')}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: BLUE }}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart key={i} className={`w-5 h-5 transition-all ${i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* STEP 0 — Story */}
        {currentStep === 0 && (
          <motion.div key="s0" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
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
                  <span className="mb-4" style={{ fontSize: 64 }}>🎵</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">
                    Why does Ed Sheeran dominate the charts?
                  </h2>
                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    {/* Ed Sheeran card */}
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🎤</span>
                      <p className="font-display text-sm font-bold text-foreground mb-2">Ed Sheeran</p>
                      <div className="w-full h-3 bg-muted-foreground/10 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '90%' }} />
                      </div>
                      <p className="font-body text-xs text-muted-foreground">3B streams</p>
                    </div>
                    {/* Indie artist card */}
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🎸</span>
                      <p className="font-display text-sm font-bold text-foreground mb-2">Indie Artist</p>
                      <div className="w-full h-3 bg-muted-foreground/10 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '10%' }} />
                      </div>
                      <p className="font-body text-xs text-muted-foreground">1M streams</p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    More streams = more influence on the playlist
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
                    On the stock exchange, that\'s called: Market Capitalization
                  </h2>
                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    {/* Apple card */}
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#EFF6FF' }}>
                      <span className="text-3xl mb-2">🍎</span>
                      <p className="font-display text-sm font-bold text-foreground">Apple</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">$3 Trillion</p>
                      <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full" style={{ width: '90%', backgroundColor: BLUE }} />
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-body text-[10px] font-semibold">
                        7.1% of the S&P 500
                      </span>
                    </div>
                    {/* Small company card */}
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2">🏢</span>
                      <p className="font-display text-sm font-bold text-foreground">Small Company</p>
                      <p className="font-body text-xs text-muted-foreground mb-2">$2 Billion</p>
                      <div className="w-full h-3 bg-muted-foreground/10 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: '5%' }} />
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-body text-[10px] font-semibold">
                        ~0.0% of the S&P 500
                      </span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">
                    1,500× smaller = almost no influence
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
                    That\'s why Apple moves the entire market.
                  </h2>
                  {/* Dark visual card */}
                  <div className="w-full rounded-2xl p-5 text-white mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-sm text-white/70 mb-3">If Apple rises +10%:</p>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-green-400 text-2xl">↑</span>
                      <span className="font-display text-3xl font-bold">+0.71%</span>
                    </div>
                    <p className="font-body text-xs text-white/60 mb-4">Contribution to the S&P 500</p>
                    <div className="border-t border-white/20 pt-4">
                      <p className="font-body text-sm text-white/70 mb-3">Wenn Small Company +100% steigt:</p>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-green-400 text-base">↑</span>
                        <span className="font-display text-lg font-bold text-white/80">+0.001%</span>
                      </div>
                      <p className="font-body text-xs text-white/60">Contribution to the S&P 500</p>
                    </div>
                  </div>
                  {/* Amber infobox */}
                  <div className="w-full rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      💡 Top 10 companies = ~35% of the S&P 500. The other 490? All together = 65%.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 1 — Weight Simulator */}
        {currentStep === 1 && (() => {
          const appleContrib = appleMove[0] * 0.071;
          const teslaContrib = teslaMove[0] * 0.017;
          const total = appleContrib + teslaContrib;
          const fmt = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
          const clr = (v: number) => v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground';

          const infoBox = (() => {
            const a = appleMove[0], t = teslaMove[0];
            if (a === 0 && t === 0) return { bg: 'bg-muted', border: 'border-muted-foreground/20', text: 'text-muted-foreground', msg: '👆 Move the sliders to feel the weighting effect' };
            if (a > 10 && t < -10) return { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-400', text: 'text-red-800 dark:text-red-200', msg: `🔥 Apple +${a}% nearly saves the index despite Tesla crash — thanks to its 4× higher weight!` };
            if ((a > 0 && t < 0) || (a < 0 && t > 0)) return { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-400', text: 'text-amber-800 dark:text-amber-200', msg: '⚔️ Opposing forces! Apple pulls up, Tesla pulls down — who wins? Apple weighs 4× more than Tesla.' };
            if (a > 10 && t > 10) return { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-400', text: 'text-green-800 dark:text-green-200', msg: '🚀 Both rising — but Apple drives the index much more!' };
            if (a < -10 && t < -10) return { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-400', text: 'text-red-800 dark:text-red-200', msg: '📉 Double crash — Apple drags the index down harder than Tesla.' };
            return null;
          })();

          return (
          <motion.div key="s1" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
              Two companies, one index — feel the difference
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Move both sliders — even in opposite directions
            </p>
            <div className="max-w-sm mx-auto w-full space-y-4">
              {/* Apple slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">🍎 Apple</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: BLUE }}>7.1% weight</span>
                </div>
                <p className={`font-display text-2xl font-bold text-center tabular-nums mb-1 ${clr(appleMove[0])}`}>
                  {appleMove[0] > 0 ? '+' : ''}{appleMove[0]}%
                </p>
                <Slider value={appleMove} onValueChange={setAppleMove} min={-20} max={20} step={1} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground font-body">-20%</span>
                  <span className="text-[10px] text-muted-foreground font-body">+20%</span>
                </div>
                <div className="flex justify-center mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${appleContrib > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-300' : appleContrib < 0 ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-muted text-muted-foreground'}`}>
                    Index contribution: {fmt(appleContrib)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Tesla slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">⚡ Tesla</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">1.7% weight</span>
                </div>
                <p className={`font-display text-2xl font-bold text-center tabular-nums mb-1 ${clr(teslaMove[0])}`}>
                  {teslaMove[0] > 0 ? '+' : ''}{teslaMove[0]}%
                </p>
                <Slider value={teslaMove} onValueChange={setTeslaMove} min={-20} max={20} step={1} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground font-body">-20%</span>
                  <span className="text-[10px] text-muted-foreground font-body">+20%</span>
                </div>
                <div className="flex justify-center mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${teslaContrib > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-300' : teslaContrib < 0 ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-muted text-muted-foreground'}`}>
                    Index contribution: {fmt(teslaContrib)}
                  </span>
                </div>
              </div>

              {/* Result card */}
              <motion.div className="rounded-2xl p-5 text-white" style={{ backgroundColor: '#1E3A5F' }}
                key={total.toFixed(2)}
                initial={{ scale: 1 }} animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}>
                <p className="font-body text-xs text-white/50 text-center mb-1">S&P 500 MOVES</p>
                <p className={`font-display font-bold text-center tabular-nums ${total > 0 ? 'text-green-400' : total < 0 ? 'text-red-400' : 'text-white'}`}
                  style={{ fontSize: 48 }}>
                  {fmt(total)}
                </p>
                <div className="border-t border-white/20 mt-3 pt-3 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="font-body text-xs text-white/60">🍎 Apple</p>
                    <p className={`font-display text-sm font-bold tabular-nums ${appleContrib > 0 ? 'text-green-400' : appleContrib < 0 ? 'text-red-400' : 'text-white/80'}`}>
                      {fmt(appleContrib)}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-white/60">⚡ Tesla</p>
                    <p className={`font-display text-sm font-bold tabular-nums ${teslaContrib > 0 ? 'text-green-400' : teslaContrib < 0 ? 'text-red-400' : 'text-white/80'}`}>
                      {fmt(teslaContrib)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic info box */}
              {infoBox && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border-l-4 ${infoBox.border} ${infoBox.bg} px-4 py-3`}>
                  <p className={`font-body text-sm leading-relaxed ${infoBox.text}`}>{infoBox.msg}</p>
                </motion.div>
              )}

              {/* Reset */}
              <div className="flex justify-center">
                <button onClick={() => { setAppleMove([0]); setTeslaMove([0]); }}
                  className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ↺ Reset
                </button>
              </div>
            </div>
          </motion.div>
          );
        })()}

        {/* STEP 2 — Matching Game */}
        {currentStep === 2 && (
          <motion.div key="s2" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">
              Which method is which?
            </h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">
              Tap a description and choose the matching method
            </p>
            <div className="max-w-sm mx-auto w-full space-y-3">
              {/* Card A — correct: Gleichgewichtung */}
              {(() => {
                const answered = matchAnswers.gleich === 'A';
                const isFlashing = wrongFlash === 'A';
                return (
                  <motion.div
                    className={`p-4 rounded-2xl border-2 transition-colors ${
                      answered ? 'border-green-500 bg-green-500/5' : isFlashing ? 'border-red-500 bg-red-500/5' : 'border-border bg-card'
                    }`}
                    animate={answered ? { scale: [1, 1.03, 1] } : isFlashing ? { x: [0, -6, 6, -6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground leading-relaxed">
                          Every stock counts the same — whether Apple or a small startup
                        </p>
                      </div>
                      {answered && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl flex-shrink-0">✅</motion.span>
                      )}
                    </div>
                    {answered && (
                      <p className="font-display text-xs font-bold text-green-600 dark:text-green-400 mt-2">Correct! → Equal Weight ✓</p>
                    )}
                    {!answered && (
                      <div className="flex gap-2 mt-3">
                        {(['Market Cap', 'Price', 'Equal Weight'] as const).map(m => {
                          const methodKey = m === 'Market Cap' ? 'marktKap' : m === 'Price' ? 'preis' : 'gleich';
                          const alreadyUsed = matchAnswers[methodKey] !== null;
                          return (
                            <button key={m} onClick={() => handleMatchTap('A', methodKey as 'marktKap' | 'preis' | 'gleich')}
                              disabled={alreadyUsed}
                              className={`flex-1 py-2 px-1 rounded-xl font-display text-[11px] font-bold border transition-colors ${
                                alreadyUsed ? 'border-muted bg-muted text-muted-foreground opacity-40' : 'border-border bg-card text-foreground hover:border-primary/50'
                              }`}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* Card B — correct: Preis */}
              {(() => {
                const answered = matchAnswers.preis === 'B';
                const isFlashing = wrongFlash === 'B';
                return (
                  <motion.div
                    className={`p-4 rounded-2xl border-2 transition-colors ${
                      answered ? 'border-green-500 bg-green-500/5' : isFlashing ? 'border-red-500 bg-red-500/5' : 'border-border bg-card'
                    }`}
                    animate={answered ? { scale: [1, 1.03, 1] } : isFlashing ? { x: [0, -6, 6, -6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground leading-relaxed">
                          A $400 stock has 4× more influence than a $100 stock
                        </p>
                      </div>
                      {answered && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl flex-shrink-0">✅</motion.span>
                      )}
                    </div>
                    {answered && (
                      <p className="font-display text-xs font-bold text-green-600 dark:text-green-400 mt-2">Correct! → Price ✓</p>
                    )}
                    {!answered && (
                      <div className="flex gap-2 mt-3">
                        {(['Market Cap', 'Price', 'Equal Weight'] as const).map(m => {
                          const methodKey = m === 'Market Cap' ? 'marktKap' : m === 'Price' ? 'preis' : 'gleich';
                          const alreadyUsed = matchAnswers[methodKey] !== null;
                          return (
                            <button key={m} onClick={() => handleMatchTap('B', methodKey as 'marktKap' | 'preis' | 'gleich')}
                              disabled={alreadyUsed}
                              className={`flex-1 py-2 px-1 rounded-xl font-display text-[11px] font-bold border transition-colors ${
                                alreadyUsed ? 'border-muted bg-muted text-muted-foreground opacity-40' : 'border-border bg-card text-foreground hover:border-primary/50'
                              }`}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* Card C — correct: Marktkapitalisierung */}
              {(() => {
                const answered = matchAnswers.marktKap === 'C';
                const isFlashing = wrongFlash === 'C';
                return (
                  <motion.div
                    className={`p-4 rounded-2xl border-2 transition-colors ${
                      answered ? 'border-green-500 bg-green-500/5' : isFlashing ? 'border-red-500 bg-red-500/5' : 'border-border bg-card'
                    }`}
                    animate={answered ? { scale: [1, 1.03, 1] } : isFlashing ? { x: [0, -6, 6, -6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground leading-relaxed">
                          Larger companies have more influence on the index
                        </p>
                      </div>
                      {answered && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl flex-shrink-0">✅</motion.span>
                      )}
                    </div>
                    {answered && (
                      <p className="font-display text-xs font-bold text-green-600 dark:text-green-400 mt-2">Correct! → Market Cap ✓</p>
                    )}
                    {!answered && (
                      <div className="flex gap-2 mt-3">
                        {(['Market Cap', 'Price', 'Equal Weight'] as const).map(m => {
                          const methodKey = m === 'Market Cap' ? 'marktKap' : m === 'Price' ? 'preis' : 'gleich';
                          const alreadyUsed = matchAnswers[methodKey] !== null;
                          return (
                            <button key={m} onClick={() => handleMatchTap('C', methodKey as 'marktKap' | 'preis' | 'gleich')}
                              disabled={alreadyUsed}
                              className={`flex-1 py-2 px-1 rounded-xl font-display text-[11px] font-bold border transition-colors ${
                                alreadyUsed ? 'border-muted bg-muted text-muted-foreground opacity-40' : 'border-border bg-card text-foreground hover:border-primary/50'
                              }`}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {allMatched && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                  <p className="font-display font-bold text-green-700 dark:text-green-300">All correct! 🎉</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Quiz 1 */}
        {currentStep === 3 && (
          <QuizSlide key="q1" quiz={quiz1} selected={quizAnswer}
            onSelect={(id) => handleQuizAnswer(id, quiz1)} />
        )}

        {/* STEP 4 — Quiz 2 */}
        {currentStep === 4 && (
          <QuizSlide key="q2" quiz={quiz2} selected={quizAnswer}
            onSelect={(id) => handleQuizAnswer(id, quiz2)} />
        )}

        {/* STEP 5 — Completion */}
        {currentStep === 5 && (
          <motion.div key="s5" className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5">You now understand how indexes are built.</p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 max-w-xs w-full mb-4 text-left space-y-1">
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Market cap = size of the company</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Larger companies have more index influence</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ There are 3 weighting methods: market cap, price, equal weight</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Top 10 S&P 500 Firmen = ~35% des Index</p>
            </div>
            <CompletionXP result={completionResult} hearts={hearts} />
            <button onClick={() => setShowDeepDive(true)}
              className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2.5 hover:bg-muted transition-colors">
              Tiefer eintauchen 📖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {showCTA() && (
          <motion.div className="px-6 pb-8 max-w-sm mx-auto w-full"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.button onClick={handleNext} whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm"
              style={{ backgroundColor: currentStep === 5 ? 'hsl(142, 71%, 45%)' : BLUE }}>
              {currentStep === 5 ? 'Next lesson →' : 'Continue →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {showDeepDive && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeepDive(false)}>
            <motion.div className="bg-card rounded-t-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-3">How indexes are built 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                <strong>Float-adjusted market cap weighting:</strong> The S&P 500 uses the "float" — only freely tradable shares count, not those held by insiders or governments.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                <strong>Rebalancing:</strong> quartalsweise Anpassung für Preisdrift, halbjährliche Vollüberprüfung für neue/entfernte Unternehmen.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                <strong>Index-Aufnahmeeffekt:</strong> wenn ein Unternehmen in einen grossen Index aufgenommen wird, müssen alle ETFs die diesen Index verfolgen die Aktie gleichzeitig kaufen — das verursacht einen temporären Kursanstieg von durchschnittlich 3-5%.
              </p>
              <button onClick={() => setShowDeepDive(false)}
                className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm">
                Schliessen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setQuizAnswer(null); setMatchAnswers({marktKap:null,preis:null,gleich:null}); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setQuizAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

/* ── Quiz sub-component ── */
const QuizSlide = ({ quiz, selected, onSelect }: {
  quiz: QuizConfig; selected: string | null; onSelect: (id: string) => void;
}) => {
  const isCorrect = selected === quiz.correctId;
  return (
    <motion.div className="flex-1 flex flex-col px-6 py-4"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 self-start mb-4">
        <span className="font-body text-xs font-semibold text-primary">Quiz time! 🧠</span>
      </div>
      <h2 className="font-display text-xl font-bold text-foreground mb-5 leading-snug">{quiz.question}</h2>
      <div className="flex flex-col gap-3 flex-1">
        {quiz.answers.map(a => {
          let cls = 'border-border bg-card';
          let suffix = '';
          if (selected) {
            if (a.id === quiz.correctId) { cls = 'border-green-500 bg-green-500/10'; suffix = ' ✅'; }
            else if (a.id === selected) { cls = 'border-red-500 bg-red-500/10'; suffix = ' ✗'; }
          }
          return (
            <motion.button key={a.id} onClick={() => onSelect(a.id)} disabled={!!selected}
              whileTap={!selected ? { scale: 0.97 } : undefined}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}>
              <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-2xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <p className={`font-body text-sm leading-relaxed ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isCorrect ? quiz.correctFeedback : quiz.wrongFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ETF_L2_HowIndexesAreBuilt;
