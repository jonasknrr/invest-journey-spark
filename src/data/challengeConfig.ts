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
    label: 'Chapter 3 – Wealth Building',
    categoryId: 'etfs',
    unlockedSlugs: ['tagesgeld', 'festgeld', 'aktien', 'etfs'],
    scenario: {
      budget: 100000,
      currency: 'CHF',
      title: 'Wealth Building',
      description:
        'You have 100,000 CHF at your disposal. Your goals: 1. You absolutely need an emergency fund of 10,000 CHF that is available at any time. 2. In exactly 3 years you want to make a down payment on a property, for which you need 30,000 CHF for certain. 3. You want to invest the rest of your money (60,000 CHF) for your retirement.',
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
