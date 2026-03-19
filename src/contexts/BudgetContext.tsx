import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Allocation {
  [assetSlug: string]: { [productSlug: string]: number };
}

interface BudgetContextType {
  totalBudget: number;
  allocations: Allocation;
  getAllocatedTotal: () => number;
  getRemaining: () => number;
  getAssetTotal: (assetSlug: string) => number;
  getProductAmount: (assetSlug: string, productSlug: string) => number;
  setProductAmount: (assetSlug: string, productSlug: string, amount: number) => void;
  resetAllocations: () => void;
  setTotalBudget: (budget: number) => void;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export const useBudget = () => {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be inside BudgetProvider');
  return ctx;
};

export const BudgetProvider = ({ totalBudget: initialBudget = 5000, children }: { totalBudget?: number; children: ReactNode }) => {
  const [totalBudget, setTotalBudget] = useState(initialBudget);
  const [allocations, setAllocations] = useState<Allocation>({});

  const getAllocatedTotal = useCallback(() => {
    return Object.values(allocations).reduce(
      (sum, products) => sum + Object.values(products).reduce((s, v) => s + v, 0),
      0,
    );
  }, [allocations]);

  const getRemaining = useCallback(() => {
    return totalBudget - getAllocatedTotal();
  }, [totalBudget, getAllocatedTotal]);

  const getAssetTotal = useCallback(
    (assetSlug: string) => {
      const products = allocations[assetSlug];
      if (!products) return 0;
      return Object.values(products).reduce((s, v) => s + v, 0);
    },
    [allocations],
  );

  const getProductAmount = useCallback(
    (assetSlug: string, productSlug: string) => {
      return allocations[assetSlug]?.[productSlug] ?? 0;
    },
    [allocations],
  );

  const setProductAmount = useCallback(
    (assetSlug: string, productSlug: string, amount: number) => {
      setAllocations((prev) => ({
        ...prev,
        [assetSlug]: {
          ...prev[assetSlug],
          [productSlug]: amount,
        },
      }));
    },
    [],
  );

  const resetAllocations = useCallback(() => {
    setAllocations({});
  }, []);

  return (
    <BudgetContext.Provider
      value={{ totalBudget, allocations, getAllocatedTotal, getRemaining, getAssetTotal, getProductAmount, setProductAmount, resetAllocations, setTotalBudget }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
