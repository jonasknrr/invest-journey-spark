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
const fmt2 = (n: number) => n.toFixed(2);

const fvAnnuity = (monthly: number, annualRate: number, years: number) => {
  const r = annualRate / 1200;
  if (r === 0) return monthly * years * 12;
  return monthly * ((Math.pow(1 + r, years * 12) - 1) / r);
};

/* ── Cost averaging months ── */
const caMonths = [
  { name: 'Januar', price: 50.00 },
  { name: 'Februar', price: 40.00 },
  { name: 'März', price: 33.33 },
  { name: 'April', price: 40.00 },
  { name: 'Mai', price: 50.00 },
  { name: 'Juni', price: 66.67 },
];

const quiz = {
  question: 'Der ETF-Kurs fällt diesen Monat um 20%. Was bedeutet das für einen Sparplan-Anleger der monatlich CHF 200 investiert?',
  answers: [
    { id: 'a', text: 'Schlecht — Sparplan sollte pausiert werden' },
    { id: 'b', text: 'Neutral — kein Einfluss auf den Sparplan' },
    { id: 'c', text: 'Gut — für CHF 200 kauft er 25% mehr Anteile und senkt seinen Durchschnittskurs' },
    { id: 'd', text: 'Der Sparplan kauft automatisch weniger Anteile' },
  ],
  correctId: 'c',
  correctFeedback: 'Genau! Cost Averaging: günstigere Kurse = mehr Anteile für denselben Betrag. Langfristige Sparplan-Anleger profitieren von Kursschwankungen statt darunter zu leiden.',
  wrongFeedback: 'Bei einem Sparplan kaufst du für einen fixen Betrag. Bei -20% Kurs bekommst du automatisch 25% mehr Anteile für deine CHF 200. Das senkt deinen Durchschnittskurs.',
};

const ETF_L8_Sparplan = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [storySlide, setStorySlide] = useState(0);

  // Step 1
  const [monthlyAmount, setMonthlyAmount] = useState(100);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(7);
  const [milestone, setMilestone] = useState<string | null>(null);
  const milestoneRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2
  const [monthsRevealed, setMonthsRevealed] = useState(0);

  // Step 3
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Step 4
  const [showDeepDive, setShowDeepDive] = useState(false);

  const progress = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e8', Math.min(currentStep / (TOTAL_STEPS - 1), 1));
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
      const r = completeLesson('etfs-e8', hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);


  // Step 1 calcs
  const deposited = monthlyAmount * years * 12;
  const endValue = fvAnnuity(monthlyAmount, returnRate, years);
  const gain = endValue - deposited;
  const depPct = deposited / endValue * 100;

  useEffect(() => {
    if (endValue > 500000) showMs('💎 Halbe Million!');
    else if (endValue > 100000) showMs('🚀 CHF 100k erreicht!');
    else if (endValue > 50000) showMs('🎯 CHF 50k Meilenstein!');
    else setMilestone(null);
  }, [endValue]);

  const showMs = (t: string) => {
    setMilestone(t);
    if (milestoneRef.current) clearTimeout(milestoneRef.current);
    milestoneRef.current = setTimeout(() => setMilestone(null), 2000);
  };

  // Step 2 calcs
  const revealedMonths = caMonths.slice(0, monthsRevealed);
  const totalShares = revealedMonths.reduce((s, m) => s + 100 / m.price, 0);
  const totalInvested = monthsRevealed * 100;
  const avgPrice = monthsRevealed > 0 ? totalInvested / totalShares : 0;

  const handleQuizAnswer = (id: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(id);
    if (id !== quiz.correctId) setHearts(h => Math.max(0, h - 1));
  };

  const showCTA = () => {
    if (currentStep === 0) return storySlide === 2;
    if (currentStep === 1) return true;
    if (currentStep === 2) return monthsRevealed >= 6;
    if (currentStep === 3) return !!selectedAnswer;
    if (currentStep === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) { navigate('/category/etfs'); return; }
    setCurrentStep(s => s + 1);
  };

  // Coffee calc for slide 0
  const coffeeDeposited = 120 * 12 * 30;
  const coffeeEndValue = fvAnnuity(120, 7, 30);
  const coffeeGain = coffeeEndValue - coffeeDeposited;

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
              {/* SLIDE 0 — Coffee */}
              {storySlide === 0 && (
                <motion.div key="ss0" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <span className="mb-4" style={{ fontSize: 64 }}>☕</span>
                  <h2 className="font-display text-2xl font-bold text-foreground text-center mb-5 leading-tight">Ein Kaffee weniger pro Tag.</h2>
                  <div className="w-full rounded-2xl border border-border overflow-hidden mb-4">
                    <div className="grid grid-cols-[1fr_auto_1fr]">
                      {/* Coffee side */}
                      <div className="p-4 bg-muted/30 flex flex-col items-center text-center">
                        <span className="text-3xl mb-2">☕</span>
                        <p className="font-display text-sm font-bold text-foreground mb-1">CHF 4 Kaffee täglich</p>
                        <p className="font-body text-[10px] text-muted-foreground">= CHF 120 pro Monat</p>
                        <p className="font-body text-[10px] text-muted-foreground">= CHF {fmt(coffeeDeposited)} in 30 Jahren</p>
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[9px] font-semibold">Ausgegeben</span>
                      </div>
                      {/* Arrow */}
                      <div className="flex items-center px-2">
                        <span className="text-2xl" style={{ color: BLUE }}>→</span>
                      </div>
                      {/* ETF side */}
                      <div className="p-4 flex flex-col items-center text-center" style={{ backgroundColor: '#EFF6FF' }}>
                        <span className="text-3xl mb-2">📈</span>
                        <p className="font-display text-sm font-bold text-foreground mb-1">CHF 120/Monat ETF-Sparplan</p>
                        <p className="font-body text-[10px] text-muted-foreground">= CHF {fmt(coffeeDeposited)} eingezahlt</p>
                        <p className="font-body text-[10px] text-foreground font-semibold">= CHF {fmt(coffeeEndValue)} nach 30 Jahren</p>
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-body text-[9px] font-semibold">CHF {fmt(coffeeGain)} geschenkt vom Zinseszins</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center mb-4">Die CHF {fmt(coffeeGain)} hast du nicht eingezahlt. Die hat der Zinseszins erarbeitet.</p>
                  <button onClick={() => setStorySlide(1)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Nächste →</button>
                </motion.div>
              )}

              {/* SLIDE 1 — How it works */}
              {storySlide === 1 && (
                <motion.div key="ss1" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">Wie funktioniert ein Sparplan?</h2>
                  <div className="w-full space-y-3 mb-4">
                    {[
                      { n: '①', title: 'Du richtest einmal ein', desc: 'Betrag + ETF + Datum festlegen', badge: '~5 Minuten', delay: 0 },
                      { n: '②', title: 'Jeden Monat automatisch', desc: 'Bank kauft ETF-Anteile für dich', badge: '0 Minuten Aufwand', delay: 0.4 },
                      { n: '③', title: 'Du machst — nichts', desc: 'Zinseszins arbeitet still im Hintergrund', badge: '30 Jahre lang ✓', delay: 0.8, green: true },
                    ].map(s => (
                      <motion.div key={s.n} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: s.delay, duration: 0.3 }} className="rounded-2xl border border-border p-4">
                        <p className="font-display text-sm font-bold text-foreground mb-1">{s.n} {s.title}</p>
                        <p className="font-body text-xs text-muted-foreground mb-2">{s.desc}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full font-body text-[10px] font-semibold ${s.green ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground'}`}>{s.badge}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="font-body text-xs text-muted-foreground text-center mb-4">Bei vielen Brokern ab CHF 1/Monat möglich.</p>
                  <button onClick={() => setStorySlide(2)} className="font-body text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-muted transition-colors">Nächste →</button>
                </motion.div>
              )}

              {/* SLIDE 2 — Cost averaging intro */}
              {storySlide === 2 && (
                <motion.div key="ss2" className="flex flex-col items-center max-w-sm mx-auto w-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 className="font-display text-xl font-bold text-foreground text-center mb-5 leading-tight">Was passiert wenn der Kurs fällt?</h2>
                  <div className="w-full rounded-2xl p-5 mb-4" style={{ backgroundColor: '#1E3A5F' }}>
                    <p className="font-body text-xs text-white/80 mb-3">Du investierst jeden Monat CHF 100.</p>
                    <p className="font-body text-sm text-white mb-1">Kurs hoch → du kaufst weniger Anteile</p>
                    <p className="font-body text-xs text-white/60 mb-3">CHF 50 → 2 Anteile</p>
                    <div className="border-t border-white/20 my-3" />
                    <p className="font-body text-sm text-white mb-1">Kurs tief → du kaufst mehr Anteile</p>
                    <p className="font-body text-xs text-white/60 mb-3">CHF 25 → 4 Anteile 🎉</p>
                    <div className="rounded-xl bg-amber-500/20 p-3">
                      <p className="font-body text-xs text-amber-300 text-center">Kursschwankungen sind beim Sparplan dein Freund — tiefe Kurse = Rabatt.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ STEP 1 — Sparplan Builder ═══ */}
        {currentStep === 1 && (
          <motion.div key="s1" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">Dein persönlicher Sparplan</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Stelle ein und sieh wie dein Vermögen wächst</p>

            <div className="space-y-3 mb-4 max-w-sm mx-auto w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Monatlicher Betrag</span>
                  <span className="font-display text-xs font-bold text-foreground">CHF {fmt(monthlyAmount)}</span>
                </div>
                <input type="range" min={25} max={1000} step={25} value={monthlyAmount} onChange={e => setMonthlyAmount(+e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-muted-foreground">Anlagedauer</span>
                  <span className="font-display text-xs font-bold text-foreground">{years} Jahre</span>
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
            </div>

            {/* Stacked bars */}
            <div className="max-w-sm mx-auto w-full mb-3">
              <div className="flex rounded-xl overflow-hidden h-8 mb-1">
                <motion.div className="bg-blue-500 flex items-center justify-center" animate={{ width: `${depPct}%` }} transition={{ duration: 0.5 }}>
                  {depPct > 20 && <span className="font-body text-[9px] text-white font-semibold truncate px-1">💙 Eingezahlt</span>}
                </motion.div>
                <motion.div className="bg-green-500 flex items-center justify-center" animate={{ width: `${100 - depPct}%` }} transition={{ duration: 0.5 }}>
                  {(100 - depPct) > 20 && <span className="font-body text-[9px] text-white font-semibold truncate px-1">💚 Zinseszins</span>}
                </motion.div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto w-full mb-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-center">
                <p className="font-body text-[10px] text-muted-foreground">Eingezahlt</p>
                <p className="font-display text-sm font-bold text-foreground">CHF {fmt(deposited)}</p>
              </div>
              <div className="rounded-xl bg-green-500/10 p-3 text-center">
                <p className="font-body text-[10px] text-muted-foreground">Final value</p>
                <p className="font-display text-sm font-bold text-foreground">CHF {fmt(endValue)}</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                <p className="font-body text-[10px] text-muted-foreground">Gewinn</p>
                <p className="font-display text-sm font-bold text-amber-600">CHF {fmt(gain)}</p>
              </div>
            </div>

            <AnimatePresence>
              {milestone && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 font-display text-xs font-bold">{milestone}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`max-w-sm mx-auto w-full rounded-xl p-3 ${gain > deposited ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
              <p className="font-body text-xs text-foreground text-center">
                {gain > deposited
                  ? '🚀 Der Zinseszins arbeitet mehr für dich als du selbst eingezahlt hast!'
                  : '📈 Mit mehr Jahren überholt der Zinseszins deine eigenen Einzahlungen.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══ STEP 2 — Cost Averaging ═══ */}
        {currentStep === 2 && (
          <motion.div key="s2" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-1">6 Monate Sparplan — erlebe Cost Averaging</h2>
            <p className="font-body text-xs text-muted-foreground text-center mb-4">Tippe «Nächster Monat» um jeden Kauf zu sehen</p>

            <div className="max-w-sm mx-auto w-full space-y-2 mb-3">
              {revealedMonths.map((m, i) => {
                const shares = 100 / m.price;
                const runShares = caMonths.slice(0, i + 1).reduce((s, cm) => s + 100 / cm.price, 0);
                const prev = i > 0 ? caMonths[i - 1].price : m.price;
                const dir = m.price < prev ? 'down' : m.price > prev ? 'up' : 'flat';
                const isGreen = dir === 'down';
                const isRed = dir === 'up' && i > 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-3 ${isGreen ? 'border-green-500/40' : isRed ? 'border-red-500/30' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-xs font-bold text-foreground">{m.name}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-body text-[10px] font-semibold ${isGreen ? 'bg-green-500/10 text-green-700' : isRed ? 'bg-red-500/10 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                        CHF {fmt2(m.price)} {dir === 'down' ? (m.price < 35 ? '↓↓' : '↓') : dir === 'up' ? (m.price > 60 ? '↑↑' : '↑') : ''}
                      </span>
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground">Du kaufst: {fmt2(shares)} Anteile für CHF 100</p>
                    {isGreen && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-body text-[9px] font-semibold">
                        {m.price < 35 ? 'Grosser Rabatt! 🎉🎉' : 'Rabatt! Mehr Anteile 🎉'}
                      </span>
                    )}
                    <p className="font-body text-[10px] text-foreground mt-1">Anteile gesamt: {fmt2(runShares)}</p>
                  </motion.div>
                );
              })}
            </div>

            {monthsRevealed < 6 && (
              <motion.button
                onClick={() => setMonthsRevealed(m => m + 1)}
                whileTap={{ scale: 0.96 }}
                className="mx-auto mb-3 px-5 py-2.5 rounded-full font-display text-sm font-bold text-white"
                style={{ backgroundColor: BLUE }}
              >
                Next month →
              </motion.button>
            )}

            {monthsRevealed >= 6 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm mx-auto w-full">
                <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 mb-3 text-center">
                  <p className="font-display text-sm font-bold text-foreground mb-2">🎯 Dein Ergebnis:</p>
                  <p className="font-body text-xs text-foreground">Investiert: CHF {fmt(totalInvested)}</p>
                  <p className="font-body text-xs text-foreground">Anteile: {fmt2(totalShares)}</p>
                  <p className="font-body text-xs text-foreground">Dein Durchschnittskurs: CHF {fmt2(avgPrice)}</p>
                  <p className="font-body text-xs text-foreground">Aktueller Kurs: CHF 66.67</p>
                  <p className="font-display text-lg font-bold text-green-600 mt-1">Depot-Wert: CHF {fmt(totalShares * 66.67)} (+{Math.round((totalShares * 66.67 / totalInvested - 1) * 100)}%!)</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="font-body text-xs text-foreground text-center">Dein Durchschnittskurs (CHF {fmt2(avgPrice)}) ist tiefer als der aktuelle Kurs (CHF 66.67) — obwohl der Kurs zwischendurch stark fiel. Das ist Cost Averaging: tiefe Monate kaufen mehr Anteile und senken deinen Schnitt.</p>
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
                let bc = 'border-border';
                if (revealed && correct) bc = 'border-green-500 bg-green-500/5';
                else if (revealed && chosen && !correct) bc = 'border-red-500 bg-red-500/5';
                return (
                  <motion.button key={a.id} whileTap={!revealed ? { scale: 0.97 } : {}} onClick={() => handleQuizAnswer(a.id)} className={`w-full text-left rounded-2xl border-2 ${bc} p-4 transition-colors`}>
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
            <p className="font-body text-sm text-muted-foreground max-w-xs text-center mb-5">Du weisst jetzt wie ein Sparplan langfristig Vermögen aufbaut.</p>

            <div className="w-full max-w-sm rounded-2xl bg-green-500/10 border border-green-500/20 p-4 mb-4 space-y-2">
              <p className="font-body text-xs text-foreground">✅ Sparplan = automatisch monatlich in ETF investieren</p>
              <p className="font-body text-xs text-foreground">✅ Zinseszins überholt nach ~15 Jahren deine Einzahlungen</p>
              <p className="font-body text-xs text-foreground">✅ Cost Averaging: tiefe Kurse = mehr Anteile = Vorteil</p>
              <p className="font-body text-xs text-foreground">✅ Start ab CHF 1/Monat — wichtig ist der Start</p>
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
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Cost Averaging 📖</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                Cost Averaging (Durchschnittskosteneffekt): durch regelmässige fixe Investitionen kauft man bei tiefen Kursen mehr Anteile und bei hohen weniger. Über Zeit resultiert ein tieferer Durchschnittskaufkurs als der arithmetische Kursdurchschnitt.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Wichtig: Bei langfristig steigenden Märkten ist eine Einmalanlage mathematisch oft überlegen — aber psychologisch ist der Sparplan nachhaltiger und führt zu besserem Anlegerverhalten.
              </p>
              <button onClick={() => setShowDeepDive(false)} className="mt-5 w-full h-12 rounded-full bg-muted text-foreground font-display font-bold text-sm">Schliessen</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setStorySlide(0); setMonthsRevealed(0); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(3); setHearts(3); setSelectedAnswer(null); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L8_Sparplan;
