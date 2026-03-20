import { useState, useCallback } from 'react';

export interface LessonResult {
  lessonId: string;
  completed: boolean;
  heartsRemaining: number;
  xpEarned: number;
  perfect: boolean;
  completedAt: number;
  progress: number; // 0–1
}

export interface ProgressStore {
  lessonResults: Record<string, LessonResult>;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
}

const STORAGE_KEY = 'finlearn_progress';

const defaultStore: ProgressStore = {
  lessonResults: {},
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
};

function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressStore;
  } catch {}
  return { ...defaultStore, lessonResults: {} };
}

function saveStore(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Extract the numeric suffix from a lessonId like "f2" → 2, "e10" → 10
 */
function lessonNumber(id: string): number {
  const m = id.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

function prevLessonId(id: string): string | null {
  const prefix = id.replace(/\d+$/, '');
  const num = lessonNumber(id);
  return num > 1 ? `${prefix}${num - 1}` : null;
}

export function useProgressStore() {
  const [store, setStore] = useState<ProgressStore>(loadStore);

  const persist = useCallback((next: ProgressStore) => {
    setStore(next);
    saveStore(next);
  }, []);

  const getLessonResult = useCallback(
    (lessonId: string): LessonResult | null =>
      store.lessonResults[lessonId] ?? null,
    [store],
  );

  const isCompleted = useCallback(
    (lessonId: string): boolean =>
      store.lessonResults[lessonId]?.completed === true,
    [store],
  );

  const isPerfect = useCallback(
    (lessonId: string): boolean =>
      store.lessonResults[lessonId]?.perfect === true,
    [store],
  );

  const completeLesson = useCallback(
    (lessonId: string, heartsRemaining: number) => {
      // Already completed → no XP
      if (store.lessonResults[lessonId]?.completed) {
        return {
          xpEarned: 0,
          streakBonus: 0,
          isFirstCompletion: false,
          newStreak: store.currentStreak,
          unlocked: true,
        };
      }

      // No hearts → minimal XP, NOT completed, next lesson NOT unlocked
      if (heartsRemaining === 0) {
        return {
          xpEarned: 5,
          streakBonus: 0,
          isFirstCompletion: false,
          newStreak: 0,
          unlocked: false,
        };
      }

      // Base XP
      const baseXP =
        heartsRemaining === 3 ? 35 :
        heartsRemaining === 2 ? 25 : 15;

      const perfect = heartsRemaining === 3;

      // Streak
      const prev = prevLessonId(lessonId);
      const prevPerfect = prev ? store.lessonResults[prev]?.perfect === true : false;

      let newStreak: number;
      if (prevPerfect && perfect) {
        newStreak = store.currentStreak + 1;
      } else {
        newStreak = perfect ? 1 : 0;
      }

      // Streak bonus (only when perfect)
      let streakBonus = 0;
      if (perfect) {
        if (newStreak >= 4) streakBonus = 15;
        else if (newStreak === 3) streakBonus = 10;
        else if (newStreak === 2) streakBonus = 5;
      }

      const xpEarned = baseXP + streakBonus;

      const next: ProgressStore = {
        lessonResults: {
          ...store.lessonResults,
          [lessonId]: {
            lessonId,
            completed: true,
            heartsRemaining,
            xpEarned,
            perfect,
            completedAt: Date.now(),
            progress: 1,
          },
        },
        totalXP: store.totalXP + xpEarned,
        currentStreak: newStreak,
        longestStreak: Math.max(store.longestStreak, newStreak),
      };

      persist(next);

      // Unlock next lesson in levels
      if (heartsRemaining > 0) {
        try {
          const storedLevels = localStorage.getItem('investify_levels');
          if (!storedLevels) return { xpEarned, streakBonus, isFirstCompletion: true, newStreak, unlocked: true };

          const levels = JSON.parse(storedLevels);

          // lessonId format examples:
          // 'festgeld-f1', 'aktien-a2', 'etfs-e3'
          // Split on LAST hyphen to get levelId and subId
          const lastHyphen = lessonId.lastIndexOf('-');
          if (lastHyphen === -1) return { xpEarned, streakBonus, isFirstCompletion: true, newStreak, unlocked: true };

          const levelId = lessonId.substring(0, lastHyphen);
          const subId = lessonId.substring(lastHyphen + 1);

          const levelIndex = levels.findIndex((l: any) => l.id === levelId);
          if (levelIndex === -1) return { xpEarned, streakBonus, isFirstCompletion: true, newStreak, unlocked: true };

          const level = levels[levelIndex];
          const subIndex = level.subLevels.findIndex((s: any) => s.id === subId);
          if (subIndex === -1) return { xpEarned, streakBonus, isFirstCompletion: true, newStreak, unlocked: true };

          // Mark current sublevel as completed
          levels[levelIndex].subLevels[subIndex].status = 'completed';

          // Unlock next sublevel in same level
          if (subIndex + 1 < level.subLevels.length) {
            levels[levelIndex].subLevels[subIndex + 1].status = 'current';
          } else {
            // Last lesson in level — mark level completed
            levels[levelIndex].status = 'completed';
            levels[levelIndex].progress = 100;

            // Unlock first lesson of next level
            if (levelIndex + 1 < levels.length) {
              levels[levelIndex + 1].status = 'current';
              if (levels[levelIndex + 1].subLevels.length > 0) {
                levels[levelIndex + 1].subLevels[0].status = 'current';
              }
            }
          }

          localStorage.setItem('investify_levels', JSON.stringify(levels));

          // Force re-render in components that read levels
          window.dispatchEvent(new Event('investify_levels_updated'));

        } catch (e) {
          console.error('Failed to unlock next lesson', e);
        }
      }

      return { xpEarned, streakBonus, isFirstCompletion: true, newStreak, unlocked: true };
    },
    [store, persist],
  );

  const resetLesson = useCallback(
    (lessonId: string) => {
      const { [lessonId]: removed, ...rest } = store.lessonResults;
      if (!removed) return;
      persist({
        ...store,
        lessonResults: rest,
        totalXP: Math.max(0, store.totalXP - (removed.xpEarned ?? 0)),
      });
    },
    [store, persist],
  );

  const updateLessonProgress = useCallback(
    (lessonId: string, progress: number) => {
      const clamped = Math.max(0, Math.min(1, progress));
      const existing = store.lessonResults[lessonId];
      // Don't overwrite a completed lesson's progress
      if (existing?.completed) return;

      const entry: LessonResult = existing
        ? { ...existing, progress: clamped }
        : {
            lessonId,
            completed: false,
            heartsRemaining: 3,
            xpEarned: 0,
            perfect: false,
            completedAt: 0,
            progress: clamped,
          };

      const next: ProgressStore = {
        ...store,
        lessonResults: {
          ...store.lessonResults,
          [lessonId]: entry,
        },
      };
      persist(next);
    },
    [store, persist],
  );

  return {
    store,
    getLessonResult,
    completeLesson,
    resetLesson,
    isCompleted,
    isPerfect,
    updateLessonProgress,
  };
}
