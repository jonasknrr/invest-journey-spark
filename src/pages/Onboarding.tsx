import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem('investify_name') || '');
  const [step, setStep] = useState(0);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    localStorage.setItem('investify_name', val);
  };

  const canProceed = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress header */}
      <div className="px-6 pt-5 pb-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Getting Started</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: step === 0 ? '50%' : '100%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="splash"
            className="flex-1 flex flex-col items-center justify-center px-6 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="flex flex-col items-center text-center max-w-sm w-full">
              {/* Robot icon */}
              <motion.div
                className="w-44 h-44 mb-6 flex items-center justify-center"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                  {/* Body */}
                  <rect x="55" y="80" width="90" height="75" rx="18" fill="hsl(var(--primary))" />
                  {/* Head */}
                  <rect x="60" y="30" width="80" height="58" rx="16" fill="hsl(var(--primary))" />
                  {/* Antenna */}
                  <line x1="100" y1="30" x2="100" y2="14" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="11" r="5" fill="#F59E0B" />
                  {/* Eyes */}
                  <circle cx="82" cy="54" r="8" fill="white" />
                  <circle cx="118" cy="54" r="8" fill="white" />
                  <circle cx="84" cy="54" r="4" fill="#1E293B" />
                  <circle cx="120" cy="54" r="4" fill="#1E293B" />
                  {/* Smile */}
                  <path d="M 85 68 Q 100 78 115 68" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                  {/* Arms */}
                  <rect x="30" y="90" width="25" height="12" rx="6" fill="hsl(var(--primary))" />
                  <rect x="145" y="90" width="25" height="12" rx="6" fill="hsl(var(--primary))" />
                  {/* Legs */}
                  <rect x="72" y="155" width="16" height="22" rx="8" fill="hsl(var(--primary))" />
                  <rect x="112" y="155" width="16" height="22" rx="8" fill="hsl(var(--primary))" />
                  {/* Trend arrow */}
                  <path d="M 140 140 L 160 110 L 175 120" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polygon points="175,112 175,124 167,118" fill="#22C55E" />
                  {/* Money bag */}
                  <circle cx="42" cy="130" r="16" fill="#F59E0B" opacity="0.9" />
                  <text x="42" y="136" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">$</text>
                </svg>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="font-display text-3xl font-bold text-foreground mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                WELCOME!
              </motion.h1>

              <motion.p
                className="text-muted-foreground text-base leading-relaxed mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Maximize your portfolio's returns! ✨
              </motion.p>

              {/* Name input */}
              <motion.div
                className="w-full space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="text-sm font-semibold text-muted-foreground block text-left">
                  What should we call you?
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full border-2 border-orange-300 focus:border-orange-400 rounded-2xl px-5 py-3.5 text-foreground bg-card font-semibold text-base focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                  onChange={handleNameChange}
                  value={name}
                  autoFocus
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="welcome"
            className="flex-1 flex flex-col items-center justify-center px-6 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="flex flex-col items-center text-center max-w-sm w-full">
              {/* Robot icon (smaller) */}
              <motion.div
                className="w-32 h-32 mb-5 flex items-center justify-center"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                  <rect x="55" y="80" width="90" height="75" rx="18" fill="hsl(var(--primary))" />
                  <rect x="60" y="30" width="80" height="58" rx="16" fill="hsl(var(--primary))" />
                  <line x1="100" y1="30" x2="100" y2="14" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="11" r="5" fill="#F59E0B" />
                  <circle cx="82" cy="54" r="8" fill="white" />
                  <circle cx="118" cy="54" r="8" fill="white" />
                  <circle cx="84" cy="54" r="4" fill="#1E293B" />
                  <circle cx="120" cy="54" r="4" fill="#1E293B" />
                  <path d="M 85 68 Q 100 78 115 68" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="30" y="90" width="25" height="12" rx="6" fill="hsl(var(--primary))" />
                  <rect x="145" y="90" width="25" height="12" rx="6" fill="hsl(var(--primary))" />
                  <rect x="72" y="155" width="16" height="22" rx="8" fill="hsl(var(--primary))" />
                  <rect x="112" y="155" width="16" height="22" rx="8" fill="hsl(var(--primary))" />
                  <path d="M 140 140 L 160 110 L 175 120" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <polygon points="175,112 175,124 167,118" fill="#22C55E" />
                  <circle cx="42" cy="130" r="16" fill="#F59E0B" opacity="0.9" />
                  <text x="42" y="136" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">$</text>
                </svg>
              </motion.div>

              {/* Personalized greeting */}
              <motion.h1
                className="font-display text-3xl font-bold text-foreground mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hi {name.trim()}! 👋
              </motion.h1>

              <motion.div
                className="bg-card rounded-2xl shadow-card p-5 w-full text-left space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="font-body text-base text-foreground leading-relaxed">
                  Great to have you here! 🎉
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Ready to turn your <span className="font-bold text-foreground">CHF 100'000 budget</span> into
                  maximal profit? Remember, you need <span className="font-bold text-foreground">CHF 20'000 in one year</span>.
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Let's make the most of it! 🚀
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        {step === 0 ? (
          <motion.button
            onClick={() => canProceed && setStep(1)}
            disabled={!canProceed}
            className={`w-full h-14 rounded-full font-display text-lg font-bold shadow-soft transition-all ${
              canProceed
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            whileTap={canProceed ? { scale: 0.95 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            LET'S GO 🚀
          </motion.button>
        ) : (
          <motion.button
            onClick={() => navigate('/learn')}
            className="w-full h-14 rounded-full font-display text-lg font-bold bg-primary text-primary-foreground shadow-soft"
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            CONTINUE →
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
