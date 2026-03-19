import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import onboardingHero from '@/assets/onboarding-hero.png';

const Onboarding = () => {
  const navigate = useNavigate();

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
          alt="Person sitzt auf einer Münze und blickt optimistisch in die Zukunft"
          className="w-64 h-64 object-contain mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Welcome text */}
        <h1 className="font-display text-4xl font-bold text-foreground text-balance leading-tight">
          Dein Geld kann wachsen. Wir zeigen dir wie.
        </h1>

        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          In 5 Minuten verstehst du mehr über Investieren als 90% der Welt. Versprochen. ✨
        </p>

        {/* Features */}
        <div className="mt-8 space-y-3 w-full">
          {[
            { emoji: '🎯', text: '8 Anlageklassen, Schritt für Schritt' },
            { emoji: '⏱', text: 'Lektionen in 2–4 Minuten' },
            { emoji: '🏆', text: 'Fortschritt, der sich gut anfühlt' },
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

        {/* CTA */}
        <motion.button
          onClick={() => navigate('/learn')}
          className="mt-10 w-full h-16 bg-primary text-primary-foreground font-display text-xl font-bold rounded-full shadow-soft"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transitionDelay: '0.7s' }}
        >
          Lernpfad starten 🚀
        </motion.button>

        <p className="mt-4 text-sm text-muted-foreground">
          Kostenlos. Keine Anmeldung nötig.
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
