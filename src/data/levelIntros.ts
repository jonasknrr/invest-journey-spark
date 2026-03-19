import {
  FiLock,
  FiDollarSign,
  FiTrendingUp,
  FiBarChart2,
  FiLayers,
  FiFileText,
  FiCalendar,
  FiShield,
  FiClock,
  FiSun,
  FiPercent,
  FiArrowUp,
  FiAlertTriangle,
  FiSliders,
} from 'react-icons/fi';
import { IconType } from 'react-icons';

export interface IntroFact {
  icon: IconType;
  label: string;
  text: string;
  color: string;
}

export interface LevelIntro {
  introTitle: string;
  introSubtitle: string;
  introText: string;
  introFacts: IntroFact[];
  introTip: string;
  accentColor: string;
  heroIcon: IconType;
}

export const levelIntros: Record<string, LevelIntro> = {
  'chapter-1': {
    introTitle: 'Liquidity Planning',
    introSubtitle: 'Your first simulation',
    introText:
      'Distribute 10,000 CHF across call money and fixed deposits. Keep your emergency fund flexible, secure your planned expense and maximise the return on the rest.',
    heroIcon: FiLock,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: FiShield,
        label: 'Emergency fund',
        text: '2,000 CHF must be available immediately at all times — in call money.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: FiCalendar,
        label: 'Training course',
        text: 'In 2 years you need 3,000 CHF — the money must be free in time.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: FiPercent,
        label: 'Return',
        text: 'The remaining money should be invested at the highest possible interest rate.',
        color: 'hsl(var(--level-currencies))',
      },
      {
        icon: FiClock,
        label: 'Terms',
        text: 'Fixed deposits with longer terms yield more interest — but you can\'t access the money.',
        color: 'hsl(var(--level-crypto))',
      },
    ],
    introTip:
      'Tip: Don\'t put everything in call money — it earns little interest. Use the different terms strategically!',
  },
  festgeld: {
    introTitle: 'What is Fixed Deposit?',
    introSubtitle: 'Your safe start into investing',
    introText:
      'With a fixed deposit, you invest your money at a bank for a fixed period. In return, you get a guaranteed interest rate — no matter what happens in the markets.',
    heroIcon: FiLock,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: FiShield,
        label: 'Safety',
        text: 'Your money is protected up to 100,000 CHF by deposit insurance.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: FiCalendar,
        label: 'Term',
        text: 'You choose how long your money is invested — e.g. 6, 12 or 24 months.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: FiPercent,
        label: 'Return',
        text: 'The interest rate is fixed, but usually lower than for riskier investments.',
        color: 'hsl(var(--level-currencies))',
      },
      {
        icon: FiClock,
        label: 'Flexibility',
        text: 'During the term, you generally cannot access your money.',
        color: 'hsl(var(--level-crypto))',
      },
    ],
    introTip:
      'Fixed deposits are especially good when you have money you definitely won\'t need in the coming months. You get predictable interest — stress-free.',
  },
  tagesgeld: {
    introTitle: 'What is Call Money?',
    introSubtitle: 'Flexible and available anytime',
    introText:
      'Call money is like a savings account you can access at any time. The interest rate can change, but your money is always available.',
    heroIcon: FiDollarSign,
    accentColor: 'var(--level-tagesgeld)',
    introFacts: [
      {
        icon: FiShield,
        label: 'Safety',
        text: 'Also protected by deposit insurance up to 100,000 CHF.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: FiArrowUp,
        label: 'Availability',
        text: 'You can withdraw your money at any time — no waiting.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: FiPercent,
        label: 'Interest',
        text: 'The interest rate is variable and can change at any time.',
        color: 'hsl(var(--level-currencies))',
      },
      {
        icon: FiSun,
        label: 'Ideal for',
        text: 'Your emergency fund or money you might need soon.',
        color: 'hsl(var(--level-crypto))',
      },
    ],
    introTip:
      'Call money is perfect for your emergency fund — always available, safe and still earning a little interest.',
  },
  aktien: {
    introTitle: 'What are Stocks?',
    introSubtitle: 'Become a co-owner of companies',
    introText:
      'When you buy a stock, you own a small piece of a company. If the company\'s value rises, so does your stock.',
    heroIcon: FiTrendingUp,
    accentColor: 'var(--level-aktien)',
    introFacts: [
      {
        icon: FiTrendingUp,
        label: 'Return potential',
        text: 'Stocks offer the highest long-term return potential of all asset classes.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: FiAlertTriangle,
        label: 'Risk',
        text: 'Prices fluctuate — you can also make losses in the short term.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: FiDollarSign,
        label: 'Dividends',
        text: 'Some companies regularly distribute profits to you.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: FiClock,
        label: 'Time horizon',
        text: 'Best for money you won\'t need for 5+ years.',
        color: 'hsl(var(--level-crypto))',
      },
    ],
    introTip:
      'Stocks are not a sprint, but a marathon. Those who stay patient are usually rewarded in the long run.',
  },
  anleihen: {
    introTitle: 'What are Bonds?',
    introSubtitle: 'Lend money, earn interest',
    introText:
      'With a bond, you lend money to a government or company. In return, you receive regular interest payments and get your money back at the end.',
    heroIcon: FiFileText,
    accentColor: 'var(--level-anleihen)',
    introFacts: [
      {
        icon: FiSliders,
        label: 'Stability',
        text: 'Bonds fluctuate less than stocks — especially government bonds.',
        color: 'hsl(var(--level-anleihen))',
      },
      {
        icon: FiPercent,
        label: 'Fixed interest',
        text: 'You know in advance how much interest you\'ll receive.',
        color: 'hsl(var(--level-currencies))',
      },
      {
        icon: FiAlertTriangle,
        label: 'Risk',
        text: 'With corporate bonds, there is a risk of default.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: FiSun,
        label: 'Good to know',
        text: 'Bonds and stocks often move in opposite directions — ideal for hedging.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'Bonds are like a calm anchor in your portfolio — less return, but fewer surprises.',
  },
  currencies: {
    introTitle: 'What are Currencies?',
    introSubtitle: 'Understanding the world of money',
    introText:
      'Currencies like Euro, Dollar or Yen constantly change in value relative to each other. This affects your investments — even without actively trading currencies.',
    heroIcon: FiBarChart2,
    accentColor: 'var(--level-currencies)',
    introFacts: [
      {
        icon: FiSliders,
        label: 'Exchange rates',
        text: 'The rate determines how much one currency is worth in another.',
        color: 'hsl(var(--level-currencies))',
      },
      {
        icon: FiAlertTriangle,
        label: 'Inflation',
        text: 'When inflation rises, your money loses purchasing power.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: FiTrendingUp,
        label: 'Impact',
        text: 'Currency fluctuations also affect your stocks and ETFs.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: FiSun,
        label: 'Tip',
        text: 'Diversification across different currency areas can reduce risk.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'You don\'t need to become a currency trader — but understanding how currencies work makes you a better investor.',
  },
  crypto: {
    introTitle: 'What are Cryptocurrencies?',
    introSubtitle: 'Exploring the digital frontier',
    introText:
      'Cryptocurrencies like Bitcoin are digital means of payment based on blockchain technology. They are decentralised, volatile and fascinating.',
    heroIcon: FiLayers,
    accentColor: 'var(--level-crypto)',
    introFacts: [
      {
        icon: FiTrendingUp,
        label: 'Opportunity',
        text: 'High return potential — but also extreme fluctuations.',
        color: 'hsl(var(--level-crypto))',
      },
      {
        icon: FiAlertTriangle,
        label: 'Risk',
        text: 'Prices can drop sharply within a few days.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: FiShield,
        label: 'Blockchain',
        text: 'Transactions are stored in a decentralised and transparent way.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: FiSun,
        label: 'For whom?',
        text: 'Only for money whose total loss you can completely handle.',
        color: 'hsl(var(--level-currencies))',
      },
    ],
    introTip:
      'Crypto is exciting but risky. Only invest what you\'re prepared to lose completely — and learn the basics first.',
  },
};
