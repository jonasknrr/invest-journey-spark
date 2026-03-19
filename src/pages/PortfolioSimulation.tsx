import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, TrendUp, Vault, ChartPie, Lightning, CoinVertical, ShieldWarning, Scales, Warning, Info, Brain, Star, Lock } from '@phosphor-icons/react';
import { calcDiversificationWithETFs, ETF_CONSTITUENTS } from '@/hooks/useDiversification';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useBudget } from '@/contexts/BudgetContext';
import { festgeldProducts } from '@/data/festgeldProducts';
import { getStockReturns, getStockTimeSeries, CHF_TO_USD, type StockReturn, type StockTimeSeries } from '@/services/stockReturns';
import { getEtfTimeSeries, type EtfTimeSeries } from '@/services/etfList';
import { getChapterConfig } from '@/data/challengeConfig';

/* ── Constants ── */
const GOAL = 1000;
const SIM_YEARS = 5;
const YEAR_LABELS = ['2006', '2007', '2008', '2009', '2010', '2011'];

/* ── Asset class definitions ── */
const ASSET_CLASSES = [
  { key: 'aktien', label: 'Stocks', color: 'hsl(var(--level-aktien))', icon: TrendUp },
  { key: 'etfs', label: 'ETFs', color: 'hsl(var(--level-etfs))', icon: ChartPie },
  { key: 'festgeld', label: 'Fixed Deposit', color: 'hsl(var(--level-festgeld))', icon: Vault },
  { key: 'krypto', label: 'Crypto', color: 'hsl(var(--level-krypto))', icon: Lightning },
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
  const ownedTickers = Object.entries(aktienAllocs).filter(([, amt]) => amt > 0);
  const ownedEtfs = Object.entries(etfAllocs).filter(([, amt]) => amt > 0);
  if (ownedTickers.length === 0 && ownedEtfs.length === 0 && festgeldPositions.length === 0 && tagesgeldAmount === 0) return [];

  const dateSet = new Set<string>();
  for (const [ticker] of ownedTickers) {
    const ts = timeSeries.get(ticker);
    if (ts) ts.prices.forEach(p => dateSet.add(p.date));
  }
  for (const [ticker] of ownedEtfs) {
    const ts = etfTimeSeries.get(ticker);
    if (ts) ts.prices.forEach(p => dateSet.add(p.date));
  }

  if (dateSet.size === 0) {
    const dates: string[] = [];
    for (let y = 2006; y <= 2011; y++) dates.push(`${y}-02-17`);
    for (const d of dates) dateSet.add(d);
  }

  const allDates = [...dateSet].sort();

  const stockData: { ticker: string; amount: number; firstPrice: number; isCHF: boolean; priceMap: Map<string, number> }[] = [];
  for (const [ticker, amount] of ownedTickers) {
    const ts = timeSeries.get(ticker);
    if (!ts || ts.prices.length === 0) continue;
    const priceMap = new Map<string, number>();
    for (const p of ts.prices) priceMap.set(p.date, p.price);
    stockData.push({ ticker, amount, firstPrice: ts.prices[0].price, isCHF: ts.isCHF, priceMap });
  }

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

    for (const sd of stockData) {
      let price = sd.priceMap.get(date);
      if (price === undefined) {
        let lastPrice = sd.firstPrice;
        for (const d of allDates) {
          if (d > date) break;
          const p = sd.priceMap.get(d);
          if (p !== undefined) lastPrice = p;
        }
        price = lastPrice;
      }
      let value = sd.amount * (price / sd.firstPrice);
      if (sd.isCHF) value *= CHF_TO_USD;
      total += value;
    }

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

    const elapsed = (new Date(date).getTime() - startDate) / (365.25 * 24 * 3600 * 1000);
    for (const fp of festgeldPositions) {
      total += fp.amount * Math.pow(1 + fp.annualRate / 100, Math.max(0, elapsed));
    }

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

/* ── ETF name resolution ── */
function resolveEtfName(ticker: string): string {
  const nameMap: Record<string, string> = {
    '^GDAXI': 'DAX', '^N225': 'Nikkei 225', '^DJI': 'DJIA',
    '^STOXX50E': 'EuroStoxx 50', '^SSMI': 'SMI',
    'DAX': 'DAX', 'Nikkei 225': 'Nikkei 225', 'DJIA': 'DJIA',
    'EuroStoxx 50': 'EuroStoxx 50', 'SMI': 'SMI',
  };
  return nameMap[ticker] ?? ticker;
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
  levelId?: string,
  ch1Context?: { tagesgeldPct: number; notgroschenOk: boolean },
  etfContext?: { etfInvested: number; hasEtfs: boolean; hasSingleStocks: boolean },
): CoachAnalysis {
  const praise: string[] = [];
  const critique: string[] = [];
  let suggestion = '';

  /* ── Chapter 1 ── */
  if (levelId === 'chapter-1') {
    if (rendite > 2) {
      praise.push('✅ Well done! You\'re getting a solid return from your safe investments.');
    }
    if (ch1Context && ch1Context.tagesgeldPct > 50) {
      critique.push('📉 Interest lost: You left a lot of money in low-interest call money that could have been placed in fixed deposits for a higher return.');
    }
    if (ch1Context && !ch1Context.notgroschenOk) {
      critique.push('⚠️ Liquidity trap: You locked too much money in fixed deposits. If you need cash short-term, you can\'t access it.');
    }
    if (ch1Context && ch1Context.tagesgeldPct > 50) {
      suggestion = 'Consider placing money you don\'t need long-term into fixed deposits with longer terms — this secures better interest rates.';
    } else if (ch1Context && !ch1Context.notgroschenOk) {
      suggestion = 'Keep at least your emergency fund in a call money account — it\'s always available when you need it.';
    } else {
      suggestion = 'Good allocation! Always ensure your emergency fund stays flexible and only the rest is locked in long-term.';
    }
    return { praise, critique, suggestion };
  }

  /* ── Chapter 2+ ── */
  if (rendite > 10) {
    praise.push('Impressive! Your return is well above average. You have a great eye for growth phases.');
  }
  if (divScore > 7) {
    praise.push('Excellent risk diversification. Your risky assets are broadly spread and not dependent on a single position.');
  }
  if (Math.abs(mdd) < 15 && aktienPct > 30) {
    praise.push('Strong performance! Your portfolio proved very resilient during the crisis.');
  }

  // ETF-specific feedback
  if (etfContext) {
    if (etfContext.hasSingleStocks && !etfContext.hasEtfs && aktienPct > 0) {
      critique.push('📊 Missed ETF Opportunity: Picking single stocks with your long-term capital is risky. Use index funds (ETFs) to instantly spread your risk across dozens of companies.');
    }
    if (etfContext.hasEtfs && divScore > 7) {
      praise.push('🌍 Excellent Diversification: By utilizing ETFs, you\'ve instantly minimized your exposure to single-company failures and secured a robust portfolio.');
    }
  }

  // Concentration risk
  if (aktienPct > 0 && divScore < 5) {
    if (levelId === 'chapter-3') {
      critique.push('⚠️ Diversification tip: You have high concentration risk in your individual stocks. Use the newly unlocked ETFs to instantly spread your risk across hundreds of companies!');
    } else {
      critique.push('⚠️ Concentration risk: Your money is spread across too few stocks. If a single company crashes, you lose too much.');
    }
  }

  if (aktienPct === 0 && (levelId === 'chapter-2' || levelId === 'chapter-3')) {
    critique.push('📉 Too conservative: You\'ve unlocked stocks but aren\'t using them. To achieve high long-term returns, you should invest part of your money in the stock market.');
  }

  if (Math.abs(mdd) > 40) {
    critique.push('📉 That was a rough ride. Your portfolio lost massive value during the crisis. This shows your risk management had gaps.');
  }

  if (safePct > 60) {
    critique.push(`⚠️ Over ${Math.round(safePct)}% of your budget is in low-risk investments (call money/fixed deposits). That's safe, but you're giving up significant return potential — that's called opportunity cost.`);
  } else if (safePct > 40 && rendite < 5) {
    critique.push('⚠️ A large portion of your portfolio is in low-risk investments. This protects your capital but costs returns.');
  }

  if (sharpeApprox < 0.5 && rendite > 0 && aktienPct > 20) {
    critique.push('⚠️ Your return is okay, but you took disproportionately high risk for it. A more efficient portfolio could have achieved the same return with less volatility.');
  }

  // Suggestion
  if (aktienPct > 0 && divScore < 5) {
    suggestion = levelId === 'chapter-3'
      ? 'Use global ETFs like the MSCI World to instantly spread your capital across hundreds of companies worldwide — this reduces your risk while maintaining expected returns.'
      : 'To make your portfolio more crisis-resistant, spread your capital across at least 5-10 different stocks from different sectors or regions.';
  } else if (safePct > 60) {
    suggestion = 'Consider shifting some of your safe investments into broadly diversified stocks or ETFs. This allows you to achieve significantly higher long-term returns.';
  } else if (Math.abs(mdd) > 25) {
    suggestion = 'Add defensive assets like fixed deposits to cushion extreme swings during crises — even if it costs some return.';
  } else {
    suggestion = 'Your portfolio is solidly positioned. To optimize further, make sure to rebalance regularly and only add new positions with a clear strategy.';
  }

  return { praise, critique, suggestion };
}

const PortfolioSimulation = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { getProductAmount, getAssetTotal, allocations, totalBudget } = useBudget();
  const chapterConfig = levelId ? getChapterConfig(levelId) : undefined;
  const isChapter1 = levelId === 'chapter-1';
  const isChapter3 = levelId === 'chapter-3';
  const currency = chapterConfig?.scenario?.currency ?? 'CHF';
  const [animProgress, setAnimProgress] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [stockReturns, setStockReturns] = useState<Map<string, StockReturn>>(new Map());
  const [stockTimeSeries, setStockTimeSeries] = useState<Map<string, StockTimeSeries>>(new Map());
  const [etfTS, setEtfTS] = useState<Map<string, EtfTimeSeries>>(new Map());
  const [dataLoaded, setDataLoaded] = useState(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    Promise.all([getStockReturns(), getStockTimeSeries(), getEtfTimeSeries()]).then(([returns, ts, ets]) => {
      setStockReturns(returns);
      setStockTimeSeries(ts);
      setEtfTS(ets);
      setDataLoaded(true);
    });
  }, []);

  const aktienAllocs = allocations['aktien'] ?? {};
  const etfAllocs = allocations['etfs'] ?? {};
  const tagesgeldAmount = getProductAmount('tagesgeld', 'tagesgeld');
  const festgeldPositions = festgeldProducts
    .map(fp => ({ amount: getProductAmount('festgeld', fp.slug), annualRate: fp.interestRate }))
    .filter(fp => fp.amount > 0);

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

  // ── Risk metrics (ETF-aware HHI diversification) ──
  const riskyPositions = useMemo(() => {
    const positions: { amount: number; name: string }[] = [];
    for (const [ticker, amount] of Object.entries(aktienAllocs)) {
      if (amount > 0) positions.push({ amount, name: ticker });
    }
    for (const [ticker, amount] of Object.entries(etfAllocs)) {
      if (amount > 0) positions.push({ amount, name: resolveEtfName(ticker) });
    }
    return positions;
  }, [JSON.stringify(aktienAllocs), JSON.stringify(etfAllocs)]);

  const riskyInvested = riskyPositions.reduce((s, p) => s + p.amount, 0);
  const numRiskyPositions = riskyPositions.length;

  const divResult = useMemo(
    () => calcDiversificationWithETFs(riskyPositions, riskyInvested),
    [JSON.stringify(riskyPositions), riskyInvested],
  );

  const divScore = divResult.riskPassed ? 8 : divResult.rating === 'Fair' ? 5 : 2;

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

  const volLabel = volatility < 2 ? 'Low' : volatility < 5 ? 'Medium' : 'High';
  const volColor = volatility < 2 ? 'text-primary' : volatility < 5 ? 'text-[hsl(30,90%,55%)]' : 'text-destructive';

  const annualizedReturn = invested > 0 ? profitPct / SIM_YEARS : 0;
  const sharpeApprox = volatility > 0 ? annualizedReturn / (volatility * Math.sqrt(12)) : 0;

  const aktienPct = invested > 0 ? ((getAssetTotal('aktien') + etfInvested) / invested) * 100 : 0;

  const tagesgeldPct = invested > 0 ? (tagesgeldAmount / invested) * 100 : 0;
  const ch1CoachContext = isChapter1
    ? { tagesgeldPct, notgroschenOk: tagesgeldAmount >= 2000 }
    : undefined;

  const hasSingleStocks = Object.values(aktienAllocs).some(v => v > 0);
  const hasEtfs = etfInvested > 0;
  const etfCoachContext = { etfInvested, hasEtfs, hasSingleStocks };

  const coachAnalysis = useMemo(
    () => analyzePortfolio(profitPct, divScore, Math.abs(maxDrawdown) * 100, aktienPct, sharpeApprox, safePct, levelId, ch1CoachContext, etfCoachContext),
    [profitPct, divScore, maxDrawdown, aktienPct, sharpeApprox, safePct, levelId, tagesgeldPct, isChapter1, etfInvested, hasSingleStocks, hasEtfs],
  );

  // ── Challenge evaluation ──
  const shortTermFestgeld = festgeldProducts
    .filter(fp => fp.durationYears <= 1)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);
  const within2YearsFestgeld = festgeldProducts
    .filter(fp => fp.durationYears <= 2)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);
  const within3YearsFestgeld = festgeldProducts
    .filter(fp => fp.durationYears <= 3)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);
  const longTermFestgeld = festgeldProducts
    .filter(fp => fp.durationYears >= 5)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);
  const fiveYearFestgeld = festgeldProducts
    .filter(fp => fp.durationYears === 5)
    .reduce((s, fp) => s + getProductAmount('festgeld', fp.slug), 0);

  // ── Chapter 3: New conditions (emergency 1k, purchase 2k in 3y, 7k long-term with ETFs) ──
  const ch3_notgroschenOk = tagesgeldAmount >= 1000;
  // Purchase fund: 2k in cash + fixed deposits ≤ 3 years
  const ch3_carFundAvailable = tagesgeldAmount + within3YearsFestgeld;
  // Must have emergency (1k in cash) AND purchase fund (2k in cash or FD ≤ 3y, separate from emergency)
  const ch3_carOk = (ch3_carFundAvailable - 1000) >= 2000; // after setting aside 1k emergency
  const ch3_riskyTotal = riskyInvested;
  const ch3_riskyEnough = ch3_riskyTotal >= 6000; // at least ~6k in risky assets
  const ch3_divGood = divResult.rating === 'Very Good' || divResult.rating === 'Good';
  const ch3_renditeOk = ch3_riskyEnough && ch3_divGood;

  // Chapter 1 conditions
  const ch1_notgroschenOk = tagesgeldAmount >= 2000;
  const ch1_weiterbildungAvailable = tagesgeldAmount + within2YearsFestgeld >= 5000;
  const ch1_restInLongTerm = longTermFestgeld >= 4500;

  // Default evaluation
  const safeAmount = tagesgeldAmount + shortTermFestgeld;
  const liquidityPassed = isChapter1 ? ch1_notgroschenOk : isChapter3 ? ch3_notgroschenOk : safeAmount >= 1000;
  const riskPassed = divResult.riskPassed;
  const opportunityCostPenalty = isChapter1
    ? !ch1_restInLongTerm
    : isChapter3
    ? !ch3_renditeOk
    : safePct > 60;

  let challengeStars: number;
  let challengeLabel: string;
  let challengeFeedback: string;

  if (isChapter3) {
    if (ch3_notgroschenOk && ch3_carOk && ch3_renditeOk) {
      challengeStars = 3;
      challengeLabel = 'Master of Diversification!';
      challengeFeedback = 'Outstanding! Your short-term goals are safely funded, and you\'ve used the power of ETFs to perfectly diversify your long-term wealth.';
    } else if (ch3_notgroschenOk && ch3_carOk) {
      challengeStars = 2;
      challengeLabel = 'Safe, but inefficient or risky!';
      challengeFeedback = 'Your short-term goals are safe, but your long-term strategy needs work. You are either taking on a cluster risk by picking single stocks, or losing money to inflation by keeping too much in cash.';
    } else {
      challengeStars = 1;
      challengeLabel = 'Financial Planning Failed!';
      challengeFeedback = 'Warning! You ignored your timeline. If you need 2,000 in 3 years, you cannot lock it in a 5-year deposit or risk it in the volatile stock market.';
    }
  } else if (isChapter1) {
    if (ch1_notgroschenOk && ch1_weiterbildungAvailable && ch1_restInLongTerm) {
      challengeStars = 3;
      challengeLabel = 'Perfect!';
      challengeFeedback = 'Excellent! Your emergency fund is flexible, the training in 2 years is secured, and for the rest you\'ve locked in maximum interest rates.';
    } else if (ch1_notgroschenOk && ch1_weiterbildungAvailable) {
      challengeStars = 2;
      challengeLabel = 'Safe, but returns wasted!';
      challengeFeedback = 'Your goals are secured, but you wasted returns. Money you don\'t need for 5 years shouldn\'t sit in low-interest call money.';
    } else {
      challengeStars = 1;
      challengeLabel = 'Liquidity trap!';
      challengeFeedback = 'Warning! You ignored the most important goal. Money you need in 2 years must not be locked for 5 years. In real life, you\'d now have to take out expensive loans.';
    }
  } else {
    challengeStars = liquidityPassed
      ? (riskPassed && !opportunityCostPenalty ? 3 : 2)
      : 1;
    challengeLabel = challengeStars === 3 ? 'Perfectly mastered!' : challengeStars === 2 ? (opportunityCostPenalty ? 'Returns wasted!' : 'Goal reached, but risky!') : 'Goal missed!';
    challengeFeedback = challengeStars === 3
      ? 'Perfect! You safely parked the required 1,000 CHF for next year and intelligently invested the rest broadly diversified.'
      : challengeStars === 2
      ? (opportunityCostPenalty
          ? 'You have the 1,000 CHF secured, but too much capital sits in low-risk investments. Through inflation you\'re losing purchasing power — that\'s called opportunity cost.'
          : 'You have the 1,000 CHF secured, but the rest of your portfolio has high concentration risk. In a crash, you would have suffered significant losses.')
      : 'You ignored the most important goal: You didn\'t safely set aside 1,000 CHF for next year. Stocks fluctuate and long-term fixed deposits are locked — if you need the money now, you have a problem.';
  }

  const assetAmounts = ASSET_CLASSES.map(ac => ({
    ...ac,
    amount: ac.key === 'tagesgeld' ? tagesgeldAmount : getAssetTotal(ac.key),
  }));
  const totalAllocated = assetAmounts.reduce((s, a) => s + a.amount, 0);

  const festgeldTotal = getAssetTotal('festgeld');
  const festgeldBreakdown = festgeldProducts.map(fp => ({
    label: fp.title,
    amount: getProductAmount('festgeld', fp.slug),
    duration: fp.durationYears,
  })).filter(fb => fb.amount > 0);

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
        <h1 className="font-display text-2xl font-bold text-foreground">Portfolio Simulation</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Historical performance 2006 – 2011
        </p>
      </div>

      {/* Chart Card */}
      <div className="px-5 mb-6">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-body font-medium">Portfolio value</p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                {currentValue.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency}
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
              <p className="font-body text-sm text-muted-foreground">Loading price data…</p>
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
                  {values[0].toLocaleString('de-CH', { maximumFractionDigits: 0 })} {currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-body">End (Feb 2011)</p>
                <p className={`font-display text-sm font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {endValue.toLocaleString('de-CH', { maximumFractionDigits: 0 })} {currency}
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
            {/* ── 0. Challenge Evaluation ── */}
            {invested > 0 && (
              <motion.div
                className="rounded-3xl border border-border shadow-card p-6"
                style={{ background: 'hsl(25, 60%, 97%)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <p className="font-display font-bold text-foreground text-[15px] text-center mb-4">Challenge Evaluation</p>

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
                  {challengeLabel}
                </motion.p>

                {/* Feedback */}
                <motion.p
                  className="font-body text-sm text-foreground/80 leading-relaxed text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  {challengeFeedback}
                </motion.p>

                {/* Breakdown pills */}
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  {isChapter1 ? (
                    <>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch1_notgroschenOk ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {ch1_notgroschenOk ? '✓' : '✗'} Emergency: {tagesgeldAmount.toLocaleString('de-CH')} {currency}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch1_weiterbildungAvailable ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {ch1_weiterbildungAvailable ? '✓' : '✗'} Training: ≤2y available
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch1_restInLongTerm ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {ch1_restInLongTerm ? '✓' : '△'} Max. return: {longTermFestgeld.toLocaleString('de-CH')} {currency} long-term
                      </span>
                    </>
                  ) : isChapter3 ? (
                    <>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch3_notgroschenOk ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {ch3_notgroschenOk ? '✓' : '✗'} Emergency: {tagesgeldAmount.toLocaleString('de-CH')} / 1,000 {currency}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch3_carOk ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {ch3_carOk ? '✓' : '✗'} Purchase fund: {Math.max(0, ch3_carFundAvailable - 1000).toLocaleString('de-CH')} / 2,000 {currency}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ch3_renditeOk ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {ch3_renditeOk ? '✓' : '△'} Diversification: {ch3_riskyTotal.toLocaleString('de-CH')} {currency} / {divResult.rating}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                        📊 {divResult.truePositionCount} underlying positions
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        liquidityPassed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {liquidityPassed ? '✓' : '✗'} Liquidity: {safeAmount.toLocaleString('de-CH')} {currency} safe
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        riskPassed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {riskPassed ? '✓' : '✗'} Diversification: {divResult.rating}
                      </span>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ── 1. Your Allocation ── */}
            <div className="rounded-3xl bg-card border border-border shadow-card p-5">
              <p className="font-display font-bold text-foreground text-[15px] mb-4">Your Allocation</p>
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
                            {ac.amount.toLocaleString('de-CH')} {currency} ({pct.toFixed(0)}%)
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

            {/* ── 2. Performance ── */}
            <div className="rounded-3xl bg-card border border-border shadow-card p-5">
              <p className="font-display font-bold text-foreground text-[15px] mb-4">Performance</p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Final Value</p>
                  <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                    {endValue.toLocaleString('de-CH', { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold">Invested</p>
                  <p className="font-display text-lg text-muted-foreground tabular-nums">
                    {invested.toLocaleString('de-CH', { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Return</p>
                  <p className={`font-display text-xl font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toLocaleString('de-CH', { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Return %</p>
                  <p className={`font-display text-xl font-bold tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {profit >= 0 ? '+' : ''}{profitPct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. Maturity Structure (only when fixed deposits > 0) ── */}
            {festgeldTotal > 0 && (
              <div className="rounded-3xl bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--level-festgeld) / 0.12)' }}>
                    <Vault size={20} weight="fill" style={{ color: 'hsl(var(--level-festgeld))' }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-[15px]">Maturity Structure</p>
                    <p className="text-xs text-muted-foreground font-body">Terms of your fixed deposit investments</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {festgeldBreakdown.map(fb => {
                    const pct = (fb.amount / festgeldTotal) * 100;
                    return (
                      <div key={fb.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-foreground">{fb.duration} {fb.duration === 1 ? 'Year' : 'Years'}</span>
                          <span className="font-display text-xs font-bold text-foreground tabular-nums">
                            {fb.amount.toLocaleString('de-CH')} {currency} ({pct.toFixed(0)}%)
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

            {/* ── 4. Stock Allocation ── */}
            {hasAktien && (
              <div className="rounded-3xl bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--level-aktien))]/12 flex items-center justify-center">
                    <ChartPie size={20} weight="fill" style={{ color: 'hsl(var(--level-aktien))' }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-[15px]">Stock Allocation</p>
                    <p className="text-xs text-muted-foreground font-body">Distribution of your stock investments</p>
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

            {/* ── 5. Risk & Stability ── */}
            {invested > 0 && values.length > 1 && (
              <div className="relative rounded-3xl bg-muted/40 border border-border shadow-card p-5 overflow-hidden">
                {isChapter1 && (
                  <div className="absolute inset-0 z-10 rounded-3xl bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Lock size={24} weight="fill" className="text-muted-foreground" />
                    </div>
                    <p className="font-display text-sm font-bold text-muted-foreground text-center px-6 leading-snug">
                      This analysis section unlocks from Chapter 2 (Stocks) onwards.
                    </p>
                  </div>
                )}

                <div className={isChapter1 ? 'opacity-40 pointer-events-none select-none' : ''}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <ShieldWarning size={20} weight="fill" className="text-destructive" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground text-[15px]">Risk & Stability</p>
                      <p className="text-xs text-muted-foreground font-body">How crisis-resistant was your portfolio?</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-card rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scales size={16} weight="bold" className="text-primary" />
                          <p className="font-display text-sm font-bold text-foreground">Diversification</p>
                          {!isChapter1 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                                  <Info size={12} weight="bold" className="text-muted-foreground" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                                Evaluated using the Herfindahl-Hirschman Index (HHI). ETFs are expanded into their underlying constituents for a more accurate assessment.
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            className="font-display text-xl font-bold"
                            style={{ color: isChapter1 ? 'hsl(var(--muted-foreground))' : divResult.color }}
                          >
                            {isChapter1 ? '—' : divResult.rating}
                          </span>
                        </div>
                        {!isChapter1 && (
                          <p className="font-body text-[11px] text-muted-foreground">
                            HHI: {divResult.hhi.toLocaleString('de-CH')} | {divResult.truePositionCount} position{divResult.truePositionCount !== 1 ? 's' : ''} across {riskyInvested.toLocaleString('de-CH')} {currency}
                          </p>
                        )}
                      </div>

                      <div className="bg-card rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Warning size={16} weight="bold" className="text-destructive" />
                          <p className="font-display text-sm font-bold text-foreground">Max. Drawdown</p>
                          {!isChapter1 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                                  <Info size={12} weight="bold" className="text-muted-foreground" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                                The maximum loss from the highest to the lowest point.
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <p className={`font-display text-2xl font-bold tabular-nums ${
                          isChapter1 ? 'text-muted-foreground' : maxDrawdown < -0.15 ? 'text-destructive' : maxDrawdown < -0.05 ? 'text-[hsl(30,90%,55%)]' : 'text-primary'
                        }`}>
                          {isChapter1 ? '—' : `${(maxDrawdown * 100).toFixed(1)}%`}
                        </p>
                        {!isChapter1 && <p className="font-body text-[11px] text-muted-foreground mt-1">Largest loss from peak</p>}
                      </div>

                      <div className="bg-card rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendUp size={16} weight="bold" className="text-muted-foreground" />
                          <p className="font-display text-sm font-bold text-foreground">Volatility</p>
                          {!isChapter1 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="ml-auto w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                                  <Info size={12} weight="bold" className="text-muted-foreground" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="max-w-[260px] text-xs font-body leading-relaxed p-3">
                                The measure of price fluctuation range.
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <p className={`font-display text-2xl font-bold tabular-nums ${isChapter1 ? 'text-muted-foreground' : volColor}`}>
                          {isChapter1 ? '—' : <>{volatility.toFixed(1)}% <span className="text-sm font-body font-normal">({volLabel})</span></>}
                        </p>
                        {!isChapter1 && <p className="font-body text-[11px] text-muted-foreground mt-1">Monthly return fluctuation</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. AI Analysis ── */}
            {invested > 0 && values.length > 1 && (() => {
              const weaknesses: { icon: string; text: string }[] = [];

              if (isChapter3) {
                if (!ch3_notgroschenOk) {
                  weaknesses.push({
                    icon: '🚨',
                    text: `Insufficient emergency fund: You only have ${tagesgeldAmount.toLocaleString('de-CH')} ${currency} in call money, but need at least 10,000 ${currency} as an immediately available reserve.`,
                  });
                }
                if (!ch3_carOk) {
                  weaknesses.push({
                    icon: '🚗',
                    text: `Car fund at risk: Only ${Math.max(0, ch3_carFundAvailable - 10000).toLocaleString('de-CH')} ${currency} is safely available within 3 years for the car — you need 20,000 ${currency}.`,
                  });
                }
                if (fiveYearFestgeld > 0 && !ch3_carOk) {
                  weaknesses.push({
                    icon: '⏰',
                    text: `Wrong term: You locked ${fiveYearFestgeld.toLocaleString('de-CH')} ${currency} for 5 years, even though you need 20,000 ${currency} in 3 years.`,
                  });
                }
                if (ch3_riskyTotal >= 50000 && etfInvested === 0) {
                  weaknesses.push({
                    icon: '📊',
                    text: `Missed ETF Opportunity: Picking single stocks with your long-term capital is risky. Use index funds (ETFs) to instantly spread your risk across dozens of companies.`,
                  });
                }
                if (ch3_riskyTotal > 0 && !ch3_divGood) {
                  weaknesses.push({
                    icon: '⚠️',
                    text: `Concentration risk (${divResult.rating}): Your capital is spread across too few positions (HHI: ${divResult.hhi.toLocaleString('de-CH')}). Diversify more broadly!`,
                  });
                }
                if (ch3_riskyTotal < 60000 && ch3_notgroschenOk && ch3_carOk) {
                  weaknesses.push({
                    icon: '💸',
                    text: `Returns wasted: Only ${ch3_riskyTotal.toLocaleString('de-CH')} ${currency} is working long-term for you. You could invest approximately 70,000 ${currency} for growth.`,
                  });
                }
                // Praise for great ETF usage
                if (ch3_riskyTotal > 0 && ch3_divGood && etfInvested > 0) {
                  weaknesses.push({
                    icon: '🌍',
                    text: `Excellent Diversification: By utilizing ETFs, you've instantly minimized your exposure to single-company failures and secured a robust portfolio.`,
                  });
                }
              } else {
                if (aktienPct > 0 && !divResult.riskPassed) {
                  weaknesses.push({
                    icon: '⚠️',
                    text: `Concentration risk (${divResult.rating}): Your capital is spread across too few positions (HHI: ${divResult.hhi.toLocaleString('de-CH')}).`,
                  });
                }
                if (Math.abs(maxDrawdown) * 100 > 25) {
                  weaknesses.push({
                    icon: '📉',
                    text: `High volatility: Your portfolio suffered significant losses during crises (Max. Drawdown: ${(maxDrawdown * 100).toFixed(1)}%).`,
                  });
                }
                if (safePct > 40) {
                  weaknesses.push({
                    icon: '💸',
                    text: `Returns wasted: ${Math.round(safePct)}% of your budget is in low-risk investments. You're giving up return potential (opportunity cost).`,
                  });
                }
                if (!liquidityPassed) {
                  weaknesses.push({
                    icon: '🔓',
                    text: 'No liquidity reserve: You haven\'t safely parked 1,000 CHF for short-term access.',
                  });
                }
                if (sharpeApprox < 0.5 && profitPct > 0 && aktienPct > 20) {
                  weaknesses.push({
                    icon: '⚖️',
                    text: 'Inefficient risk: Your return doesn\'t justify the risk taken.',
                  });
                }
              }

              const isPerfect = weaknesses.length === 0 || (weaknesses.length === 1 && weaknesses[0].icon === '🌍');

              return (
                <motion.div
                  className="rounded-3xl border border-[hsl(210,60%,90%)] dark:border-[hsl(210,40%,25%)] shadow-card p-5"
                  style={{ background: isPerfect ? 'hsl(142, 50%, 97%)' : 'hsl(210, 60%, 97%)' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="dark:opacity-95">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        isPerfect ? 'bg-primary/15' : 'bg-[hsl(210,70%,55%)]/15'
                      }`}>
                        <Brain size={24} weight="fill" className={isPerfect ? 'text-primary' : 'text-[hsl(210,70%,55%)]'} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-foreground text-[15px]">AI Analysis</p>
                        <p className="text-xs text-muted-foreground font-body">{isPerfect ? 'No weaknesses found' : 'Room for improvement'}</p>
                      </div>
                    </div>

                    {isPerfect && weaknesses.length === 0 ? (
                      <div className="rounded-2xl bg-primary/8 border border-primary/15 p-4">
                        <p className="font-body text-sm text-foreground leading-relaxed">
                          ✅ Your portfolio is excellently positioned. There are currently no major weaknesses!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-2xl bg-card/80 dark:bg-card border border-border p-3.5">
                            <span className="text-lg flex-shrink-0 mt-0.5">{w.icon}</span>
                            <p className="font-body text-sm text-foreground/90 leading-relaxed">{w.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* Empty state */}
            {invested === 0 && (
              <div className="rounded-3xl bg-muted/50 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  You haven't allocated any budget yet. Go back and invest in stocks, fixed deposits, or cash.
                </p>
              </div>
            )}

            {/* ── Back button ── */}
            <motion.button
              onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
              whileTap={{ scale: 0.96 }}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display text-base font-bold shadow-sm"
            >
              Back to Challenge
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioSimulation;
