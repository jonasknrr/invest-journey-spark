import { motion } from 'framer-motion';

interface NoHeartsOverlayProps {
  onRestart: () => void;
  onQuizOnly: () => void;
  onContinue: () => void;
}

const NoHeartsOverlay = ({ onRestart, onQuizOnly, onContinue }: NoHeartsOverlayProps) => (
  <motion.div
    className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  >
    <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mb-5">
      <span style={{ fontSize: 48 }}>💔</span>
    </div>
    <h2 className="font-display text-2xl font-bold text-foreground mb-2">Keine Herzen mehr</h2>
    <p className="font-body text-sm text-muted-foreground mb-8">Kein Problem — wähle wie du weitermachst</p>

    <div className="w-full max-w-sm space-y-3 mb-6">
      <button onClick={onRestart} className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="text-2xl block mb-1">🔄</span>
        <p className="font-display text-sm font-bold text-foreground">Lektion neu starten</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">Zurück zu Schritt 0 · 3 Herzen · gleiche XP-Chance</p>
      </button>
      <button onClick={onQuizOnly} className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="text-2xl block mb-1">🧠</span>
        <p className="font-display text-sm font-bold text-foreground">Nur Quizfragen wiederholen</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">Zurück zu Quiz 1 · 3 Herzen · gleiche XP-Chance</p>
      </button>
    </div>

    <button onClick={onContinue} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
      Ohne Neustart weitermachen →
    </button>
  </motion.div>
);

export default NoHeartsOverlay;
