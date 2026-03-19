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
    <h2 className="font-display text-2xl font-bold text-foreground mb-2">No hearts left</h2>
    <p className="font-body text-sm text-muted-foreground mb-8">No worries — choose how to continue</p>

    <div className="w-full max-w-sm space-y-3 mb-6">
      <button onClick={onRestart} className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="text-2xl block mb-1">🔄</span>
        <p className="font-display text-sm font-bold text-foreground">Restart lesson</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">Back to step 0 · 3 hearts · same XP chance</p>
      </button>
      <button onClick={onQuizOnly} className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="text-2xl block mb-1">🧠</span>
        <p className="font-display text-sm font-bold text-foreground">Repeat quiz questions only</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">Back to Quiz 1 · 3 hearts · same XP chance</p>
      </button>
    </div>

    <button onClick={onContinue} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
      Continue without restart →
    </button>
  </motion.div>
);

export default NoHeartsOverlay;
