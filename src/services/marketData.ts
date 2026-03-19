import Papa from 'papaparse';

export interface StockEntry {
  date: string;
  ticker: string;
  name: string;
  price: number;
}

export interface StockSummary {
  ticker: string;
  name: string;
  firstPrice: number;
  lastPrice: number;
  returnPct: number;
  minPrice: number;
  maxPrice: number;
  prices: { date: string; price: number }[];
}

async function loadCSV(filename: string): Promise<StockEntry[]> {
  const response = await fetch(`/${filename}`);
  const text = await response.text();
  const result = Papa.parse<StockEntry>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}

export async function getStocksForGame(
  market: 'smi' | 'djia',
  startYear: number,
  endYear: number
): Promise<StockSummary[]> {
  const filename = market === 'smi' ? 'smi_stocks.csv' : 'djia_stocks.csv';
  const data = await loadCSV(filename);

  const filtered = data.filter((row) => {
    const year = new Date(row.date).getFullYear();
    return year >= startYear && year <= endYear;
  });

  const grouped: Record<string, StockEntry[]> = {};
  for (const row of filtered) {
    if (!grouped[row.ticker]) grouped[row.ticker] = [];
    grouped[row.ticker].push(row);
  }

  return Object.entries(grouped)
    .map(([ticker, entries]) => {
      const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
      const firstPrice = sorted[0].price;
      const lastPrice = sorted[sorted.length - 1].price;
      const returnPct = ((lastPrice - firstPrice) / firstPrice) * 100;
      const prices = sorted.map((e) => ({ date: e.date, price: e.price }));
      return {
        ticker,
        name: sorted[0].name,
        firstPrice,
        lastPrice,
        returnPct,
        minPrice: Math.min(...prices.map((p) => p.price)),
        maxPrice: Math.max(...prices.map((p) => p.price)),
        prices,
      };
    })
    .filter((s) => s.prices.length > 100);
}
