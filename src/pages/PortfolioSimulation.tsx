import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, TrendUp, Vault, ChartPie, Lightning, CoinVertical, ShieldWarning, Scales, Warning, Info, Brain, Star } from '@phosphor-icons/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useBudget } from '@/contexts/BudgetContext';
import { festgeldProducts } from '@/data/festgeldProducts';
import { getStockReturns, getStockTimeSeries, CHF_TO_USD, type StockReturn, type StockTimeSeries } from '@/services/stockReturns';
import { getEtfTimeSeries, type EtfTimeSeries } from '@/services/etfList';

/* ── Constants ── */
const GOAL = 1000;
const SIM_YEARS = 5;
const YEAR_LABELS = ['2006', '2007', '2008', '2009', '2010', '2011'];

/* ── Asset class definitions ── */
const ASSET_CLASSES = [
  { key: 'aktien', label: 'Aktien', color: 'hsl(var(--level-aktien))', icon: TrendUp },
  { key: 'etfs', label: 'ETFs', color: 'hsl(var(--level-etfs))', icon: ChartPie },
  { key: 'festgeld', label: 'Festgeld', color: 'hsl(var(--level-festgeld))', icon: Vault },
  { key: 'krypto', label: 'Krypto', color: 'hsl(var(--level-krypto))', icon: Lightning },
  { key: 'tagesgeld', label: 'Cash', color: 'hsl(var(--level-tagesgeld))', icon: CoinVertical },
] as const;

/* ── Chart helpers ── */
const CHART_W = 320;
const CHART_H = 160;

function toPath(data: number[], count: number): string {
  const subset = data.slice(0, count + 1);
  const min = Math.min(...data) * 0.995;
  const max = Math.max(...data) * 1.005;
  const range = max - min || 1;
  return subset
    .map((v, i) => {
      const x = (i / (data.length - 1)) * CHART_W;
      const y = CHART_H - ((v - min) / range) * (CHART_H - 16);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function toArea(data: number[], count: number): string {
  const path = toPath(data, count);
  const lastX = ((Math.min(count, data.length - 1)) / (data.length - 1)) * CHART_W;
  return `${path} L${lastX.toFixed(1)},${CHART_H} L0,${CHART_H} Z`;
}

/* ── Build portfolio time series from real stock data ── */
interface PortfolioTimePoint {
  date: string;
  totalValue: number;
}

function buildPortfolioTimeSeries(
  aktienAllocs: Record<string, number>,
  timeSeries: Map<string, StockTimeSeries>,
  etfAllocs: Record<string, number>,
  etfTimeSeries: Map<string, EtfTimeSeries>,
  festgeldPositions: { amount: number; annualRate: number }[],
  tagesgeldAmount: number,
): PortfolioTimePoint[] {
  // Collect all unique dates from stock time series that the user owns
  const ownedTickers = Object.entries(aktienAllocs).filter(([, amt]) => amt > 0);
  const ownedEtfs = Object.entries(etfAllocs).filter(([, amt]) => amt > 0);
  if (ownedTickers.length === 0 && ownedEtfs.length === 0 && festgeldPositions.length === 0 && tagesgeldAmount === 0) return [];

  // Build a union of dates
  const dateSet = new Set<string>();
  for (const [ticker] of ownedTickers) {
    const ts = timeSeries.get(ticker);
    if (ts) ts.prices.forEach(p => dateSet.add(p.date));
  }
  for (const [ticker] of ownedEtfs) {
    const ts = etfTimeSeries.get(ticker);
    if (ts) ts.prices.forEach(p => dateSet.add(p.date));
  }

  // If no stock dates, generate yearly points for festgeld/tagesgeld
  if (dateSet.size === 0) {
    const dates: string[] = [];
    for (let y = 2006; y <= 2011; y++) dates.push(`${y}-02-17`);
    for (const d of dates) dateSet.add(d);
  }

  const allDates = [...dateSet].sort();

  // For each stock, build a lookup: date → price, and get first price for return calc
  const stockData: { ticker: string; amount: number; firstPrice: number; isCHF: boolean; priceMap: Map<string, number> }[] = [];
  for (const [ticker, amount] of ownedTickers) {
    const ts = timeSeries.get(ticker);
    if (!ts || ts.prices.length === 0) continue;
    const priceMap = new Map<string, number>();
    for (const p of ts.prices) priceMap.set(p.date, p.price);
    stockData.push({
      ticker,
      amount,
      firstPrice: ts.prices[0].price,
      isCHF: ts.isCHF,
      priceMap,
    });
  }

  // ETF data
  const etfData: { ticker: string; amount: number; firstPrice: number; isCHF: boolean; priceMap: Map<string, number> }[] = [];
  for (const [ticker, amount] of ownedEtfs) {
    const ts = etfTimeSeries.get(ticker);
    if (!ts || ts.prices.length === 0) continue;
    const priceMap = new Map<string, number>();
    for (const p of ts.prices) priceMap.set(p.date, p.price);
    etfData.push({ ticker, amount, firstPrice: ts.prices[0].price, isCHF: ts.isCHF, priceMap });
  }

  const totalFestgeld = festgeldPositions.reduce((s, f) => s + f.amount, 0);
  const startDate = new Date('2006-02-17').getTime();

  const points: PortfolioTimePoint[] = [];
  for (const date of allDates) {
    let total = 0;

    // Stock values
    for (const sd of stockData) {
      let price = sd.priceMap.get(date);
      if (price === undefined) {
        // Use last known price
        let lastPrice = sd.firstPrice;
        for (const d of allDates) {
          if (d > date) break;
          const p = sd.priceMap.get(d);
          if (p !== undefined) lastPrice = p;
        }
        price = lastPrice;
      }
      // Value = amount * (currentPrice / firstPrice), converted to USD if CHF
      let value = sd.amount * (price / sd.firstPrice);
      if (sd.isCHF) value *= CHF_TO_USD;
      total += value;
    }

    // ETF values (same logic as stocks)
    for (const ed of etfData) {
      let price = ed.priceMap.get(date);
      if (price === undefined) {
        let lastPrice = ed.firstPrice;
        for (const d of allDates) {
          if (d > date) break;
          const p = ed.priceMap.get(d);
          if (p !== undefined) lastPrice = p;
        }
        price = lastPrice;
      }
      let value = ed.amount * (price / ed.firstPrice);
      if (ed.isCHF) value *= CHF_TO_USD;
      total += value;
    }

    // Festgeld: linear compound interest based on elapsed time
    const elapsed = (new Date(date).getTime() - startDate) / (365.25 * 24 * 3600 * 1000);
    for (const fp of festgeldPositions) {
      total += fp.amount * Math.pow(1 + fp.annualRate / 100, Math.max(0, elapsed));
    }

    // Tagesgeld: no interest
    total += tagesgeldAmount;

    points.push({ date, totalValue: Math.round(total * 100) / 100 });
  }

  return points;
}

/* ── Donut Chart Component ── */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const strokeW = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="flex-shrink-0">
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={seg.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="font-body text-sm text-muted-foreground">{seg.label}</span>
            <span className="font-display text-sm font-bold text-foreground ml-auto tabular-nums">
              {((seg.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Portfolio Coach Logic ── */
interface CoachAnalysis {
  praise: string[];
  critique: string[];
  suggestion: string;
}

function analyzePortfolio(
  rendite: number,
  divScore: number,
  mdd: number,
  aktienPct: number,
  sharpeApprox: number,
  safePct: number,
): CoachAnalysis {
  const praise: string[] = [];
  const critique: string[] = [];
  let suggestion = '';

  // Praise
  if (rendite > 10) {
    praise.push(
      'Beeindruckend! Deine Rendite liegt weit über dem Durchschnitt. Du hast ein glückliches Händchen für Wachstumsphasen bewiesen.',
    );
  }
  if (divScore > 7) {
    praise.push(
      'Hervorragende Arbeit bei der Risikostreuung. Deine risikobehafteten Anlagen sind breit aufgestellt und nicht von einer einzelnen Position abhängig.',
    );
  }
  if (Math.abs(mdd) < 15 && aktienPct > 30) {
    praise.push(
      'Starke Leistung! Dein Portfolio hat sich in der Krise als sehr robust erwiesen.',
    );
  }

  // Critique — Klumpenrisiko only for risky assets
  if (aktienPct > 0 && divScore < 3) {
    critique.push(
      'Achtung, Klumpenrisiko! Deine risikobehafteten Anlagen (Aktien, ETFs) sind auf zu wenige Positionen konzentriert. Wenn eine davon fällt, reißt sie dein ganzes Portfolio mit.',
    );
  }
  if (Math.abs(mdd) > 40) {
    critique.push(
      'Das war eine harte Fahrt. Dein Portfolio hat in der Krise massiv an Wert verloren. Das zeigt, dass dein Risikomanagement lückenhaft war.',
    );
  }

  // Opportunity cost — too much in safe assets
  if (safePct > 60) {
    critique.push(
      'Über ' + Math.round(safePct) + '% deines Budgets liegen in risikoarmen Anlagen (Tagesgeld/Festgeld). Das ist zwar sicher, aber du verzichtest auf erhebliches Renditepotenzial — das nennt man Opportunitätskosten.',
    );
  } else if (safePct > 40 && rendite < 5) {
    critique.push(
      'Ein grosser Teil deines Portfolios steckt in risikoarmen Anlagen. Das schützt dein Kapital, kostet aber Rendite. Prüfe, ob du nicht etwas mehr in Aktien oder ETFs investieren könntest.',
    );
  }

  if (sharpeApprox < 0.5 && rendite > 0 && aktienPct > 20) {
    critique.push(
      'Deine Rendite ist zwar okay, aber du hast dafür ein unverhältnismäßig hohes Risiko auf dich genommen. Ein effizienteres Portfolio hätte die gleiche Rendite mit weniger Schwankung erreicht.',
    );
  }

  // Suggestion
  if (aktienPct > 0 && divScore < 5) {
    suggestion =
      'Um dein Portfolio krisenfester zu machen, solltest du dein Kapital auf mindestens 5–10 verschiedene Aktien aus unterschiedlichen Branchen oder Regionen verteilen. Ein Welt-ETF wäre ein guter Start.';
  } else if (safePct > 60) {
    suggestion =
      'Überlege, einen Teil deiner sicheren Anlagen in breit diversifizierte ETFs umzuschichten. So kannst du langfristig deutlich mehr Rendite erzielen, ohne ein übermässiges Risiko einzugehen.';
  } else if (Math.abs(mdd) > 25) {
    suggestion =
      'Mische defensive Werte wie Festgeld oder Anleihen bei, um die extremen Schwankungen in Krisenzeiten abzufedern — auch wenn das etwas Rendite kostet.';
  } else {
    suggestion =
      'Dein Portfolio ist solide aufgestellt. Um weiter zu optimieren, achte darauf, regelmässig zu rebalancen und neue Positionen nur mit klarer Strategie hinzuzufügen.';
  }

  return { praise, critique, suggestion };
}
const PortfolioSimulation = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { getProductAmount, getAssetTotal, allocations } = useBudget();
  const [animProgress, setAnimProgress] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [stockReturns, setStockReturns] = useState<Map<string, StockReturn>>(new Map());
  const [stockTimeSeries, setStockTimeSeries] = useState<Map<string, StockTimeSeries>>(new Map());
  const [etfTS, setEtfTS] = useState<Map<string, EtfTimeSeries>>(new Map());
  const [dataLoaded, setDataLoaded] = useState(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  // Load stock data
  useEffect(() => {
    Promise.all([getStockReturns(), getStockTimeSeries(), getEtfTimeSeries()]).then(([returns, ts, ets]) => {
      setStockReturns(returns);
      setStockTimeSeries(ts);
      setEtfTS(ets);
      setDataLoaded(true);
    });
  }, []);

  // Gather allocations
  const aktienAllocs = allocations['aktien'] ?? {};
  const etfAllocs = allocations['etfs'] ?? {};
  const tagesgeldAmount = getProductAmount('tagesgeld', 'tagesgeld');
  const festgeldPositions = festgeldProducts
    .map(fp => ({ amount: getProductAmount('festgeld', fp.slug), annualRate: fp.interestRate }))
    .filter(fp => fp.amount > 0);

  // Build real time series
  const portfolioTS = useMemo(
    () => buildPortfolioTimeSeries(aktienAllocs, stockTimeSeries, etfAllocs, etfTS, festgeldPositions, tagesgeldAmount),
    [dataLoaded, JSON.stringify(aktienAllocs), JSON.stringify(etfAllocs), JSON.stringify(festgeldPositions), tagesgeldAmount],
  );

  const values = portfolioTS.map(p => p.totalValue);
  const etfInvested = Object.values(etfAllocs).reduce((s, v) => s + Math.max(0, v), 0);
  const invested = Object.values(aktienAllocs).reduce((s, v) => s + Math.max(0, v), 0)
    + etfInvested
    + festgeldPositions.reduce((s, f) => s + f.amount, 0)
    + tagesgeldAmount;
  const endValue = values.length > 0 ? values[values.length - 1] : invested;
  const profit = Math.round((endValue - invested) * 100) / 100;
  const profitPct = invested > 0 ? Math.round((profit / invested) * 10000) / 100 : 0;
  const goalMet = profit >= GOAL;

  // ── Risk metrics ──
  // Only count risky positions for diversification (Aktien, ETFs) — Festgeld/Tagesgeld are safe and don't cause Klumpenrisiko
  const numRiskyPositions = Object.values(aktienAllocs).filter(v => v > 0).length
    + Object.values(etfAllocs).filter(v => v > 0).length;

  const riskyInvested = Object.values(aktienAllocs).filter(v => v > 0).reduce((s, v) => s + v, 0)
    + Object.values(etfAllocs).filter(v => v > 0).reduce((s, v) => s + v, 0);

  // Concentration penalty: only for risky positions — if any single risky position > 30% of risky total
  const riskyPositionPcts = riskyInvested > 0 ? [
    ...Object.values(aktienAllocs).filter(v => v > 0).map(v => (v / riskyInvested) * 100),
    ...Object.values(etfAllocs).filter(v => v > 0).map(v => (v / riskyInvested) * 100),
  ] : [];
  const maxRiskyPositionPct = riskyPositionPcts.length > 0 ? Math.max(...riskyPositionPcts) : 0;
  const concentrationPenalty = maxRiskyPositionPct > 30 ? (maxRiskyPositionPct - 30) / 10 : 0;

  const divScoreRaw = riskyInvested > 0
    ? Math.min(10, (numRiskyPositions / (riskyInvested / 500)) * 5)
    : 10; // If no risky assets, diversification is not an issue
  const divScore = Math.max(0, Math.round((divScoreRaw - concentrationPenalty) * 10) / 10);

  // Safe asset percentage (Tagesgeld + Festgeld)
  const safeTotal = tagesgeldAmount + festgeldPositions.reduce((s, f) => s + f.amount, 0);
  const safePct = invested > 0 ? (safeTotal / invested) * 100 : 0;

  const maxDrawdown = useMemo(() => {
    if (values.length < 2) return 0;
    let peak = values[0];
    let mdd = 0;
    for (const v of values) {
      if (v > peak) peak = v;
      const dd = (v - peak) / peak;
      if (dd < mdd) mdd = dd;
    }
    return mdd;
  }, [values]);

  const volatility = useMemo(() => {
    if (values.length < 2) return 0;
    const step = Math.max(1, Math.floor(values.length / 60));
    const sampled: number[] = [];
    for (let i = 0; i < values.length; i += step) sampled.push(values[i]);
    if (sampled.length < 2) return 0;
    const returns: number[] = [];
    for (let i = 1; i < sampled.length; i++) {
      returns.push((sampled[i] - sampled[i - 1]) / sampled[i - 1]);
    }
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * 100;
  }, [values]);

  const volLabel = volatility < 2 ? 'Niedrig' : volatility < 5 ? 'Mittel' : 'Hoch';
  const volColor = volatility < 2 ? 'text-primary' : volatility < 5 ? 'text-[hsl(30,90%,55%)]' : 'text-destructive';

  // Sharpe approximation (annualized return / volatility)
  const annualizedReturn = invested > 0 ? profitPct / SIM_YEARS : 0;
  const sharpeApprox = volatility > 0 ? annualizedReturn / (volatility * Math.sqrt(12)) : 0;

  // Aktien percentage
  const aktienPct = invested > 0 ? ((getAssetTotal('aktien') + etfInvested) / invested) * 100 : 0;

  // Coach analysis
  const coachAnalysis = useMemo(
    () => analyzePortfolio(profitPct, divScore, Math.abs(maxDrawdown) * 100, aktienPct, sharpeApprox, safePct),
    [profitPct, divScore, maxDrawdown, aktienPct, sharpeApprox, safePct],
  );

  // ── Challenge evaluation (Liquidity + Risk) ──
  const shortTermFestgeld = festgeldProducts
    .filter(fp => fp.durationYears <= 1)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);
  const safeAmount = tagesgeldAmount + shortTermFestgeld;
  const liquidityPassed = safeAmount >= 1000;
  const riskPassed = divScore >= 7;
  const challengeStars = liquidityPassed ? (riskPassed ? 3 : 2) : 1;

  const assetAmounts = ASSET_CLASSES.map(ac => ({
    ...ac,
    amount: ac.key === 'tagesgeld' ? tagesgeldAmount : getAssetTotal(ac.key),
  }));
  const totalAllocated = assetAmounts.reduce((s, a) => s + a.amount, 0);

  // Festgeld breakdown
  const festgeldTotal = getAssetTotal('festgeld');
  const festgeldBreakdown = festgeldProducts.map(fp => ({
    label: fp.title,
    amount: getProductAmount('festgeld', fp.slug),
    duration: fp.durationYears,
  })).filter(fb => fb.amount > 0);

  // Aktien breakdown for diversification donut
  const aktienTotal = getAssetTotal('aktien');
  const aktienBreakdown = Object.entries(aktienAllocs)
    .filter(([, amount]) => amount > 0)
    .map(([ticker, amount]) => ({
      ticker,
      name: stockReturns.get(ticker)?.name ?? ticker,
      amount,
    }));
  const hasAktien = aktienTotal > 0;

  // Animation
  useEffect(() => {
    if (!dataLoaded || values.length === 0) return;
    startRef.current = performance.now();
    const dur = 2500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / dur);
      setAnimProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dataLoaded, values.length]);

  const visiblePoints = values.length > 0
    ? Math.min(Math.floor(animProgress * (values.length - 1)), values.length - 1)
    : 0;
  const currentValue = values[visiblePoints] ?? invested;

  // Date labels for x-axis (show year labels at proper positions)
  const dateLabels = useMemo(() => {
    if (portfolioTS.length === 0) return [];
    const labels: { x: number; label: string }[] = [];
    for (const year of YEAR_LABELS) {
      const idx = portfolioTS.findIndex(p => p.date.startsWith(year));
      if (idx >= 0) {
        labels.push({ x: (idx / (portfolioTS.length - 1)) * CHART_W, label: year });
      }
    }
    return labels;
  }, [portfolioTS]);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Portfolio-Simulation</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Historische Entwicklung 2006 – 2011
        </p>
      </div>

      {/* Chart Card */}
      <div className="px-5 mb-6">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-body font-medium">Portfoliowert</p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                {currentValue.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $
              </p>
            </div>
            {animDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-bold ${
                  profit >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {profit >= 0 ? '+' : ''}{profitPct.toFixed(1)} %
              </motion.div>
            )}
          </div>

          {values.length > 1 ? (
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 24}`} className="w-full" style={{ maxHeight: 200 }}>
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1="0" y1={CHART_H * (1 - f)} x2={CHART_W} y2={CHART_H * (1 - f)}
                  stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}
              <path d={toArea(values, visiblePoints)} fill="hsl(var(--primary) / 0.08)" />
              <path d={toPath(values, visiblePoints)} fill="none" stroke="hsl(var(--primary))"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {visiblePoints > 0 && (
                <circle
                  cx={(visiblePoints / (values.length - 1)) * CHART_W}
                  cy={(() => {
                    const min = Math.min(...values) * 0.995;
                    const max = Math.max(...values) * 1.005;
                    const range = max - min || 1;
                    return CHART_H - ((currentValue - min) / range) * (CHART_H - 16);
                  })()}
                  r="4" fill="hsl(var(--primary))"
                />
              )}
              {dateLabels.map(dl => (
                <text key={dl.label} x={dl.x} y={CHART_H + 18}
                  textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))"
                  className="font-body">
                  {dl.label}
                </text>
              ))}
            </svg>
          ) : (
            <div className="h-[160px] flex items-center justify-center">
              <p className="font-body text-sm text-muted-foreground">Lade Kursdaten…</p>
            </div>
          )}

          {/* Start / End labels */}
          {animDone && values.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between mt-3"
            >
              <div>
                <p className="text-[10px] text-muted-foreground font-body">Start (Feb 2006)</p>
                <p className="font-display text-sm font-bold text-foreground tabular-nums">
                  {values[0].toLocaleString('de-CH', { maximumFractionDigits: 0 })} $
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-body">Ende (Feb 2011)</p>
                <p className={`font-display text-sm font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {endValue.toLocaleString('de-CH', { maximumFractionDigits: 0 })} $
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sections appear after animation */}
      <AnimatePresence>
        {animDone && (
          <motion.div
            className="px-5 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* ── 0. Challenge-Auswertung ── */}
            {invested > 0 && (
              <motion.div
                className="rounded-3xl border border-border shadow-card p-6"
                style={{ background: 'hsl(25, 60%, 97%)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <p className="font-display font-bold text-foreground text-[15px] text-center mb-4">Challenge-Auswertung</p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map(s => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, scale: 0, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + s * 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Star
                        size={40}
                        weight="fill"
                        className={s <= challengeStars
                          ? 'text-amber-400 drop-shadow-[0_0_6px_hsl(45,100%,60%)]'
                          : 'text-muted-foreground/25'
                        }
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Label */}
                <motion.p
                  className={`font-display text-sm font-bold text-center mb-3 ${
                    challengeStars === 3 ? 'text-primary' : challengeStars === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  {challengeStars === 3 ? 'Perfekt gemeistert!' : challengeStars === 2 ? 'Ziel erreicht, aber riskant!' : 'Ziel verfehlt!'}
                </motion.p>

                {/* Feedback */}
                <motion.p
                  className="font-body text-sm text-foreground/80 leading-relaxed text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  {challengeStars === 3
                    ? 'Perfekt! Du hast die benötigten 1.000 $ für das nächste Jahr sicher geparkt und den Rest deines Kapitals intelligent und breit gestreut investiert.'
                    : challengeStars === 2
                    ? 'Du hast zwar die 1.000 $ sicher, aber der Rest deines Portfolios weist ein hohes Klumpenrisiko auf. Bei einem Crash hättest du starke Verluste erlitten.'
                    : 'Du hast das wichtigste Ziel ignoriert: Du hast keine 1.000 $ sicher für das nächste Jahr zurückgelegt. Aktien schwanken und langfristiges Festgeld ist blockiert — wenn du das Geld jetzt brauchst, hast du ein Problem.'}
                </motion.p>

                {/* Breakdown pills */}
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    liquidityPassed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {liquidityPassed ? '✓' : '✗'} Liquidität: {safeAmount.toLocaleString('de-CH')} $ sicher
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    riskPassed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {riskPassed ? '✓' : '✗'} Diversifikation: {divScore.toFixed(1)}/10
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ── 1. Deine Aufteilung ── */}
            <div className="rounded-3xl bg-card border border-border shadow-card p-5">
              <p className="font-display font-bold text-foreground text-[15px] mb-4">Deine Aufteilung</p>
              <div className="space-y-3">
                {assetAmounts.map(ac => {
                  const pct = totalAllocated > 0 ? (ac.amount / totalAllocated) * 100 : 0;
                  const isZero = ac.amount === 0;
                  const Icon = ac.icon;
                  return (
                    <div key={ac.key} className={`flex items-center gap-3 ${isZero ? 'opacity-40' : ''}`}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isZero ? 'hsl(var(--muted))' : `${ac.color}20` }}
                      >
                        <Icon size={16} weight="bold" style={{ color: isZero ? 'hsl(var(--muted-foreground))' : ac.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-foreground font-medium">{ac.label}</span>
                          <span className="font-display text-xs font-bold text-foreground tabular-nums">
                            {ac.amount.toLocaleString('de-CH')} $ ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: isZero ? 'hsl(var(--muted))' : ac.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Ziel-Check & Performance ── */}
            <div className={`rounded-3xl p-5 border shadow-card ${
              goalMet
                ? 'bg-primary/5 border-primary/20'
                : 'bg-[hsl(30,90%,55%)]/5 border-[hsl(30,90%,55%)]/20'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  goalMet ? 'bg-primary/15' : 'bg-[hsl(30,90%,55%)]/15'
                }`}>
                  <Trophy size={24} weight="fill" className={goalMet ? 'text-primary' : 'text-[hsl(30,90%,55%)]'} />
                </div>
                <div>
                  <p className={`font-display font-bold text-base ${goalMet ? 'text-primary' : 'text-[hsl(30,90%,55%)]'}`}>
                    {goalMet ? 'Ziel erreicht! 🎉' : 'Ziel nicht erreicht'}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Ziel: {GOAL.toLocaleString('de-CH')} $ Rendite in {SIM_YEARS} Jahren
                  </p>
                </div>
              </div>

              {/* Endwert */}
              <div className="bg-card rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Endwert</p>
                    <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                      {endValue.toLocaleString('de-CH', { maximumFractionDigits: 0 })} $
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Investiert</p>
                    <p className="font-display text-lg text-muted-foreground tabular-nums">
                      {invested.toLocaleString('de-CH', { maximumFractionDigits: 0 })} $
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Rendite</p>
                  <p className={`font-display text-xl font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toLocaleString('de-CH', { maximumFractionDigits: 0 })} $
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Rendite %</p>
                  <p className={`font-display text-xl font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {profit >= 0 ? '+' : ''}{profitPct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. Fälligkeits-Struktur (nur wenn Festgeld > 0) ── */}
            {festgeldTotal > 0 && (
              <div className="rounded-3xl bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--level-festgeld) / 0.12)' }}>
                    <Vault size={20} weight="fill" style={{ color: 'hsl(var(--level-festgeld))' }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-[15px]">Fälligkeits-Struktur</p>
                    <p className="text-xs text-muted-foreground font-body">Laufzeiten deiner Festgeld-Anlagen</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {festgeldBreakdown.map(fb => {
                    const pct = (fb.amount / festgeldTotal) * 100;
                    return (
                      <div key={fb.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-foreground">{fb.duration} {fb.duration === 1 ? 'Jahr' : 'Jahre'}</span>
                          <span className="font-display text-xs font-bold text-foreground tabular-nums">
                            {fb.amount.toLocaleString('de-CH')} $ ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: 'hsl(var(--level-festgeld))' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. Aktien-Aufteilung ── */}
            {hasAktien && (
              <div className="rounded-3xl bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--level-aktien))]/12 flex items-center justify-center">
                    <ChartPie size={20} weight="fill" style={{ color: 'hsl(var(--level-aktien))' }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-[15px]">Aktien-Aufteilung</p>
                    <p className="text-xs text-muted-foreground font-body">Streuung deiner Aktien-Investitionen</p>
                  </div>
                </div>
                <DonutChart
                  segments={aktienBreakdown.map((ab, i) => {
                    const hues = [210, 240, 180, 150, 270, 330, 30, 60];
                    const hue = hues[i % hues.length];
                    return {
                      label: ab.name,
                      value: ab.amount,
                      color: `hsl(${hue}, 70%, 50%)`,
                    };
                  })}
                />
              </div>
            )}

            {/* ── 5. Risiko & Stabilität ── */}
            {invested > 0 && values.length > 1 && (
              <div className="rounded-3xl bg-muted/40 border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <ShieldWarning size={20} weight="fill" className="text-destructive" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-[15px]">Risiko & Stabilität</p>
                    <p className="text-xs text-muted-foreground font-body">Wie krisenfest war dein Portfolio?</p>
                  </div>
                </div>

                 <div className="space-y-3 mb-5">
                  {/* 3-card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Diversifikations-Score */}
                    <div className="bg-card rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Scales size={16} weight="bold" className="text-primary" />
                        <p className="font-display text-sm font-bold text-foreground">Diversifikation</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                              <Info size={12} weight="bold" className="text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                            Misst, wie gut dein Kapital verteilt ist. Ein hoher Score bedeutet, dass du nicht von einer einzelnen Aktie abhängig bist. Bei wenig Kapital reichen wenige Aktien, bei viel Kapital solltest du mehr streuen.
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: divScore >= 7 ? 'hsl(var(--primary))' : divScore >= 4 ? 'hsl(30,90%,55%)' : 'hsl(var(--destructive))' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${divScore * 10}%` }}
                            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="font-display text-lg font-bold text-foreground tabular-nums w-12 text-right">{divScore.toFixed(1)}</span>
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground">{numPositions} Position{numPositions !== 1 ? 'en' : ''} · {invested.toLocaleString('de-CH')} $</p>
                    </div>

                    {/* Max Drawdown */}
                    <div className="bg-card rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Warning size={16} weight="bold" className="text-destructive" />
                        <p className="font-display text-sm font-bold text-foreground">Max. Drawdown</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                              <Info size={12} weight="bold" className="text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                            Der maximale Wertverlust vom höchsten zum tiefsten Punkt. Es zeigt dir das «Worst-Case-Szenario», das du während der 5 Jahre hättest aussitzen müssen.
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className={`font-display text-2xl font-bold tabular-nums ${maxDrawdown < -0.15 ? 'text-destructive' : maxDrawdown < -0.05 ? 'text-[hsl(30,90%,55%)]' : 'text-primary'}`}>
                        {(maxDrawdown * 100).toFixed(1)}%
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground mt-1">Grösster Verlust vom Höchststand</p>
                    </div>

                    {/* Volatilität */}
                    <div className="bg-card rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendUp size={16} weight="bold" className="text-[hsl(30,90%,55%)]" />
                        <p className="font-display text-sm font-bold text-foreground">Volatilität</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                              <Info size={12} weight="bold" className="text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                            Das Mass für die Schwankungsbreite. Hohe Volatilität bedeutet nervöse Kurssprünge, niedrige Volatilität steht für einen ruhigeren Verlauf.
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className={`font-display text-2xl font-bold tabular-nums ${volColor}`}>
                        {volatility.toFixed(1)}% <span className="text-sm font-body font-normal">({volLabel})</span>
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground mt-1">Schwankung der Monatsrenditen</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. Portfolio-Coach ── */}
            {invested > 0 && values.length > 1 && (
              <motion.div
                className="rounded-3xl border border-[hsl(210,60%,90%)] dark:border-[hsl(210,40%,25%)] shadow-card p-5"
                style={{ background: 'hsl(210, 60%, 97%)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="dark:opacity-95">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[hsl(210,70%,55%)]/15 flex items-center justify-center">
                      <Brain size={24} weight="fill" className="text-[hsl(210,70%,55%)]" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground text-[15px]">KI-Analyse: Dein Feedback</p>
                      <p className="text-xs text-muted-foreground font-body">Dein Portfolio-Coach</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90">
                    {coachAnalysis.praise.length > 0 && (
                      <div>
                        <p className="font-display text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                          ✅ Was gut lief
                        </p>
                        {coachAnalysis.praise.map((text, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>{text}</p>
                        ))}
                      </div>
                    )}

                    {coachAnalysis.critique.length > 0 && (
                      <div>
                        <p className="font-display text-xs font-bold uppercase tracking-wider text-destructive mb-1.5">
                          ⚠️ Was du verbessern kannst
                        </p>
                        {coachAnalysis.critique.map((text, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>{text}</p>
                        ))}
                      </div>
                    )}

                    <div className="rounded-2xl bg-card/80 dark:bg-card p-4 border border-border">
                      <p className="font-display text-xs font-bold uppercase tracking-wider text-[hsl(210,70%,55%)] mb-1.5">
                        💡 Coach-Empfehlung
                      </p>
                      <p>{coachAnalysis.suggestion}</p>
                    </div>

                    {coachAnalysis.praise.length === 0 && coachAnalysis.critique.length === 0 && (
                      <p className="text-muted-foreground">
                        Dein Portfolio ist solide — weiter so! Achte darauf, breit zu streuen und dein Risiko im Griff zu behalten.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {invested === 0 && (
              <div className="rounded-3xl bg-muted/50 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  Du hast noch kein Budget verteilt. Geh zurück und investiere in Aktien, Festgeld oder Cash.
                </p>
              </div>
            )}

            {/* ── 5. Back button ── */}
            <motion.button
              onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
              whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display text-base font-bold shadow-sm"
            >
              Zurück zur Challenge
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioSimulation;
