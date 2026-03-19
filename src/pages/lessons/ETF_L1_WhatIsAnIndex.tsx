import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const DARK_BLUE = '#1E3A5F';

const chips = [
  { ticker: 'AAPL', weight: '7.1%' },
  { ticker: 'MSFT', weight: '6.9%' },
  { ticker: 'NVDA', weight: '5.8%' },
  { ticker: 'AMZN', weight: '3.6%' },
  { ticker: 'GOOGL', weight: '3.2%' },
  { ticker: 'META', weight: '2.8%' },
  { ticker: 'TSLA', weight: '2.0%' },
  { ticker: 'JPM', weight: '1.3%' },
  { ticker: 'BRK.B', weight: '1.1%' },
  { ticker: '+491', weight: '65.6%' },
];

interface QuizConfig {
  question: string;
  answers: { id: string; text: string }[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
}

const quiz1: QuizConfig = {
  question: 'What best describes a stock index?',
  answers: [
    { id: 'a', text: 'A fund you can invest in directly' },
    { id: 'b', text: 'A measurement that tracks a group of stocks as a single number' },
    { id: 'c', text: 'A list of the best stocks of the year' },
    { id: 'd', text: 'A government report on the economy' },
  ],
  correctId: 'b',
  correctFeedback: 'Exactly! An index is purely a measurement tool — like a thermometer. You can\'t buy the S&P 500 directly.',
  wrongFeedback: 'Not quite. An index is just a number that measures a basket of stocks. That\'s what ETFs are for — coming in Lesson 3!',
};

const quiz2: QuizConfig = {
  question: 'The MSCI World falls 3% today. What does that mean?',
  answers: [
    { id: 'a', text: 'Every single stock fell exactly 3%' },
    { id: 'b', text: 'The index committee manually lowered the number' },
    { id: 'c', text: 'Large companies across 23 countries lost on average ~3% of their value' },
    { id: 'd', text: 'The US economy shrank by 3%' },
  ],
  correctId: 'c',
  correctFeedback: 'Correct! An index is a weighted average. Individual stocks move differently — the net effect was -3%.',
  wrongFeedback: 'An index is a weighted average. The -3% shows the overall basket, not every single stock.',
};

const ETF_L1_WhatIsAnIndex = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [storySlide, setStorySlide] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<'pick' | 'result'>('pick');

  const progress = ((currentStep) / 4) * 100;

  // No hearts effect
  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen('showing');
      try { navigator.vibrate?.([300, 100, 300]); } catch {}
    }
  }, [hearts]);

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e1', Math.min(currentStep / 4, 1));
  }, [currentStep]);

  // Completion effect
  useEffect(() => {
    if (currentStep === 4 && !completionResult) {
      const r = completeLesson('etfs-e1', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  const handleAnswer = (id: string, quiz: QuizConfig) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) {
      setHearts(h => Math.max(0, h - 1));
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      navigate('/category/etfs');
      return;
    }
    setSelectedAnswer(null);
    setCurrentStep(s => s + 1);
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return gamePhase === 'result';
    if (currentStep === 2 || currentStep === 3) return !!selectedAnswer;
    if (currentStep === 4) return true;
    return false;
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
        {currentStep === 0 && (
          <motion.div key="story" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === storySlide ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {storySlide === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1">
                  <div className="flex flex-col items-center text-center mb-5">
                    <span style={{ fontSize: 64 }} className="mb-3">🎵</span>
                    <h2 className="font-display text-2xl font-bold text-foreground leading-tight">You know Spotify's Top 50?</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-5">
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center gap-2">
                      <span className="text-2xl">🎵</span>
                      <p className="font-body text-sm font-medium text-foreground">A song by Ed Sheeran</p>
                      <p className="font-body text-xs text-muted-foreground">= one stock</p>
                    </div>
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2" style={{ backgroundColor: '#EFF6FF' }}>
                      <span className="text-2xl">📋</span>
                      <p className="font-body text-sm font-medium text-foreground">Top 50 Global Playlist</p>
                      <p className="font-body text-xs" style={{ color: BLUE }}>= an index</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors">Next →</button>
                  </div>
                </motion.div>
              )}

              {storySlide === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Nobody owns the playlist.</h2>
                  <div className="max-w-sm mx-auto w-full mb-4 rounded-2xl overflow-hidden shadow-md">
                    <div className="px-4 py-3 text-white font-display font-bold text-sm" style={{ backgroundColor: '#1DB954' }}>🎵 Top 50 Global — Spotify</div>
                    <div className="bg-card px-4 py-3 flex flex-col gap-2">
                      <p className="font-body text-sm text-foreground">🥇 Blinding Lights — The Weeknd</p>
                      <p className="font-body text-sm text-foreground">🥈 Shape of You — Ed Sheeran</p>
                      <p className="font-body text-sm text-foreground">🥉 Dance Monkey — Tones and I</p>
                    </div>
                    <div className="bg-card px-4 py-2 border-t border-border">
                      <p className="font-body text-xs text-muted-foreground">Curated by Spotify • updated daily</p>
                    </div>
                  </div>
                  <div className="max-w-sm mx-auto w-full rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 mb-4">
                    <p className="font-body text-sm text-destructive font-medium">❌ You can't buy this playlist — only listen</p>
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center max-w-xs mx-auto mb-4">Spotify selects, calculates, updates. You just watch.</p>
                  <div className="flex justify-end mt-auto">
                    <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors">Next →</button>
                  </div>
                </motion.div>
              )}

              {storySlide === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">The S&P 500 is the same thing — for stocks.</h2>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto w-full mb-4">
                    {[
                      { flag: '🇺🇸', name: 'S&P 500', desc: 'Top 500 US companies by size', tag: 'Most well-known index worldwide' },
                      { flag: '🇩🇪', name: 'DAX', desc: 'Top 40 German companies', tag: 'Germany\'s economic pulse' },
                      { flag: '🌍', name: 'MSCI World', desc: '~1,500 companies from 23 countries', tag: 'The global playlist' },
                    ].map(item => (
                      <div key={item.name} className="rounded-xl border border-border bg-card p-3 flex gap-3 items-start" style={{ borderLeftWidth: 4, borderLeftColor: BLUE }}>
                        <span className="text-2xl mt-0.5">{item.flag}</span>
                        <div className="flex-1">
                          <p className="font-display text-sm font-bold text-foreground">{item.name}</p>
                          <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                          <span className="inline-block mt-1.5 font-body text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">{item.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-sm mx-auto w-full">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">💡 An index is a measurement — not a product. Like a thermometer: you can\'t buy 20°C.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div key="interaction" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <AnimatePresence mode="wait">
              {gamePhase === 'pick' && (
                <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Build your own index!</h2>
                      <p className="font-body text-sm text-muted-foreground mt-1">Pick 5 companies you think are the most important in the world</p>
                    </div>
                    <span className={`font-body text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${selectedStocks.length === 5 ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                      {selectedStocks.length} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto w-full">
                    {([
                      { flag: '🇺🇸', ticker: 'AAPL', name: 'Apple', sector: 'Tech', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                      { flag: '🇺🇸', ticker: 'MSFT', name: 'Microsoft', sector: 'Tech', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                      { flag: '🇺🇸', ticker: 'TSLA', name: 'Tesla', sector: 'Auto', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
                      { flag: '🇩🇪', ticker: 'SAP', name: 'SAP', sector: 'Tech', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                      { flag: '🇨🇭', ticker: 'NESN', name: 'Nestlé', sector: 'Consumer', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
                      { flag: '🇳🇱', ticker: 'ASML', name: 'ASML', sector: 'Tech', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                      { flag: '🇺🇸', ticker: 'JPM', name: 'JPMorgan', sector: 'Finance', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
                      { flag: '🇫🇷', ticker: 'MC', name: 'LVMH', sector: 'Luxury', color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400' },
                      { flag: '🇺🇸', ticker: 'AMZN', name: 'Amazon', sector: 'Consumer', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
                    ]).map(stock => {
                      const isSelected = selectedStocks.includes(stock.ticker);
                      const isFull = selectedStocks.length >= 5 && !isSelected;
                      return (
                        <motion.button
                          key={stock.ticker}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStocks(s => s.filter(t => t !== stock.ticker));
                            } else if (!isFull) {
                              setSelectedStocks(s => [...s, stock.ticker]);
                            }
                          }}
                          whileTap={!isFull || isSelected ? { scale: 0.95 } : undefined}
                          animate={isFull ? { x: [0, -3, 3, -2, 2, 0] } : isSelected ? { scale: [1, 1.05, 1] } : {}}
                          transition={isFull ? { duration: 0.4 } : { duration: 0.2 }}
                          className={`relative rounded-2xl p-3 flex flex-col items-center text-center border-2 transition-colors ${
                            isSelected ? 'border-transparent text-white' : 'border-border bg-card text-foreground'
                          }`}
                          style={isSelected ? { backgroundColor: BLUE } : undefined}
                        >
                          {isSelected && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 text-white text-xs font-bold">✓</motion.span>
                          )}
                          <span className="text-lg">{stock.flag}</span>
                          <span className="font-display text-sm font-bold mt-1">{stock.ticker}</span>
                          <span className={`font-body text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>{stock.name}</span>
                          <span className={`font-body text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1.5 ${isSelected ? 'bg-white/20 text-white' : stock.color}`}>{stock.sector}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {selectedStocks.length === 5 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 max-w-md mx-auto w-full">
                      <motion.button
                        onClick={() => setGamePhase('result')}
                        whileTap={{ scale: 0.96 }}
                        className="w-full h-12 rounded-full font-display font-bold text-white text-sm"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        Meinen Index erstellen →
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {gamePhase === 'result' && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Your Index vs. the real S&P 500</h2>

                  {/* User index */}
                  <div className="rounded-2xl p-4 mb-3 max-w-md mx-auto w-full" style={{ backgroundColor: '#EFF6FF' }}>
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-3">YOUR INDEX</p>
                    <div className="flex flex-col gap-2">
                      {selectedStocks.map(ticker => (
                        <div key={ticker} className="flex items-center gap-2">
                          <span className="font-display text-xs font-bold w-12 text-foreground">{ticker}</span>
                          <div className="flex-1 h-4 rounded-full bg-white/60 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full rounded-full" style={{ backgroundColor: BLUE }} />
                          </div>
                          <span className="font-body text-xs text-foreground w-8 text-right">20%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="font-display text-sm text-muted-foreground text-center my-2">↓ vs ↓</p>

                  {/* S&P 500 */}
                  <div className="rounded-2xl bg-muted p-4 mb-4 max-w-md mx-auto w-full">
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-3">REAL S&P 500</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { ticker: 'AAPL', weight: 7.1 },
                        { ticker: 'MSFT', weight: 6.9 },
                        { ticker: 'NVDA', weight: 5.8 },
                        { ticker: 'AMZN', weight: 3.6 },
                        { ticker: 'GOOGL', weight: 3.2 },
                      ].map(s => (
                        <div key={s.ticker} className="flex items-center gap-2">
                          <span className="font-display text-xs font-bold w-12 text-foreground">{s.ticker}</span>
                          <div className="flex-1 h-4 rounded-full bg-background overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(s.weight / 7.1) * 30}%` }} transition={{ duration: 0.6, delay: 0.3 }} className="h-full rounded-full bg-green-500" />
                          </div>
                          <span className="font-body text-xs text-foreground w-8 text-right">{s.weight}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-2">+ 495 more companies...</p>
                  </div>

                  {/* Insights */}
                  <div className="flex flex-col gap-2 max-w-md mx-auto w-full mb-4">
                    {selectedStocks.includes('AAPL') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-body text-sm text-foreground">
                        ✓ You got Apple right — largest position in the S&P 500 at 7.1%
                      </motion.p>
                    )}
                    {selectedStocks.some(t => ['SAP', 'NESN', 'ASML', 'MC'].includes(t)) && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="font-body text-sm text-foreground">
                        🌍 You picked a European stock — the S&P 500 only contains US companies. For global companies, there\'s the MSCI World.
                      </motion.p>
                    )}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-body text-sm text-muted-foreground">
                      💡 The real S&P 500 weights by market cap, not equally. Apple has 7.1% — not 0.2% as in an equal-weight index.
                    </motion.p>
                  </div>

                  <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-md mx-auto w-full mb-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      That\'s the difference between an index you make up and one that works according to clear rules (market cap, liquidity, size).
                    </p>
                  </div>

                  <button
                    onClick={() => { setSelectedStocks([]); setGamePhase('pick'); }}
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    ← Nochmal wählen
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentStep === 2 && (
          <QuizSlideETF
            key="quiz1"
            quiz={quiz1}
            selected={selectedAnswer}
            onSelect={(id) => handleAnswer(id, quiz1)}
          />
        )}

        {currentStep === 3 && (
          <QuizSlideETF
            key="quiz2"
            quiz={quiz2}
            selected={selectedAnswer}
            onSelect={(id) => handleAnswer(id, quiz2)}
          />
        )}

        {currentStep === 4 && (
          <motion.div key="completion" className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5">You now know what an index is.</p>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 max-w-xs w-full mb-4 text-left">
              <p className="font-body text-sm text-green-700 dark:text-green-300 mb-1">✅ An index is a measurement, not a product</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300 mb-1">✅ Examples: S&P 500, DAX, MSCI World</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Larger companies have more influence</p>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeepDive(false)}
          >
            <motion.div
              className="bg-card rounded-t-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-3">What is a stock index? 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                A stock index is a statistical measure that tracks the performance of a defined group of securities. The methodology defines: (1) the universe of securities, (2) the weighting scheme (market cap, price, equal weight), (3) the rebalancing schedule. The S&P 500 uses float-adjusted market cap weighting — only freely tradable shares count.
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
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setSelectedAnswer(null); setSelectedStocks([]); setGamePhase('pick'); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

/* ── Quiz sub-component ── */
const QuizSlideETF = ({
  quiz,
  selected,
  onSelect,
}: {
  quiz: QuizConfig;
  selected: string | null;
  onSelect: (id: string) => void;
}) => {
  const isCorrect = selected === quiz.correctId;

  return (
    <motion.div
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
          if (selected) {
            if (a.id === quiz.correctId) {
              cls = 'border-green-500 bg-green-500/10';
              suffix = ' ✅';
            } else if (a.id === selected) {
              cls = 'border-red-500 bg-red-500/10';
              suffix = ' ✗';
            }
          }
          return (
            <motion.button
              key={a.id}
              onClick={() => onSelect(a.id)}
              disabled={!!selected}
              whileTap={!selected ? { scale: 0.97 } : undefined}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${cls}`}
            >
              <span className="font-body text-[15px] text-foreground">{a.text}{suffix}</span>
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
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <p className={`font-body text-sm leading-relaxed ${
              isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isCorrect ? quiz.correctFeedback : quiz.wrongFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ETF_L1_WhatIsAnIndex;
