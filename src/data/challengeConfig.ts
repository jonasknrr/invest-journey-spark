/**
 * Defines which asset classes are unlocked per chapter simulation.
 * Each chapter maps to a set of asset slugs that are available.
 */

export interface ChapterConfig {
  id: string;
  label: string;
  /** Which category ID triggers this chapter's simulation */
  categoryId: string;
  unlockedSlugs: string[];
}

export const chapterConfigs: ChapterConfig[] = [
  {
    id: 'chapter-1',
    label: 'Kapitel 1 – Cash & Cash Equivalents',
    categoryId: 'festgeld',
    unlockedSlugs: ['tagesgeld', 'festgeld'],
  },
  {
    id: 'chapter-2',
    label: 'Kapitel 2 – Aktien',
    categoryId: 'aktien',
    unlockedSlugs: ['tagesgeld', 'festgeld', 'aktien'],
  },
  {
    id: 'chapter-3',
    label: 'Kapitel 3 – ETFs & Indexe',
    categoryId: 'etfs',
    unlockedSlugs: ['tagesgeld', 'festgeld', 'aktien', 'etfs'],
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
