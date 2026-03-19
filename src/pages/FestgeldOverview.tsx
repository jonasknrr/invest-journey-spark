import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Vault, ArrowRight, Percent } from '@phosphor-icons/react';
import { useBudget } from '@/contexts/BudgetContext';
import { festgeldProducts } from '@/data/festgeldProducts';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const FestgeldOverview = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { getRemaining, getProductAmount, getAssetTotal } = useBudget();

  const remaining = getRemaining();
  const festgeldTotal = getAssetTotal('festgeld');

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <button onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })} className="text-muted-foreground text-sm font-body mb-2 flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <motion.div className="px-5 space-y-5" variants={containerVariants} initial="hidden" animate="visible">
        {/* Title card */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[hsl(var(--level-festgeld)/0.12)] flex items-center justify-center">
            <Vault size={30} weight="fill" className="text-[hsl(var(--level-festgeld))]" />
          </div>
          <div>
             <h1 className="font-display text-2xl font-bold text-foreground">Fixed Deposit</h1>
            <p className="text-muted-foreground text-sm font-body">Secure interest, fixed term</p>
          </div>
        </motion.div>

        {/* Budget cards */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="flex-1 rounded-3xl bg-card border border-border shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Available</p>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              {remaining.toLocaleString('de-CH')} CHF
            </p>
          </div>
          <div className="flex-1 rounded-3xl bg-[hsl(var(--level-festgeld)/0.08)] border border-[hsl(var(--level-festgeld)/0.15)] shadow-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">In Fixed Deposit</p>
            <p className="font-display text-2xl font-bold text-[hsl(var(--level-festgeld))] tabular-nums">
              {festgeldTotal.toLocaleString('de-CH')} CHF
            </p>
          </div>
        </motion.div>

        {/* Product list */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Fixed deposit accounts</h2>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-3">
          {festgeldProducts.map((product) => {
            const allocated = getProductAmount('festgeld', product.slug);
            return (
              <motion.button
                key={product.slug}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/challenge/${levelId}/festgeld/${product.slug}`)}
                className="w-full rounded-3xl bg-card border border-border shadow-card p-5 flex items-center gap-4 text-left active:bg-muted/50 transition-colors"
              >
                {/* Duration badge */}
                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--level-festgeld)/0.12)] flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-[hsl(var(--level-festgeld))] text-sm">
                    {product.durationYears}Y
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-[15px]">{product.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Percent size={12} className="text-[hsl(var(--level-festgeld))]" />
                    <span className="text-xs text-muted-foreground font-body">
                      {product.interestRate.toFixed(1)} % p.a.
                    </span>
                  </div>
                </div>

                {/* Allocated amount */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-display font-bold tabular-nums text-[15px] ${allocated > 0 ? 'text-[hsl(var(--level-festgeld))]' : 'text-muted-foreground'}`}>
                    {allocated > 0 ? `${allocated.toLocaleString('de-CH')} CHF` : '—'}
                  </p>
                  {allocated > 0 && (
                    <p className="text-xs text-muted-foreground font-body tabular-nums mt-0.5">
                      +{(allocated * product.interestRate / 100 * product.durationYears).toFixed(0)} CHF Zinsen
                    </p>
                  )}
                </div>

                <ArrowRight size={18} className="text-muted-foreground/50 flex-shrink-0" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Summary hint */}
        {festgeldTotal > 0 && (
          <motion.div variants={itemVariants} className="rounded-3xl bg-primary/8 border border-primary/15 p-4">
            <p className="font-body text-sm text-primary leading-relaxed">
              💡 Dein Festgeld ist sicher angelegt — du erhältst garantierte Zinsen am Ende der Laufzeit.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FestgeldOverview;
