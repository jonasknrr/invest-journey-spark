/**
 * Defines which asset classes are unlocked per chapter simulation.
 * Each chapter maps to a set of asset slugs that are available.
 */

export interface ChapterScenario {
  budget: number;
  title: string;
  description: string;
  /** Currency symbol for display */
  currency: string;
}

export interface ChapterConfig {
  id: string;
  label: string;
  /** Which category ID triggers this chapter's simulation */
  categoryId: string;
  unlockedSlugs: string[];
  scenario?: ChapterScenario;
}

export const chapterConfigs: ChapterConfig[] = [
  {
    id: 'chapter-1',
    label: 'Chapter 1 – Liquidity Planning',
    categoryId: 'festgeld',
    unlockedSlugs: ['tagesgeld', 'festgeld'],
    scenario: {
      budget: 10000,
      currency: 'CHF',
      title: 'Liquidity Planning',
      description:
        'You have 10,000 CHF saved. You need an emergency fund of 2,000 CHF that you can access at any time. You also plan a training course in exactly 2 years that will cost 3,000 CHF. You don\'t need the rest of your money for now.',
    },
  },
  {
    id: 'chapter-2',
    label: 'Chapter 2 – Stocks',
    categoryId: 'aktien',
    unlockedSlugs: ['tagesgeld', 'festgeld', 'aktien'],
  },
  {
    id: 'chapter-3',
    label: 'Chapter 3 – ETF Diversification',
    categoryId: 'etfs',
    unlockedSlugs: ['tagesgeld', 'festgeld', 'aktien', 'etfs'],
    scenario: {
      budget: 10000,
      currency: 'CHF',
      title: 'ETF Diversification',
      description:
        'You have a budget of 10,000.\n1. You need a liquid emergency fund of 1,000 (available immediately).\n2. You plan a larger purchase in exactly 3 years, requiring a safe 2,000.\n3. The remaining 7,000 is for your long-term wealth building. Maximize returns but ensure your portfolio is highly diversified using the newly unlocked ETFs!',
    },
  },
];

/** Map from categoryId → chapterId for quick lookup */
export const categoryToChapter: Record<string, string> = Object.fromEntries(
  chapterConfigs.map(c => [c.categoryId, c.id])
);

/** Get the set of unlocked slugs for a given chapter ID */
export function getUnlockedSlugs(chapterId: string): Set<string> {
  const config = chapterConfigs.find(c => c.id === chapterId);
  return new Set(config?.unlockedSlugs ?? []);
}

/** Get the chapter config by ID */
export function getChapterConfig(chapterId: string): ChapterConfig | undefined {
  return chapterConfigs.find(c => c.id === chapterId);
}
