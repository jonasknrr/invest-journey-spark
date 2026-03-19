import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { useBudget } from '@/contexts/BudgetContext';
import { getAllStocks, type StockListItem } from '@/services/stockList';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const AktienOverview = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { getRemaining, getProductAmount, getAssetTotal } = useBudget();
  const chapterConfig = levelId;

  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketFilter, setMarketFilter] = useState<'all' | 'SMI' | 'DJIA'>('all');

  const remaining = getRemaining();
  const aktienTotal = getAssetTotal('aktien');

  useEffect(() => {
    getAllStocks().then((s) => {
      setStocks(s);
      setLoading(false);
    });
  }, []);

  const filtered = marketFilter === 'all' ? stocks : stocks.filter(s => s.market === marketFilter);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-6 pb-2">
        <button
          onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
          className="text-muted-foreground text-sm font-body mb-2 flex items-center gap-1"
        >
          <FiArrowLeft size={16} /> Back
        </button>
      </div>

      <motion.div className="px-5 space-y-5" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[hsl(var(--level-aktien)/0.12)] flex items-center justify-center">
            <FiTrendingUp size={30} className="text-[hsl(var(--level-aktien))]" />
          </div>
          <div>
             <h1 className="font-display text-2xl font-bold text-foreground">Stocks</h1>
            <p className="text-muted-foreground text-sm font-body">Buy individual stocks</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="flex-1 rounded-3xl bg-card border border-border shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">
              Available capital
            </p>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              {remaining.toLocaleString('de-CH')} CHF
            </p>
          </div>
          <div className="flex-1 rounded-3xl bg-[hsl(var(--level-aktien)/0.08)] border border-[hsl(var(--level-aktien)/0.15)] shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">
              Already invested (Stocks)
            </p>
            <p className="font-display text-2xl font-bold text-[hsl(var(--level-aktien))] tabular-nums">
              {aktienTotal.toLocaleString('de-CH')} CHF
            </p>
          </div>
        </motion.div>

        {/* Market filter */}
        <motion.div variants={itemVariants} className="flex gap-2">
          {(['all', 'SMI', 'DJIA'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarketFilter(m)}
              className={`px-4 py-2 rounded-full text-sm font-display font-bold transition-colors ${
                marketFilter === m
                  ? 'bg-[hsl(var(--level-aktien))] text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {m === 'all' ? 'All' : m}
            </button>
          ))}
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
            {filtered.map((stock) => {
              const allocated = getProductAmount('aktien', stock.ticker);
              return (
                <motion.button
                  key={stock.ticker}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/challenge/${levelId}/aktien/${stock.ticker}`)}
                  className="w-full rounded-3xl bg-card border border-border shadow-card p-5 flex items-center gap-4 text-left active:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--level-aktien)/0.12)] flex items-center justify-center flex-shrink-0">
                    <FiTrendingUp size={22} className="text-[hsl(var(--level-aktien))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground text-[15px] truncate">{stock.name}</p>
                    <span className="text-xs text-muted-foreground font-body">{stock.ticker} · {stock.market}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-display font-bold tabular-nums text-[15px] ${
                        allocated > 0 ? 'text-[hsl(var(--level-aktien))]' : 'text-muted-foreground'
                      }`}
                    >
                      {allocated > 0 ? `${allocated.toLocaleString('de-CH')} CHF` : '—'}
                    </p>
                  </div>
                  <FiArrowRight size={18} className="text-muted-foreground/50 flex-shrink-0" />
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {aktienTotal > 0 && (
          <motion.div variants={itemVariants} className="rounded-3xl bg-primary/8 border border-primary/15 p-4">
            <p className="font-body text-sm text-primary leading-relaxed">
              💡 You have invested a total of {aktienTotal.toLocaleString('de-CH')} CHF in stocks.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AktienOverview;
