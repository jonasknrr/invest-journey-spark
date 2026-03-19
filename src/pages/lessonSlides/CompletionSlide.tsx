import { motion } from 'framer-motion';

interface Props {
  subtitle?: string;
}

const CompletionSlide = ({
  subtitle = 'You now know what a stock is and why it makes you a co-owner of a company.',
}: Props) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-6 text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center gap-3 mb-6">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="text-5xl"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.3, type: 'spring', stiffness: 300, damping: 15 }}
          style={{ filter: 'drop-shadow(0 0 8px hsl(45, 100%, 50%, 0.5))' }}
        >
          ⭐
        </motion.span>
      ))}
    </div>

    <motion.h2
      className="font-display text-2xl font-bold text-foreground mb-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      Lesson complete! 🎉
    </motion.h2>

    <motion.p
      className="font-body text-sm text-muted-foreground max-w-xs mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      {subtitle}
    </motion.p>

    <motion.div
      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
    >
      <motion.span
        className="font-display text-lg font-bold text-primary"
        animate={{ textShadow: ['0 0 0px hsl(var(--primary))', '0 0 16px hsl(var(--primary))', '0 0 0px hsl(var(--primary))'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        +50 XP
      </motion.span>
    </motion.div>
  </motion.div>
);

export default CompletionSlide;
