import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem('investify_name') || '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    localStorage.setItem('investify_name', val);
  };

  const canProceed = name.trim().length > 0;

  const handleStart = () => {
    if (canProceed) {
      navigate('/learn');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          {/* Emoji icon */}
          <motion.div
            className="text-8xl mb-6"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            🌱
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
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        <motion.button
          onClick={handleStart}
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
      </div>
    </div>
  );
};

export default Onboarding;
