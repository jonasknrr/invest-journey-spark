import Papa from 'papaparse';

interface CsvRow {
  date: string;
  ticker: string;
  name: string;
  price: number;
}

export interface EtfListItem {
  ticker: string;
  name: string;
}

export interface EtfTimeSeries {
  ticker: string;
  name: string;
  isCHF: boolean;
  prices: { date: string; price: number }[];
}

const START_DATE = '2006-02-17';
const END_DATE = '2011-02-17';
export const CHF_TO_USD = 1.26;

let cachedRows: CsvRow[] | null = null;
let cachedTimeSeries: Map<string, EtfTimeSeries> | null = null;

async function loadRows(): Promise<CsvRow[]> {
  if (cachedRows) return cachedRows;
  const res = await fetch('/equity_indices.csv');
  const text = await res.text();
  const parsed = Papa.parse<CsvRow>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  cachedRows = parsed.data;
  return cachedRows;
}

export async function getAllEtfs(): Promise<EtfListItem[]> {
  const rows = await loadRows();
  const seen = new Map<string, string>();
  for (const r of rows) {
    if (!seen.has(r.ticker)) seen.set(r.ticker, r.name);
  }
  return [...seen.entries()].map(([ticker, name]) => ({ ticker, name }));
}

export async function getEtfTimeSeries(): Promise<Map<string, EtfTimeSeries>> {
  if (cachedTimeSeries) return cachedTimeSeries;
  const rows = await loadRows();
  const byTicker: Record<string, { name: string; prices: { date: string; price: number }[] }> = {};

  for (const row of rows) {
    if (row.date < START_DATE || row.date > END_DATE) continue;
    if (!byTicker[row.ticker]) byTicker[row.ticker] = { name: row.name, prices: [] };
    byTicker[row.ticker].prices.push({ date: row.date, price: row.price });
  }

  const result = new Map<string, EtfTimeSeries>();
  for (const [ticker, data] of Object.entries(byTicker)) {
    const sorted = data.prices.sort((a, b) => a.date.localeCompare(b.date));
    const step = Math.max(1, Math.floor(sorted.length / 100));
    const sampled = sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);
    result.set(ticker, {
      ticker,
      name: data.name,
      isCHF: ticker === 'SMI',
      prices: sampled,
    });
  }

  cachedTimeSeries = result;
  return result;
}
