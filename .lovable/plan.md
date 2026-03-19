

## Plan: Scale Chapter 3 budget from 100,000 → 10,000 CHF

Only Chapter 3 ("ETF Diversification") has a 100,000 CHF budget. All other challenges remain untouched.

### Changes

**1. `src/data/challengeConfig.ts` (line ~49-53)**
Update the chapter-3 scenario:
- `budget: 100000` → `budget: 10000`
- Description: "100,000 CHF" → "10,000 CHF", "10,000 CHF" → "1,000 CHF", "20,000 CHF" → "2,000 CHF", "70,000 CHF" → "7,000 CHF"

**2. `src/pages/LevelChallenge.tsx` (line 170)**
Change the hardcoded emergency fund display for chapter-3:
- `'10,000'` → `'1,000'`

That's it. All other UI elements (budget display, available budget tracker, asset allocations, simulation) are already driven dynamically from `scenario.budget` / `totalBudget`, so they will automatically reflect the new 10,000 CHF base.

No other files reference the 100,000 budget for this challenge — the other `100,000` matches (deposit insurance text, lesson slides, ETF milestones, cost slider range) are unrelated educational content and must not change.

