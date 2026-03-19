import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Stack } from '@phosphor-icons/react';
import { useBudget } from '@/contexts/BudgetContext';
import { getAllEtfs, type EtfListItem } from '@/services/etfList';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const EtfOverview = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { getRemaining, getProductAmount, getAssetTotal } = useBudget();

  const [etfs, setEtfs] = useState<EtfListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const remaining = getRemaining();
  const etfTotal = getAssetTotal('etfs');

  useEffect(() => {
    getAllEtfs().then((e) => {
      setEtfs(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-6 pb-2">
        <button
          onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
          className="text-muted-foreground text-sm font-body mb-2 flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Zurück
        </button>
      </div>

      <motion.div className="px-5 space-y-5" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[hsl(var(--level-etfs)/0.12)] flex items-center justify-center">
            <Stack size={30} weight="fill" className="text-[hsl(var(--level-etfs))]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">ETFs</h1>
            <p className="text-muted-foreground text-sm font-body">Index-ETFs kaufen</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="flex-1 rounded-3xl bg-card border border-border shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">
              Verfügbares Kapital
            </p>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              {remaining.toLocaleString('de-CH')} $
            </p>
          </div>
          <div className="flex-1 rounded-3xl bg-[hsl(var(--level-etfs)/0.08)] border border-[hsl(var(--level-etfs)/0.15)] shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">
              Bereits investiert (ETFs)
            </p>
            <p className="font-display text-2xl font-bold text-[hsl(var(--level-etfs))] tabular-nums">
              {etfTotal.toLocaleString('de-CH')} $
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">ETFs</h2>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <motion.div
              className="w-10 h-10 border-3 border-muted border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          </div>
        )}

        {!loading && (
          <motion.div variants={containerVariants} className="space-y-3">
            {etfs.map((etf) => {
              const allocated = getProductAmount('etfs', etf.ticker);
              return (
                <motion.button
                  key={etf.ticker}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/challenge/${levelId}/etfs/${etf.ticker}`)}
                  className="w-full rounded-3xl bg-card border border-border shadow-card p-5 flex items-center gap-4 text-left active:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--level-etfs)/0.12)] flex items-center justify-center flex-shrink-0">
                    <Stack size={22} weight="fill" className="text-[hsl(var(--level-etfs))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground text-[15px] truncate">{etf.name}</p>
                    <span className="text-xs text-muted-foreground font-body">{etf.ticker}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-display font-bold tabular-nums text-[15px] ${
                        allocated > 0 ? 'text-[hsl(var(--level-etfs))]' : 'text-muted-foreground'
                      }`}
                    >
                      {allocated > 0 ? `${allocated.toLocaleString('de-CH')} $` : '—'}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground/50 flex-shrink-0" />
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {etfTotal > 0 && (
          <motion.div variants={itemVariants} className="rounded-3xl bg-primary/8 border border-primary/15 p-4">
            <p className="font-body text-sm text-primary leading-relaxed">
              💡 Du hast insgesamt {etfTotal.toLocaleString('de-CH')} CHF in ETFs investiert.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EtfOverview;
