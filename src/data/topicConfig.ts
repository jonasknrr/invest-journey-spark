export interface QuizAnswer {
  id: string;
  text: string;
}

export interface TopicConfig {
  slug: string;
  levelId: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  explanation: {
    mainText: string;
    secondaryText: string;
  };
  visualKey: string;
  quiz: {
    question: string;
    answers: QuizAnswer[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
}

const aktienTopics: TopicConfig[] = [
  {
    slug: 'a1',
    levelId: 'aktien',
    title: 'What are Stocks?',
    subtitle: 'Become a co-owner of companies',
    iconName: 'TrendUp',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText:
        'When you buy a stock, you own a small piece of a company. If the company\'s value rises, so does your stock — you directly benefit from its success.',
      secondaryText:
        'Companies sell stocks to raise money for growth — instead of taking out a loan.',
    },
    visualKey: 'pizza',
    quiz: {
      question:
        'AlphaFirm AG\'s valuation rises this year. What happens to your stock?',
      answers: [
        { id: 'a', text: 'Nothing — it doesn\'t affect me' },
        { id: 'b', text: 'It becomes more valuable' },
        { id: 'c', text: 'I have to pay more for it' },
        { id: 'd', text: 'The stock disappears' },
      ],
      correctId: 'b',
      correctFeedback:
        'Correct! You\'re a co-owner — when the company wins, your piece wins too.',
      wrongFeedback:
        'Almost! You\'re a co-owner of the company — its success is your success too.',
    },
  },
  {
    slug: 'a2',
    levelId: 'aktien',
    title: 'How do Returns Arise?',
    subtitle: 'Why stocks grow long-term',
    iconName: 'TrendUp',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText:
        'A return is the profit you make from your investment. With stocks, it comes in two ways: the stock price rises — or the company regularly pays you a share of its profits, called a dividend.',
      secondaryText:
        'Historically, stocks have almost always gained value over the long term — because companies grow.',
    },
    visualKey: 'scale',
    quiz: {
      question:
        'A well-known company announces a revolutionary new product. What likely happens to the stock price?',
      answers: [
        { id: 'a', text: 'It falls — the company spent money on development' },
        { id: 'b', text: 'It stays the same — products don\'t change anything' },
        { id: 'c', text: 'It rises — more people want to buy the stock' },
        { id: 'd', text: 'The exchange closes temporarily' },
      ],
      correctId: 'c',
      correctFeedback:
        'Exactly! Good news creates more demand — and more demand drives the price up.',
      wrongFeedback:
        'Almost! Good news means more buyers. More buyers = higher price. That\'s how the market reacts every day.',
    },
  },
  {
    slug: 'a3',
    levelId: 'aktien',
    title: 'Risk and Volatility',
    subtitle: 'Why fluctuations are normal',
    iconName: 'Warning',
    iconColor: 'hsl(35, 95%, 50%)',
    iconBgColor: 'hsl(35, 95%, 55% / 0.12)',
    explanation: {
      mainText:
        'Stocks can rise in value — but also fall. These fluctuations are called volatility. The greater the potential return, the greater the risk usually is. This isn\'t a flaw — it\'s how stocks work.',
      secondaryText:
        'A young startup stock can double or fall to zero. A large established company fluctuates much more calmly.',
    },
    visualKey: 'riskCharts',
    quiz: {
      question:
        'You need your money back with certainty in exactly 1 year. Which stock do you choose?',
      answers: [
        { id: 'a', text: 'RocketStartup AG — could double' },
        { id: 'b', text: 'StableBank AG — steady performance' },
        { id: 'c', text: 'Both, half each' },
        { id: 'd', text: 'Better not to invest at all' },
      ],
      correctId: 'b',
      correctFeedback:
        'Perfect! When you need the money soon, stability matters more than maximum upside. RocketStartup could be down -60% in a year.',
      wrongFeedback:
        'Careful — RocketStartup could be at -60% in a year. High risk also means high loss potential, especially short-term.',
    },
  },
  {
    slug: 'a5',
    levelId: 'aktien',
    title: 'Diversification',
    subtitle: 'Don\'t put all your eggs in one basket',
    iconName: 'ChartPie',
    iconColor: 'hsl(var(--primary))',
    iconBgColor: 'hsl(var(--primary) / 0.12)',
    explanation: {
      mainText:
        'If you invest everything in a single stock, you depend entirely on that one company. If you spread your money across many different stocks from various sectors, your risk drops significantly — because they don\'t all fall at the same time.',
      secondaryText:
        'Diversification is the only "free" risk reduction that exists.',
    },
    visualKey: 'crash',
    quiz: {
      question:
        'Which portfolio survives a severe crash in the tech sector best?',
      answers: [
        { id: 'a', text: '100% Apple stock' },
        { id: 'b', text: '50% Apple, 50% Microsoft' },
        { id: 'c', text: '20% each in Tech, Healthcare, Energy, Consumer & Finance' },
        { id: 'd', text: 'Sell all stocks and wait' },
      ],
      correctId: 'c',
      correctFeedback:
        'Exactly! Apple and Microsoft fall together when tech crashes — that\'s not real diversification. Different sectors react differently to crises.',
      wrongFeedback:
        'Watch out! Apple and Microsoft are both tech stocks — they usually fall together. Real diversification means different sectors, not just different company names.',
    },
  },
  {
    slug: 'a6',
    levelId: 'aktien',
    title: 'Time Horizon & Patience',
    subtitle: 'Your greatest advantage as an investor',
    iconName: 'Clock',
    iconColor: 'hsl(var(--primary))',
    iconBgColor: 'hsl(var(--primary) / 0.12)',
    explanation: {
      mainText:
        'Stocks fluctuate daily — sometimes sharply. But the longer you stay invested, the more these fluctuations even out. Historically, broadly diversified portfolios have almost always delivered positive returns over long periods.',
      secondaryText:
        'Time in the market almost always beats timing the market.',
    },
    visualKey: 'timeChart',
    quiz: {
      question:
        'The market just crashed by 30%. You don\'t need the money for 15 years. What do you do?',
      answers: [
        { id: 'a', text: 'Sell everything immediately — before it gets worse' },
        { id: 'b', text: 'Stay invested and wait patiently' },
        { id: 'c', text: 'Buy even more on credit' },
        { id: 'd', text: 'Convert everything to gold' },
      ],
      correctId: 'b',
      correctFeedback:
        'Perfect! Losses only become real when you sell. Those who think long-term and stay in recover with the market — history shows this time and again.',
      wrongFeedback:
        'That\'s the most expensive mistake investors make — panic selling locks in the loss. With a 15-year horizon, the market has almost always had time to recover.',
    },
  },
];

export const topicsByLevel: Record<string, TopicConfig[]> = {
  aktien: aktienTopics,
};

export function getTopic(levelId: string, slug: string): TopicConfig | undefined {
  return topicsByLevel[levelId]?.find((t) => t.slug === slug);
}

export function getTopicsForLevel(levelId: string): TopicConfig[] {
  return topicsByLevel[levelId] ?? [];
}
