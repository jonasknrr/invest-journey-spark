import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import onboardingHero from '@/assets/onboarding-hero.png';

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem('investify_name') || '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    localStorage.setItem('investify_name', val);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="flex flex-col items-center text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Hero illustration */}
        <motion.img
          src={onboardingHero}
          alt="Person sitting on a coin looking optimistically into the future"
          className="w-64 h-64 object-contain mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Welcome text */}
        <h1 className="font-display text-4xl font-bold text-foreground text-balance leading-tight">
          Welcome to Investify.
        </h1>

        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          Learn more about investing in 5 minutes than 90% of people. Guaranteed. ✨
        </p>

        {/* Features */}
        <div className="mt-8 space-y-3 w-full">
          {[
            { emoji: '🎯', text: '8 asset classes, step by step' },
            { emoji: '⏱', text: 'Lessons in 2–4 minutes' },
            { emoji: '🏆', text: 'Progress that feels great' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 bg-card rounded-2xl px-5 py-4 shadow-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-body font-medium text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2 mt-8 w-full text-left">
          <label className="text-sm text-muted-foreground font-medium">What's your name?</label>
          <input
            type="text"
            placeholder="Your name"
            maxLength={20}
            className="border border-border rounded-xl px-4 py-3 text-foreground bg-card font-semibold focus:outline-none focus:border-primary transition-colors"
            onChange={handleNameChange}
            value={name}
          />
        </div>

        {/* CTA */}
        <motion.button
          onClick={() => navigate('/learn')}
          className="mt-6 w-full h-16 bg-primary text-primary-foreground font-display text-xl font-bold rounded-full shadow-soft"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transitionDelay: '0.7s' }}
        >
          Start learning 🚀
        </motion.button>

        <p className="mt-4 text-sm text-muted-foreground">
          Free. No sign-up required.
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
