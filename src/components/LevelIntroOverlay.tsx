import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSun } from 'react-icons/fi';
import type { LevelIntro } from '@/data/levelIntros';

interface LevelIntroOverlayProps {
  intro: LevelIntro;
  open: boolean;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: 0.05 },
  },
  exit: { opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.2 } },
};

const factVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.07, type: 'spring' as const, stiffness: 300, damping: 24 },
  }),
};

const LevelIntroOverlay = ({ intro, open, onClose }: LevelIntroOverlayProps) => {
  const HeroIcon = intro.heroIcon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-auto max-h-[92vh] overflow-y-auto rounded-t-[2rem] bg-card shadow-xl"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header area with accent bg */}
            <div
              className="relative px-6 pt-6 pb-5 rounded-t-[2rem] overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${intro.accentColor}) / 0.12, hsl(${intro.accentColor}) / 0.04)`,
              }}
            >
              {/* Decorative blob */}
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-20"
                style={{ backgroundColor: `hsl(${intro.accentColor})` }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                aria-label="Close"
              >
                <FiX size={18} className="text-muted-foreground" />
              </button>

              {/* Hero icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `hsl(${intro.accentColor} / 0.15)` }}
              >
                <HeroIcon
                  size={30}
                  style={{ color: `hsl(${intro.accentColor})` }}
                />
              </div>

              <h2 className="font-display text-xl font-bold text-foreground leading-snug">
                {intro.introTitle}
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {intro.introSubtitle}
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Intro text */}
              <p className="text-[15px] leading-relaxed text-foreground/85 font-body">
                {intro.introText}
              </p>

              {/* Facts */}
              <div className="space-y-3">
                {intro.introFacts.map((fact, i) => {
                  const FactIcon = fact.icon;
                  return (
                    <motion.div
                      key={fact.label}
                      custom={i}
                      variants={factVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3.5"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${fact.color}15` }}
                      >
                        <FactIcon size={20} style={{ color: fact.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-foreground">
                          {fact.label}
                        </p>
                        <p className="text-[13px] text-muted-foreground font-body leading-relaxed mt-0.5">
                          {fact.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tip card */}
              <div className="rounded-2xl bg-primary/8 border border-primary/15 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <FiSun size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-foreground mb-1">Remember</p>
                  <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                    {intro.introTip}
                  </p>
                </div>
              </div>

              {/* CTA to dismiss */}
              <button
                onClick={onClose}
                className="w-full h-13 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft active:scale-[0.98] transition-transform"
              >
                Got it, let's go!
              </button>

              {/* Bottom spacer for safe area */}
              <div className="h-2" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelIntroOverlay;
