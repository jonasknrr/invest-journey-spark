import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Stack, Check } from '@phosphor-icons/react';
import { useBudget } from '@/contexts/BudgetContext';
import { getAllEtfs, type EtfListItem } from '@/services/etfList';

const EtfDetail = () => {
  const { levelId, ticker } = useParams<{ levelId: string; ticker: string }>();
  const navigate = useNavigate();
  const { getRemaining, getProductAmount, setProductAmount } = useBudget();

  const [etf, setEtf] = useState<EtfListItem | null>(null);

  useEffect(() => {
    getAllEtfs().then((list) => {
      setEtf(list.find((e) => e.ticker === ticker) ?? null);
    });
  }, [ticker]);

  const currentAmount = ticker ? getProductAmount('etfs', ticker) : 0;
  const remaining = getRemaining();
  const maxAmount = remaining + currentAmount;

  const [inputValue, setInputValue] = useState(currentAmount > 0 ? String(currentAmount) : '');

  const numericValue = Number(inputValue) || 0;
  const isOverBudget = numericValue > maxAmount;
  const isReset = numericValue === 0 && currentAmount > 0;
  const isValid = (numericValue > 0 && !isOverBudget) || isReset;

  const handleConfirm = () => {
    if (!isValid || !ticker) return;
    setProductAmount('etfs', ticker, isReset ? 0 : numericValue);
    navigate(`/challenge/${levelId}/etfs`);
  };

  const handleQuickAmount = (amount: number) => {
    setInputValue(String(Math.min(amount, maxAmount)));
  };

  const quickAmounts = [500, 1000, 2000].filter((a) => a <= maxAmount);

  if (!etf) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-3 border-muted border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 pt-6 pb-2">
        <button
          onClick={() => navigate(`/challenge/${levelId}/etfs`)}
          className="text-muted-foreground text-sm font-body flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Zurück
        </button>
      </div>

      <div className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--level-etfs)/0.12)] flex items-center justify-center">
            <Stack size={24} weight="fill" className="text-[hsl(var(--level-etfs))]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{etf.name}</h1>
            <p className="text-muted-foreground text-sm font-body">{etf.ticker}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="bg-muted/50 rounded-2xl px-5 py-2.5 mb-6">
          <p className="text-xs text-muted-foreground font-body text-center">
            Verfügbar: <span className="font-bold text-foreground">{maxAmount.toLocaleString('de-CH')} $</span>
          </p>
        </div>

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
            <span className="font-display text-2xl font-bold text-muted-foreground">$</span>
          </div>
          {isOverBudget && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm font-body mt-2">
              Budget überschritten
            </motion.p>
          )}
        </div>

        {quickAmounts.length > 0 && (
          <div className="flex gap-2 mt-6">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="h-10 px-5 rounded-2xl bg-muted text-muted-foreground font-display font-bold text-sm hover:bg-muted/80 transition-colors"
              >
                {amt.toLocaleString('de-CH')} $
              </button>
            ))}
            <button
              onClick={() => handleQuickAmount(maxAmount)}
              className="h-10 px-5 rounded-2xl bg-[hsl(var(--level-etfs)/0.12)] text-[hsl(var(--level-etfs))] font-display font-bold text-sm hover:opacity-80 transition-colors"
            >
              Max
            </button>
          </div>
        )}

        <input
          type="number"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Betrag eingeben"
          className="mt-6 w-full max-w-xs h-14 rounded-2xl border-2 border-border bg-card text-center font-display text-lg font-bold text-foreground focus:border-[hsl(var(--level-etfs))] focus:outline-none transition-colors tabular-nums"
        />
      </div>

      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        <motion.button
          onClick={handleConfirm}
          whileTap={isValid ? { scale: 0.96 } : undefined}
          disabled={!isValid}
          className={`w-full h-14 rounded-full font-display font-bold text-base shadow-soft flex items-center justify-center gap-2 transition-colors ${
            isValid
              ? 'bg-[hsl(var(--level-etfs))] text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Check size={20} weight="bold" />
          {isReset ? 'Investment entfernen' : currentAmount > 0 ? 'Betrag anpassen' : 'Investieren'}
        </motion.button>
      </div>
    </div>
  );
};

export default EtfDetail;
