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

export const levels: Level[] = [
  {
    id: 'festgeld',
    title: 'Cash & Cash Equivalents',
    subtitle: 'Your safe start',
    iconName: 'Vault',
    colorKey: 'festgeld',
    colorVar: '--level-festgeld',
    status: 'current',
    progress: 0,
    subLevels: [
      { id: 'f1', title: 'What is Cash?', description: 'Cash, savings accounts & more explained', status: 'current', duration: '3 Min' },
      { id: 'f3', title: 'What is Liquidity?', description: 'Why availability matters', status: 'current', duration: '2 Min' },
      { id: 'f6', title: 'The Emergency Fund', description: 'Your financial safety net', status: 'current', duration: '3 Min' },
      { id: 'f2', title: 'What is Inflation?', description: 'Why your money loses value', status: 'current', duration: '3 Min' },
      { id: 'f7', title: 'Real vs. Nominal Interest', description: 'What you actually earn', status: 'current', duration: '3 Min' },
      { id: 'f4', title: 'What is Call Money?', description: 'Flexible saving with returns', status: 'current', duration: '3 Min' },
      { id: 'f5', title: 'What is Fixed Deposit?', description: 'More interest, less flexibility', status: 'current', duration: '3 Min' },
      { id: 'f8', title: 'Deposit Protection', description: 'Why your bank account is safe', status: 'current', duration: '3 Min' },
      { id: 'f9', title: 'Opportunity Cost', description: 'The price of doing nothing', status: 'current', duration: '3 Min' },
    ],
  },
  {
    id: 'aktien',
    title: 'Stocks',
    subtitle: 'Become a co-owner',
    iconName: 'RocketLaunch',
    colorKey: 'aktien',
    colorVar: '--level-aktien',
    status: 'current',
    progress: 42,
    subLevels: [
      { id: 'a1', title: 'What are Stocks?', description: 'Imagine buying a piece of your favourite company', status: 'current', duration: '3 Min' },
      { id: 'a2', title: 'How is the stock price determined?', description: 'Why stocks grow long-term', status: 'current', duration: '4 Min' },
      { id: 'a3', title: 'Risk and Volatility', description: 'Why fluctuations are normal', status: 'current', duration: '3 Min' },
      { id: 'a4', title: 'Dividends', description: 'Earn money just by holding', status: 'current', duration: '3 Min' },
      { id: 'a5', title: 'Diversification', description: 'The smart way to spread risk', status: 'current', duration: '4 Min' },
      { id: 'a6', title: 'Long-term Thinking', description: 'Time is your best friend', status: 'current', duration: '3 Min' },
      { id: 'a7', title: 'Common Beginner Mistakes', description: 'Learn from others\' mistakes', status: 'current', duration: '4 Min' },
    ],
  },
  {
    id: 'etfs',
    title: 'ETFs & Indices',
    subtitle: 'Invest smarter',
    iconName: 'ChartLineUp',
    colorKey: 'etfs',
    colorVar: '--level-etfs',
    status: 'current',
    progress: 0,
    subLevels: [
      { id: 'e1', title: 'What is an index?', description: 'The market\'s scoreboard', status: 'current', duration: '4 Min' },
      { id: 'e2', title: 'How indexes are built', description: 'Why size matters', status: 'current', duration: '5 Min' },
      { id: 'e3', title: 'What is an ETF?', description: 'The investable wrapper', status: 'current', duration: '5 Min' },
      { id: 'e4', title: 'The ETF universe', description: 'Broad, sector, theme & factor', status: 'current', duration: '6 Min' },
      { id: 'e5', title: 'Costs & key numbers', description: 'The silent fee', status: 'current', duration: '6 Min' },
      { id: 'e6', title: 'Risk & diversification', description: 'What an ETF can\'t protect', status: 'current', duration: '6 Min' },
      { id: 'e7', title: 'Acc vs Dist & tax', description: 'Snowball or paycheck?', status: 'current', duration: '5 Min' },
      { id: 'e8', title: 'The ETF savings plan', description: 'How CHF 100/month becomes wealth', status: 'current', duration: '5 Min' },
      { id: 'e9', title: 'Final simulation', description: 'Apply everything', status: 'current', duration: '10 Min' },
    ],
  },
  {
    id: 'anleihen',
    title: 'Bonds',
    subtitle: 'Lend money, earn interest',
    iconName: 'Ticket',
    colorKey: 'anleihen',
    colorVar: '--level-anleihen',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'an1', title: 'What are Bonds?', description: 'You become the lender', status: 'locked', duration: '3 Min' },
      { id: 'an2', title: 'Government vs Corporate Bonds', description: 'Who do you trust with your money?', status: 'locked', duration: '3 Min' },
      { id: 'an3', title: 'Interest and Prices', description: 'How bonds move in the market', status: 'locked', duration: '4 Min' },
    ],
  },
  {
    id: 'currencies',
    title: 'Currencies',
    subtitle: 'The world of money',
    iconName: 'Compass',
    colorKey: 'currencies',
    colorVar: '--level-currencies',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'w1', title: 'What are Exchange Rates?', description: 'Why the dollar is sometimes worth more, sometimes less', status: 'locked', duration: '3 Min' },
      { id: 'w2', title: 'Why do Exchange Rates Change?', description: 'Interest rates, economies & politics explained', status: 'locked', duration: '4 Min' },
    ],
  },
  {
    id: 'krypto',
    title: 'Cryptocurrencies',
    subtitle: 'Digital frontier',
    iconName: 'Globe',
    colorKey: 'krypto',
    colorVar: '--level-krypto',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'k1', title: 'What is Bitcoin?', description: 'The first digital currency', status: 'locked', duration: '4 Min' },
      { id: 'k2', title: 'Blockchain explained simply', description: 'The technology behind it', status: 'locked', duration: '3 Min' },
    ],
  },
  {
    id: 'gold',
    title: 'Gold',
    subtitle: 'The safe haven',
    iconName: 'Diamond',
    colorKey: 'gold',
    colorVar: '--level-gold',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'g1', title: 'Why Gold?', description: 'The oldest store of value', status: 'locked', duration: '3 Min' },
      { id: 'g2', title: 'Physical vs Digital', description: 'Bars in the vault or ETF in the portfolio?', status: 'locked', duration: '3 Min' },
    ],
  },
  {
    id: 'immobilien',
    title: 'Real Estate',
    subtitle: 'Understanding property',
    iconName: 'House',
    colorKey: 'immobilien',
    colorVar: '--level-immobilien',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'i1', title: 'Renting vs Buying', description: 'What really pays off?', status: 'locked', duration: '4 Min' },
      { id: 'i2', title: 'Discovering REITs', description: 'Real estate without a house', status: 'locked', duration: '3 Min' },
    ],
  },
];
