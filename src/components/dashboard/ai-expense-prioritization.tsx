import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import { mockExpenses, mockClubs } from '@/lib/mock-data';
import type { PrioritizedExpense, Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { StatusBadge } from './status-badge';
import React, { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

async function PrioritizedList() {
    const expensesToPrioritize = mockExpenses
      .filter(e => e.status === 'Pending' || e.status === 'Under Review')
      .map(e => ({
        expenseId: e.id,
        description: e.description,
        amount: e.amount,
      }));
  
    try {
      const prioritizedResult = await prioritizeExpenses(expensesToPrioritize);

      const prioritizedExpenses: PrioritizedExpense[] = prioritizedResult
        .map(p => {
          const originalExpense = mockExpenses.find(e => e.id === p.expenseId);
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
  
      const getClubName = (clubId: string) => {
        return mockClubs.find((c) => c.id === clubId)?.name || 'Unknown Club';
      };
      
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prioritizedExpenses.map((expense) => (
            <Card key={expense.id} className="border-primary/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <span>High Priority</span>
                </CardTitle>
                <CardDescription>AI-flagged for immediate review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <p className="text-sm font-semibold">{getClubName(expense.clubId)}</p>
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                 </div>
                 <div className="flex justify-between items-center">
                    <p className="text-xl font-bold">${expense.amount.toFixed(2)}</p>
                    <StatusBadge status={expense.status} />
                 </div>
                 <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
                   <strong>AI Reason:</strong> {expense.reason}
                 </p>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } catch (error) {
      console.error('AI Prioritization Error:', error);
      return (
        <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load AI-prioritized expenses.</p>
            </CardContent>
        </Card>
      );
    }
  }

function PrioritizedListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                 <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                 </Card>
            ))}
        </div>
    )
}

export function AiExpensePrioritization() {
  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">AI Priority Queue</h2>
        <Suspense fallback={<PrioritizedListSkeleton />}>
            <PrioritizedList />
        </Suspense>
    </div>
  );
}
