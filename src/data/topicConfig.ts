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
  quizzes?: {
    question: string;
    answers: QuizAnswer[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  }[];
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
    quizzes: [
      {
        question: 'Du kaufst eine Aktie von BurgerBros AG. Was bist du jetzt?',
        answers: [
          { id: 'a', text: 'Ein Kunde von BurgerBros' },
          { id: 'b', text: 'Ein kleiner Miteigentümer von BurgerBros' },
          { id: 'c', text: 'Ein Mitarbeiter von BurgerBros' },
          { id: 'd', text: 'Der Chef von BurgerBros' },
        ],
        correctId: 'b',
        correctFeedback: 'Genau! Eine Aktie = ein kleines Stück des Unternehmens. Du bist jetzt Miteigentümer — egal wie klein der Anteil ist.',
        wrongFeedback: 'Eine Aktie ist ein Besitzanteil. Wer eine Aktie kauft, wird Miteigentümer — auch wenn es nur ein winziger Anteil ist.',
      },
      {
        question: 'Warum verkaufen Unternehmen überhaupt Aktien an andere Menschen?',
        answers: [
          { id: 'a', text: 'Weil sie dazu gesetzlich verpflichtet sind' },
          { id: 'b', text: 'Um Geld für Wachstum zu sammeln, ohne einen Kredit aufzunehmen' },
          { id: 'c', text: 'Um ihre Mitarbeiter zu bezahlen' },
          { id: 'd', text: 'Damit der Aktienkurs steigt' },
        ],
        correctId: 'b',
        correctFeedback: 'Richtig! Aktien ausgeben ist wie eine Finanzierungsrunde — das Unternehmen bekommt Kapital, die Käufer bekommen einen Anteil.',
        wrongFeedback: 'Unternehmen verkaufen Aktien freiwillig um Kapital zu sammeln — als Alternative zu einem Bankkredit. Die Käufer werden dafür Miteigentümer.',
      },
      {
        question: 'SolarMax AG verdoppelt ihren Gewinn dieses Jahr. Du hältst 10 Aktien. Was passiert wahrscheinlich?',
        answers: [
          { id: 'a', text: 'Nichts — Gewinne betreffen nur die Geschäftsführung' },
          { id: 'b', text: 'Du musst Steuern auf den Unternehmensgewinn zahlen' },
          { id: 'c', text: 'Der Wert deiner 10 Aktien steigt wahrscheinlich — du profitierst als Miteigentümer' },
          { id: 'd', text: 'Du bekommst automatisch 10 weitere Aktien gratis' },
        ],
        correctId: 'c',
        correctFeedback: 'Genau! Als Miteigentümer profitierst du vom Erfolg des Unternehmens — der Markt bewertet ein profitableres Unternehmen höher, also steigt der Aktienkurs.',
        wrongFeedback: 'Als Miteigentümer gehört dir ein Stück des Erfolgs. Wenn das Unternehmen mehr verdient, wird es am Markt höher bewertet — und deine Aktien werden mehr wert.',
      },
    ],
  },
  {
    slug: 'a2',
    levelId: 'aktien',
    title: 'How is the stock price determined?',
    subtitle: 'Why stocks grow long-term',
    iconName: 'TrendUp',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText: 'A stock price is simply what buyers and sellers agree on at any given moment. If more people want to buy a stock than sell it, the price rises. If more want to sell, it falls. Every trade is a negotiation between supply and demand.',
      secondaryText: 'News, company results, and even emotions move stock prices daily — but long-term, it\'s the company\'s actual growth that drives the direction.',
    },
    visualKey: 'scale',
    quiz: {
      question: 'A company announces record profits. What most likely happens to the stock price?',
      answers: [
        { id: 'a', text: 'It falls — the company has less money now' },
        { id: 'b', text: 'Nothing — profits don\'t affect the price' },
        { id: 'c', text: 'It rises — more people want to own a profitable company' },
        { id: 'd', text: 'The stock is suspended from trading' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Good news = more buyers. More buyers = higher price. The market reacts to new information almost instantly.',
      wrongFeedback: 'Record profits mean the company is doing well — more investors want a piece of it. More demand pushes the price up.',
    },
    quizzes: [
      {
        question: 'SpaceX goes public and everyone wants a piece. There are 10x more buyers than sellers. What happens to the price?',
        answers: [
          { id: 'a', text: 'It stays the same — supply and demand don\'t affect stocks' },
          { id: 'b', text: 'It rises — too many buyers push the price up' },
          { id: 'c', text: 'It falls — too many people buying scares the market' },
          { id: 'd', text: 'Trading gets suspended until it balances out' },
        ],
        correctId: 'b',
        correctFeedback: 'Correct! When demand exceeds supply, sellers can charge more. That\'s the entire mechanism behind rising stock prices.',
        wrongFeedback: 'Stock prices are set by supply and demand. More buyers than sellers = sellers can ask for more = price rises. Simple as that.',
      },
      {
        question: 'A news headline says: "CEO of MegaCorp resigns unexpectedly." What would you expect the stock to do immediately?',
        answers: [
          { id: 'a', text: 'Rise — the old CEO was probably holding it back' },
          { id: 'b', text: 'Fall — uncertainty makes investors nervous and they sell' },
          { id: 'c', text: 'Nothing — leadership changes don\'t affect stock prices' },
          { id: 'd', text: 'Rise — the company gets a fresh start' },
        ],
        correctId: 'b',
        correctFeedback: 'Right! Unexpected leadership changes create uncertainty. Nervous investors sell, which pushes the price down — at least until the situation becomes clearer.',
        wrongFeedback: 'Unexpected events create uncertainty, and markets hate uncertainty. Investors sell first and ask questions later — that\'s why sudden news usually drops a stock initially.',
      },
      {
        question: 'CleanEnergy AG has great technology but no profits yet. RealEstate AG earns stable profits every year but grows slowly. Which likely has a more volatile stock price?',
        answers: [
          { id: 'a', text: 'RealEstate AG — stable earnings cause more trading' },
          { id: 'b', text: 'CleanEnergy AG — no profits means the price depends entirely on future hopes' },
          { id: 'c', text: 'Both are equally volatile' },
          { id: 'd', text: 'Neither — volatility only comes from bad management' },
        ],
        correctId: 'b',
        correctFeedback: 'Spot on! Companies without profits are priced on hope and expectations. Any change in sentiment can swing the price dramatically. Profitable companies have an anchor — their actual earnings.',
        wrongFeedback: 'Without real profits, a stock\'s price is based purely on expectations about the future. That makes it extremely sensitive to news, mood, and speculation — far more volatile than a steady profit-maker.',
      },
    ],
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
    slug: 'a4',
    levelId: 'aktien',
    title: 'Dividends',
    subtitle: 'Earn money just by holding',
    iconName: 'Money',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText: 'Some companies regularly share part of their profits with shareholders — that\'s called a dividend. You don\'t need to sell anything, do nothing — just hold the stock and you automatically receive payouts.',
      secondaryText: 'Not all companies pay dividends — large established companies do it more often than young growth companies.',
    },
    visualKey: 'pizza',
    quiz: {
      question: 'You hold 50 shares of StableBank AG. They announce a dividend of €2 per share. What do you receive?',
      answers: [
        { id: 'a', text: 'Nothing — you have to sell first' },
        { id: 'b', text: '€100 — paid directly to you just for holding' },
        { id: 'c', text: '€2 total — shared between all shareholders' },
        { id: 'd', text: '50 additional shares' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! 50 shares × €2 per share = €100 paid to you automatically. No selling, no action required — just hold.',
      wrongFeedback: 'Dividends are paid per share. 50 shares × €2 = €100 goes straight to your account — just for being a shareholder.',
    },
    quizzes: [
      {
        question: 'Why do some companies pay dividends while others don\'t?',
        answers: [
          { id: 'a', text: 'All profitable companies are required to pay dividends by law' },
          { id: 'b', text: 'Mature companies with stable profits share them; young growth companies reinvest to grow faster' },
          { id: 'c', text: 'Only companies with more than 1,000 employees pay dividends' },
          { id: 'd', text: 'Companies pay dividends when their stock price is falling' },
        ],
        correctId: 'b',
        correctFeedback: 'Exactly right! A startup reinvesting every cent grows faster. An established company that already dominates its market rewards shareholders with regular cash instead.',
        wrongFeedback: 'Dividends are a choice. Young companies reinvest profits to grow. Mature companies with steady earnings often share profits with shareholders as dividends — it\'s a sign of financial stability.',
      },
      {
        question: 'You hold 100 shares of DividendKing AG worth €50 each. They pay a €1.50 dividend per share today. What happens to your total wealth?',
        answers: [
          { id: 'a', text: 'It increases by €150 — you now have the same shares plus €150 cash' },
          { id: 'b', text: 'It stays the same — the stock price usually drops by roughly the dividend amount on payout day' },
          { id: 'c', text: 'It doubles — dividends always double your money' },
          { id: 'd', text: 'It decreases — the company is giving away its value' },
        ],
        correctId: 'b',
        correctFeedback: 'This is the nuance! On dividend day, the stock price typically drops by roughly the dividend amount — the company\'s cash just moved to you. Total wealth stays similar, it just shifted form.',
        wrongFeedback: 'On dividend payout day, the stock price typically falls by roughly the dividend amount — because that cash has left the company. Your total wealth doesn\'t magically increase, it just shifts from stock value to cash.',
      },
      {
        question: 'Maria holds dividend stocks and reinvests every payout back into more shares. Tom takes the cash and spends it. After 20 years, who likely has more wealth from the same starting investment?',
        answers: [
          { id: 'a', text: 'Tom — having cash is always better than more shares' },
          { id: 'b', text: 'Maria — reinvesting dividends compounds growth dramatically over time' },
          { id: 'c', text: 'Both the same — dividends are just moving money around' },
          { id: 'd', text: 'Tom, if he invests the cash elsewhere' },
        ],
        correctId: 'b',
        correctFeedback: 'Maria wins by a wide margin! Reinvested dividends buy more shares, which earn more dividends, which buy even more shares. That\'s compounding — and 20 years of it creates a massive difference.',
        wrongFeedback: 'Reinvesting dividends is one of the most powerful wealth-building strategies. Each reinvested dividend buys more shares, which generates more dividends — a compounding cycle that grows dramatically over decades.',
      },
    ],
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
