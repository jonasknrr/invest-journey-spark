import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

const quiz = {
  question: 'ETF A: TER 0.15%, Tracking Difference -0.05%.\nETF B: TER 0.07%, Tracking Difference +0.20%.\nWhich one is actually cheaper?',
  answers: [
    { id: 'a', text: 'ETF B — lower TER' },
    { id: 'b', text: 'ETF A — negative TD means it beat its index, real costs near zero' },
    { id: 'c', text: 'Both equally expensive' },
    { id: 'd', text: 'Impossible to tell' },
  ],
  correctId: 'b',
  correctFeedback: 'Exactly! Tracking Difference is the true cost metric. TD -0.05% = ETF A outperformed its index. ETF B at +0.20% TD is more expensive despite a lower TER.',
  wrongFeedback: 'Look at the Tracking Difference, not just the TER. ETF A with TD -0.05% even outperformed its index — real costs = negative. ETF B at +0.20% TD is the more expensive one.',
};

/* ── Helpers ── */
const calcValue = (inv: number, ret: number, ter: number, years: number) =>
  inv * Math.pow(1 + (ret - ter) / 100, years);

const calcMaxValue = (inv: number, ret: number, years: number) =>
  inv * Math.pow(1 + ret / 100, years);

const fmt = (n: number) => Math.round(n).toLocaleString('de-CH');

/* ── Bucket component ── */
const Bucket = ({ label, ter, fill, value, color }: { label: string; ter: string; fill: number; value: number; color: 'blue' | 'red' }) => {
  const bg = color === 'blue' ? 'bg-blue-500' : 'bg-red-500';
  const border = color === 'blue' ? 'border-blue-300' : 'border-red-300';
  return (
    <div className="flex flex-col items-center flex-1">
      <p className="font-display text-xs font-bold text-foreground mb-1">{label}</p>
      <p className="font-body text-[10px] text-muted-foreground mb-2">TER: {ter}</p>
      <div className={`relative w-16 h-28 border-2 ${border} rounded-b-2xl overflow-hidden bg-muted/30`}>
        <motion.div
          className={`absolute bottom-0 left-0 right-0 ${bg}/70`}
          initial={{ height: '100%' }}
          animate={{ height: `${fill}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-foreground/30 ${color === 'blue' ? 'w-1 h-1' : 'w-2.5 h-2.5'}`} />
      </div>
      <p className="font-display text-sm font-bold text-foreground mt-2">CHF {fmt(value)}</p>
    </div>
  );
};

/* ── Component ── */
const ETF_L5_Costs = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [storySlide, setStorySlide] = useState(0);

  // Step 1 — Leaky Bucket
  const [investment, setInvestment] = useState(10000);
  const [returnRate, setReturnRate] = useState(7);
  const [terB, setTerB] = useState(0.50);
  const terA = 0.07;

  // Step 2 — Race
  const [raceTerA, setRaceTerA] = useState(0.07);
  const [raceTerB, setRaceTerB] = useState(0.50);
  const [raceYear, setRaceYear] = useState(0);
  const [raceRunning, setRaceRunning] = useState(false);
  const raceInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3 — Quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4 — Deep dive
  const [showDeepDive, setShowDeepDive] = useState(false);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e5', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('etfs-e5', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  // Race logic
  useEffect(() => {
    if (raceRunning && raceYear < 30) {
      raceInterval.current = setInterval(() => {
        setRaceYear(y => {
          if (y >= 30) {
            if (raceInterval.current) clearInterval(raceInterval.current);
            setRaceRunning(false);
            return 30;
          }
          return y + 1;
        });
      }, 100);
    }
    return () => { if (raceInterval.current) clearInterval(raceInterval.current); };
  }, [raceRunning]);

  useEffect(() => {
    if (raceYear >= 30 && raceInterval.current) {
      clearInterval(raceInterval.current);
      setRaceRunning(false);
    }
  }, [raceYear]);

  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return true;
    if (currentStep === 2) return raceYear >= 30;
    if (currentStep === 3) return !!selectedAnswer;
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) { navigate('/category/etfs'); return; }
    setCurrentStep(s => s + 1);
  };

  // Step 1 calculations
  const valA = calcValue(investment, returnRate, terA, 30);
  const valB = calcValue(investment, returnRate, terB, 30);
  const maxVal = calcMaxValue(investment, returnRate, 30);
  const fillA = (valA / maxVal) * 100;
  const fillB = (valB / maxVal) * 100;
  const saved = valA - valB;

  // Step 2 calculations
  const raceMaxVal = calcValue(10000, 7, Math.min(raceTerA, raceTerB), 30);
  const raceValA = calcValue(10000, 7, raceTerA, raceYear);
  const raceValB = calcValue(10000, 7, raceTerB, raceYear);
  const raceValA30 = calcValue(10000, 7, raceTerA, 30);
  const raceValB30 = calcValue(10000, 7, raceTerB, 30);
  const raceDiff = Math.abs(raceValA30 - raceValB30);
  const racePosA = raceYear === 0 ? 0 : (raceValA / raceMaxVal) * 90;
  const racePosB = raceYear === 0 ? 0 : (raceValB / raceMaxVal) * 90;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/category/etfs')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <FiX className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: BLUE }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <FiHeart key={i} className={`w-5 h-5 transition-all ${i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">

        {/* ═══ STEP 0 — Story ═══ */}
        {currentStep === 0 && (
          <motion.div key="s0" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === storySlide ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* SLIDE 0 — Water Bucket */}
              {storySlide === 0 && (
                <motion.div key="ss0" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>🪣</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">Your investment is a water bucket.</h2>
                  <div className="flex gap-6 mb-4 w-full justify-center">
                    <div className="flex flex-col items-center">
                      <p className="font-display text-xs font-bold text-foreground mb-1">ETF A — 0.07%</p>
                      <div className="relative w-20 h-32 border-2 border-blue-300 rounded-b-2xl overflow-hidden bg-muted/30">
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/70" style={{ height: '99%' }} />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/30" />
                      </div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-body text-[10px] font-semibold">After 30 years: CHF 96,000</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="font-display text-xs font-bold text-foreground mb-1">ETF B — 0.50%</p>
                      <div className="relative w-20 h-32 border-2 border-red-300 rounded-b-2xl overflow-hidden bg-muted/30">
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500/70" style={{ height: '78%' }} />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground/30" />
                      </div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 font-body text-[10px] font-semibold">After 30 years: CHF 82,000</span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">Same hole. 30 years. CHF 14,000 difference.</p>
                  <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Next →</button>
                </motion.div>
              )}

              {/* SLIDE 1 — Cover band */}
              {storySlide === 1 && (
                <motion.div key="ss1" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>🎸</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">The ETF is a cover band.</h2>
                  <div className="w-full rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🎵</span>
                      <p className="font-body text-sm text-white font-medium">Original-Song (Index)</p>
                    </div>
                    <div className="h-1 rounded-full bg-green-400 mb-1" />
                    <p className="font-body text-[10px] text-green-300 mb-3">Exact index return</p>
                    <div className="border-t border-white/20 mb-3" />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🎸</span>
                      <p className="font-body text-sm text-white font-medium">Coverband (ETF)</p>
                    </div>
                    <svg className="w-full h-2 mb-1" viewBox="0 0 200 8">
                      <path d="M0,4 Q10,1 20,4 T40,4 T60,4 T80,4 T100,4 T120,4 T140,4 T160,4 T180,4 T200,4" fill="none" stroke="#F59E0B" strokeWidth="2" />
                    </svg>
                    <p className="font-body text-[10px] text-amber-300">Almost the same — but not quite</p>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="inline-block px-2 py-1 rounded-full bg-green-500/10 text-green-700 font-body text-[10px] font-semibold">Good cover band = low Tracking Difference</span>
                    <span className="inline-block px-2 py-1 rounded-full bg-amber-500/10 text-amber-700 font-body text-[10px] font-semibold">Bad cover band = you lose more than the TER</span>
                  </div>
                  <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Next →</button>
                </motion.div>
              )}

              {/* SLIDE 2 — Costs breakdown */}
              {storySlide === 2 && (
                <motion.div key="ss2" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>🎟</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">Buying costs — even with ETFs.</h2>
                  <div className="w-full rounded-2xl border border-border bg-card p-4 mb-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">🎟</span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">Entry price (Spread)</p>
                        <p className="font-body text-xs text-muted-foreground">You pay CHF 100.10, get back CHF 99.90</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px] font-semibold">CHF 0.20 gone instantly</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">📅</span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">Annual fee (TER)</p>
                        <p className="font-body text-xs text-muted-foreground">Silently deducted from fund assets daily</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-body text-[10px] font-semibold">0.07% – 0.75% p.a.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">📊</span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">Deviation (Tracking Diff.)</p>
                        <p className="font-body text-xs text-muted-foreground">How closely does the ETF really follow the index?</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 font-body text-[10px] font-semibold">More important than TER!</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-2">
                    <p className="font-body text-xs text-amber-700 text-center">💡 Always check the Tracking Difference — not just the TER.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ STEP 1 — Leaky Bucket Calculator ═══ */}
        {currentStep === 1 && (
          <motion.div key="s1" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">How big is your hole?</h2>

            <div className="space-y-4 mb-5 max-w-sm mx-auto w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Initial investment</span>
                  <span className="font-display text-xs font-bold text-foreground">CHF {fmt(investment)}</span>
                </div>
                <input type="range" min={1000} max={100000} step={1000} value={investment} onChange={e => setInvestment(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Annual return</span>
                  <span className="font-display text-xs font-bold text-foreground">{returnRate.toFixed(1)}%</span>
                </div>
                <input type="range" min={1} max={12} step={0.5} value={returnRate} onChange={e => setReturnRate(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">ETF B TER</span>
                  <span className="font-display text-xs font-bold text-foreground">{terB.toFixed(2)}%</span>
                </div>
                <input type="range" min={0.10} max={1.50} step={0.05} value={terB} onChange={e => setTerB(+e.target.value)} className="w-full accent-red-500" />
              </div>
            </div>

            <div className="flex gap-6 justify-center mb-4">
              <Bucket label="ETF A" ter={`${terA}%`} fill={fillA} value={valA} color="blue" />
              <Bucket label="ETF B" ter={`${terB.toFixed(2)}%`} fill={fillB} value={valB} color="red" />
            </div>

            <div className="max-w-sm mx-auto w-full rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 mb-3 text-center">
              <p className="font-body text-xs text-muted-foreground">You save with ETF A</p>
              <p className="font-display text-xl font-bold text-amber-600">CHF {fmt(saved)}</p>
            </div>
            <p className="font-body text-[11px] text-muted-foreground text-center max-w-xs mx-auto">The TER is deducted from fund assets daily — you never see it directly.</p>
          </motion.div>
        )}

        {/* ═══ STEP 2 — Race ═══ */}
        {currentStep === 2 && (
          <motion.div key="s2" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">30-year race — who wins?</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Set the fees and start the race</p>

            <div className="grid grid-cols-2 gap-4 mb-4 max-w-sm mx-auto w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-[10px] text-muted-foreground">🔵 ETF A TER</span>
                  <span className="font-display text-[10px] font-bold">{raceTerA.toFixed(2)}%</span>
                </div>
                <input type="range" min={0.01} max={0.50} step={0.01} value={raceTerA} onChange={e => setRaceTerA(+e.target.value)} className="w-full accent-blue-500" disabled={raceRunning} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-[10px] text-muted-foreground">🔴 ETF B TER</span>
                  <span className="font-display text-[10px] font-bold">{raceTerB.toFixed(2)}%</span>
                </div>
                <input type="range" min={0.10} max={1.50} step={0.05} value={raceTerB} onChange={e => setRaceTerB(+e.target.value)} className="w-full accent-red-500" disabled={raceRunning} />
              </div>
            </div>

            {raceYear === 0 && !raceRunning && (
              <motion.button
                onClick={() => { setRaceYear(0); setRaceRunning(true); }}
                whileTap={{ scale: 0.96 }}
                className="mx-auto mb-4 px-6 py-3 rounded-full font-display text-sm font-bold text-white"
                style={{ backgroundColor: BLUE }}
              >
                Start the race! 🏁
              </motion.button>
            )}

            <div className="max-w-sm mx-auto w-full mb-4">
              <p className="font-display text-sm font-bold text-foreground text-center mb-2">
                {raceYear > 0 ? `Year ${raceYear} / 30` : 'Ready'}
              </p>
              <div className="relative h-20 bg-muted rounded-xl overflow-hidden">
                <div className="absolute right-2 top-0 bottom-0 w-px border-r-2 border-dashed border-foreground/20 flex items-center">
                  <span className="absolute -right-3 top-1 text-xs">🏁</span>
                </div>
                <motion.div className="absolute top-3 flex items-center gap-1" animate={{ left: `${racePosA}%` }} transition={{ duration: 0.1 }}>
                  <span className="text-lg">🔵</span>
                  <span className="font-body text-[9px] text-foreground font-bold whitespace-nowrap">CHF {fmt(raceValA)}</span>
                </motion.div>
                <motion.div className="absolute top-12 flex items-center gap-1" animate={{ left: `${racePosB}%` }} transition={{ duration: 0.1 }}>
                  <span className="text-lg">🔴</span>
                  <span className="font-body text-[9px] text-foreground font-bold whitespace-nowrap">CHF {fmt(raceValB)}</span>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {raceYear >= 30 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm mx-auto w-full mb-3">
                  <div className={`rounded-2xl p-4 text-center ${raceDiff > 5000 ? 'bg-red-500/10 border border-red-500/20' : raceDiff >= 1000 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                    <p className="font-display text-sm font-bold text-foreground">
                      {raceDiff > 5000 && `😱 ETF B costs you CHF ${fmt(raceDiff)} more over 30 years!`}
                      {raceDiff >= 1000 && raceDiff <= 5000 && `⚠️ CHF ${fmt(raceDiff)} difference — not to be underestimated.`}
                      {raceDiff < 1000 && `✅ Small difference — both ETFs nearly identical.`}
                    </p>
                  </div>
                  <button onClick={() => { setRaceYear(0); setRaceRunning(false); }} className="mt-2 font-body text-xs text-muted-foreground underline mx-auto block">↺ Again</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ STEP 3 — Quiz ═══ */}
        {currentStep === 3 && (
          <motion.div key="s3" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-2">Quiz time! 🧠</h2>
            <p className="font-body text-sm text-foreground text-center mb-5 whitespace-pre-line">{quiz.question}</p>
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
            <p className="font-body text-sm text-muted-foreground max-w-xs text-center mb-5">You now see through hidden costs.</p>

            <div className="w-full max-w-sm rounded-2xl bg-green-500/10 border border-green-500/20 p-4 mb-4 space-y-2">
              <p className="font-body text-xs text-foreground">✅ TER = the hole in the bucket, silently deducted daily</p>
              <p className="font-body text-xs text-foreground">✅ Tracking Difference = true costs (more important than TER!)</p>
              <p className="font-body text-xs text-foreground">✅ Spread = entry costs when trading</p>
              <p className="font-body text-xs text-foreground">✅ Small TER difference = big sum after 30 years</p>
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">TER vs Tracking Difference 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                TER is the stated annual fee. TD is the actual return difference between ETF and index — the true costs.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Securities lending: ETF providers lend stocks to short sellers and earn a fee — this can overcompensate the TER and lead to negative TD.
              </p>
              <button onClick={() => setShowDeepDive(false)} className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L5_Costs;
