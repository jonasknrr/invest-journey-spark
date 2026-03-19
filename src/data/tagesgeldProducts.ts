export interface TagesgeldProduct {
  slug: string;
  title: string;
  interestRate: number;
}

export const tagesgeldProducts: TagesgeldProduct[] = [
  { slug: 'tagesgeld', title: 'Tagesgeld', interestRate: 0.5 },
];

export function getTagesgeldProduct(slug: string): TagesgeldProduct | undefined {
  return tagesgeldProducts.find((p) => p.slug === slug);
}
