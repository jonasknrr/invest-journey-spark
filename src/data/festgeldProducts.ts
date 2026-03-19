export interface FestgeldProduct {
  slug: string;
  title: string;
  durationYears: number;
  interestRate: number;
}

export const festgeldProducts: FestgeldProduct[] = [
  { slug: '1-jahr', title: '1 Year Fixed Deposit', durationYears: 1, interestRate: 1.5 },
  { slug: '2-jahre', title: '2 Year Fixed Deposit', durationYears: 2, interestRate: 2.0 },
  { slug: '5-jahre', title: '5 Year Fixed Deposit', durationYears: 5, interestRate: 3.0 },
];

export function getFestgeldProduct(slug: string): FestgeldProduct | undefined {
  return festgeldProducts.find((p) => p.slug === slug);
}
