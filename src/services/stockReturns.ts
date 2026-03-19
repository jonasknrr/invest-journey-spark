import Papa from 'papaparse';

interface CsvRow {
  date: string;
  ticker: string;
  name: string;
  price: number;
}

export interface StockReturn {
  ticker: string;
  name: string;
  annualRate: number;
  totalReturn: number;
  /** Whether this is a CHF stock (needs conversion to USD) */
  isCHF: boolean;
}

export interface StockTimeSeries {
  ticker: string;
  name: string;
  isCHF: boolean;
  /** Sorted daily prices between START_DATE and END_DATE */
  prices: { date: string; price: number }[];
}

let cachedReturns: Map<string, StockReturn> | null = null;
let cachedTimeSeries: Map<string, StockTimeSeries> | null = null;

const START_DATE = '2006-02-17';
const END_DATE = '2011-02-17';
const CHF_TO_USD = 1.26;

async function loadCSV(filename: string): Promise<CsvRow[]> {
  const response = await fetch(`/${filename}`);
  const text = await response.text();
  const result = Papa.parse<CsvRow>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return result.data;
}

async function loadAllData(): Promise<CsvRow[]> {
  if ((window as any).__stockCsvCache) return (window as any).__stockCsvCache;
  const [smiData, djiaData] = await Promise.all([
    loadCSV('smi_stocks.csv'),
    loadCSV('djia_stocks.csv'),
  ]);
  const all = [...smiData, ...djiaData];
  (window as any).__stockCsvCache = all;
  return all;
}

/**
 * Returns annualized stock returns from START_DATE to END_DATE.
 */
export async function getStockReturns(): Promise<Map<string, StockReturn>> {
  if (cachedReturns) return cachedReturns;

  const allData = await loadAllData();
  const byTicker: Record<string, { first: CsvRow | null; end: CsvRow | null; name: string }> = {};

  for (const row of allData) {
    if (row.date < START_DATE || row.date > END_DATE) continue;
    if (!byTicker[row.ticker]) {
      byTicker[row.ticker] = { first: null, end: null, name: row.name };
    }
    const entry = byTicker[row.ticker];
    if (!entry.first || row.date < entry.first.date) entry.first = row;
    if (!entry.end || row.date > entry.end.date) entry.end = row;
  }

  const returns = new Map<string, StockReturn>();
  for (const [ticker, data] of Object.entries(byTicker)) {
    if (!data.first || !data.end || data.first.price <= 0) continue;
    const years = (new Date(data.end.date).getTime() - new Date(data.first.date).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (years <= 0) continue;
    const totalReturn = ((data.end.price - data.first.price) / data.first.price) * 100;
    const annualRate = (Math.pow(data.end.price / data.first.price, 1 / years) - 1) * 100;
    const isCHF = ticker.endsWith('-CH');
    returns.set(ticker, { ticker, name: data.name, annualRate, totalReturn, isCHF });
  }

  cachedReturns = returns;
  return returns;
}

/**
 * Returns daily price time series for each stock within [START_DATE, END_DATE].
 * Sampled to ~100 data points for performance.
 */
export async function getStockTimeSeries(): Promise<Map<string, StockTimeSeries>> {
  if (cachedTimeSeries) return cachedTimeSeries;

  const allData = await loadAllData();
  const byTicker: Record<string, { name: string; prices: { date: string; price: number }[] }> = {};

  for (const row of allData) {
    if (row.date < START_DATE || row.date > END_DATE) continue;
    if (!byTicker[row.ticker]) byTicker[row.ticker] = { name: row.name, prices: [] };
    byTicker[row.ticker].prices.push({ date: row.date, price: row.price });
  }

  const result = new Map<string, StockTimeSeries>();
  for (const [ticker, data] of Object.entries(byTicker)) {
    const sorted = data.prices.sort((a, b) => a.date.localeCompare(b.date));
    // Sample to ~100 points
    const step = Math.max(1, Math.floor(sorted.length / 100));
    const sampled = sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);
    result.set(ticker, {
      ticker,
      name: data.name,
      isCHF: ticker.endsWith('-CH'),
      prices: sampled,
    });
  }

  cachedTimeSeries = result;
  return result;
}

export { CHF_TO_USD };
