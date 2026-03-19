import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from '@phosphor-icons/react';
import { PiggyBank } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { getTagesgeldProduct } from '@/data/tagesgeldProducts';

const TagesgeldDetail = () => {
  const { levelId, productSlug } = useParams<{ levelId: string; productSlug: string }>();
  const navigate = useNavigate();
  const { getRemaining, getProductAmount, setProductAmount } = useBudget();

  const product = productSlug ? getTagesgeldProduct(productSlug) : undefined;
  const currentAmount = product ? getProductAmount('tagesgeld', product.slug) : 0;
  const remaining = getRemaining();
  const maxAmount = remaining + currentAmount;

  const [inputValue, setInputValue] = useState(currentAmount > 0 ? String(currentAmount) : '');

  if (!product) return null;

  const numericValue = Number(inputValue) || 0;
  const isOverBudget = numericValue > maxAmount;
  const isValid = numericValue > 0 && !isOverBudget;

  const handleConfirm = () => {
    if (!isValid) return;
    setProductAmount('tagesgeld', product.slug, numericValue);
    navigate(`/challenge/${levelId}/tagesgeld`);
  };

  const handleQuickAmount = (amount: number) => {
    const clamped = Math.min(amount, maxAmount);
    setInputValue(String(clamped));
  };

  const quickAmounts = [500, 1000, 2000].filter((a) => a <= maxAmount);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <button onClick={() => navigate(`/challenge/${levelId}/tagesgeld`)} className="text-muted-foreground text-sm font-body flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Title */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--level-tagesgeld)/0.12)] flex items-center justify-center">
            <PiggyBank size={24} className="text-[hsl(var(--level-tagesgeld))]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{product.title}</h1>
            <p className="text-muted-foreground text-sm font-body">
              {product.interestRate.toFixed(1)} % p.a. · Available anytime
            </p>
          </div>
        </div>
      </div>

      {/* Amount input area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Available budget */}
        <div className="bg-muted/50 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-xs text-muted-foreground font-body text-center">
            Available: <span className="font-bold text-foreground">{maxAmount.toLocaleString('de-CH')} CHF</span>
          </p>
        </div>

        {/* Big amount display */}
        <div className="text-center mb-2">
          <div className="flex items-baseline justify-center gap-1">
            <motion.span
              key={inputValue}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`font-display text-5xl font-bold tabular-nums ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}
            >
              {inputValue || '0'}
            </motion.span>
            <span className="font-display text-2xl font-bold text-muted-foreground">CHF</span>
          </div>
          {isOverBudget && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm font-body mt-2">
              Budget exceeded
            </motion.p>
          )}
        </div>

        {/* Info note */}
        {numericValue > 0 && !isOverBudget && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[hsl(var(--level-tagesgeld)/0.08)] border border-[hsl(var(--level-tagesgeld)/0.15)] rounded-2xl px-5 py-3 mt-4 text-center"
          >
            <p className="text-xs text-muted-foreground font-body">Interest rate</p>
            <p className="font-display text-xl font-bold text-[hsl(var(--level-tagesgeld))] tabular-nums mt-0.5">
              {product.interestRate.toFixed(1)} % p.a.
            </p>
          </motion.div>
        )}

        {/* Quick amount buttons */}
        {quickAmounts.length > 0 && (
          <div className="flex gap-2 mt-6">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="h-10 px-5 rounded-2xl bg-muted text-muted-foreground font-display font-bold text-sm hover:bg-muted/80 transition-colors"
              >
                {amt.toLocaleString('de-CH')} CHF
              </button>
            ))}
            <button
              onClick={() => handleQuickAmount(maxAmount)}
              className="h-10 px-5 rounded-2xl bg-[hsl(var(--level-tagesgeld)/0.12)] text-[hsl(var(--level-tagesgeld))] font-display font-bold text-sm hover:opacity-80 transition-colors"
            >
              Max
            </button>
          </div>
        )}

        {/* Number input */}
        <input
          type="number"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter amount"
          className="mt-6 w-full max-w-xs h-14 rounded-2xl border-2 border-border bg-card text-center font-display text-lg font-bold text-foreground focus:border-[hsl(var(--level-tagesgeld))] focus:outline-none transition-colors tabular-nums"
        />
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        <motion.button
          onClick={handleConfirm}
          whileTap={isValid ? { scale: 0.96 } : undefined}
          disabled={!isValid}
          className={`w-full h-14 rounded-full font-display font-bold text-base shadow-soft flex items-center justify-center gap-2 transition-colors ${
            isValid
              ? 'bg-[hsl(var(--level-tagesgeld))] text-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Check size={20} weight="bold" />
          {currentAmount > 0 ? 'Betrag anpassen' : 'Investieren'}
        </motion.button>
      </div>
    </div>
  );
};

export default TagesgeldDetail;
