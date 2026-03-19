import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import StorySlide from './lessonSlides/StorySlide';
import PizzaSlide from './lessonSlides/PizzaSlide';
import ScaleSlide from './lessonSlides/ScaleSlide';
import RiskChartSlide from './lessonSlides/RiskChartSlide';
import TimeChartSlide from './lessonSlides/TimeChartSlide';
import CrashSlide from './lessonSlides/CrashSlide';
import DividendSlide from './lessonSlides/DividendSlide';
import QuizSlide from './lessonSlides/QuizSlide';
import CompletionSlide from './lessonSlides/CompletionSlide';
import CashSortSlide from './lessonSlides/CashSortSlide';
import EmergencyFundSlide from './lessonSlides/EmergencyFundSlide';
import RealInterestSlide from './lessonSlides/RealInterestSlide';
import DepositProtectionSlide from './lessonSlides/DepositProtectionSlide';
import OpportunityCostSlide from './lessonSlides/OpportunityCostSlide';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const TOTAL_STEPS = 6;

interface QuizConfig {
  label: string;
  question: string;
  answers: { id: string; text: string }[];
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
}

interface LessonConfig {
  story: { emoji: string; title: string; mainText: string; secondaryText: string };
  interactionType: 'pizza' | 'scale' | 'riskChart' | 'timeChart' | 'crash' | 'dividend' | 'cashSort' | 'emergencyFund' | 'realInterest' | 'depositProtection' | 'opportunityCost';
  quiz1: QuizConfig;
  quiz2: QuizConfig;
  quiz3: QuizConfig;
  completionSubtitle: string;
}

const lessonConfigs: Record<string, LessonConfig> = {
  f1: {
    story: {
      emoji: '💵',
      title: 'Cash is king — but what exactly is cash?',
      mainText: 'Cash is everything you can spend immediately — banknotes in your pocket, money in your account, or in a savings book. It\'s the most liquid form of money: always available, always safe.',
      secondaryText: 'Cash equivalents are nearly as safe — short-term investments you can quickly convert to cash, like a call money account.',
    },
    interactionType: 'cashSort',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'You need CHF 500 tomorrow morning for an urgent repair. Which option helps you fastest?',
      answers: [
        { id: 'a', text: 'Sell your stocks' },
        { id: 'b', text: 'Sell your property' },
        { id: 'c', text: 'Withdraw money from your checking account' },
        { id: 'd', text: 'Break your fixed deposit early' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! The checking account is instantly available — no waiting, no fees, no risk.',
      wrongFeedback: 'Close! Stocks, property and fixed deposits require time or come with costs. Cash in your account is available right away.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'What distinguishes cash from a stock?',
      answers: [
        { id: 'a', text: 'Cash generates more return than stocks' },
        { id: 'b', text: 'Cash is always instantly available and doesn\'t suddenly lose significant value' },
        { id: 'c', text: 'Stocks are safer than cash' },
        { id: 'd', text: 'There is no significant difference' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Cash is stable and instantly available — stocks can fluctuate significantly and take time to sell.',
      wrongFeedback: 'Not quite — cash doesn\'t shine through returns, but through safety and instant availability. That\'s its greatest advantage.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'In financial terms, what is considered the most liquid asset you can own?',
      answers: [
        { id: 'a', text: 'Real estate' },
        { id: 'b', text: 'Cash' },
        { id: 'c', text: 'Gold' },
        { id: 'd', text: 'Stock index funds' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Cash is the most liquid asset — it\'s immediately available with no conversion needed.',
      wrongFeedback: 'Cash is the ultimate liquid asset. Real estate, gold, and even stocks need to be sold first — that takes time and may cost fees.',
    },
    completionSubtitle: 'You now know what cash and cash equivalents are — and why the difference to stocks or real estate matters in everyday life.',
  },
  f3: {
    story: {
      emoji: '💧',
      title: 'Why availability matters',
      mainText: 'Liquidity describes how quickly and easily you can convert an asset into cash without significant loss. Cash in your checking account is perfectly liquid — you can spend it right now. A house is very illiquid — selling it takes months.',
      secondaryText: 'In investing, liquidity is a crucial factor. The more liquid an asset, the faster you can react to opportunities or emergencies.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'Which of these assets has the highest liquidity?',
      answers: [
        { id: 'a', text: 'A rental property' },
        { id: 'b', text: 'A vintage car collection' },
        { id: 'c', text: 'Money in a call money account' },
        { id: 'd', text: 'A 5-year fixed deposit' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! Call money accounts let you access your funds immediately — that\'s high liquidity.',
      wrongFeedback: 'Call money is the most liquid option here. Property and cars take weeks or months to sell; fixed deposits lock your money.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'Why might an investor accept lower returns for higher liquidity?',
      answers: [
        { id: 'a', text: 'They enjoy losing money' },
        { id: 'b', text: 'They want to be able to access their money quickly in case of emergencies' },
        { id: 'c', text: 'Liquid assets always outperform over time' },
        { id: 'd', text: 'Banks force them to' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Liquidity is like insurance — you accept lower returns for the flexibility to access your money when you need it.',
      wrongFeedback: 'High liquidity means quick access. That flexibility is valuable — especially for emergencies or unexpected opportunities.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'In a balanced investment portfolio, what is the primary function of assets with very high liquidity?',
      answers: [
        { id: 'a', text: 'To maximize your long-term returns' },
        { id: 'b', text: 'To provide a hedge against stock market crashes' },
        { id: 'c', text: 'To be immediately available to cover short-term or unexpected expenses' },
        { id: 'd', text: 'To generate a high annual income through interest' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! Highly liquid assets are your financial buffer — ready for life\'s surprises without having to sell long-term investments.',
      wrongFeedback: 'Liquid assets serve as your safety net for the unexpected. They\'re not about maximizing returns — they\'re about access when you need it.',
    },
    completionSubtitle: 'You now understand liquidity — why availability is just as important as returns.',
  },
  f4: {
    story: {
      emoji: '🏦',
      title: 'Flexible saving with returns',
      mainText: 'A call money account (Tagesgeld) offers you interest on your savings while keeping your money fully accessible. Unlike a fixed deposit, you can withdraw anytime without penalty. The trade-off? The interest rate is usually lower and can change.',
      secondaryText: 'Think of it as a savings account that actually pays you — flexible, safe, and liquid.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What makes a call money account different from a fixed deposit?',
      answers: [
        { id: 'a', text: 'Call money always has higher interest rates' },
        { id: 'b', text: 'You can access your money at any time without penalty' },
        { id: 'c', text: 'Fixed deposits are more liquid' },
        { id: 'd', text: 'There is no difference' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! The key advantage of call money is instant access — your money isn\'t locked up.',
      wrongFeedback: 'The main difference is flexibility. Call money = instant access. Fixed deposit = locked for a term, usually with higher interest.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'What is a typical risk of a call money account?',
      answers: [
        { id: 'a', text: 'You can lose your principal' },
        { id: 'b', text: 'The interest rate can change at any time' },
        { id: 'c', text: 'Your money is locked for 1 year' },
        { id: 'd', text: 'It\'s not covered by deposit protection' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Call money rates are variable — the bank can lower them at any time. Your principal is safe, though.',
      wrongFeedback: 'The main risk isn\'t losing money — it\'s that the interest rate can be adjusted by the bank at any time.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'What is a primary advantage of a Call Money Account over a Fixed Deposit Account?',
      answers: [
        { id: 'a', text: 'Higher guaranteed interest rates' },
        { id: 'b', text: 'Immediate access to your funds without penalty' },
        { id: 'c', text: 'Automatic protection against high inflation' },
        { id: 'd', text: 'Direct investment in individual stocks' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Call money gives you full flexibility — withdraw anytime, no penalty, no waiting period.',
      wrongFeedback: 'The biggest advantage is liquidity. Unlike a fixed deposit where your money is locked, call money lets you access funds immediately.',
    },
    completionSubtitle: 'You now know how call money accounts work — flexible, safe, and always accessible.',
  },
  f5: {
    story: {
      emoji: '🔒',
      title: 'More interest, less flexibility',
      mainText: 'A fixed deposit (Festgeld) locks your money for a set period — typically 3 months to several years. In exchange, you get a guaranteed, usually higher interest rate that won\'t change during the term. The trade-off is clear: you can\'t access your money early without penalties.',
      secondaryText: 'Fixed deposits are ideal for money you know you won\'t need for a specific time period.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'Why do fixed deposits typically offer higher interest than call money accounts?',
      answers: [
        { id: 'a', text: 'Because they are riskier investments' },
        { id: 'b', text: 'Because you lock your capital for a specific term, reducing your liquidity' },
        { id: 'c', text: 'Because the government subsidizes them' },
        { id: 'd', text: 'Because they invest your money in stocks' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! The bank can plan with your money for longer — and rewards you with a higher rate for giving up flexibility.',
      wrongFeedback: 'The higher rate compensates you for locking up your money. The bank can use it for longer-term lending, so they pay you more.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'What happens if you need your money back before the fixed deposit matures?',
      answers: [
        { id: 'a', text: 'You simply withdraw it, no problem' },
        { id: 'b', text: 'You typically face penalties or may not be able to access it at all' },
        { id: 'c', text: 'The bank doubles your interest rate' },
        { id: 'd', text: 'The government refunds you' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Early withdrawal usually means penalties — that\'s the trade-off for the higher interest rate.',
      wrongFeedback: 'Fixed deposits lock your money. Breaking the term early typically costs you — either in penalties or lost interest.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'Why do Fixed Deposit Accounts typically offer a higher interest rate than Call Money Accounts?',
      answers: [
        { id: 'a', text: 'Because they are backed by more secure assets' },
        { id: 'b', text: 'Because the bank wants to incentivize you to spend your money' },
        { id: 'c', text: 'Because you must lock your capital up for a specific term, reducing your liquidity' },
        { id: 'd', text: 'Because they are fully protected against inflation' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! You sacrifice liquidity for a guaranteed higher return — the bank rewards you for committing your money for a fixed term.',
      wrongFeedback: 'The higher rate compensates for reduced flexibility. You\'re giving the bank certainty about how long they can use your funds.',
    },
    completionSubtitle: 'You now understand fixed deposits — higher returns in exchange for locked liquidity.',
  },
  f6: {
    story: {
      emoji: '🐷',
      title: 'The Emergency Fund',
      mainText: 'Think of your emergency fund as your financial safety net. It\'s a dedicated stack of cash that you use only for significant, unexpected life events like a sudden job loss or a major car repair. By having this cushion, typically recommended to cover 3 to 6 months of your essential living expenses, you prevent yourself from having to go into debt or sell off long-term investments during a crisis.',
      secondaryText: 'It should always be kept in an incredibly secure and instantly available account.',
    },
    interactionType: 'emergencyFund',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What is the typical recommended size for an emergency fund?',
      answers: [
        { id: 'a', text: '1 month of savings' },
        { id: 'b', text: '3 to 6 months of essential living expenses' },
        { id: 'c', text: '12 months of total income' },
        { id: 'd', text: 'Enough money for a vacation' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! 3–6 months of essential expenses gives you a solid buffer for most emergencies without over-allocating to cash.',
      wrongFeedback: '3 to 6 months of essential living expenses is the widely recommended target — enough to cover most emergencies without over-saving in low-return accounts.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'Where is the best place to store an emergency fund?',
      answers: [
        { id: 'a', text: 'Under your mattress' },
        { id: 'b', text: 'In a standard checking account' },
        { id: 'c', text: 'In a highly liquid and secure account (e.g., call money account)' },
        { id: 'd', text: 'Invested in a tech stock ETF' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! A call money account gives you instant access while still earning some interest — perfect for an emergency fund.',
      wrongFeedback: 'Your emergency fund needs two things: instant access and safety. A call money account offers both, while still earning some interest.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'In a financial crisis, what is the least desirable asset to use to cover an emergency?',
      answers: [
        { id: 'a', text: 'Cash from a call money account' },
        { id: 'b', text: 'Funds from a 1-year term deposit (already at 11 months)' },
        { id: 'c', text: 'Money invested in a long-term stock portfolio' },
        { id: 'd', text: 'A paycheck you just received' },
      ],
      correctId: 'c',
      correctFeedback: 'Right! Selling long-term investments during a crisis often means selling at a loss — the worst time to liquidate. That\'s exactly why emergency funds exist.',
      wrongFeedback: 'Selling stocks during a crisis typically means selling at low prices — locking in losses. Emergency funds exist to prevent exactly this scenario.',
    },
    completionSubtitle: 'You now understand the emergency fund — your first line of defense against financial surprises.',
  },
  f7: {
    story: {
      emoji: '📊',
      title: 'Real Interest Rate vs. Nominal',
      mainText: 'It\'s easy to focus only on the interest rate your bank advertises, known as the nominal interest rate. This is the rate at which your money grows on paper. However, to understand how much purchasing power you are actually gaining or losing, you must subtract the inflation rate from the nominal rate. This resulting number is your real interest rate.',
      secondaryText: 'For example, if you earn 3% interest but inflation is 4%, you are still losing 1% in real purchasing power.',
    },
    interactionType: 'realInterest',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What is the nominal interest rate of an investment?',
      answers: [
        { id: 'a', text: 'The return after adjusting for inflation' },
        { id: 'b', text: 'The advertised interest rate at which your money grows on paper' },
        { id: 'c', text: 'The percentage of your investment eaten by taxes' },
        { id: 'd', text: 'The historical average return of the stock market' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! The nominal rate is the headline number — what the bank advertises. But it doesn\'t tell the full story.',
      wrongFeedback: 'The nominal rate is simply the advertised rate — the number the bank shows you. To know your real gain, you need to subtract inflation.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'How do you calculate your approximate real interest rate?',
      answers: [
        { id: 'a', text: 'Nominal Interest Rate + Inflation Rate' },
        { id: 'b', text: 'Nominal Interest Rate - Inflation Rate' },
        { id: 'c', text: 'Inflation Rate / Nominal Interest Rate' },
        { id: 'd', text: 'It is always equal to the nominal interest rate' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! Real rate ≈ Nominal − Inflation. Simple but powerful — this tells you what you\'re actually earning in purchasing power.',
      wrongFeedback: 'The formula is simple: Real ≈ Nominal − Inflation. This tells you whether your money is actually growing in real terms.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'A certificate of deposit offers 5% interest for 1 year. Inflation is 6%. If you invest, what is true about your purchasing power after one year?',
      answers: [
        { id: 'a', text: 'It has increased by 11%' },
        { id: 'b', text: 'It has increased by 1%' },
        { id: 'c', text: 'It has remained the same' },
        { id: 'd', text: 'It has decreased by 1%' },
      ],
      correctId: 'd',
      correctFeedback: 'Correct! 5% − 6% = −1%. Even though your account balance grew, your purchasing power actually decreased. That\'s the real interest rate at work.',
      wrongFeedback: '5% interest minus 6% inflation equals −1% real return. Your money grew on paper but bought less — purchasing power decreased.',
    },
    completionSubtitle: 'You now understand the difference between nominal and real returns — and why inflation matters for every investment.',
  },
  f8: {
    story: {
      emoji: '🛡️',
      title: 'Deposit Protection',
      mainText: 'You have learned that cash and cash equivalents are secure. But why? In many stable economies, this security is backed by statutory deposit protection schemes. These are legal guarantees that protect your money up to a certain limit per bank (often around 100,000 €/CHF in Europe) if the bank should ever fail and be unable to repay your deposits.',
      secondaryText: 'This is a critical factor that makes your bank account much safer than investing directly in the stock market.',
    },
    interactionType: 'depositProtection',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What is the typical limit per customer, per bank for statutory deposit protection in many European countries?',
      answers: [
        { id: 'a', text: '10,000 €/CHF' },
        { id: 'b', text: '50,000 €/CHF' },
        { id: 'c', text: '100,000 €/CHF' },
        { id: 'd', text: 'Unlimited' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! 100,000 €/CHF per customer, per bank is the standard limit in most European deposit protection schemes.',
      wrongFeedback: 'The standard protection limit in most European countries is 100,000 €/CHF per customer, per bank. Anything above that limit is at risk if the bank fails.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'What does statutory deposit protection typically cover?',
      answers: [
        { id: 'a', text: 'The full value of your stock investments' },
        { id: 'b', text: 'Losses in a volatile tech ETF' },
        { id: 'c', text: 'A legal guarantee to reimburse your deposits in the event of a bank failure, up to a certain limit' },
        { id: 'd', text: 'Any decrease in your account balance over time' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! It\'s specifically about bank deposits — not investments. If the bank fails, your savings (up to the limit) are guaranteed by law.',
      wrongFeedback: 'Deposit protection covers bank deposits only — not stocks, ETFs, or other investments. It\'s a legal guarantee against bank failure.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'Which of the following assets is NOT typically covered by statutory deposit protection schemes?',
      answers: [
        { id: 'a', text: 'A 1-year Fixed Deposit Account' },
        { id: 'b', text: 'Stocks held in a brokerage account' },
        { id: 'c', text: 'A standard call money account (Tagesgeld)' },
        { id: 'd', text: 'The money in your current account' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Stocks are not bank deposits — they\'re investments. Deposit protection only covers actual deposits like savings, call money, and fixed deposits.',
      wrongFeedback: 'Stocks are investments, not bank deposits. Deposit protection only covers actual deposits — like savings accounts, call money, and fixed deposits.',
    },
    completionSubtitle: 'You now understand deposit protection — the legal safety net that makes bank accounts uniquely secure.',
  },
  f9: {
    story: {
      emoji: '⚖️',
      title: 'Opportunity Cost',
      mainText: 'It\'s crucial to realize that even "doing nothing" with your money has a cost. This is the opportunity cost: the potential benefit or profit you miss by choosing one alternative over another. When you hold an excessive amount of cash, for example, your opportunity cost is the potentially higher long-term market return you are forgoing.',
      secondaryText: 'While cash is safe, its safety comes with the hidden cost of lost purchasing power and reduced wealth-building potential over time.',
    },
    interactionType: 'opportunityCost',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What is the primary idea behind the concept of opportunity cost?',
      answers: [
        { id: 'a', text: 'The cost of purchasing an expensive item' },
        { id: 'b', text: 'The interest paid to a bank on a loan' },
        { id: 'c', text: 'The potential benefit or return you miss out on by choosing one alternative over another' },
        { id: 'd', text: 'The difference between the highest and lowest price of a stock in a single day' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! Every financial decision has an alternative — the benefit you miss by not choosing that alternative is your opportunity cost.',
      wrongFeedback: 'Opportunity cost is about what you give up. Every choice means not choosing something else — the potential benefit of that unchosen path is the cost.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'If you hold all your savings in cash and miss out on a historical 7% long-term market return, what is this called?',
      answers: [
        { id: 'a', text: 'Inflation cost' },
        { id: 'b', text: 'Risk cost' },
        { id: 'c', text: 'A bank fee' },
        { id: 'd', text: 'An opportunity cost' },
      ],
      correctId: 'd',
      correctFeedback: 'Exactly! The 7% you could have earned but didn\'t is a textbook example of opportunity cost — the price of choosing safety over growth.',
      wrongFeedback: 'Missing out on potential returns because you chose a different path is an opportunity cost. It\'s not a fee or a loss — it\'s a missed gain.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'In what situation can understanding opportunity cost be most helpful?',
      answers: [
        { id: 'a', text: 'When deciding between two identical bank accounts' },
        { id: 'b', text: 'When tracking your monthly expenses' },
        { id: 'c', text: 'When evaluating the trade-off between the high liquidity of a savings account and the higher potential return of a long-term ETF' },
        { id: 'd', text: 'When calculating your final real return after inflation' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! This is exactly the kind of trade-off where opportunity cost thinking shines — weighing safety and access against growth potential.',
      wrongFeedback: 'Opportunity cost is most useful when comparing fundamentally different options — like the safety of cash vs. the growth potential of investing.',
    },
    completionSubtitle: 'You now understand opportunity cost — the hidden price of every financial decision you make.',
  },
  a1: {
    story: {
      emoji: '🏢',
      title: 'Imagine buying a piece of your favourite company',
      mainText: 'When you buy a stock, you own a small piece of a company. If the company grows in value, so does your stock — you directly benefit from its success.',
      secondaryText: 'Companies sell stocks to raise money for growth — instead of taking out a loan.',
    },
    interactionType: 'pizza',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What happens when you buy a stock?',
      answers: [
        { id: 'a', text: 'You lend the company money' },
        { id: 'b', text: 'You become a co-owner of the company' },
        { id: 'c', text: 'You receive a fixed monthly payment' },
        { id: 'd', text: 'The company belongs entirely to you' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! As a shareholder you\'re a co-owner — the company\'s success is also your success.',
      wrongFeedback: 'Close! A stock makes you a co-owner — not a creditor or sole owner.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'AlphaFirma AG\'s valuation rises this year. What happens to your stock?',
      answers: [
        { id: 'a', text: 'Nothing — that doesn\'t affect me' },
        { id: 'b', text: 'It becomes more valuable' },
        { id: 'c', text: 'I have to pay more for it' },
        { id: 'd', text: 'The stock disappears' },
      ],
      correctId: 'b',
      correctFeedback: 'Exactly! The company\'s valuation rises, and so does your share — you directly benefit as a co-owner.',
      wrongFeedback: 'Close! You\'re a co-owner — their gain is also your gain. The price rises when the company does well.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'Why do companies sell stocks to the public?',
      answers: [
        { id: 'a', text: 'Because the government requires them to' },
        { id: 'b', text: 'To raise capital for growth without taking on debt' },
        { id: 'c', text: 'To give away ownership for free' },
        { id: 'd', text: 'To reduce their stock price' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Selling stocks is like a financing round — the company gets capital, buyers get ownership.',
      wrongFeedback: 'Companies sell stocks voluntarily to raise capital — as an alternative to bank loans. Buyers become co-owners in return.',
    },
    completionSubtitle: 'You now know what a stock is and why it makes you a co-owner of a company.',
  },
  a2: {
    story: {
      emoji: '📈',
      title: 'Your money works for you',
      mainText: 'A return is the profit you make on your investment. With stocks, it comes in two ways: the stock price rises — or the company regularly pays you part of its profits, called a dividend.',
      secondaryText: 'Historically, stocks have almost always gained value over the long term — because companies grow.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'How is the price of a stock determined?',
      answers: [
        { id: 'a', text: 'The company sets it' },
        { id: 'b', text: 'The government determines it' },
        { id: 'c', text: 'Supply and demand from buyers and sellers' },
        { id: 'd', text: 'It always stays the same' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! Millions of transactions every second determine the price — nobody sets it alone.',
      wrongFeedback: 'Not quite — no single entity determines the price. It\'s created by the interplay of buyers and sellers.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'A well-known company announces a revolutionary new product. What likely happens to the stock price?',
      answers: [
        { id: 'a', text: 'It drops — the company spent money' },
        { id: 'b', text: 'It stays the same' },
        { id: 'c', text: 'It rises — more people want to buy the stock' },
        { id: 'd', text: 'The exchange closes' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Good news creates more demand — and more demand drives the price up.',
      wrongFeedback: 'Close! Good news means more buyers. More buyers = higher price. That\'s how the market reacts every day.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'What are the two main ways stocks generate returns for investors?',
      answers: [
        { id: 'a', text: 'Interest payments and tax refunds' },
        { id: 'b', text: 'Price appreciation and dividends' },
        { id: 'c', text: 'Bonuses and salary increases' },
        { id: 'd', text: 'Reduced fees and bank credits' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Price going up + dividends = the two engines of stock returns.',
      wrongFeedback: 'Stocks generate returns through price appreciation (the stock becomes worth more) and dividends (the company shares its profits).',
    },
    completionSubtitle: 'You now understand how returns are generated and why a stock\'s price constantly fluctuates.',
  },
  a3: {
    story: {
      emoji: '⚠️',
      title: 'Higher potential — but also higher risk',
      mainText: 'Stocks can rise in value — but also fall. These fluctuations are called volatility. The greater the potential return, the greater the risk usually is.',
      secondaryText: 'A young startup stock can double or go to zero. A large established company fluctuates much more steadily.',
    },
    interactionType: 'riskChart',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What does high volatility mean for a stock?',
      answers: [
        { id: 'a', text: 'The stock always rises' },
        { id: 'b', text: 'The price fluctuates strongly — up and down' },
        { id: 'c', text: 'The stock is very safe' },
        { id: 'd', text: 'The company pays high dividends' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Volatility means strong fluctuations — it can be an opportunity or a risk, depending on timing.',
      wrongFeedback: 'Not quite — volatility describes how strongly a price fluctuates, not whether it rises or falls.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'You need your money back in exactly 1 year. Which stock do you choose?',
      answers: [
        { id: 'a', text: 'RocketStartup AG — could double' },
        { id: 'b', text: 'StableBank AG — steady trajectory' },
        { id: 'c', text: 'Both, half and half' },
        { id: 'd', text: 'Better not to invest at all' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfect! When you need the money soon, stability matters more than maximum upside.',
      wrongFeedback: 'Careful — RocketStartup could be at -60% in a year. High risk also means high potential for loss.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'What is the relationship between risk and potential return in investing?',
      answers: [
        { id: 'a', text: 'Higher risk always guarantees higher returns' },
        { id: 'b', text: 'Risk and return have no relationship' },
        { id: 'c', text: 'Higher potential returns usually come with higher risk' },
        { id: 'd', text: 'Lower risk always means higher returns' },
      ],
      correctId: 'c',
      correctFeedback: 'Correct! This is the fundamental trade-off in investing — more potential reward requires accepting more risk.',
      wrongFeedback: 'Higher risk doesn\'t guarantee higher returns, but higher potential returns almost always involve higher risk. It\'s a trade-off, not a guarantee.',
    },
    completionSubtitle: 'You now understand the difference between high-risk and stable stocks.',
  },
  a4: {
    story: {
      emoji: '💰',
      title: 'Earn money just by holding',
      mainText: 'Some companies regularly distribute part of their profits to shareholders — that\'s called a dividend. You don\'t need to sell anything, do nothing — just hold the stock and you automatically receive payouts.',
      secondaryText: 'Not all companies pay dividends — large, established companies do it more often than young growth companies.',
    },
    interactionType: 'dividend',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What is a dividend?',
      answers: [
        { id: 'a', text: 'A loan the company gives you' },
        { id: 'b', text: 'A portion of the company\'s profit paid to shareholders' },
        { id: 'c', text: 'The price you pay for a stock' },
        { id: 'd', text: 'A penalty when the price drops' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Dividends are your share of the company\'s profit — simply because you\'re a shareholder.',
      wrongFeedback: 'Close! A dividend is not a debt or a price — it\'s your share of the company\'s profit, paid simply because you hold the stock.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'You hold a stock that pays 4% dividend per year. What do you need to do to receive the dividend?',
      answers: [
        { id: 'a', text: 'Sell the stock at the right time' },
        { id: 'b', text: 'Buy more every month' },
        { id: 'c', text: 'Nothing — just hold the stock' },
        { id: 'd', text: 'Ask the company for a payout' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Dividends are paid automatically — you just need to be a shareholder and hold the stock.',
      wrongFeedback: 'Close! You don\'t need to do anything — dividends are automatically paid to all shareholders, simply by holding the stock.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'Why do growth companies like Tesla or Amazon often NOT pay dividends?',
      answers: [
        { id: 'a', text: 'Because they\'re not profitable' },
        { id: 'b', text: 'Because they reinvest all profits back into the company to grow faster' },
        { id: 'c', text: 'Because the government doesn\'t allow it' },
        { id: 'd', text: 'Because they don\'t have shareholders' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Growth companies prefer to reinvest profits into expansion rather than distributing them as dividends.',
      wrongFeedback: 'Growth companies choose to reinvest their profits to fuel expansion rather than paying them out — shareholders benefit from the rising stock price instead.',
    },
    completionSubtitle: 'You now know what dividends are and how passive income is generated simply by holding stocks.',
  },
  a6: {
    story: {
      emoji: '⏳',
      title: 'Time is your greatest advantage',
      mainText: 'Stocks fluctuate daily — sometimes strongly. But the longer you stay invested, the more these fluctuations even out. Historically, broadly diversified portfolios have almost always achieved positive returns over long periods.',
      secondaryText: 'Time in the market almost always beats timing the market.',
    },
    interactionType: 'timeChart',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'What does the AlphaIndex chart show over a period of 20 years?',
      answers: [
        { id: 'a', text: 'The price always fell' },
        { id: 'b', text: 'The price was always stable without fluctuations' },
        { id: 'c', text: 'Despite crashes, a long-term upward trend is visible' },
        { id: 'd', text: 'There was no change' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! In the short term the market is unpredictable — in the long term it tends upward.',
      wrongFeedback: 'Look at the 20-year chart again — despite significant crashes, a clear upward trend is visible.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'The market just crashed 30%. You don\'t need the money for 15 years. What do you do?',
      answers: [
        { id: 'a', text: 'Sell everything immediately — before it gets worse' },
        { id: 'b', text: 'Stay invested and wait patiently' },
        { id: 'c', text: 'Buy even more on credit' },
        { id: 'd', text: 'Convert everything to gold' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfect! Losses only become real when you sell. With a 15-year horizon, the market almost always has time to recover.',
      wrongFeedback: 'That\'s the most expensive mistake — panic selling realises the loss. Time is your greatest advantage as an investor.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'What does "time in the market beats timing the market" mean?',
      answers: [
        { id: 'a', text: 'You should trade stocks as fast as possible' },
        { id: 'b', text: 'Staying invested long-term is more effective than trying to predict perfect entry points' },
        { id: 'c', text: 'Markets only go up over time, never down' },
        { id: 'd', text: 'You should only invest when the market is at its lowest' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Consistent, long-term investing beats trying to time the perfect moment — because nobody can predict markets reliably.',
      wrongFeedback: 'It means that staying invested consistently outperforms trying to guess when to buy and sell. Nobody can time the market reliably.',
    },
    completionSubtitle: 'You now know why patience is one of the most important qualities of a good investor.',
  },
  a5: {
    story: {
      emoji: '🥚',
      title: 'Don\'t put all your eggs in one basket',
      mainText: 'If you invest everything in a single stock, you depend entirely on that one company. If you spread your money across many different stocks from different sectors, your risk decreases significantly — because they don\'t all fall at the same time.',
      secondaryText: 'Diversification is the only free risk reduction that exists.',
    },
    interactionType: 'crash',
    quiz1: {
      label: 'Question 1 of 3',
      question: 'Why does diversification protect your portfolio?',
      answers: [
        { id: 'a', text: 'Because you have more money' },
        { id: 'b', text: 'Because different sectors don\'t all fall at the same time' },
        { id: 'c', text: 'Because you receive more dividends' },
        { id: 'd', text: 'Because the market then becomes more stable' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! Different sectors react differently to crises — that reduces your overall risk.',
      wrongFeedback: 'Close! The key is that different sectors react independently — if one falls, others can remain stable.',
    },
    quiz2: {
      label: 'Question 2 of 3',
      question: 'Which portfolio survives a crash in the technology sector best?',
      answers: [
        { id: 'a', text: '100% Apple shares' },
        { id: 'b', text: '50% Apple, 50% Microsoft' },
        { id: 'c', text: '20% each in Tech, Healthcare, Energy, Consumer and Finance' },
        { id: 'd', text: 'Sell all stocks and wait' },
      ],
      correctId: 'c',
      correctFeedback: 'Exactly! Apple and Microsoft fall together when tech crashes — true diversification means different sectors.',
      wrongFeedback: 'Watch out! Apple and Microsoft are both tech stocks — they usually fall together. Different sectors are the key.',
    },
    quiz3: {
      label: 'Question 3 of 3',
      question: 'What is the simplest way for a beginner to achieve instant diversification?',
      answers: [
        { id: 'a', text: 'Buy 5 different tech stocks' },
        { id: 'b', text: 'Invest in a single broad market ETF like MSCI World' },
        { id: 'c', text: 'Put everything in gold' },
        { id: 'd', text: 'Buy the most expensive stock available' },
      ],
      correctId: 'b',
      correctFeedback: 'Correct! A single MSCI World ETF gives you exposure to over 1,500 companies across many sectors and countries — instant diversification.',
      wrongFeedback: 'A broad market ETF like MSCI World holds 1,500+ companies across sectors and countries — it\'s the easiest way to diversify with just one purchase.',
    },
    completionSubtitle: 'You now know how to significantly reduce your risk through diversification — without sacrificing returns.',
  },
};

const LessonFlow = () => {
  const { categoryId, lessonId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [noHeartsScreen, setNoHeartsScreen] = useState<'none' | 'showing'>('none');
  const [completionResult, setCompletionResult] = useState<{ xpEarned: number; streakBonus: number; isFirstCompletion: boolean; newStreak: number } | null>(null);
  const { completeLesson, updateLessonProgress } = useProgressStore();

  const config = lessonConfigs[lessonId ?? 'a1'] ?? lessonConfigs.a1;
  const lessonStoreId = `${categoryId}-${lessonId}`;

  useEffect(() => {
    if (currentStep === 0 || currentStep === 5) {
      setCanAdvance(true);
    }
  }, [currentStep]);

  useEffect(() => {
    updateLessonProgress(lessonStoreId, Math.min(currentStep / 5, 1));
  }, [currentStep]);

  useEffect(() => {
    if (hearts === 0) {
      setNoHeartsScreen('showing');
      try { navigator.vibrate?.([300, 100, 300]); } catch {}
    }
  }, [hearts]);

  useEffect(() => {
    if (currentStep === 5 && !completionResult) {
      const r = completeLesson(lessonStoreId, hearts);
      setCompletionResult(r);
    }
  }, [currentStep]);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const goBack = () => navigate(`/category/${categoryId}`);

  const handleNext = () => {
    if (!canAdvance) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCanAdvance(false);
      setCurrentStep(prev => prev + 1);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  const handleWrongAnswer = () => {
    setHearts(h => Math.max(0, h - 1));
  };

  const renderInteraction = () => {
    const onComplete = () => setCanAdvance(true);
    switch (config.interactionType) {
      case 'scale': return <ScaleSlide key="scale" onComplete={onComplete} />;
      case 'riskChart': return <RiskChartSlide key="riskChart" onComplete={onComplete} />;
      case 'timeChart': return <TimeChartSlide key="timeChart" onComplete={onComplete} />;
      case 'crash': return <CrashSlide key="crash" onComplete={onComplete} />;
      case 'dividend': return <DividendSlide key="dividend" onComplete={onComplete} />;
      case 'cashSort': return <CashSortSlide key="cashSort" onComplete={onComplete} />;
      case 'emergencyFund': return <EmergencyFundSlide key="emergencyFund" onComplete={onComplete} />;
      case 'realInterest': return <RealInterestSlide key="realInterest" onComplete={onComplete} />;
      case 'depositProtection': return <DepositProtectionSlide key="depositProtection" onComplete={onComplete} />;
      case 'opportunityCost': return <OpportunityCostSlide key="opportunityCost" onComplete={onComplete} />;
      default: return <PizzaSlide key="pizza" onComplete={onComplete} />;
    }
  };

  const getQuizForStep = (step: number) => {
    if (step === 2) return config.quiz1;
    if (step === 3) return config.quiz2;
    if (step === 4) return config.quiz3;
    return config.quiz1;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart key={i} className={`w-5 h-5 transition-all ${
              i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
            }`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <StorySlide
            key="story"
            emoji={config.story.emoji}
            title={config.story.title}
            mainText={config.story.mainText}
            secondaryText={config.story.secondaryText}
          />
        )}
        {currentStep === 1 && renderInteraction()}
        {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
          <QuizSlide
            key={`quiz${currentStep}`}
            label={getQuizForStep(currentStep).label}
            question={getQuizForStep(currentStep).question}
            answers={getQuizForStep(currentStep).answers}
            correctId={getQuizForStep(currentStep).correctId}
            correctFeedback={getQuizForStep(currentStep).correctFeedback}
            wrongFeedback={getQuizForStep(currentStep).wrongFeedback}
            onAnswered={() => setCanAdvance(true)}
            onWrongAnswer={handleWrongAnswer}
          />
        )}
        {currentStep === 5 && (
          <motion.div key="completion" className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Lesson complete!</h2>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-xs">{config.completionSubtitle}</p>
            <CompletionXP result={completionResult} hearts={hearts} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        {!(currentStep === 1 && !canAdvance) && (
          <motion.button
            onClick={handleNext}
            disabled={!canAdvance}
            whileTap={canAdvance ? { scale: 0.96 } : undefined}
            className={`w-full h-14 rounded-full font-display text-lg font-bold transition-opacity ${
              canAdvance
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {currentStep < TOTAL_STEPS - 1 ? 'Continue' : 'Finish'}
          </motion.button>
        )}
      </div>

      {/* No Hearts Overlay */}
      {noHeartsScreen === 'showing' && (
        <NoHeartsOverlay
          onRestart={() => { setCurrentStep(0); setHearts(3); setCanAdvance(false); setNoHeartsScreen('none'); }}
          onQuizOnly={() => { setCurrentStep(2); setHearts(3); setCanAdvance(false); setNoHeartsScreen('none'); }}
          onContinue={() => setNoHeartsScreen('none')}
        />
      )}
    </div>
  );
};

export default LessonFlow;
