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
    label: 'Kapitel 1 – Liquiditätsplanung',
    categoryId: 'festgeld',
    unlockedSlugs: ['tagesgeld', 'festgeld'],
    scenario: {
      budget: 10000,
      currency: '€',
      title: 'Liquiditätsplanung',
      description:
        'Du hast 10.000 € gespart. Du brauchst einen Notgroschen von 2.000 €, an den du jederzeit sofort herankommst. Außerdem planst du in genau 2 Jahren eine Weiterbildung, die 3.000 € kosten wird. Den Rest deines Geldes brauchst du vorerst nicht. Verteile das Geld so, dass deine Ziele sicher gedeckt sind und du gleichzeitig die maximale Rendite herausholst.',
    },
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

/** Get the chapter config by ID */
export function getChapterConfig(chapterId: string): ChapterConfig | undefined {
  return chapterConfigs.find(c => c.id === chapterId);
}
