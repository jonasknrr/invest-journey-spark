import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendUp,
  ChartBar,
  Stack,
  Vault,
  Coins,
  Certificate,
  Trophy,
  Lightning,
  ArrowRight,
  DiamondsFour,
  CurrencyBtc,
  Lock,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import LevelIntroOverlay from '@/components/LevelIntroOverlay';
import { levelIntros } from '@/data/levelIntros';
import LessonFlow from '@/components/lessons/LessonFlow';
import { getTopic } from '@/data/topicConfig';
import { useBudget } from '@/contexts/BudgetContext';
import { getUnlockedSlugs, chapterConfigs, getChapterConfig } from '@/data/challengeConfig';
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
  { name: 'Tagesgeld', slug: 'tagesgeld', icon: Coins, color: 'hsl(var(--level-tagesgeld))', bgColor: 'hsl(var(--level-tagesgeld) / 0.12)', hasDetail: true },
  { name: 'Festgeld', slug: 'festgeld', icon: Vault, color: 'hsl(var(--level-festgeld))', bgColor: 'hsl(var(--level-festgeld) / 0.12)', hasDetail: true },
  { name: 'Aktien', slug: 'aktien', icon: TrendUp, color: 'hsl(var(--level-aktien))', bgColor: 'hsl(var(--level-aktien) / 0.12)', hasDetail: true },
  { name: 'ETFs', slug: 'etfs', icon: Stack, color: 'hsl(var(--level-etfs))', bgColor: 'hsl(var(--level-etfs) / 0.12)', hasDetail: true },
  { name: 'Fonds', slug: 'indizes', icon: ChartBar, color: 'hsl(var(--level-waehrungen))', bgColor: 'hsl(var(--level-waehrungen) / 0.12)' },
  { name: 'Anleihen', slug: 'anleihen', icon: Certificate, color: 'hsl(var(--level-anleihen))', bgColor: 'hsl(var(--level-anleihen) / 0.12)' },
  { name: 'Rohstoffe', slug: 'rohstoffe', icon: DiamondsFour, color: 'hsl(var(--level-gold))', bgColor: 'hsl(var(--level-gold) / 0.12)' },
  { name: 'Kryptowährungen', slug: 'krypto', icon: CurrencyBtc, color: 'hsl(var(--level-krypto))', bgColor: 'hsl(var(--level-krypto) / 0.12)' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const LevelChallenge = () => {
  const { levelId, topicSlug } = useParams<{ levelId: string; topicSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSubPage = (location.state as { fromSubPage?: boolean })?.fromSubPage === true;
  const [showIntro, setShowIntro] = useState(!fromSubPage);
  const { totalBudget, getRemaining, getAllocatedTotal, getAssetTotal, setTotalBudget, resetAllocations } = useBudget();

  // Get chapter config and set budget
  const chapterConfig = levelId ? getChapterConfig(levelId) : undefined;
  const scenario = chapterConfig?.scenario;

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

  // Determine which asset classes are unlocked for this chapter
  const unlockedSlugs = levelId ? getUnlockedSlugs(levelId) : new Set<string>();
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
          ← Zurück
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
                <Trophy size={16} weight="fill" />
                <span className="text-xs font-display font-semibold">{chapterLabel}</span>
              </div>
            </div>
            <h1 className="font-display text-xl font-bold leading-snug mb-3">
              {scenario ? scenario.title : 'Verteile dein Budget und erziele maximale Rendite!'}
            </h1>
            <p className="text-sm leading-relaxed opacity-90 font-body">
              {scenario
                ? scenario.description
                : <>Du hast <span className="font-bold">{totalBudget.toLocaleString('de-CH')} {currency}</span> und brauchst in einem Jahr <span className="font-bold">1.000 {currency}</span>. Versuche so viel Rendite zu erzielen wie möglich.</>
              }
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
                <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Dein Budget</p>
                <p className="font-display text-2xl font-bold tabular-nums">{totalBudget.toLocaleString('de-CH')} {currency}</p>
              </div>
              {scenario ? (
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Notgroschen</p>
                  <p className="font-display text-2xl font-bold tabular-nums">2.000 {currency}</p>
                </div>
              ) : (
                <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-body font-semibold mb-0.5">Ziel</p>
                  <p className="font-display text-2xl font-bold tabular-nums">1.000 {currency}</p>
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
                <Lightning size={22} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body font-medium">Verfügbares Budget</p>
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

        {/* Asset Classes */}
        <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
          <h2 className="font-display text-lg font-bold text-foreground">Anlageklassen</h2>
          <span className="text-xs text-muted-foreground font-body">{unlockedCount} von {assetClasses.length} verfügbar</span>
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
                        <Icon size={26} weight="fill" className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-muted-foreground text-[15px]">{asset.name}</p>
                        <p className="text-xs text-muted-foreground/60 font-body mt-0.5 flex items-center gap-1">
                          <Lock size={12} weight="bold" />
                          Wird in einem späteren Kapitel freigeschaltet
                        </p>
                      </div>
                      <Lock size={18} className="text-muted-foreground/40 flex-shrink-0" />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Diese Anlageklasse wird in einem späteren Kapitel freigeschaltet.</p>
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
                  <Icon size={26} weight="fill" style={{ color: asset.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-[15px]">{asset.name}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {assetTotal > 0 ? 'Investiert' : 'Noch nicht investiert'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-display font-bold tabular-nums text-[15px] ${assetTotal > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {assetTotal > 0 ? `${assetTotal.toLocaleString('de-CH')} ${currency}` : `0 ${currency}`}
                  </p>
                  <p className="text-xs text-muted-foreground font-body tabular-nums mt-0.5">{assetPct} %</p>
                </div>
                <ArrowRight size={18} className="text-muted-foreground/50 flex-shrink-0" />
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
            <Lightning size={20} weight="fill" />
            Simulation starten
          </Button>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default LevelChallenge;
