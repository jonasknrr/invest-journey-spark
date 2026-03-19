

## Plan: Rewrite "Was ist Cash?" Lesson (Cash_F1_WhatIsCash.tsx)

### What changes

**Single file edit: `src/pages/lessons/Cash_F1_WhatIsCash.tsx`**

Replace the entire content with a new 3-slide layout matching the Spotify/ETF visual style used in other lessons. The file keeps its standalone structure (own route at `/lesson/festgeld/f1`) with progress bar and hearts system intact.

### Slide structure

1. **Slide 1 — "Du kennst ein Wasserglas?"**: Two side-by-side cards (gray bg: water glass metaphor, blue bg: bank account), centered explanation text, "Nächste →" button bottom-right.

2. **Slide 2 — "Cash ist nicht nur Bargeld."**: Four stacked info cards with colored left borders (green for cash items, blue for cash equivalents), each with emoji, title, description, and badge. Yellow info banner at bottom. "Nächste →" button.

3. **Slide 3 — "Das hier ist kein Cash."**: Three stacked info cards with red/orange left borders (Aktien, Immobilie, Festgeld), each with badge. Yellow info banner. "Nächste →" button navigates to next lesson.

### Technical details

- Keep existing top bar (X button, progress bar, hearts) exactly as-is
- Keep existing AnimatePresence slide transitions
- Replace card styling to match the user's exact JSX/Tailwind specs (rounded-2xl, shadow-sm, flex items-center gap-4, border-l-4, badge pills)
- Cards use `bg-white` with `shadow-sm` instead of current `bg-card` with `border`
- Navigation on final slide goes to `/category/festgeld`
- No new files, no CSS files, no changes to other lessons

