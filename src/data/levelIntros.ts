import {
  Vault,
  Coins,
  TrendUp,
  ChartBar,
  Stack,
  Certificate,
  CalendarBlank,
  ShieldCheck,
  Clock,
  Lightbulb,
  Warning,
  Percent,
  ArrowUp,
  ChartLineUp,
  Scales,
  CurrencyDollar,
} from '@phosphor-icons/react';

export interface IntroFact {
  icon: React.ElementType;
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
  heroIcon: React.ElementType;
}

export const levelIntros: Record<string, LevelIntro> = {
  'chapter-1': {
    introTitle: 'Liquidity Planning',
    introSubtitle: 'Your first simulation',
    introText:
      'Distribute 10,000 CHF across call money and fixed deposits. Keep your emergency fund flexible, secure your planned expense and maximise the return on the rest.',
    heroIcon: Vault,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Emergency fund',
        text: '2,000 CHF must be available immediately at all times — in call money.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: CalendarBlank,
        label: 'Training course',
        text: 'In 2 years you need 3,000 CHF — the money must be free in time.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Percent,
        label: 'Return',
        text: 'The remaining money should be invested at the highest possible interest rate.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Clock,
        label: 'Terms',
        text: 'Fixed deposits with longer terms yield more interest — but you can\'t access the money.',
        color: 'hsl(var(--level-krypto))',
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
    heroIcon: Vault,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Safety',
        text: 'Your money is protected up to 100,000 CHF by deposit insurance.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: CalendarBlank,
        label: 'Term',
        text: 'You choose how long your money is invested — e.g. 6, 12 or 24 months.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Percent,
        label: 'Return',
        text: 'The interest rate is fixed, but usually lower than for riskier investments.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Clock,
        label: 'Flexibility',
        text: 'During the term, you generally cannot access your money.',
        color: 'hsl(var(--level-krypto))',
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
    heroIcon: Coins,
    accentColor: 'var(--level-tagesgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Safety',
        text: 'Also protected by deposit insurance up to 100,000 CHF.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: ArrowUp,
        label: 'Availability',
        text: 'You can withdraw your money at any time — no waiting.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: Percent,
        label: 'Interest',
        text: 'The interest rate is variable and can change at any time.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Lightbulb,
        label: 'Ideal for',
        text: 'Your emergency fund or money you might need soon.',
        color: 'hsl(var(--level-krypto))',
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
    heroIcon: TrendUp,
    accentColor: 'var(--level-aktien)',
    introFacts: [
      {
        icon: ChartLineUp,
        label: 'Return potential',
        text: 'Stocks offer the highest long-term return potential of all asset classes.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Warning,
        label: 'Risk',
        text: 'Prices fluctuate — you can also make losses in the short term.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: CurrencyDollar,
        label: 'Dividends',
        text: 'Some companies regularly distribute profits to you.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: Clock,
        label: 'Time horizon',
        text: 'Best for money you won\'t need for 5+ years.',
        color: 'hsl(var(--level-krypto))',
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
    heroIcon: Certificate,
    accentColor: 'var(--level-anleihen)',
    introFacts: [
      {
        icon: Scales,
        label: 'Stability',
        text: 'Bonds fluctuate less than stocks — especially government bonds.',
        color: 'hsl(var(--level-anleihen))',
      },
      {
        icon: Percent,
        label: 'Fixed interest',
        text: 'You know in advance how much interest you\'ll receive.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Warning,
        label: 'Risk',
        text: 'With corporate bonds, there is a risk of default.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: Lightbulb,
        label: 'Good to know',
        text: 'Bonds and stocks often move in opposite directions — ideal for hedging.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'Bonds are like a calm anchor in your portfolio — less return, but fewer surprises.',
  },
  waehrungen: {
    introTitle: 'What are Currencies?',
    introSubtitle: 'Understanding the world of money',
    introText:
      'Currencies like Euro, Dollar or Yen constantly change in value relative to each other. This affects your investments — even without actively trading currencies.',
    heroIcon: ChartBar,
    accentColor: 'var(--level-waehrungen)',
    introFacts: [
      {
        icon: Scales,
        label: 'Exchange rates',
        text: 'The rate determines how much one currency is worth in another.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Warning,
        label: 'Inflation',
        text: 'When inflation rises, your money loses purchasing power.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: ChartLineUp,
        label: 'Impact',
        text: 'Currency fluctuations also affect your stocks and ETFs.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Lightbulb,
        label: 'Tip',
        text: 'Diversification across different currency areas can reduce risk.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'You don\'t need to become a currency trader — but understanding how currencies work makes you a better investor.',
  },
  krypto: {
    introTitle: 'What are Cryptocurrencies?',
    introSubtitle: 'Exploring the digital frontier',
    introText:
      'Cryptocurrencies like Bitcoin are digital means of payment based on blockchain technology. They are decentralised, volatile and fascinating.',
    heroIcon: Stack,
    accentColor: 'var(--level-krypto)',
    introFacts: [
      {
        icon: ChartLineUp,
        label: 'Opportunity',
        text: 'High return potential — but also extreme fluctuations.',
        color: 'hsl(var(--level-krypto))',
      },
      {
        icon: Warning,
        label: 'Risk',
        text: 'Prices can drop sharply within a few days.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: ShieldCheck,
        label: 'Blockchain',
        text: 'Transactions are stored in a decentralised and transparent way.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Lightbulb,
        label: 'For whom?',
        text: 'Only for money whose total loss you can completely handle.',
        color: 'hsl(var(--level-waehrungen))',
      },
    ],
    introTip:
      'Crypto is exciting but risky. Only invest what you\'re prepared to lose completely — and learn the basics first.',
  },
};
