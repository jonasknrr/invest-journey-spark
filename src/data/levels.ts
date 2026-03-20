export type LevelStatus = 'completed' | 'current' | 'locked';
export type SubLevelStatus = 'completed' | 'current' | 'locked';

export interface SubLevel {
  id: string;
  title: string;
  description: string;
  status: SubLevelStatus;
  duration: string;
}

export interface Level {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  colorKey: string;
  colorVar: string;
  status: LevelStatus;
  progress: number;
  subLevels: SubLevel[];
}

const levelTemplates: Omit<Level, 'status' | 'progress' | 'subLevels'>[] = [
  { id: 'festgeld', title: 'Cash & Cash Equivalents', subtitle: 'Your safe start', iconName: 'Banknote', colorKey: 'festgeld', colorVar: '--level-festgeld' },
  { id: 'aktien', title: 'Stocks', subtitle: 'Become a co-owner', iconName: 'RocketLaunch', colorKey: 'aktien', colorVar: '--level-aktien' },
  { id: 'etfs', title: 'ETFs & Indices', subtitle: 'Invest smarter', iconName: 'ChartLineUp', colorKey: 'etfs', colorVar: '--level-etfs' },
  { id: 'anleihen', title: 'Bonds', subtitle: 'Lend money, earn interest', iconName: 'Ticket', colorKey: 'anleihen', colorVar: '--level-anleihen' },
  { id: 'metals', title: 'Precious Metals', subtitle: 'Gold, Silver & Safe Havens', iconName: 'Diamond', colorKey: 'metals', colorVar: '--level-metals' },
  { id: 'realestate', title: 'Real Estate', subtitle: 'Understanding property', iconName: 'House', colorKey: 'realestate', colorVar: '--level-realestate' },
  { id: 'currencies', title: 'Currencies', subtitle: 'The world of money', iconName: 'Compass', colorKey: 'currencies', colorVar: '--level-currencies' },
  { id: 'crypto', title: 'Cryptocurrencies', subtitle: 'Digital frontier', iconName: 'Globe', colorKey: 'crypto', colorVar: '--level-crypto' },
];

const subLevelData: Record<string, Omit<SubLevel, 'status'>[]> = {
  festgeld: [
    { id: 'f2', title: 'What is Inflation?', description: 'Why your money loses value', duration: '3 Min' },
    { id: 'f1', title: 'What is Cash?', description: 'Cash, savings accounts & more explained', duration: '3 Min' },
    { id: 'f3', title: 'What is Liquidity?', description: 'Why availability matters', duration: '2 Min' },
    { id: 'f6', title: 'The Emergency Fund', description: 'Your financial safety net', duration: '3 Min' },
    { id: 'f7', title: 'Real vs. Nominal Interest', description: 'What you actually earn', duration: '3 Min' },
    { id: 'f4', title: 'What is Call Money?', description: 'Flexible saving with returns', duration: '3 Min' },
    { id: 'f5', title: 'What is Fixed Deposit?', description: 'More interest, less flexibility', duration: '3 Min' },
    { id: 'f8', title: 'Deposit Protection', description: 'Why your bank account is safe', duration: '3 Min' },
    { id: 'f9', title: 'Opportunity Cost', description: 'The price of doing nothing', duration: '3 Min' },
  ],
  aktien: [
    { id: 'a1', title: 'What are Stocks?', description: 'Imagine buying a piece of your favourite company', duration: '3 Min' },
    { id: 'a2', title: 'How is the stock price determined?', description: 'Why stocks grow long-term', duration: '4 Min' },
    { id: 'a3', title: 'Risk and Volatility', description: 'Why fluctuations are normal', duration: '3 Min' },
    { id: 'a4', title: 'Dividends', description: 'Earn money just by holding', duration: '3 Min' },
    { id: 'a5', title: 'Diversification', description: 'The smart way to spread risk', duration: '4 Min' },
    { id: 'a6', title: 'Long-term Thinking', description: 'Time is your best friend', duration: '3 Min' },
    { id: 'a7', title: 'Common Beginner Mistakes', description: 'Learn from others\' mistakes', duration: '4 Min' },
  ],
  etfs: [
    { id: 'e1', title: 'What is an index?', description: 'The market\'s scoreboard', duration: '4 Min' },
    { id: 'e2', title: 'How indexes are built', description: 'Why size matters', duration: '5 Min' },
    { id: 'e3', title: 'What is an ETF?', description: 'The investable wrapper', duration: '5 Min' },
    { id: 'e4', title: 'The ETF universe', description: 'Broad, sector, theme & factor', duration: '6 Min' },
    { id: 'e5', title: 'Costs & key numbers', description: 'The silent fee', duration: '6 Min' },
    { id: 'e6', title: 'Risk & diversification', description: 'What an ETF can\'t protect', duration: '6 Min' },
    { id: 'e7', title: 'Acc vs Dist & tax', description: 'Snowball or paycheck?', duration: '5 Min' },
    { id: 'e8', title: 'The ETF savings plan', description: 'How CHF 100/month becomes wealth', duration: '5 Min' },
    { id: 'e9', title: 'Final simulation', description: 'Apply everything', duration: '10 Min' },
  ],
  anleihen: [
    { id: 'an1', title: 'What are Bonds?', description: 'You become the lender', duration: '3 Min' },
    { id: 'an2', title: 'Government vs Corporate Bonds', description: 'Who do you trust with your money?', duration: '3 Min' },
    { id: 'an3', title: 'Interest and Prices', description: 'How bonds move in the market', duration: '4 Min' },
  ],
  metals: [
    { id: 'g1', title: 'Why Precious Metals?', description: 'Gold, silver & the safe haven concept', duration: '3 Min' },
    { id: 'g2', title: 'Physical vs Digital', description: 'Bars in the vault or ETF in the portfolio?', duration: '3 Min' },
    { id: 'g3', title: 'Precious Metals vs Stocks', description: 'When does gold make more sense than stocks?', duration: '4 Min' },
  ],
  realestate: [
    { id: 'i1', title: 'Renting vs Buying', description: 'What really pays off?', duration: '4 Min' },
    { id: 'i2', title: 'Discovering REITs', description: 'Real estate without a house', duration: '3 Min' },
    { id: 'i3', title: 'Real Estate as an Investment', description: 'Cashflow, value growth & portfolio role', duration: '4 Min' },
  ],
  currencies: [
    { id: 'w1', title: 'What are Exchange Rates?', description: 'Why the dollar is sometimes worth more, sometimes less', duration: '3 Min' },
    { id: 'w2', title: 'Why do Exchange Rates Change?', description: 'Interest rates, economies & politics explained', duration: '4 Min' },
  ],
  crypto: [
    { id: 'k1', title: 'What is Bitcoin?', description: 'The first digital currency', duration: '4 Min' },
    { id: 'k2', title: 'Blockchain explained simply', description: 'The technology behind it', duration: '3 Min' },
    { id: 'k3', title: 'Crypto as an Investment', description: 'Opportunity, risk & how it differs from stocks', duration: '4 Min' },
  ],
};

const unlockedChapters = ['festgeld', 'aktien', 'etfs'];

function buildLevels(mode: 'fresh' | 'demo'): Level[] {
  return levelTemplates.map(tmpl => {
    const subs = subLevelData[tmpl.id] || [];
    if (mode === 'demo') {
      const isUnlocked = unlockedChapters.includes(tmpl.id);
      return {
        ...tmpl,
        status: isUnlocked ? 'current' as LevelStatus : 'locked' as LevelStatus,
        progress: 0,
        subLevels: subs.map(s => ({ ...s, status: (isUnlocked ? 'current' : 'locked') as SubLevelStatus })),
      };
    }
    // fresh mode: only festgeld current, only first sub (f2) current
    if (tmpl.id === 'festgeld') {
      return {
        ...tmpl,
        status: 'current' as LevelStatus,
        progress: 0,
        subLevels: subs.map((s, i) => ({ ...s, status: (i === 0 ? 'current' : 'locked') as SubLevelStatus })),
      };
    }
    return {
      ...tmpl,
      status: 'locked' as LevelStatus,
      progress: 0,
      subLevels: subs.map(s => ({ ...s, status: 'locked' as SubLevelStatus })),
    };
  });
}

export const freshLevels: Level[] = buildLevels('fresh');
export const demoLevels: Level[] = buildLevels('demo');

export function getLevels(): Level[] {
  const mode = localStorage.getItem('investify_mode');
  return mode === 'demo' ? demoLevels : freshLevels;
}

/** @deprecated Use getLevels() instead */
export const levels: Level[] = demoLevels;
