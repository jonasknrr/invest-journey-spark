import Papa from 'papaparse';

export interface StockListItem {
  ticker: string;
  name: string;
  market: 'SMI' | 'DJIA';
}

const CHF_TO_USD = 1.26;

interface CsvRow {
  date: string;
  ticker: string;
  name: string;
  price: number;
}

let cachedStocks: StockListItem[] | null = null;

async function loadCSV(filename: string): Promise<CsvRow[]> {
  const response = await fetch(`/${filename}`);
  const text = await response.text();
  const result = Papa.parse<CsvRow>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return result.data;
}

export async function getAllStocks(): Promise<StockListItem[]> {
  if (cachedStocks) return cachedStocks;

  const [smiData, djiaData] = await Promise.all([
    loadCSV('smi_stocks.csv'),
    loadCSV('djia_stocks.csv'),
  ]);

  const seen = new Set<string>();
  const stocks: StockListItem[] = [];

  for (const row of smiData) {
    if (!seen.has(row.ticker)) {
      seen.add(row.ticker);
      stocks.push({ ticker: row.ticker, name: row.name, market: 'SMI' });
    }
  }
  for (const row of djiaData) {
    if (!seen.has(row.ticker)) {
      seen.add(row.ticker);
      stocks.push({ ticker: row.ticker, name: row.name, market: 'DJIA' });
    }
  }

  // Sort alphabetically by name
  stocks.sort((a, b) => a.name.localeCompare(b.name));
  cachedStocks = stocks;
  return stocks;
}

export { CHF_TO_USD };
