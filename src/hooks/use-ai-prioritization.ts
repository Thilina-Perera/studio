'use client';
import { useState, useCallback, useEffect } from 'react';
import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import type { Expense, PrioritizedExpense, Club, User } from '@/lib/types';

interface UseAiPrioritizationProps {
  expenses: Expense[];
  clubs: Club[];
  users: User[];
}

export function useAiPrioritization({ expenses, clubs, users }: UseAiPrioritizationProps) {
  const [prioritizedExpenses, setPrioritizedExpenses] = useState<PrioritizedExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const getClubName = (clubId: string) => clubs.find(c => c.id === clubId)?.name || 'Unknown Club';
  const getSubmitterName = (submitterId: string) => users.find(u => u.id === submitterId)?.name || 'Unknown User';

  const runPrioritization = useCallback(async () => {
    if (cooldown) return;

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
      clubName: e.clubName || getClubName(e.clubId),
      submitterName: e.submitterName || getSubmitterName(e.submitterId),
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
      if (e.message && (e.message.includes("429") || e.message.includes("quota") || e.message.includes("503"))) {
        setError("The AI service is currently busy or you've exceeded your request limit. Please wait a moment before trying again.");
      } else {
        setError(e.message || "An unknown error occurred.");
      }
       // Start cooldown on error
      setCooldown(true);
      setTimeout(() => setCooldown(false), 5000); // 5-second cooldown
    } finally {
      setLoading(false);
    }
  }, [expenses, clubs, users, cooldown]);

  return { prioritizedExpenses, loading, error, cooldown, runPrioritization };
}
