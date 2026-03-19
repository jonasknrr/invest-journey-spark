import { motion } from 'framer-motion';

interface Props {
  emoji?: string;
  title?: string;
  mainText?: string;
  secondaryText?: string;
}

const StorySlide = ({
  emoji = '🏢',
  title = 'Imagine buying a piece of your favourite company',
  mainText = 'When you buy a stock, you own a small piece of a company. If the company grows in value, so does your stock — you directly benefit from its success.',
  secondaryText = 'Companies sell stocks to raise money for growth — instead of taking out a loan.',
}: Props) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.35 }}
  >
    <span className="text-6xl mb-5">{emoji}</span>
    <h2 className="font-display text-2xl font-bold text-foreground mb-4 leading-tight max-w-xs">
      {title}
    </h2>
    <p className="font-body text-[15px] leading-relaxed text-muted-foreground max-w-xs mb-3">
      {mainText}
    </p>
    <p className="font-body text-sm leading-relaxed text-muted-foreground/70 max-w-xs">
      {secondaryText}
    </p>
  </motion.div>
);

export default StorySlide;
