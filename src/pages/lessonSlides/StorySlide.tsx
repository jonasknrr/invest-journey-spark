import { motion } from 'framer-motion';

interface Props {
  emoji?: string;
  title?: string;
  mainText?: string;
  secondaryText?: string;
}

const StorySlide = ({
  emoji = '🏢',
  title = 'Stell dir vor, du kaufst ein Stück deiner Lieblingsfirma',
  mainText = 'Wenn du eine Aktie kaufst, gehört dir ein kleines Stück eines Unternehmens. Steigt der Wert des Unternehmens, steigt auch deine Aktie — du profitierst direkt von seinem Erfolg.',
  secondaryText = 'Unternehmen verkaufen Aktien um Geld für Wachstum zu sammeln — statt einen Kredit aufzunehmen.',
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
