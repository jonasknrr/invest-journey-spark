/**
 * Herfindahl-Hirschman-Index (HHI) based diversification assessment.
 *
 * HHI = Σ (weight_i in %)²   →  range 0 … 10 000
 *
 * Combined with a capital-position check to produce a qualitative rating.
 */

export type DivRating = 'Very Good' | 'Good' | 'Fair' | 'Poor' | 'Bad';

export interface DiversificationResult {
  hhi: number;
  numPositions: number;
  /** True underlying positions after ETF expansion */
  truePositionCount: number;
  expectedPositions: number;
  fulfillmentRatio: number;
  rating: DivRating;
  color: string;          // HSL string for UI
  riskPassed: boolean;    // replaces old divScore >= 7 check
  investedCapital: number;
}

/** Maps ETF names to their real-world constituent counts */
export const ETF_CONSTITUENTS: Record<string, number> = {
  'DAX': 40,
  'Nikkei 225': 225,
  'DJIA': 30,
  'EuroStoxx 50': 50,
  'SMI': 20,
};

/**
 * Resolve an ETF ticker/name to its constituent count. Returns 1 if not an ETF.
 */
function getConstituentCount(nameOrTicker: string): number {
  for (const [key, count] of Object.entries(ETF_CONSTITUENTS)) {
    if (nameOrTicker === key || nameOrTicker.includes(key)) return count;
  }
  return 1;
}

/**
 * @param positionAmounts  Array of invested amounts per risky position (> 0 only)
 * @param investedCapital  Total invested capital in risky assets (Aktien + ETFs)
 */
export function calcDiversification(
  positionAmounts: number[],
  investedCapital: number,
): DiversificationResult {
  return calcDiversificationWithETFs(
    positionAmounts.map(a => ({ amount: a, name: '' })),
    investedCapital,
  );
}

/**
 * ETF-aware diversification calculation.
 * When a position is an ETF, we simulate equal distribution among its constituents
 * for HHI calculation purposes.
 *
 * @param positions  Array of { amount, name } where name is used to look up ETF constituents
 * @param investedCapital  Total invested capital in risky assets
 */
export function calcDiversificationWithETFs(
  positions: { amount: number; name: string }[],
  investedCapital: number,
): DiversificationResult {
  const activePositions = positions.filter(p => p.amount > 0);
  const numPositions = activePositions.length;

  // Calculate true underlying position count (ETFs expand to constituents)
  let truePositionCount = 0;
  for (const pos of activePositions) {
    truePositionCount += getConstituentCount(pos.name);
  }

  // ── Step 1: HHI with ETF expansion ──
  let hhi = 10_000; // default: worst case
  if (investedCapital > 0 && numPositions > 0) {
    // Build expanded position amounts: each ETF becomes N equal positions
    const expandedAmounts: number[] = [];
    for (const pos of activePositions) {
      const constituents = getConstituentCount(pos.name);
      if (constituents > 1) {
        const perConstituent = pos.amount / constituents;
        for (let i = 0; i < constituents; i++) {
          expandedAmounts.push(perConstituent);
        }
      } else {
        expandedAmounts.push(pos.amount);
      }
    }

    const expandedTotal = expandedAmounts.reduce((s, a) => s + a, 0);
    hhi = expandedAmounts.reduce((sum, amt) => {
      const pct = (amt / expandedTotal) * 100;
      return sum + pct * pct;
    }, 0);
    hhi = Math.round(hhi);
  } else if (numPositions === 0) {
    hhi = 0;
  }

  // ── Step 2: Capital-Position check (use true position count) ──
  const expectedPositions = Math.min(10, investedCapital / 1000);
  const fulfillmentRatio = expectedPositions > 0 ? truePositionCount / expectedPositions : 1;

  // ── Step 3: Qualitative rating ──
  let rating: DivRating;

  if (numPositions === 0) {
    rating = 'Very Good';
  } else if (hhi >= 5_000) {
    rating = 'Bad';
  } else if (hhi >= 2_500) {
    rating = 'Poor';
  } else if (hhi < 1_500 && fulfillmentRatio >= 0.75) {
    rating = 'Very Good';
  } else if (hhi < 2_500 && fulfillmentRatio >= 0.5) {
    rating = 'Good';
  } else {
    rating = 'Fair';
  }

  const colorMap: Record<DivRating, string> = {
    'Very Good': 'hsl(var(--primary))',
    'Good': 'hsl(142, 71%, 45%)',
    'Fair': 'hsl(30, 90%, 55%)',
    'Poor': 'hsl(25, 95%, 53%)',
    'Bad': 'hsl(var(--destructive))',
  };

  const riskPassed = rating === 'Very Good' || rating === 'Good';

  return {
    hhi,
    numPositions,
    truePositionCount,
    expectedPositions: Math.round(expectedPositions * 10) / 10,
    fulfillmentRatio: Math.round(fulfillmentRatio * 100) / 100,
    rating,
    color: colorMap[rating],
    riskPassed,
    investedCapital,
  };
}
