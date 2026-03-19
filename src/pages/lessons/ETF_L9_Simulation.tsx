import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const BLUE = '#1A56DB';
const fmt = (n: number) => Math.round(n).toLocaleString('de-CH');

/* ── Stocks ── */
const stocks = [
  { ticker: 'AAPL', name: 'Apple', flag: '🇺🇸', sector: 'Tech', color: '#1A56DB' },
  { ticker: 'TSLA', name: 'Tesla', flag: '🇺🇸', sector: 'Auto', color: '#E24B4A' },
  { ticker: 'SAP', name: 'SAP', flag: '🇩🇪', sector: 'Tech', color: '#1A56DB' },
  { ticker: 'SHEL', name: 'Shell', flag: '🇬🇧', sector: 'Energy', color: '#BA7517' },
  { ticker: 'NESN', name: 'Nestlé', flag: '🇨🇭', sector: 'Consumer', color: '#065F46' },
  { ticker: 'ASML', name: 'ASML', flag: '🇳🇱', sector: 'Tech', color: '#1A56DB' },
  { ticker: 'JPM', name: 'JPMorgan', flag: '🇺🇸', sector: 'Finance', color: '#7E22CE' },
  { ticker: 'MC', name: 'LVMH', flag: '🇫🇷', sector: 'Luxury', color: '#9F1239' },
  { ticker: '005930', name: 'Samsung', flag: '🇰🇷', sector: 'Tech', color: '#1A56DB' },
  { ticker: '9988', name: 'Alibaba', flag: '🇨🇳', sector: 'Tech', color: '#C2410C' },
  { ticker: 'BHP', name: 'BHP', flag: '🇦🇺', sector: 'Materials', color: '#92400E' },
  { ticker: 'MRNA', name: 'Moderna', flag: '🇺🇸', sector: 'Health', color: '#0369A1' },
];

/* ── Shocks ── */
const shocks = [
  {
    id: 'tech', emoji: '💻', title: 'Tech Selloff',
    subtitle: 'Rising rates hit growth stocks',
    description: 'The US Fed raises rates faster than expected. Investors flee expensive tech stocks.',
    sectorImpact: { Tech: -0.22, Auto: -0.15, Energy: +0.08, Finance: +0.05, Consumer: -0.05, Luxury: -0.08, Materials: +0.03, Health: -0.10 } as Record<string, number>,
    flagImpact: {} as Record<string, number>,
  },
  {
    id: 'eur', emoji: '💶', title: 'Euro appreciates sharply',
    subtitle: 'ECB surprise hits exporters',
    description: 'An unexpected ECB rate hike causes the Euro to rise sharply against all currencies.',
    sectorImpact: {} as Record<string, number>,
    flagImpact: { '🇩🇪': -0.06, '🇫🇷': -0.07, '🇳🇱': -0.05, '🇨🇭': -0.04, '🇬🇧': +0.01, '🇺🇸': +0.02, '🇰🇷': +0.03, '🇨🇳': +0.02, '🇦🇺': +0.01 } as Record<string, number>,
  },
  {
    id: 'em', emoji: '🌏', title: 'Emerging Market Rally',
    subtitle: 'Fed turns dovish — capital flows into EM',
    description: 'The US Fed signals rate cuts. Capital flows massively into emerging markets.',
    sectorImpact: {} as Record<string, number>,
    flagImpact: { '🇨🇳': +0.18, '🇰🇷': +0.14, '🇦🇺': +0.06, '🇺🇸': -0.02, '🇩🇪': +0.01, '🇫🇷': +0.01, '🇳🇱': +0.01, '🇨🇭': -0.01, '🇬🇧': +0.02 } as Record<string, number>,
  },
];

const sectorColors: Record<string, string> = {
  Tech: '#1A56DB', Auto: '#E24B4A', Energy: '#BA7517', Consumer: '#065F46',
  Finance: '#7E22CE', Luxury: '#9F1239', Materials: '#92400E', Health: '#0369A1',
};

/* ── Helpers ── */
function getStockReturn(stock: typeof stocks[0], shock: typeof shocks[0]) {
  const s = shock.sectorImpact[stock.sector] ?? 0;
  const f = shock.flagImpact[stock.flag] ?? 0;
  return s + f;
}

/* ── Component ── */
const ETF_L9_Simulation = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tempAllocation, setTempAllocation] = useState(0);
  const [currentShock, setCurrentShock] = useState(0);
  const [currentShockPhase, setCurrentShockPhase] = useState<'card' | 'impact'>('card');
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [shockHistory, setShockHistory] = useState<{ shockIdx: number; results: { ticker: string; pct: number; eur: number }[]; totalChange: number }[]>([]);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();
  const [showImpactBtn, setShowImpactBtn] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(10000);

  // Track progress
  useEffect(() => {
    updateLessonProgress('etfs-e9', Math.min(phase / 4, 1));
  }, [phase]);

  const remainingBudget = 100 - Object.values(portfolio).reduce((s, v) => s + v, 0);

  // Scores
  const ownedStocks = stocks.filter(s => (portfolio[s.ticker] ?? 0) > 0);
  const uniqueFlags = new Set(ownedStocks.map(s => s.flag)).size;
  const uniqueSectors = new Set(ownedStocks.map(s => s.sector)).size;
  const maxPosition = Math.max(0, ...Object.values(portfolio));
  const geoScore = Math.round((uniqueFlags / 6) * 100);
  const sectorScore = Math.round((uniqueSectors / 6) * 100);
  const clusterScore = Math.round(100 - maxPosition);
  const numTransactions = ownedStocks.length;

  // US stats
  const totalUSPct = ownedStocks.filter(s => s.flag === '🇺🇸').reduce((sum, s) => sum + (portfolio[s.ticker] ?? 0), 0);

  // ETF match
  const etfMatch = useMemo(() => {
    if (totalUSPct > 60) return { name: 'iShares Core S&P 500 (CSPX)', ter: 0.07, holdings: 500, flag: '🇺🇸', totalReturn: -0.12 };
    if (uniqueFlags >= 4) return { name: 'Vanguard FTSE All-World (VWCE)', ter: 0.22, holdings: 3700, flag: '🌍', totalReturn: -0.08 };
    return { name: 'iShares Core MSCI Europe (IMAE)', ter: 0.12, holdings: 430, flag: '🇪🇺', totalReturn: -0.06 };
  }, [totalUSPct, uniqueFlags]);

  const etfValueAfterShocks = Math.round(10000 * (1 + etfMatch.totalReturn));

  // Shock impact button delay
  useEffect(() => {
    if (phase === 2 && currentShockPhase === 'card') {
      setShowImpactBtn(false);
      const t = setTimeout(() => setShowImpactBtn(true), 1500);
      return () => clearTimeout(t);
    }
  }, [phase, currentShock, currentShockPhase]);

  // Animated value counter
  useEffect(() => {
    if (phase !== 2 || currentShockPhase !== 'impact') return;
    const target = portfolioValue;
    const start = animatedValue;
    const dur = 1500;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / dur);
      setAnimatedValue(Math.round(start + (target - start) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [portfolioValue, currentShockPhase]);

  const applyShock = () => {
    const shock = shocks[currentShock];
    const results: { ticker: string; pct: number; eur: number }[] = [];
    let totalChange = 0;
    for (const s of ownedStocks) {
      const pct = getStockReturn(s, shock);
      const eurAmt = (portfolio[s.ticker] / 100) * portfolioValue;
      const eur = eurAmt * pct;
      results.push({ ticker: s.ticker, pct, eur });
      totalChange += eur;
    }
    results.sort((a, b) => Math.abs(b.eur) - Math.abs(a.eur));
    const newValue = Math.round(portfolioValue + totalChange);
    setPortfolioValue(newValue);
    setShockHistory(h => [...h, { shockIdx: currentShock, results, totalChange }]);
    setCurrentShockPhase('impact');
    try { navigator.vibrate?.(totalChange < 0 ? [300, 100, 300] : [100]); } catch {}
  };

  const openModal = (ticker: string) => {
    setSelectedStock(ticker);
    setTempAllocation(portfolio[ticker] ?? 0);
  };

  const confirmAllocation = () => {
    if (!selectedStock) return;
    const old = portfolio[selectedStock] ?? 0;
    const diff = tempAllocation - old;
    if (diff > remainingBudget + old - (portfolio[selectedStock] ?? 0)) return;
    setPortfolio(p => ({ ...p, [selectedStock]: tempAllocation }));
    setSelectedStock(null);
  };

  const maxSliderVal = Math.min(50, (portfolio[selectedStock ?? ''] ?? 0) + remainingBudget);

  // Grades for Phase 4
  const grades = useMemo(() => {
    const L1 = uniqueFlags >= 3 ? 'A' : uniqueFlags === 2 ? 'B' : 'C';
    const L2 = maxPosition <= 25 ? 'A' : maxPosition <= 40 ? 'B' : 'C';
    const L3 = 'A';
    const L4 = uniqueSectors >= 4 ? 'A' : uniqueSectors >= 3 ? 'B' : 'C';
    const L5 = 'A';
    const L6 = uniqueFlags >= 3 && uniqueSectors >= 3 ? 'A' : 'B';
    const L7 = 'A';
    const L8 = 'A';
    return [L1, L2, L3, L4, L5, L6, L7, L8];
  }, [uniqueFlags, uniqueSectors, maxPosition]);

  const gradeCount = { A: grades.filter(g => g === 'A').length, B: grades.filter(g => g === 'B').length, C: grades.filter(g => g === 'C').length };
  const fees = numTransactions;
  const etfFees = 1;
  const perfDiff = portfolioValue - etfValueAfterShocks;

  const gradeFeedback = [
    { title: 'Was ist ein Index?', a: `✅ You invested in ${uniqueFlags} countries — you think like an index constructor.`, b: '👍 Solid — a bit more geographic diversification would be even better.', c: '💡 Your portfolio was very concentrated — a broad index would have solved that automatically.' },
    { title: 'Wie Indizes gebaut werden', a: '✅ No single stock dominates — you avoided concentration risk.', b: '👍 Fast ausgeglichen — achte auf Übergewichtung einzelner positions.', c: '💡 One position was very dominant — just like Apple in the S&P 500, but without the other 499 to balance it.' },
    { title: 'Was ist ein ETF?', a: `✅ Du hast gelernt dass 1 ETF-Kauf hunderte companies abdeckt — statt deiner ${numTransactions} Transaktionen für CHF ${numTransactions} Gebühren.`, b: '', c: '' },
    { title: 'ETF-Universum', a: '✅ Strong sector diversification — you combined different industries.', b: '👍 Good mix — one or two more sectors would be ideal.', c: '💡 Your portfolio was sector-concentrated — a thematic ETF would do the same, but with more holdings.' },
    { title: 'Kosten & Kennzahlen', a: `✅ The ETF comparison shows: CHF ${fees - etfFees} in fees saved, 1 instead of ${numTransactions} transactions. Over 30 years that makes a big difference.`, b: '', c: '' },
    { title: 'Risiko & Diversifikation', a: '✅ Good combination of countries AND sectors — you built real diversification.', b: '👍 Solid — but with more diversification you would have lost less in the tech shock.', c: '' },
    { title: 'Acc vs Dist', a: '✅ For a portfolio like yours, accumulating ETFs (Acc) are recommended — maximum compound interest with no effort.', b: '', c: '' },
    { title: 'ETF-Sparplan', a: '✅ If you had built this portfolio as a monthly savings plan of CHF 200 — in 30 years at 7%: CHF 243,994. The best time to start: today.', b: '', c: '' },
  ];

  // Confetti
  const confetti = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 1.5,
    color: ['#1A56DB', '#10B981', '#F59E0B', '#E24B4A', '#7E22CE'][i % 5],
    size: 6 + Math.random() * 6,
  })), []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence mode="wait">

        {/* ═══ PHASE 0 — INTRO ═══ */}
        {phase === 0 && (
          <motion.div key="p0" className="flex-1 flex flex-col items-center justify-center px-6 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 px-4 pt-4 flex items-center gap-3">
              <button onClick={() => navigate('/category/etfs')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><X className="w-5 h-5 text-foreground" /></button>
              <div className="flex-1" />
              <div className="flex items-center gap-0.5">
                {[0, 1, 2].map(i => <Heart key={i} className={`w-5 h-5 transition-all ${i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />)}
              </div>
            </div>

            <motion.span className="mb-6" style={{ fontSize: 72 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>🎮</motion.span>
            <h1 className="font-display text-3xl font-bold text-foreground text-center mb-3">Final Simulation</h1>
            <p className="font-body text-sm text-muted-foreground text-center max-w-xs mb-6 leading-relaxed">
              You\'ve learned everything. Now put it to use. Build a portfolio of individual stocks — then we\'ll show you what an ETF would have made of it.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['1️⃣ Build portfolio', '2️⃣ Survive market shocks', '3️⃣ ETF comparison', '4️⃣ Your report card'].map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full border border-border font-body text-[11px] text-muted-foreground">{s}</span>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase(1)} className="w-full max-w-xs h-14 rounded-full font-display text-lg font-bold text-white" style={{ backgroundColor: BLUE }}>
              Start simulation →
            </motion.button>
          </motion.div>
        )}

        {/* ═══ PHASE 1 — PORTFOLIO BAUEN ═══ */}
        {phase === 1 && (
          <motion.div key="p1" className="flex-1 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-background border-b border-border px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg font-bold text-foreground">Build your portfolio</h2>
                <span className={`px-3 py-1 rounded-full font-display text-xs font-bold ${remainingBudget > 20 ? 'bg-primary/10 text-primary' : remainingBudget > 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'}`}>
                  {remainingBudget}% übrig
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: BLUE }} animate={{ width: `${100 - remainingBudget}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>

            {/* Stock grid */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                {stocks.map(s => {
                  const alloc = portfolio[s.ticker] ?? 0;
                  const isOwned = alloc > 0;
                  return (
                    <motion.button key={s.ticker} whileTap={{ scale: 0.97 }} onClick={() => openModal(s.ticker)}
                      className={`text-left rounded-2xl border p-3 transition-colors ${isOwned ? 'border-blue-500/50 bg-blue-500/5' : 'border-border bg-card'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{s.flag}</span>
                        <span className="font-display text-xs font-bold text-foreground">{s.ticker}</span>
                        <span className="ml-auto px-1.5 py-0.5 rounded-md font-body text-[9px] font-semibold text-white" style={{ backgroundColor: sectorColors[s.sector] ?? '#666' }}>{s.sector}</span>
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground">{s.name}</p>
                      {isOwned && (
                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body text-[10px] font-semibold">
                          {alloc}% — CHF {fmt(alloc / 100 * 10000)}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Sticky bottom scores + CTA */}
            <div className="sticky bottom-0 z-20 bg-background border-t border-border px-4 py-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '🌍 Geo', score: geoScore },
                  { label: '🏭 Sector', score: sectorScore },
                  { label: '⚖️ Cluster', score: clusterScore },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className="font-body text-[9px] text-muted-foreground mb-0.5">{m.label}</p>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-0.5">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${m.score}%`, backgroundColor: m.score >= 60 ? '#10B981' : m.score >= 30 ? '#F59E0B' : '#E24B4A' }} />
                    </div>
                    <span className="font-display text-[10px] font-bold text-foreground">{m.score}/100</span>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.96 }} disabled={remainingBudget !== 0}
                onClick={() => { setPhase(2); setAnimatedValue(10000); try { navigator.vibrate?.([200, 100, 200]); } catch {} }}
                className={`w-full h-12 rounded-full font-display text-sm font-bold text-white transition-opacity ${remainingBudget === 0 ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                style={{ backgroundColor: BLUE }}>
                Freeze portfolio 🔒
              </motion.button>
              {remainingBudget > 0 && <p className="font-body text-[10px] text-muted-foreground text-center">Invest all CHF 10,000 to continue</p>}
            </div>
          </motion.div>
        )}

        {/* ═══ PHASE 2 — MARKTSCHOCKS ═══ */}
        {phase === 2 && (
          <motion.div key="p2" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              {currentShockPhase === 'card' && (
                <motion.div key={`card-${currentShock}`} className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center" style={{ backgroundColor: '#7F1D1D' }}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, type: 'spring' }}>
                  <span className="font-body text-xs text-white/60 mb-6">⚡ MARKET SHOCK {currentShock + 1}/3</span>
                  <motion.span className="mb-4" style={{ fontSize: 64 }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    {shocks[currentShock].emoji}
                  </motion.span>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">{shocks[currentShock].title}</h2>
                  <p className="font-body text-sm text-white/70 mb-4">{shocks[currentShock].subtitle}</p>
                  <div className="border-t border-white/20 w-16 mx-auto my-3" />
                  <p className="font-body text-sm text-white/80 max-w-xs mb-5 leading-relaxed">{shocks[currentShock].description}</p>
                  <div className="border-t border-white/20 w-16 mx-auto my-3" />
                  <p className="font-body text-xs text-white/60 mb-1">Your portfolio currently:</p>
                  <p className="font-display text-2xl font-bold text-white mb-6">CHF {fmt(portfolioValue)}</p>
                  <AnimatePresence>
                    {showImpactBtn && (
                      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.96 }}
                        onClick={applyShock} className="px-6 py-3 rounded-full font-display text-sm font-bold text-white bg-red-600">
                        See impact ⚡
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {currentShockPhase === 'impact' && (
                <motion.div key={`impact-${currentShock}`} className="flex-1 flex flex-col px-5 py-6 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{shocks[currentShock].emoji}</span>
                    <h2 className="font-display text-lg font-bold text-foreground">{shocks[currentShock].title}</h2>
                  </div>

                  {/* Animated value */}
                  <div className="text-center mb-4">
                    <p className="font-body text-xs text-muted-foreground mb-1">Portfolio value</p>
                    <p className={`font-display text-3xl font-bold tabular-nums ${portfolioValue < 10000 ? 'text-destructive' : 'text-primary'}`}>CHF {fmt(animatedValue)}</p>
                    {(() => {
                      const last = shockHistory[shockHistory.length - 1];
                      if (!last) return null;
                      return <p className={`font-body text-sm font-semibold ${last.totalChange < 0 ? 'text-destructive' : 'text-primary'}`}>
                        {last.totalChange >= 0 ? '+' : ''}CHF {fmt(last.totalChange)} ({((last.totalChange / (portfolioValue - last.totalChange)) * 100).toFixed(1)}%)
                      </p>;
                    })()}
                  </div>

                  {/* Holdings impact */}
                  <div className="space-y-1.5 mb-4">
                    {shockHistory[shockHistory.length - 1]?.results.map(r => {
                      const s = stocks.find(st => st.ticker === r.ticker)!;
                      return (
                        <div key={r.ticker} className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
                          <span className="text-sm">{s.flag}</span>
                          <span className="font-display text-xs font-bold text-foreground flex-shrink-0">{s.ticker}</span>
                          <span className="font-body text-[10px] text-muted-foreground">{portfolio[s.ticker]}%</span>
                          <span className={`ml-auto font-display text-xs font-bold tabular-nums ${r.pct < 0 ? 'text-destructive' : 'text-primary'}`}>
                            {r.pct >= 0 ? '+' : ''}{(r.pct * 100).toFixed(1)}%
                          </span>
                          <span className={`font-body text-[10px] tabular-nums ${r.eur < 0 ? 'text-destructive' : 'text-primary'}`}>
                            {r.eur >= 0 ? '+' : ''}CHF {fmt(r.eur)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Winner/Loser highlight */}
                  {(() => {
                    const res = shockHistory[shockHistory.length - 1]?.results ?? [];
                    const winner = res.reduce((best, r) => r.eur > best.eur ? r : best, res[0]);
                    const loser = res.reduce((worst, r) => r.eur < worst.eur ? r : worst, res[0]);
                    return (
                      <div className="space-y-1.5 mb-6">
                        {winner && winner.eur > 0 && (
                          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                            <p className="font-body text-xs text-foreground">🟢 Biggest winner: <strong>{winner.ticker}</strong> +{(winner.pct * 100).toFixed(1)}%</p>
                          </div>
                        )}
                        {loser && loser.eur < 0 && (
                          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                            <p className="font-body text-xs text-foreground">🔴 Hardest hit: <strong>{loser.ticker}</strong> {(loser.pct * 100).toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-auto pb-4">
                    <motion.button whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (currentShock < 2) { setCurrentShock(c => c + 1); setCurrentShockPhase('card'); try { navigator.vibrate?.([200, 100, 200]); } catch {} }
                        else setPhase(3);
                      }}
                      className="w-full h-14 rounded-full font-display text-base font-bold text-white" style={{ backgroundColor: BLUE }}>
                      {currentShock < 2 ? 'Next shock →' : 'To the ETF comparison →'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ PHASE 3 — ETF VERGLEICH ═══ */}
        {phase === 3 && (
          <motion.div key="p3" className="flex-1 flex flex-col px-5 py-6 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">Your Portfolio vs. ETF</h2>

            {/* Your portfolio card */}
            <div className="rounded-2xl border border-border bg-card p-4 mb-3">
              <p className="font-display text-sm font-bold text-foreground mb-2">🎯 Your Portfolio</p>
              <p className={`font-display text-2xl font-bold tabular-nums ${portfolioValue >= 10000 ? 'text-primary' : 'text-destructive'}`}>CHF {fmt(portfolioValue)}</p>
              <p className={`font-body text-xs font-semibold ${portfolioValue >= 10000 ? 'text-primary' : 'text-destructive'}`}>
                {((portfolioValue / 10000 - 1) * 100).toFixed(1)}%
              </p>
              <div className="border-t border-border my-3" />
              <p className="font-body text-[11px] text-muted-foreground">Holdings: {numTransactions} positions</p>
              <p className="font-body text-[11px] text-muted-foreground">Transactions: {numTransactions}</p>
              <p className="font-body text-[11px] text-muted-foreground">Est. broker fees: CHF {numTransactions}</p>
              <div className="border-t border-border my-3" />
              <p className="font-body text-[11px] text-muted-foreground">Geo {geoScore}/100 | Sektor {sectorScore}/100</p>
              {totalUSPct > 70 && <p className="font-body text-[11px] text-amber-600 mt-1">⚠️ Very US-heavy</p>}
              {uniqueSectors < 3 && <p className="font-body text-[11px] text-amber-600 mt-1">⚠️ Low sector diversification</p>}
            </div>

            {/* VS */}
            <div className="text-center my-2"><span className="font-display text-xl font-bold text-muted-foreground">VS</span></div>

            {/* ETF card */}
            <div className="rounded-2xl border-2 border-blue-500/30 p-4 mb-4" style={{ backgroundColor: '#EFF6FF' }}>
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 font-body text-[10px] font-semibold mb-2">💡 ETF Alternative</span>
              <p className="font-display text-sm font-bold text-foreground mb-2">{etfMatch.name}</p>
              <p className={`font-display text-2xl font-bold tabular-nums ${etfValueAfterShocks >= 10000 ? 'text-primary' : 'text-destructive'}`}>CHF {fmt(etfValueAfterShocks)}</p>
              <p className={`font-body text-xs font-semibold ${etfValueAfterShocks >= 10000 ? 'text-primary' : 'text-destructive'}`}>
                {(etfMatch.totalReturn * 100).toFixed(1)}%
              </p>
              <div className="border-t border-blue-500/20 my-3" />
              <p className="font-body text-[11px] text-foreground">Holdings: {fmt(etfMatch.holdings)} companies</p>
              <p className="font-body text-[11px] text-foreground">Transactions: 1</p>
              <p className="font-body text-[11px] text-foreground">TER: {etfMatch.ter}% p.a.</p>
              <p className="font-body text-[11px] text-foreground">Broker-Gebühren: CHF 1</p>
              <div className="border-t border-blue-500/20 my-3" />
              <div className="space-y-1">
                <p className="font-body text-[11px] text-primary">✓ More broadly diversified</p>
                <p className="font-body text-[11px] text-primary">✓ Automatically rebalanced</p>
                <p className="font-body text-[11px] text-primary">✓ Less effort</p>
              </div>
            </div>

            {/* Comparison rows */}
            <div className="space-y-2 mb-4">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="font-body text-xs text-primary font-semibold">Fees saved: CHF {fees - etfFees}</p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="font-body text-xs text-primary font-semibold">Transactions saved: {numTransactions - 1}</p>
              </div>
              <div className={`rounded-xl p-3 ${perfDiff > 0 ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-primary/5 border border-primary/10'}`}>
                <p className={`font-body text-xs font-semibold ${perfDiff > 0 ? 'text-amber-600' : 'text-primary'}`}>
                  {perfDiff > 0 ? `Performance: You +CHF ${fmt(perfDiff)} better 🎉` : `Performance: ETF +CHF ${fmt(Math.abs(perfDiff))} better`}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-6">
              <p className="font-body text-xs text-foreground text-center">💡 The ETF doesn\'t always have better returns — but it\'s cheaper, broader and requires 0 minutes of effort.</p>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase(4)} className="w-full h-14 rounded-full font-display text-base font-bold text-white" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}>
              See my report card 🎓 →
            </motion.button>
          </motion.div>
        )}

        {/* ═══ PHASE 4 — ZEUGNIS ═══ */}
        {phase === 4 && (
          <motion.div key="p4" className="flex-1 flex flex-col px-5 py-6 overflow-y-auto relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Confetti */}
            {confetti.map(c => (
              <motion.div key={c.id} className="absolute rounded-full pointer-events-none" style={{ left: `${c.x}%`, width: c.size, height: c.size, backgroundColor: c.color }}
                initial={{ y: -20, opacity: 1 }} animate={{ y: 400, opacity: 0 }} transition={{ delay: c.delay, duration: 2 + Math.random(), ease: 'easeIn' }} />
            ))}

            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-1">🎓 Your Report Card</h2>
            <p className="font-body text-sm text-muted-foreground text-center mb-5">Based on your decisions</p>

            {/* Grade cards */}
            <div className="space-y-2.5 mb-5">
              {grades.map((grade, i) => {
                const fb = gradeFeedback[i];
                const text = grade === 'A' ? fb.a : grade === 'B' ? fb.b : fb.c;
                const gradeColor = grade === 'A' ? 'bg-primary text-primary-foreground' : grade === 'B' ? 'bg-amber-500 text-white' : 'bg-destructive text-white';
                return (
                  <motion.div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}>
                    <div className={`w-9 h-9 rounded-full ${gradeColor} flex items-center justify-center flex-shrink-0 font-display text-sm font-bold`}>{grade}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs font-bold text-foreground mb-0.5">{fb.title}</p>
                      <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Overall verdict */}
            <motion.div className="rounded-2xl p-5 mb-5 text-center" style={{ backgroundColor: '#1E3A5F' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              {gradeCount.A >= 6 ? (
                <>
                  <p className="font-display text-xl font-bold text-white mb-2">🏆 Ausgezeichnet!</p>
                  <p className="font-body text-sm text-white/80 leading-relaxed">Du denkst bereits wie ein erfahrener ETF-Investor. Dein Portfolio zeigte starke Diversifikation und kluge Sektor-Aufteilung.</p>
                </>
              ) : gradeCount.A >= 4 ? (
                <>
                  <p className="font-display text-xl font-bold text-white mb-2">🎯 Sehr gut!</p>
                  <p className="font-body text-sm text-white/80 leading-relaxed">Solide Grundlage mit kleinen Verbesserungspotentialen. Ein paar mehr Länder und Sektoren hätten die Schocks abgefedert.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl font-bold text-white mb-2">💪 Guter Anfang!</p>
                  <p className="font-body text-sm text-white/80 leading-relaxed">Das Wichtigste: du hast es durchgespielt und weisst jetzt was du beim nächsten Mal anders machen würdest.</p>
                </>
              )}
            </motion.div>

            {/* XP */}
            <CompletionXP result={completionResult} hearts={hearts} />

            {/* Checklist */}
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 mb-6 space-y-1.5">
              {[
                'What is an index — understood',
                'Market cap weighting — experienced',
                'ETF as an investable wrapper — clear',
                'ETF categories and risk — classified',
                'Costs truly understood — simulated',
                'Diversification felt — through shocks',
                'Acc vs Dist — decided',
                'Savings plan power — calculated',
              ].map(t => (
                <p key={t} className="font-body text-[11px] text-foreground">✅ {t}</p>
              ))}
            </div>

            <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/category/etfs')}
              className="w-full h-14 rounded-full font-display text-base font-bold text-white mb-4" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}>
              Chapter complete! 🎉
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Allocation Modal ── */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStock(null)}>
            <motion.div className="bg-card rounded-t-3xl p-6 max-w-md w-full" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              {(() => {
                const s = stocks.find(st => st.ticker === selectedStock)!;
                return (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{s.flag}</span>
                      <span className="font-display text-base font-bold text-foreground">{s.name}</span>
                      <span className="font-body text-xs text-muted-foreground">{s.ticker}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-xs text-muted-foreground">Allocation</span>
                        <span className="font-display text-sm font-bold text-foreground">{tempAllocation}% = CHF {fmt(tempAllocation / 100 * 10000)}</span>
                      </div>
                      <input type="range" min={0} max={maxSliderVal} step={5} value={tempAllocation} onChange={e => setTempAllocation(+e.target.value)} className="w-full accent-blue-500" />
                      <p className="font-body text-[10px] text-muted-foreground mt-1">Danach noch: {remainingBudget - (tempAllocation - (portfolio[selectedStock] ?? 0))}% übrig</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedStock(null)} className="flex-1 h-12 rounded-full border border-border font-display text-sm font-bold text-foreground">Abbrechen</button>
                      <button onClick={confirmAllocation} className="flex-1 h-12 rounded-full font-display text-sm font-bold text-white" style={{ backgroundColor: '#10B981' }}>Bestätigen ✓</button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setPhase(0); setHearts(3); setPortfolio({}); setSelectedStock(null); setCurrentShock(0); setCurrentShockPhase('card'); setPortfolioValue(10000); setShockHistory([]); setAnimatedValue(10000); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setPhase(0); setHearts(3); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default ETF_L9_Simulation;
