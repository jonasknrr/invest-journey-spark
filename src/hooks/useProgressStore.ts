import { useState, useCallback } from 'react';

export interface LessonResult {
  lessonId: string;
  completed: boolean;
  heartsRemaining: number;
  xpEarned: number;
  perfect: boolean;
  completedAt: number;
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
        };
      }

      // Base XP
      const baseXP =
        heartsRemaining === 3 ? 35 :
        heartsRemaining === 2 ? 25 :
        heartsRemaining === 1 ? 15 : 5;

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
          },
        },
        totalXP: store.totalXP + xpEarned,
        currentStreak: newStreak,
        longestStreak: Math.max(store.longestStreak, newStreak),
      };

      persist(next);

      return { xpEarned, streakBonus, isFirstCompletion: true, newStreak };
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

  return {
    store,
    getLessonResult,
    completeLesson,
    resetLesson,
    isCompleted,
    isPerfect,
  };
}
