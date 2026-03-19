import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const accounts = [
  { icon: '💰', label: 'Call Money', amount: 'CHF 45,000' },
  { icon: '🔒', label: 'Fixed Deposit', amount: 'CHF 30,000' },
  { icon: '🏦', label: 'Current Account', amount: 'CHF 15,000' },
];

const DepositProtectionSlide = ({ onComplete }: Props) => {
  const [step, setStep] = useState<'safe' | 'shake' | 'protected'>(
    'safe'
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStep('shake'), 2500);
    const t2 = setTimeout(() => setStep('protected'), 4500);
    const t3 = setTimeout(onComplete, 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      key="depositProtection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground mb-2 text-center">
        Your money has a bodyguard 🛡️
      </h3>
      <p className="font-body text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Watch what happens when a bank runs into trouble.
      </p>

      {/* Vault */}
      <motion.div
        animate={
          step === 'shake'
            ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.5, repeat: 2 } }
            : {}
        }
        className="relative w-full max-w-xs"
      >
        {/* Vault frame */}
        <div
          className={`rounded-2xl border-2 p-5 transition-colors duration-500 ${
            step === 'shake'
              ? 'border-destructive/50 bg-destructive/5'
              : step === 'protected'
              ? 'border-primary/50 bg-primary/5'
              : 'border-border bg-card'
          }`}
        >
          {/* Vault header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{step === 'protected' ? '🛡️' : '🏦'}</span>
            <span className="font-display text-sm font-bold text-foreground">
              {step === 'shake' ? 'Bank failure!' : step === 'protected' ? 'Deposit protection activated' : 'Your deposits'}
            </span>
          </div>

          {/* Account items */}
          <div className="space-y-2.5">
            {accounts.map((acc, i) => (
              <motion.div
                key={acc.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50"
                initial={false}
                animate={
                  step === 'protected'
                    ? { scale: [1, 1.03, 1], transition: { delay: i * 0.15 } }
                    : {}
                }
              >
                <span className="text-xl">{acc.icon}</span>
                <div className="flex-1">
                  <p className="font-display text-xs font-bold text-foreground">{acc.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{acc.amount}</p>
                </div>
                <AnimatePresence>
                  {step === 'protected' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.15 + 0.2 }}
                      className="text-primary text-base"
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Shield overlay on protection */}
        <AnimatePresence>
          {step === 'protected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-3 py-1.5 shadow-lg"
            >
              <span className="font-display text-[10px] font-bold">
                Protected up to CHF 100,000
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 'protected' ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        className="font-body text-xs text-primary text-center mt-4 max-w-xs"
      >
        ✅ Per bank, per customer — backed by law
      </motion.p>
    </motion.div>
  );
};

export default DepositProtectionSlide;
