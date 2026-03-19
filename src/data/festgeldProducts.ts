export interface FestgeldProduct {
  slug: string;
  title: string;
  durationYears: number;
  interestRate: number;
}

export const festgeldProducts: FestgeldProduct[] = [
  { slug: '1-jahr', title: '1 Jahr Festgeld', durationYears: 1, interestRate: 0.5 },
  { slug: '3-jahre', title: '3 Jahre Festgeld', durationYears: 3, interestRate: 1.0 },
  { slug: '5-jahre', title: '5 Jahre Festgeld', durationYears: 5, interestRate: 1.5 },
];

export function getFestgeldProduct(slug: string): FestgeldProduct | undefined {
  return festgeldProducts.find((p) => p.slug === slug);
}
