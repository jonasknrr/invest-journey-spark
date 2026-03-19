/**
 * Portfolio simulation with yearly compound interest.
 *
 * Each position compounds independently: K_new = K_old × (1 + rate).
 * Tagesgeld has rate = 0 %, so its value stays constant.
 */

export interface PortfolioPosition {
  label: string;
  /** Initial investment amount */
  amount: number;
  /** Annual interest rate as a percentage, e.g. 1.5 for 1.5 % */
  annualRate: number;
}

export interface YearSnapshot {
  year: number;
  totalValue: number;
  /** Value of each position after compounding to this year */
  positions: { label: string; value: number }[];
}

export interface SimulationResult {
  /** One entry per year from year 0 to year `years` (inclusive) */
  yearlySnapshots: YearSnapshot[];
  /** Total amount invested at year 0 */
  totalInvested: number;
  /** Portfolio value at end of simulation */
  endValue: number;
  /** Absolute profit (endValue − totalInvested) */
  profitAbsolute: number;
  /** Profit as percentage of totalInvested */
  profitPercent: number;
}

/**
 * Simulate a portfolio over `years` years with yearly compound interest.
 *
 * @param positions - The individual investments with their annual rates.
 * @param years     - Simulation horizon in years (default 5).
 */
export function simulatePortfolio(
  positions: PortfolioPosition[],
  years = 5,
): SimulationResult {
  const totalInvested = positions.reduce((s, p) => s + p.amount, 0);

  // Build yearly snapshots
  const yearlySnapshots: YearSnapshot[] = [];

  for (let y = 0; y <= years; y++) {
    const positionValues = positions.map((p) => {
      // Compound: amount × (1 + rate/100)^y
      const value =
        Math.round(p.amount * Math.pow(1 + p.annualRate / 100, y) * 100) / 100;
      return { label: p.label, value };
    });

    const totalValue =
      Math.round(positionValues.reduce((s, pv) => s + pv.value, 0) * 100) / 100;

    yearlySnapshots.push({ year: y, totalValue, positions: positionValues });
  }

  const endValue = yearlySnapshots[yearlySnapshots.length - 1].totalValue;
  const profitAbsolute = Math.round((endValue - totalInvested) * 100) / 100;
  const profitPercent =
    totalInvested > 0
      ? Math.round((profitAbsolute / totalInvested) * 10000) / 100
      : 0;

  return {
    yearlySnapshots,
    totalInvested,
    endValue,
    profitAbsolute,
    profitPercent,
  };
}
