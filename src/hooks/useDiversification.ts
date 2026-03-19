/**
 * Herfindahl-Hirschman-Index (HHI) based diversification assessment.
 *
 * HHI = Σ (weight_i in %)²   →  range 0 … 10 000
 *
 * Combined with a capital-position check to produce a qualitative rating.
 */

export type DivRating = 'Sehr gut' | 'Gut' | 'Ausreichend' | 'Mangelhaft' | 'Schlecht';

export interface DiversificationResult {
  hhi: number;
  numPositions: number;
  expectedPositions: number;
  fulfillmentRatio: number;
  rating: DivRating;
  color: string;          // HSL string for UI
  riskPassed: boolean;    // replaces old divScore >= 7 check
  investedCapital: number;
}

/**
 * @param positionAmounts  Array of invested amounts per risky position (> 0 only)
 * @param investedCapital  Total invested capital in risky assets (Aktien + ETFs)
 */
export function calcDiversification(
  positionAmounts: number[],
  investedCapital: number,
): DiversificationResult {
  const positions = positionAmounts.filter(a => a > 0);
  const numPositions = positions.length;

  // ── Step 1: HHI ──
  let hhi = 10_000; // default: worst case (1 position or none)
  if (investedCapital > 0 && numPositions > 0) {
    hhi = positions.reduce((sum, amt) => {
      const pct = (amt / investedCapital) * 100;
      return sum + pct * pct;
    }, 0);
    hhi = Math.round(hhi);
  } else if (numPositions === 0) {
    // No risky positions → not applicable, treat as neutral
    hhi = 0;
  }

  // ── Step 2: Capital-Position check ──
  const expectedPositions = Math.min(10, investedCapital / 1000);
  const fulfillmentRatio = expectedPositions > 0 ? numPositions / expectedPositions : 1;

  // ── Step 3: Qualitative rating ──
  let rating: DivRating;

  if (numPositions === 0) {
    // No risky assets → neutral (not applicable)
    rating = 'Sehr gut';
  } else if (hhi === 10_000 || fulfillmentRatio < 0.25) {
    rating = 'Schlecht';
  } else if (hhi >= 5_000 || fulfillmentRatio < 0.5) {
    rating = 'Mangelhaft';
  } else if (hhi < 1_500 && fulfillmentRatio >= 1) {
    rating = 'Sehr gut';
  } else if (hhi < 2_500 && fulfillmentRatio >= 0.75) {
    rating = 'Gut';
  } else if (hhi < 5_000 && fulfillmentRatio >= 0.5) {
    rating = 'Ausreichend';
  } else {
    rating = 'Ausreichend';
  }

  const colorMap: Record<DivRating, string> = {
    'Sehr gut': 'hsl(var(--primary))',
    'Gut': 'hsl(142, 71%, 45%)',
    'Ausreichend': 'hsl(30, 90%, 55%)',
    'Mangelhaft': 'hsl(25, 95%, 53%)',
    'Schlecht': 'hsl(var(--destructive))',
  };

  const riskPassed = rating === 'Sehr gut' || rating === 'Gut';

  return {
    hhi,
    numPositions,
    expectedPositions: Math.round(expectedPositions * 10) / 10,
    fulfillmentRatio: Math.round(fulfillmentRatio * 100) / 100,
    rating,
    color: colorMap[rating],
    riskPassed,
    investedCapital,
  };
}
