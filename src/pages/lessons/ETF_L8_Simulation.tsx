import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart } from 'react-icons/fi';

const BLUE = '#1A56DB';

/* ── Stock data ── */
interface Stock {
  ticker: string;
  name: string;
  flag: string;
  sector: string;
  country: string;
}

const stocks: Stock[] = [
  { ticker: 'AAPL', name: 'Apple', flag: '🇺🇸', sector: 'Tech', country: 'US' },
  { ticker: 'TSLA', name: 'Tesla', flag: '🇺🇸', sector: 'Consumer', country: 'US' },
  { ticker: 'SAP', name: 'SAP', flag: '🇩🇪', sector: 'Tech', country: 'DE' },
  { ticker: 'SHEL', name: 'Shell', flag: '🇬🇧', sector: 'Energy', country: 'UK' },
  { ticker: 'NESN', name: 'Nestlé', flag: '🇨🇭', sector: 'Consumer', country: 'CH' },
  { ticker: 'ASML', name: 'ASML', flag: '🇳🇱', sector: 'Tech', country: 'NL' },
  { ticker: 'JPM', name: 'JPMorgan', flag: '🇺🇸', sector: 'Finance', country: 'US' },
  { ticker: 'MC', name: 'LVMH', flag: '🇫🇷', sector: 'Luxury', country: 'FR' },
  { ticker: '005930', name: 'Samsung', flag: '🇰🇷', sector: 'Tech', country: 'KR' },
  { ticker: '9988', name: 'Alibaba', flag: '🇨🇳', sector: 'Tech', country: 'CN' },
  { ticker: 'BHP', name: 'BHP', flag: '🇦🇺', sector: 'Materials', country: 'AU' },
  { ticker: 'MRNA', name: 'Moderna', flag: '🇺🇸', sector: 'Healthcare', country: 'US' },
];

/* ── Shocks ── */
interface Shock {
  title: string;
  description: string;
  affected: string;
  sectorImpact: Record<string, number>;
  countryImpact: Record<string, number>;
}

const shocks: Shock[] = [
  {
    title: 'Tech Selloff',
    description: 'Rising rates trigger a rotation out of tech stocks.',
    affected: 'Tech sector worldwide',
    sectorImpact: { Tech: -0.22, Consumer: -0.05, Finance: 0.05, Energy: 0.08, Luxury: -0.02, Materials: 0.02, Healthcare: -0.03 },
    countryImpact: {},
  },
  {
    title: 'Euro appreciates (+8%)',
    description: 'ECB surprise rate hike pushes EUR/USD higher.',
    affected: 'European markets',
    sectorImpact: {},
    countryImpact: { DE: -0.06, FR: -0.07, NL: -0.05, US: 0.02, UK: 0.01, CH: -0.04, KR: 0, CN: 0, AU: 0 },
  },
  {
    title: 'Emerging Market Rally',
    description: 'Fed turns dovish. Capital flows into emerging markets.',
    affected: 'Emerging markets & commodities',
    sectorImpact: {},
    countryImpact: { CN: 0.18, KR: 0.14, AU: 0.06, US: -0.02, DE: 0, FR: 0, NL: 0, UK: 0, CH: 0 },
  },
];

const fmt = (n: number) => Math.round(n).toLocaleString('de-CH');

const sectorBadgeColor: Record<string, string> = {
  Tech: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  Consumer: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Energy: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  Finance: 'bg-green-500/15 text-green-700 dark:text-green-300',
  Luxury: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  Materials: 'bg-stone-500/15 text-stone-700 dark:text-stone-300',
  Healthcare: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

/* ── Component ── */
const ETF_L8_Simulation = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [hearts, setHearts] = useState(3);

  // Phase 1
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [sliderStock, setSliderStock] = useState<Stock | null>(null);
  const [sliderVal, setSliderVal] = useState(0);

  // Phase 2
  const [currentShock, setCurrentShock] = useState(0);
  const [shockRevealed, setShockRevealed] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [shocksDone, setShocksDone] = useState(false);

  // Phase 3
  const [showDeepDive] = useState(false);
  void showDeepDive;

  const remainingBudget = 100 - Object.values(portfolio).reduce((s, v) => s + v, 0);

  // Diversity scores
  const diversityScores = useMemo(() => {
    const allocated = stocks.filter(s => (portfolio[s.ticker] || 0) > 0);
    const countries = new Set(allocated.map(s => s.country));
    const sectors = new Set(allocated.map(s => s.sector));
    return {
      geo: Math.min(10, Math.round(countries.size * 1.4)),
      sector: Math.min(10, Math.round(sectors.size * 1.4)),
      countries,
      sectors,
    };
  }, [portfolio]);

  // Compute impact of a shock on portfolio
  const computeShockImpact = (shock: Shock, currentVal: number) => {
    let totalChange = 0;
    const details: { ticker: string; name: string; pct: number; change: number }[] = [];
    stocks.forEach(s => {
      const alloc = portfolio[s.ticker] || 0;
      if (alloc === 0) return;
      const sectorHit = shock.sectorImpact[s.sector] || 0;
      const countryHit = shock.countryImpact[s.country] || 0;
      const combined = sectorHit + countryHit;
      const positionValue = currentVal * (alloc / 100);
      const change = positionValue * combined;
      totalChange += change;
      details.push({ ticker: s.ticker, name: s.name, pct: combined * 100, change });
    });
    return { totalChange, details, newVal: currentVal + totalChange };
  };

  const handleAllocConfirm = () => {
    if (!sliderStock || sliderVal === 0) { setSliderStock(null); return; }
    const current = portfolio[sliderStock.ticker] || 0;
    const delta = sliderVal - current;
    if (delta > remainingBudget + current - (portfolio[sliderStock.ticker] || 0)) return;
    setPortfolio(prev => ({ ...prev, [sliderStock.ticker]: sliderVal }));
    setSliderStock(null);
    setSliderVal(0);
  };

  const handleRevealShock = () => {
    const impact = computeShockImpact(shocks[currentShock], portfolioValue);
    setPortfolioValue(Math.round(impact.newVal));
    setShockRevealed(true);
  };

  const handleNextShock = () => {
    if (currentShock < shocks.length - 1) {
      setCurrentShock(s => s + 1);
      setShockRevealed(false);
    } else {
      setShocksDone(true);
    }
  };

  // ETF recommendation
  const etfRec = useMemo(() => {
    const allocated = stocks.filter(s => (portfolio[s.ticker] || 0) > 0);
    const usWeight = allocated.filter(s => s.country === 'US').reduce((s, st) => s + (portfolio[st.ticker] || 0), 0);
    const euWeight = allocated.filter(s => ['DE', 'FR', 'NL', 'UK'].includes(s.country)).reduce((s, st) => s + (portfolio[st.ticker] || 0), 0);
    const countries = new Set(allocated.map(s => s.country));

    if (usWeight > 60) return { name: 'iShares Core S&P 500 (CSPX)', ter: '0.07%', holdings: '503', score: 9 };
    if (euWeight > 40) return { name: 'iShares Core MSCI Europe (IMAE)', ter: '0.12%', holdings: '428', score: 8 };
    if (countries.size > 3) return { name: 'Vanguard FTSE All-World (VWCE)', ter: '0.22%', holdings: '3.644', score: 10 };
    return { name: 'Vanguard FTSE All-World (VWCE)', ter: '0.22%', holdings: '3.644', score: 10 };
  }, [portfolio]);

  // Insights
  const insights = useMemo(() => {
    const result: string[] = [];
    const techWeight = stocks.filter(s => s.sector === 'Tech').reduce((s, st) => s + (portfolio[st.ticker] || 0), 0);
    const allocated = stocks.filter(s => (portfolio[s.ticker] || 0) > 0);
    const countries = new Set(allocated.map(s => s.country));
    const sectors = new Set(allocated.map(s => s.sector));
    const maxCountry = stocks.reduce((best, s) => {
      const w = portfolio[s.ticker] || 0;
      return w > best.w ? { c: s.country, w } : best;
    }, { c: '', w: 0 });
    const totalOneCountry = stocks.filter(s => s.country === maxCountry.c).reduce((s, st) => s + (portfolio[st.ticker] || 0), 0);

    if (techWeight > 40) result.push('📊 Your portfolio was tech-heavy — you would have benefited from a NASDAQ-100 ETF, but with less individual risk.');
    if (totalOneCountry > 60) result.push('🌍 You were geographically concentrated — like 10 playlists from the same artist. A global ETF would have diversified that.');
    if (countries.size > 5 && sectors.size > 4) result.push('🎯 Good instincts! Your portfolio was already broadly diversified — you think like an ETF manager.');
    if (result.length === 0) result.push('💡 With a single ETF you would have achieved broader diversification, less effort and lower costs.');
    return result;
  }, [portfolio]);

  const progress = currentPhase === 0 ? 0 : currentPhase === 1 ? 25 : currentPhase === 2 ? (shocksDone ? 85 : 50 + currentShock * 10) : 100;

  const currentShockImpact = shockRevealed ? computeShockImpact(shocks[currentShock], portfolioValue) : null;
  void currentShockImpact;

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

      <AnimatePresence mode="wait">
        {/* PHASE 0 — Intro */}
        {currentPhase === 0 && (
          <motion.div key="p0" className="flex-1 flex flex-col items-center justify-center px-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <span className="text-5xl mb-4">🎮</span>
            <h2 className="font-display text-2xl font-bold text-foreground leading-tight max-w-xs mb-3">The final simulation</h2>
            <p className="font-body text-[15px] leading-relaxed text-muted-foreground max-w-sm mb-8">
              You\'ve learned everything. Now put it to use. You have CHF 10,000 to invest. Pick your stocks — then we\'ll show you which ETF could have covered the same thing cheaper and broader.
            </p>
            <motion.button onClick={() => setCurrentPhase(1)} whileTap={{ scale: 0.96 }} className="h-14 px-8 rounded-full font-display text-lg font-bold text-white shadow-sm" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}>
              Start simulation →
            </motion.button>
          </motion.div>
        )}

        {/* PHASE 1 — Build portfolio */}
        {currentPhase === 1 && (
          <motion.div key="p1" className="flex-1 flex flex-col px-4 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-2 max-w-sm mx-auto w-full">
              <h2 className="font-display text-lg font-bold text-foreground">Build your portfolio</h2>
              <span className="font-display text-sm font-bold text-primary">{remainingBudget}% remaining</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden max-w-sm mx-auto w-full mb-4">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${100 - remainingBudget}%` }} transition={{ duration: 0.3 }} />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto w-full mb-4">
              {stocks.map(s => {
                const alloc = portfolio[s.ticker] || 0;
                const hasAlloc = alloc > 0;
                return (
                  <motion.button
                    key={s.ticker}
                    onClick={() => { setSliderStock(s); setSliderVal(alloc); }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative text-left p-3 rounded-xl border-2 transition-colors ${hasAlloc ? 'border-green-500 bg-green-500/5' : 'border-border bg-card'}`}
                  >
                    {hasAlloc && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alloc}%</span>
                    )}
                    <p className="font-display text-sm font-bold text-foreground">{s.flag} {s.ticker}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sectorBadgeColor[s.sector] || 'bg-muted text-muted-foreground'}`}>{s.sector}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Scores */}
            <div className="flex gap-3 max-w-sm mx-auto w-full mb-4">
              <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
                <p className="font-body text-[10px] text-muted-foreground mb-1">Geo diversification</p>
                <p className="font-display text-lg font-bold text-foreground">{diversityScores.geo}/10</p>
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
                <p className="font-body text-[10px] text-muted-foreground mb-1">Sector diversification</p>
                <p className="font-display text-lg font-bold text-foreground">{diversityScores.sector}/10</p>
              </div>
            </div>

            {/* Freeze button */}
            {remainingBudget === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full">
                <motion.button onClick={() => setCurrentPhase(2)} whileTap={{ scale: 0.96 }} className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm" style={{ backgroundColor: BLUE }}>
                  Freeze portfolio →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PHASE 2 — Shocks */}
        {currentPhase === 2 && !shocksDone && (
          <motion.div key={`p2-${currentShock}`} className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {/* Portfolio value */}
            <div className="text-center mb-4">
              <p className="font-body text-xs text-muted-foreground">Portfolio value</p>
              <motion.p key={portfolioValue} className="font-display text-2xl font-bold text-foreground" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                CHF {fmt(portfolioValue)}
              </motion.p>
            </div>

            {/* Shock card */}
            <div className="max-w-sm mx-auto w-full rounded-2xl border-2 border-red-400 dark:border-red-600 overflow-hidden mb-4">
              <div className="bg-red-600 dark:bg-red-700 px-4 py-3">
                <p className="font-display text-sm font-bold text-white">⚡ Market shock {currentShock + 1}/3</p>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-display text-xl font-bold text-foreground">{shocks[currentShock].title}</h3>
                <p className="font-body text-sm text-muted-foreground">{shocks[currentShock].description}</p>
                <p className="font-body text-xs text-muted-foreground">Affected: {shocks[currentShock].affected}</p>

                {!shockRevealed ? (
                  <motion.button onClick={handleRevealShock} whileTap={{ scale: 0.96 }} className="w-full h-12 rounded-full font-display text-sm font-bold text-white" style={{ backgroundColor: BLUE }}>
                    Impact on your portfolio →
                  </motion.button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    {(() => {
                      const impact = computeShockImpact(shocks[currentShock], portfolioValue);
                      const topHits = [...impact.details].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 3);
                      return topHits.map(d => (
                        <div key={d.ticker} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                          <span className="font-body text-xs text-foreground font-semibold">{d.ticker} ({d.name})</span>
                          <span className={`font-display text-xs font-bold ${d.pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{d.pct >= 0 ? '+' : ''}{d.pct.toFixed(1)}%</span>
                        </div>
                      ));
                    })()}
                    <motion.button onClick={handleNextShock} whileTap={{ scale: 0.96 }} className="w-full h-12 rounded-full font-display text-sm font-bold text-white mt-2" style={{ backgroundColor: currentShock < 2 ? BLUE : 'hsl(142, 71%, 45%)' }}>
                      {currentShock < 2 ? 'Next shock →' : 'To the result →'}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2 done → go to 3 */}
        {currentPhase === 2 && shocksDone && (
          <motion.div key="p2done" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onAnimationComplete={() => setCurrentPhase(3)} />
        )}

        {/* PHASE 3 — Resolution */}
        {currentPhase === 3 && (
          <motion.div key="p3" className="flex-1 flex flex-col px-6 py-4 overflow-y-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">What an ETF would have made of this</h2>

            <div className="max-w-sm mx-auto w-full space-y-4">
              {/* Your portfolio */}
              <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-2">
                <p className="font-display text-sm font-bold text-foreground">Your Portfolio</p>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Final value after shocks</span>
                  <span className="font-display text-sm font-bold text-foreground">CHF {fmt(portfolioValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Geo-Score</span>
                  <span className="font-display text-sm font-bold text-foreground">{diversityScores.geo}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Sektor-Score</span>
                  <span className="font-display text-sm font-bold text-foreground">{diversityScores.sector}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Transactions</span>
                  <span className="font-body text-xs text-foreground">{Object.keys(portfolio).filter(k => portfolio[k] > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Broker fees</span>
                  <span className="font-body text-xs text-foreground">~CHF {Object.keys(portfolio).filter(k => portfolio[k] > 0).length}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center">
                <span className="font-display text-lg text-muted-foreground">↓ vs ↓</span>
              </div>

              {/* ETF alternative */}
              <div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-4 space-y-2">
                <p className="font-display text-sm font-bold text-primary">ETF-Alternative</p>
                <p className="font-display text-base font-bold text-foreground">{etfRec.name}</p>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">TER</span>
                  <span className="font-body text-xs text-foreground">{etfRec.ter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Number of holdings</span>
                  <span className="font-body text-xs text-foreground">{etfRec.holdings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Transactions</span>
                  <span className="font-body text-xs text-foreground font-semibold text-green-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Broker fees</span>
                  <span className="font-body text-xs text-foreground font-semibold text-green-600">CHF 1</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">Diversification score</span>
                  <span className="font-display text-sm font-bold text-green-600">{etfRec.score}/10</span>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }} className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{ins}</p>
                  </motion.div>
                ))}
              </div>

              {/* Final CTA */}
              <motion.button onClick={() => navigate('/category/etfs')} whileTap={{ scale: 0.96 }} className="w-full h-14 rounded-full font-display text-lg font-bold text-white shadow-sm" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}>
                Chapter complete! 🎉
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slider overlay for stock allocation */}
      <AnimatePresence>
        {sliderStock && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSliderStock(null)}>
            <motion.div className="bg-card rounded-t-3xl p-6 max-w-md w-full" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{sliderStock.flag}</span>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">{sliderStock.ticker}</p>
                  <p className="font-body text-sm text-muted-foreground">{sliderStock.name}</p>
                </div>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-body text-sm text-muted-foreground">Allocation</span>
                <span className="font-display text-lg font-bold text-foreground">{sliderVal}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.min(50, remainingBudget + (portfolio[sliderStock.ticker] || 0))}
                step={5}
                value={sliderVal}
                onChange={e => setSliderVal(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-full mb-5"
              />
              <motion.button onClick={handleAllocConfirm} whileTap={{ scale: 0.96 }} className="w-full h-12 rounded-full font-display text-base font-bold text-white" style={{ backgroundColor: BLUE }}>
                {sliderVal > 0 ? 'Confirm' : 'Remove'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ETF_L8_Simulation;
