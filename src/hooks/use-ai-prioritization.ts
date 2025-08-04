'use client';
import { useState, useEffect } from 'react';
import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import type { Expense, PrioritizedExpense } from '@/lib/types';

interface UseAiPrioritizationProps {
  expenses: Expense[];
}

export function useAiPrioritization({ expenses }: UseAiPrioritizationProps) {
  const [prioritizedExpenses, setPrioritizedExpenses] = useState<PrioritizedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getPrioritizedExpenses() {
      setLoading(true);
      setError(null);

      const pendingExpenses = expenses.filter(e => ["Pending", "Under Review"].includes(e.status));

      if (pendingExpenses.length === 0) {
        setPrioritizedExpenses([]);
        setLoading(false);
        return;
      }
      
      const expensesToPrioritize = pendingExpenses.map((e) => ({
        expenseId: e.id,
        description: e.description,
        amount: e.amount,
      }));

      try {
        const prioritizedResult = await prioritizeExpenses(expensesToPrioritize);

        const enrichedExpenses: PrioritizedExpense[] = prioritizedResult
          .map((p) => {
            const originalExpense = pendingExpenses.find((e) => e.id === p.expenseId);
            if (!originalExpense) return null;
            return {
              ...originalExpense,
              priorityScore: p.priorityScore,
              reason: p.reason,
            };
          })
          .filter((e): e is PrioritizedExpense => e !== null)
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 3); // Take top 3

        setPrioritizedExpenses(enrichedExpenses);
      } catch (e: any) {
        console.error("Error prioritizing expenses:", e);
        setError(e.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
    
    // Only run if there are expenses to avoid unnecessary calls
    if (expenses.length > 0) {
        getPrioritizedExpenses();
    } else {
        setLoading(false);
    }

  }, [expenses]); // Rerun when the base expenses list changes

  return { prioritizedExpenses, loading, error };
}
