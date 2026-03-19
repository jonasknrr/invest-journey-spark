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
  question: 'Was beschreibt einen Aktienindex am besten?',
  answers: [
    { id: 'a', text: 'Ein Fonds in den man direkt investieren kann' },
    { id: 'b', text: 'Eine Messung die eine Gruppe von Aktien als eine Zahl verfolgt' },
    { id: 'c', text: 'Eine Liste der besten Aktien des Jahres' },
    { id: 'd', text: 'Ein Staatsbericht über die Wirtschaft' },
  ],
  correctId: 'b',
  correctFeedback: 'Genau! Ein Index ist ein reines Messinstrument — wie ein Thermometer. Du kannst nicht den S&P 500 direkt kaufen.',
  wrongFeedback: 'Nicht ganz. Ein Index ist nur eine Zahl die einen Aktienkorb misst. Dafür gibt es ETFs — kommt in Lektion 3!',
};

const quiz2: QuizConfig = {
  question: 'Der MSCI World fällt heute um 3%. Was bedeutet das?',
  answers: [
    { id: 'a', text: 'Jede einzelne Aktie fiel genau um 3%' },
    { id: 'b', text: 'Das Index-Komitee hat die Zahl manuell gesenkt' },
    { id: 'c', text: 'Grosse Unternehmen in 23 Ländern verloren im Schnitt ~3% ihres Wertes' },
    { id: 'd', text: 'Die US-Wirtschaft schrumpfte um 3%' },
  ],
  correctId: 'c',
  correctFeedback: 'Korrekt! Ein Index ist ein gewichteter Durchschnitt. Einzelne Aktien bewegen sich unterschiedlich — der Nettoeffekt war -3%.',
  wrongFeedback: 'Ein Index ist ein gewichteter Durchschnitt. Die -3% zeigen den Gesamtkorb, nicht jede einzelne Aktie.',
};

const ETF_L1_WhatIsAnIndex = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson } = useProgressStore();
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
                    <h2 className="font-display text-2xl font-bold text-foreground leading-tight">Du kennst Spotify's Top 50?</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-5">
                    <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center gap-2">
                      <span className="text-2xl">🎵</span>
                      <p className="font-body text-sm font-medium text-foreground">Ein Song von Ed Sheeran</p>
                      <p className="font-body text-xs text-muted-foreground">= eine Aktie</p>
                    </div>
                    <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2" style={{ backgroundColor: '#EFF6FF' }}>
                      <span className="text-2xl">📋</span>
                      <p className="font-body text-sm font-medium text-foreground">Top 50 Global Playlist</p>
                      <p className="font-body text-xs" style={{ color: BLUE }}>= ein Index</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors">Nächste →</button>
                  </div>
                </motion.div>
              )}

              {storySlide === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Die Playlist gehört niemandem.</h2>
                  <div className="max-w-sm mx-auto w-full mb-4 rounded-2xl overflow-hidden shadow-md">
                    <div className="px-4 py-3 text-white font-display font-bold text-sm" style={{ backgroundColor: '#1DB954' }}>🎵 Top 50 Global — Spotify</div>
                    <div className="bg-card px-4 py-3 flex flex-col gap-2">
                      <p className="font-body text-sm text-foreground">🥇 Blinding Lights — The Weeknd</p>
                      <p className="font-body text-sm text-foreground">🥈 Shape of You — Ed Sheeran</p>
                      <p className="font-body text-sm text-foreground">🥉 Dance Monkey — Tones and I</p>
                    </div>
                    <div className="bg-card px-4 py-2 border-t border-border">
                      <p className="font-body text-xs text-muted-foreground">Kuratiert von Spotify • täglich aktualisiert</p>
                    </div>
                  </div>
                  <div className="max-w-sm mx-auto w-full rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 mb-4">
                    <p className="font-body text-sm text-destructive font-medium">❌ Du kannst diese Playlist nicht kaufen — nur hören</p>
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center max-w-xs mx-auto mb-4">Spotify wählt aus, berechnet, aktualisiert. Du schaust zu.</p>
                  <div className="flex justify-end mt-auto">
                    <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors">Nächste →</button>
                  </div>
                </motion.div>
              )}

              {storySlide === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Der S&P 500 ist dasselbe — für Aktien.</h2>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto w-full mb-4">
                    {[
                      { flag: '🇺🇸', name: 'S&P 500', desc: 'Top 500 US-Unternehmen nach Grösse', tag: 'Bekanntester Index weltweit' },
                      { flag: '🇩🇪', name: 'DAX', desc: 'Top 40 deutsche Unternehmen', tag: 'Deutschlands Wirtschaftspuls' },
                      { flag: '🌍', name: 'MSCI World', desc: '~1.500 Firmen aus 23 Ländern', tag: 'Die globale Playlist' },
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
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">💡 Ein Index ist eine Messung — kein Produkt. Wie ein Thermometer: du kannst nicht 20°C kaufen.</p>
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
                      <h2 className="font-display text-xl font-bold text-foreground">Bau deinen eigenen Index!</h2>
                      <p className="font-body text-sm text-muted-foreground mt-1">Wähle 5 Unternehmen die du für die wichtigsten der Welt hältst</p>
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
                      { flag: '🇨🇭', ticker: 'NESN', name: 'Nestlé', sector: 'Konsum', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
                      { flag: '🇳🇱', ticker: 'ASML', name: 'ASML', sector: 'Tech', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                      { flag: '🇺🇸', ticker: 'JPM', name: 'JPMorgan', sector: 'Finanzen', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
                      { flag: '🇫🇷', ticker: 'MC', name: 'LVMH', sector: 'Luxus', color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400' },
                      { flag: '🇺🇸', ticker: 'AMZN', name: 'Amazon', sector: 'Konsum', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
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
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Dein Index vs. der echte S&P 500</h2>

                  {/* User index */}
                  <div className="rounded-2xl p-4 mb-3 max-w-md mx-auto w-full" style={{ backgroundColor: '#EFF6FF' }}>
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-3">DEIN INDEX</p>
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
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-3">ECHTER S&P 500</p>
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
                    <p className="font-body text-xs text-muted-foreground mt-2">+ 495 weitere Unternehmen...</p>
                  </div>

                  {/* Insights */}
                  <div className="flex flex-col gap-2 max-w-md mx-auto w-full mb-4">
                    {selectedStocks.includes('AAPL') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-body text-sm text-foreground">
                        ✓ Apple hast du richtig eingeschätzt — grösste Position im S&P 500 mit 7.1%
                      </motion.p>
                    )}
                    {selectedStocks.some(t => ['SAP', 'NESN', 'ASML', 'MC'].includes(t)) && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="font-body text-sm text-foreground">
                        🌍 Du hast eine europäische Aktie gewählt — der S&P 500 enthält nur US-Unternehmen. Für globale Firmen gibt es den MSCI World.
                      </motion.p>
                    )}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-body text-sm text-muted-foreground">
                      💡 Der echte S&P 500 gewichtet nach Marktkapitalisierung, nicht gleichmässig. Apple hat 7.1% — nicht 0.2% wie in einem gleichgewichteten Index.
                    </motion.p>
                  </div>

                  <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-md mx-auto w-full mb-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      Das ist der Unterschied zwischen einem Index den du dir ausdenkst und einem der nach klaren Regeln (Marktkapitalisierung, Liquidität, Grösse) funktioniert.
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lektion abgeschlossen!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5">Du weisst jetzt was ein Index ist.</p>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 max-w-xs w-full mb-4 text-left">
              <p className="font-body text-sm text-green-700 dark:text-green-300 mb-1">✅ Ein Index ist eine Messung, kein Produkt</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300 mb-1">✅ Beispiele: S&P 500, DAX, MSCI World</p>
              <p className="font-body text-sm text-green-700 dark:text-green-300">✅ Grosse Unternehmen haben mehr Einfluss</p>
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Was ist ein Aktienindex? 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Ein Aktienindex ist ein statistisches Mass das die Performance einer definierten Gruppe von Wertpapieren verfolgt. Die Methodologie legt fest: (1) das Universum der Wertpapiere, (2) das Gewichtungsschema (Marktkapitalisierung, Preis, Gleichgewichtung), (3) den Rebalancing-Zeitplan. Der S&P 500 nutzt float-adjustierte Marktkapitalisierungsgewichtung — nur frei handelbare Aktien zählen.
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
