import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiBarChart2,
  FiLayers,
  FiLock as FiVault,
  FiDollarSign,
  FiFileText,
  FiAward,
  FiZap,
  FiArrowRight,
  FiGrid,
  FiLock,
  FiSliders,
} from 'react-icons/fi';
import { BiBitcoin } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import LevelIntroOverlay from '@/components/LevelIntroOverlay';
import { levelIntros } from '@/data/levelIntros';
import LessonFlow from '@/components/lessons/LessonFlow';
import { getTopic } from '@/data/topicConfig';
import { useBudget } from '@/contexts/BudgetContext';
import { getUnlockedSlugs, chapterConfigs, getChapterConfig } from '@/data/challengeConfig';
import { calcDiversificationWithETFs, ETF_CONSTITUENTS } from '@/hooks/useDiversification';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssetClass {
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hasDetail?: boolean;
}

const assetClasses: AssetClass[] = [
  { name: 'Call Money', slug: 'tagesgeld', icon: FiDollarSign, color: 'hsl(var(--level-tagesgeld))', bgColor: 'hsl(var(--level-tagesgeld) / 0.12)', hasDetail: true },
  { name: 'Fixed Deposit', slug: 'festgeld', icon: FiVault, color: 'hsl(var(--level-festgeld))', bgColor: 'hsl(var(--level-festgeld) / 0.12)', hasDetail: true },
  { name: 'Stocks', slug: 'aktien', icon: FiTrendingUp, color: 'hsl(var(--level-aktien))', bgColor: 'hsl(var(--level-aktien) / 0.12)', hasDetail: true },
  { name: 'ETFs', slug: 'etfs', icon: FiLayers, color: 'hsl(var(--level-etfs))', bgColor: 'hsl(var(--level-etfs) / 0.12)', hasDetail: true },
  { name: 'Funds', slug: 'indizes', icon: FiBarChart2, color: 'hsl(var(--level-currencies))', bgColor: 'hsl(var(--level-currencies) / 0.12)' },
  { name: 'Bonds', slug: 'anleihen', icon: FiFileText, color: 'hsl(var(--level-anleihen))', bgColor: 'hsl(var(--level-anleihen) / 0.12)' },
  { name: 'Commodities', slug: 'rohstoffe', icon: FiGrid, color: 'hsl(var(--level-metals))', bgColor: 'hsl(var(--level-metals) / 0.12)' },
  { name: 'Cryptocurrencies', slug: 'crypto', icon: BiBitcoin, color: 'hsl(var(--level-crypto))', bgColor: 'hsl(var(--level-crypto) / 0.12)' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

/** Resolve ETF name from ticker for constituent lookup */
function resolveEtfName(ticker: string): string {
  const nameMap: Record<string, string> = {
    '^GDAXI': 'DAX',
    '^N225': 'Nikkei 225',
    '^DJI': 'DJIA',
    '^STOXX50E': 'EuroStoxx 50',
    '^SSMI': 'SMI',
    'DAX': 'DAX',
    'Nikkei 225': 'Nikkei 225',
    'DJIA': 'DJIA',
    'EuroStoxx 50': 'EuroStoxx 50',
    'SMI': 'SMI',
  };
  return nameMap[ticker] ?? ticker;
}

const LevelChallenge = () => {
  const { levelId, topicSlug } = useParams<{ levelId: string; topicSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSubPage = (location.state as { fromSubPage?: boolean })?.fromSubPage === true;
  const [showIntro, setShowIntro] = useState(!fromSubPage);
  const { totalBudget, getRemaining, getAllocatedTotal, getAssetTotal, setTotalBudget, resetAllocations, allocations } = useBudget();

  // Get chapter config and set budget
  const chapterConfig = levelId ? getChapterConfig(levelId) : undefined;
  const scenario = chapterConfig?.scenario;

  // ── Real-time diversification indicator ──
  const aktienAllocs = allocations['aktien'] ?? {};
  const etfAllocs = allocations['etfs'] ?? {};

  const divResult = useMemo(() => {
    const positions: { amount: number; name: string }[] = [];
    for (const [ticker, amount] of Object.entries(aktienAllocs)) {
      if (amount > 0) positions.push({ amount, name: ticker });
    }
    for (const [ticker, amount] of Object.entries(etfAllocs)) {
      if (amount > 0) positions.push({ amount, name: resolveEtfName(ticker) });
    }
    const investedCapital = positions.reduce((s, p) => s + p.amount, 0);
    return calcDiversificationWithETFs(positions, investedCapital);
  }, [JSON.stringify(aktienAllocs), JSON.stringify(etfAllocs)]);

  const hasRiskyAssets = divResult.numPositions > 0;

  useEffect(() => {
    if (scenario && totalBudget !== scenario.budget) {
      setTotalBudget(scenario.budget);
      resetAllocations();
    }
  }, [scenario?.budget]);

  // Render interactive lesson if a topic slug is provided and config exists
  if (levelId && topicSlug) {
    const topicConfig = getTopic(levelId, topicSlug);
    if (topicConfig) {
      return <LessonFlow config={topicConfig} />;
    }
  }

  const intro = levelId ? levelIntros[levelId] : undefined;

  const unlockedSlugs = levelId ? getUnlockedSlugs(levelId) : new Set(assetClasses.map(a => a.slug));
  const chapterLabel = chapterConfig?.label ?? 'Challenge';
  const unlockedCount = assetClasses.filter(a => unlockedSlugs.has(a.slug)).length;

  const remaining = getRemaining();
  const allocated = getAllocatedTotal();
  const pctUsed = totalBudget > 0 ? Math.round((allocated / totalBudget) * 100) : 0;
  const currency = scenario?.currency ?? 'CHF';


  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-6 pb-2">
        <button onClick={() => navigate('/learn')} className="text-muted-foreground text-sm font-body mb-2 flex items-center gap-1">
          ← Back
        </button>
      </div>

      <motion.div className="px-5 space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        {/* Challenge Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary/90 to-primary p-6 text-primary-foreground shadow-soft">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-foreground/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary-foreground/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 bg-primary-foreground/20 rounded-full px-3 py-1">
                <FiAward size={16} />
                <span className="text-xs font-display font-semibold">{chapterLabel}</span>
              </div>
            </div>
            <h1 className="font-display text-xl font-bold leading-snug mb-3">
              {scenario ? scenario.title : 'Distribute your budget and maximise your return!'}
            </h1>
            <p className="text-sm leading-relaxed opacity-90 font-body whitespace-pre-line">
              {scenario
                ? scenario.description
                : <>You have <span className="font-bold">{totalBudget.toLocaleString('de-CH')} {currency}</span> and need <span className="font-bold">1,000 {currency}</span> in one year. Try to earn as much return as possible.</>
              }
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
                <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Your Budget</p>
                <p className="font-display text-2xl font-bold tabular-nums">{totalBudget.toLocaleString('de-CH')} {currency}</p>
              </div>
              {scenario ? (
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Emergency Fund</p>
                  <p className="font-display text-2xl font-bold tabular-nums">{levelId === 'chapter-3' ? '10,000' : '2,000'} {currency}</p>
                </div>
              ) : (
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Goal</p>
                  <p className="font-display text-2xl font-bold tabular-nums">1,000 {currency}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Budget Status */}
        <motion.div variants={itemVariants} className="rounded-3xl bg-card border border-border shadow-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FiZap size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body font-medium">Available budget</p>
                <p className="font-display text-xl font-bold text-foreground tabular-nums">{remaining.toLocaleString('de-CH')} {currency}</p>
              </div>
            </div>
            <div className="bg-primary/10 text-primary text-xs font-display font-bold px-3 py-1.5 rounded-full">
              {100 - pctUsed} %
            </div>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pctUsed}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        </motion.div>

        {/* ── Real-time Diversification Indicator ── */}
        {hasRiskyAssets && (
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-card border border-border shadow-card p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${divResult.color}20` }}>
              <FiSliders size={22} style={{ color: divResult.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display font-bold text-foreground text-[15px]">Diversification</p>
                <span
                  className="text-xs font-display font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${divResult.color}15`,
                    color: divResult.color,
                  }}
                >
                  {divResult.rating}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground font-body">
                  <span className="font-bold text-foreground">{divResult.truePositionCount}</span> underlying positions
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  HHI: <span className="font-bold text-foreground tabular-nums">{divResult.hhi.toLocaleString('de-CH')}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Asset Classes */}
        <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
          <h2 className="font-display text-lg font-bold text-foreground">Asset classes</h2>
          <span className="text-xs text-muted-foreground font-body">{unlockedCount} of {assetClasses.length} available</span>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-3">
          {assetClasses.map((asset) => {
            const Icon = asset.icon;
            const isUnlocked = unlockedSlugs.has(asset.slug);
            const assetTotal = getAssetTotal(asset.slug);
            const assetPct = totalBudget > 0 ? Math.round((assetTotal / totalBudget) * 100) : 0;

            if (!isUnlocked) {
              return (
                <Tooltip key={asset.name}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      className="rounded-3xl bg-card border border-border shadow-card p-4 flex items-center gap-4 opacity-50 grayscale cursor-not-allowed select-none"
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-muted">
                        <Icon size={26} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-muted-foreground text-[15px]">{asset.name}</p>
                        <p className="text-xs text-muted-foreground/60 font-body mt-0.5 flex items-center gap-1">
                          <FiLock size={12} />
                          Unlocks in a later chapter
                        </p>
                      </div>
                      <FiLock size={18} className="text-muted-foreground/40 flex-shrink-0" />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This asset class unlocks in a later chapter.</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <motion.div
                key={asset.name}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={asset.hasDetail ? () => navigate(`/challenge/${levelId}/${asset.slug}`) : undefined}
                className="rounded-3xl bg-card border border-border shadow-card p-4 flex items-center gap-4 cursor-pointer active:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: asset.bgColor }}>
                  <Icon size={26} style={{ color: asset.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-[15px]">{asset.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-display font-bold tabular-nums text-[15px] ${assetTotal > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {assetTotal > 0 ? `${assetTotal.toLocaleString('de-CH')} ${currency}` : `0 ${currency}`}
                  </p>
                  <p className="text-xs text-muted-foreground font-body tabular-nums mt-0.5">{assetPct} %</p>
                </div>
                <FiArrowRight size={18} className="text-muted-foreground/50 flex-shrink-0" />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2 pb-4">
          <Button
            size="lg"
            className="w-full h-14 rounded-full font-display text-base font-bold shadow-soft text-lg gap-2"
            onClick={() => navigate(`/challenge/${levelId}/simulation`, { state: { fromSubPage: true } })}
          >
            <FiZap size={20} />
            Start simulation
          </Button>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default LevelChallenge;
