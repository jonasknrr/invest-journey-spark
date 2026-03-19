import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const TOTAL_STEPS = 5;

const fmt = (n: number) => Math.round(n).toLocaleString('de-CH');

/* ── Future value of annuity ── */
const fvAnnuity = (monthly: number, annualRate: number, years: number) => {
  const r = annualRate / 1200;
  if (r === 0) return monthly * years * 12;
  return monthly * ((Math.pow(1 + r, years * 12) - 1) / r);
};

/* ── Decoder game ── */
interface DecoderETF {
  name: string;
  answer: 'acc' | 'dist';
  feedback: string;
}

const decoderETFs: DecoderETF[] = [
  { name: 'iShares Core MSCI World UCITS ETF (Acc)', answer: 'acc', feedback: "✅ '(Acc)' am Ende = thesaurierend. Dividenden werden automatisch reinvestiert." },
  { name: 'Vanguard FTSE All-World UCITS ETF (USD) Distributing', answer: 'dist', feedback: "✅ 'Distributing' = ausschüttend. Du bekommst Dividenden ausgezahlt." },
  { name: 'Xtrackers MSCI World Swap UCITS ETF 1C', answer: 'acc', feedback: "✅ '1C' steht für 'Capitalising' = thesaurierend. Auch 'C' am Ende ist ein Hinweis." },
  { name: 'SPDR S&P 500 ETF Trust', answer: 'dist', feedback: "✅ Kein 'Acc' = meist ausschüttend. US-ETFs schütten fast immer aus." },
  { name: 'Amundi MSCI World II UCITS ETF Acc', answer: 'acc', feedback: "✅ 'Acc' direkt im Namen = thesaurierend." },
];

/* ── Quiz ── */
const quiz = {
  question: 'Julia ist 28 und investiert für die Rente mit 65. Sie will maximales Wachstum ohne manuellen Aufwand. Was wählt sie?',
  answers: [
    { id: 'a', text: 'Ausschüttend — regelmässige Barzahlungen zum selbst reinvestieren' },
    { id: 'b', text: 'Thesaurierend — Dividenden automatisch reinvestiert, kein Aufwand' },
    { id: 'c', text: 'Macht keinen Unterschied für die Rendite' },
    { id: 'd', text: 'Ausschüttend — hat immer niedrigere TER' },
  ],
  correctId: 'b',
  correctFeedback: 'Genau! Thesaurierend = Schneeball rollt ungestört. 37 Jahre Zinseszins ohne einen Finger zu rühren.',
  wrongFeedback: 'Thesaurierende ETFs reinvestieren automatisch — kein Aufwand, kein verpasstes Timing, maximaler Zinseszins über 37 Jahre.',
};

/* ── Component ── */
const ETF_L7_AccVsDist = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson } = useProgressStore();
  const [storySlide, setStorySlide] = useState(0);

  // Slide 0 snowball animation
  const [accSize, setAccSize] = useState(60);
  const [distSize, setDistSize] = useState(60);
  const [snowDone, setSnowDone] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const snowInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);

  // Step 1 — Snowball race
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(7);
  const dividendYield = 2;
  const [milestone, setMilestone] = useState<string | null>(null);
  const milestoneTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 — Decoder
  const [decoderIndex, setDecoderIndex] = useState(0);
  const [decoderScore, setDecoderScore] = useState(0);
  const [decoderDone, setDecoderDone] = useState(false);
  const [decoderFeedback, setDecoderFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // Step 3 — Quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4 — Deep dive
  const [showDeepDive, setShowDeepDive] = useState(false);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

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
      const r = completeLesson('etfs-e7', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  // Slide 0 snowball animation
  useEffect(() => {
    if (currentStep === 0 && storySlide === 0 && !snowDone) {
      const startTime = Date.now();
      snowInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / 3000, 1);
        setAccSize(60 + t * 60); // 60 → 120
        setDistSize(60 + t * 30); // 60 → 90
        if (t >= 1) {
          setSnowDone(true);
          if (snowInterval.current) clearInterval(snowInterval.current);
        }
      }, 50);
      // Particle emission
      const pInterval = setInterval(() => {
        particleId.current += 1;
        setParticles(p => [...p.slice(-4), particleId.current]);
      }, 800);
      return () => {
        if (snowInterval.current) clearInterval(snowInterval.current);
        clearInterval(pInterval);
      };
    }
  }, [currentStep, storySlide, snowDone]);

  // Step 1 calculations
  const accVal = fvAnnuity(monthlyAmount, returnRate, years);
  const distVal = fvAnnuity(monthlyAmount, returnRate - dividendYield, years);
  const diff = accVal - distVal;
  const maxVal = Math.max(accVal, 1);
  const accBallSize = Math.min(200, Math.max(60, (accVal / maxVal) * 200));
  const distBallSize = Math.min(200, Math.max(60, (distVal / maxVal) * 200));

  // Milestones
  useEffect(() => {
    if (accVal >= 250000) showMilestone('💎 €250k erreicht!');
    else if (accVal >= 100000) showMilestone('🚀 €100k erreicht!');
    else if (accVal >= 50000) showMilestone('🎯 €50k erreicht!');
    else setMilestone(null);
  }, [accVal]);

  const showMilestone = (text: string) => {
    setMilestone(text);
    if (milestoneTimeout.current) clearTimeout(milestoneTimeout.current);
    milestoneTimeout.current = setTimeout(() => setMilestone(null), 2000);
  };

  // Decoder
  const handleDecoder = (choice: 'acc' | 'dist') => {
    if (decoderFeedback || decoderDone) return;
    const etf = decoderETFs[decoderIndex];
    const correct = choice === etf.answer;
    if (correct) {
      setDecoderScore(s => s + 1);
      setDecoderFeedback({ type: 'correct', text: etf.feedback });
    } else {
      setHearts(h => Math.max(0, h - 1));
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setDecoderFeedback({ type: 'wrong', text: etf.feedback });
    }
    setTimeout(() => {
      setDecoderFeedback(null);
      if (decoderIndex + 1 >= decoderETFs.length) setDecoderDone(true);
      else setDecoderIndex(i => i + 1);
    }, 1500);
  };

  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return true;
    if (currentStep === 2) return decoderDone;
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
              {/* SLIDE 0 — Snowballs */}
              {storySlide === 0 && (
                <motion.div key="ss0" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>⛄</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">Zwei Schneebälle. Ein Hügel.</h2>
                  <div className="flex gap-8 items-end justify-center mb-4 h-56">
                    {/* Acc snowball */}
                    <div className="flex flex-col items-center">
                      <p className="font-display text-[10px] font-bold text-foreground mb-2">Thesaurierend (Acc)</p>
                      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
                        <motion.div
                          className="rounded-full bg-blue-400/80 border-2 border-blue-300"
                          style={{ width: accSize, height: accSize }}
                          transition={{ duration: 0.05 }}
                        />
                      </div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-body text-[10px] font-semibold">Rollt ungestört ✓</span>
                    </div>
                    {/* Dist snowball */}
                    <div className="flex flex-col items-center">
                      <p className="font-display text-[10px] font-bold text-foreground mb-2">Ausschüttend (Dist)</p>
                      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
                        <motion.div
                          className="rounded-full bg-gray-300/80 border-2 border-gray-400"
                          style={{ width: distSize, height: distSize }}
                          transition={{ duration: 0.05 }}
                        />
                        {/* Particles */}
                        {particles.map(pid => (
                          <motion.div
                            key={pid}
                            className="absolute w-2 h-2 rounded-full bg-gray-400"
                            initial={{ opacity: 1, y: 0, x: 0 }}
                            animate={{ opacity: 0, y: 40, x: Math.random() * 20 - 10 }}
                            transition={{ duration: 0.8 }}
                            style={{ top: '60%', left: '50%' }}
                          />
                        ))}
                      </div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-body text-[10px] font-semibold">Gibt Schnee ab...</span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground text-center mb-4">Gleicher Start. Gleiche Strecke. 30 Jahre später: riesiger Unterschied.</p>
                  <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Nächste →</button>
                </motion.div>
              )}

              {/* SLIDE 1 — What happens to dividends */}
              {storySlide === 1 && (
                <motion.div key="ss1" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">Was passiert mit deinen Dividenden?</h2>
                  <div className="w-full rounded-2xl border border-border overflow-hidden mb-4">
                    {/* Acc section */}
                    <div className="p-4" style={{ backgroundColor: '#EFF6FF' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📋</span>
                        <p className="font-display text-sm font-bold text-foreground">Thesaurierend (Acc)</p>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>💰</motion.span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-body text-xs text-foreground">Automatisch reinvestiert</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-body text-[10px] font-semibold">Zinseszins voll erhalten ✓</span>
                    </div>
                    {/* Divider */}
                    <div className="border-t-2 border-dashed border-border" />
                    {/* Dist section */}
                    <div className="p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💸</span>
                        <p className="font-display text-sm font-bold text-foreground">Ausschüttend (Dist)</p>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span animate={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>💰</motion.span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm">🏦</span>
                        <span className="font-body text-xs text-foreground">Wird dir ausgezahlt</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-body text-[10px] font-semibold">Du musst selbst reinvestieren</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center mb-4">Vergisst du die Reinvestition auch nur einen Monat? Der Zinseszins-Effekt leidet.</p>
                  <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Nächste →</button>
                </motion.div>
              )}

              {/* SLIDE 2 — 30 year difference */}
              {storySlide === 2 && (
                <motion.div key="ss2" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">Der Unterschied nach 30 Jahren.</h2>
                  <div className="w-full rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-[10px] text-white/60 mb-3">Startkapital: €10.000 · Rendite: 7% · Dividende: 2%</p>
                    <p className="font-body text-xs text-white/80 mb-1">⛄ Acc nach 30 Jahren:</p>
                    <p className="font-display text-3xl font-bold text-green-400 mb-3">€{fmt(10000 * Math.pow(1.07, 30))}</p>
                    <div className="border-t border-white/20 my-3" />
                    <p className="font-body text-xs text-white/80 mb-1">💸 Dist nach 30 Jahren (Dividenden ausgegeben):</p>
                    <p className="font-display text-2xl font-bold text-white/60 mb-3">€{fmt(10000 * Math.pow(1.05, 30))}</p>
                    <div className="rounded-xl bg-amber-500/20 p-3">
                      <p className="font-display text-sm font-bold text-amber-300">Unterschied: €{fmt(10000 * Math.pow(1.07, 30) - 10000 * Math.pow(1.05, 30))}</p>
                      <p className="font-body text-[10px] text-amber-300/70 mt-1">Das ist der Preis für «ich nehme lieber das Geld jetzt.»</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ STEP 1 — Snowball Race ═══ */}
        {currentStep === 1 && (
          <motion.div key="s1" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-4">Sieh wie die Schneebälle auseinanderdriften</h2>

            <div className="space-y-3 mb-4 max-w-sm mx-auto w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Monatliche Sparrate</span>
                  <span className="font-display text-xs font-bold text-foreground">€{fmt(monthlyAmount)}</span>
                </div>
                <input type="range" min={50} max={1000} step={50} value={monthlyAmount} onChange={e => setMonthlyAmount(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Jahre</span>
                  <span className="font-display text-xs font-bold text-foreground">{years}</span>
                </div>
                <input type="range" min={5} max={40} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Jährliche Rendite</span>
                  <span className="font-display text-xs font-bold text-foreground">{returnRate.toFixed(1)}%</span>
                </div>
                <input type="range" min={3} max={12} step={0.5} value={returnRate} onChange={e => setReturnRate(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div className="flex justify-between">
                <span className="font-body text-xs text-muted-foreground">Dividendenrendite</span>
                <span className="font-display text-xs font-bold text-muted-foreground">{dividendYield}% (fix)</span>
              </div>
            </div>

            {/* Snowballs */}
            <div className="flex gap-6 items-end justify-center mb-3" style={{ minHeight: 220 }}>
              <div className="flex flex-col items-center">
                <motion.div
                  className="rounded-full bg-blue-400/80 border-2 border-blue-300"
                  animate={{ width: accBallSize, height: accBallSize }}
                  transition={{ duration: 0.3 }}
                />
                <p className="font-display text-sm font-bold text-green-600 mt-2">€{fmt(accVal)}</p>
                <p className="font-body text-[10px] text-muted-foreground">Acc</p>
              </div>
              <div className="flex flex-col items-center">
                <motion.div
                  className="rounded-full bg-gray-300/80 border-2 border-gray-400"
                  animate={{ width: distBallSize, height: distBallSize }}
                  transition={{ duration: 0.3 }}
                />
                <p className="font-display text-sm font-bold text-muted-foreground mt-2">€{fmt(distVal)}</p>
                <p className="font-body text-[10px] text-muted-foreground">Dist</p>
              </div>
            </div>

            {/* Milestone */}
            <AnimatePresence>
              {milestone && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 font-display text-xs font-bold">{milestone}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Diff box */}
            <div className="max-w-sm mx-auto w-full rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-2 text-center">
              <p className="font-body text-xs text-muted-foreground">Acc ist mehr</p>
              <p className="font-display text-xl font-bold text-amber-600">€{fmt(diff)}</p>
            </div>
            <p className="font-body text-[11px] text-muted-foreground text-center max-w-xs mx-auto">Der blaue Ball wächst schneller weil jeder Cent sofort wieder arbeitet.</p>
          </motion.div>
        )}

        {/* ═══ STEP 2 — ETF Name Decoder ═══ */}
        {currentStep === 2 && (
          <motion.div key="s2" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">Acc oder Dist? Du entscheidest!</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Tippe auf den richtigen Typ für jeden ETF-Namen</p>

            {!decoderDone ? (
              <div className="max-w-sm mx-auto w-full">
                <p className="font-body text-xs text-muted-foreground text-right mb-3">{decoderScore}/{decoderETFs.length}</p>

                <motion.div key={decoderIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border shadow-sm p-5 text-center mb-4">
                  <p className="font-display text-sm font-bold text-foreground leading-relaxed">{decoderETFs[decoderIndex].name}</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDecoder('acc')} className="py-3 rounded-2xl border-2 border-blue-500 text-blue-700 font-display text-sm font-bold">
                    ⛄ Thesaurierend (Acc)
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDecoder('dist')} className="py-3 rounded-2xl border-2 border-blue-500 text-blue-700 font-display text-sm font-bold">
                    💸 Ausschüttend (Dist)
                  </motion.button>
                </div>

                {decoderFeedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-3 ${decoderFeedback.type === 'correct' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <p className="font-body text-xs text-foreground">{decoderFeedback.text}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full">
                <div className="rounded-2xl p-5 text-center mb-4 bg-green-500/10 border border-green-500/20">
                  <p className="font-display text-2xl font-bold text-foreground mb-2">{decoderScore}/{decoderETFs.length}</p>
                  <p className="font-display text-base font-bold text-foreground">
                    {decoderScore >= 5 ? '🎯 Perfekt! Du erkennst ETF-Namen wie ein Profi.' : decoderScore >= 3 ? '👍 Gut! Fast alle richtig.' : "💪 Schau auf 'Acc', 'C', 'Capitalising' vs 'Dist', 'D', 'Distributing'."}
                  </p>
                </div>
              </motion.div>
            )}
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
                  <motion.button key={a.id} whileTap={!revealed ? { scale: 0.97 } : {}} onClick={() => handleQuizAnswer(a.id)} className={`w-full text-left rounded-2xl border-2 ${borderColor} p-4 transition-colors`}>
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lektion abgeschlossen! 🎉</h2>
            <p className="font-body text-sm text-muted-foreground max-w-xs text-center mb-5">Du kennst den Unterschied der über Jahrzehnte zehntausende Euro ausmacht.</p>

            <div className="w-full max-w-sm rounded-2xl bg-green-500/10 border border-green-500/20 p-4 mb-4 space-y-2">
              <p className="font-body text-xs text-foreground">✅ Acc = Schneeball rollt ungestört, voller Zinseszins</p>
              <p className="font-body text-xs text-foreground">✅ Dist = Dividenden ausgezahlt, du musst reinvestieren</p>
              <p className="font-body text-xs text-foreground">✅ 'Acc'/'C' im Namen = thesaurierend</p>
              <p className="font-body text-xs text-foreground">✅ Für Vermögensaufbau: Thesaurierung meist besser</p>
            </div>

            <CompletionXP result={completionResult} hearts={hearts} />

            <button onClick={() => setShowDeepDive(true)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2.5 hover:bg-muted transition-colors">
              Tiefer eintauchen 📖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {showCTA() && (
          <motion.div className="px-6 pb-8 max-w-sm mx-auto w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.button onClick={handleNext} whileTap={{ scale: 0.96 }} className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm" style={{ backgroundColor: currentStep === 4 ? 'hsl(142, 71%, 45%)' : BLUE }}>
              {currentStep === 4 ? 'Zur nächsten Lektion →' : 'Weiter →'}
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Steuerliche Details 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Irisch domizilierte ETFs (ISIN beginnt 'IE') zahlen 15% Quellensteuer auf US-Dividenden statt 30% für Nicht-Vertragsländer — deshalb sind iShares und Vanguard EU-ETFs steuerlich effizienter.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Vorabpauschale (Deutschland): jährliche Vorauszahlung auf unrealisierte Gewinne bei thesaurierenden ETFs.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Schweizer Privatanleger: 0% Kapitalertragsteuer, Dividenden als Einkommen versteuert.
              </p>
              <button onClick={() => setShowDeepDive(false)} className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm">Schliessen</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setDecoderIndex(0); setDecoderScore(0); setDecoderDone(false); setDecoderFeedback(null); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L7_AccVsDist;
