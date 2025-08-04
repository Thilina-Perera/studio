
import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import type { PrioritizedExpense } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { Button } from '../ui/button';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Expense, Club } from '@/lib/types';


export async function PrioritizedList() {
  const expenseQuery = query(collection(db, "expenses"), where("status", "in", ["Pending", "Under Review"]));
  const clubsQuery = query(collection(db, "clubs"));

  const [expenseSnapshot, clubsSnapshot] = await Promise.all([
    getDocs(expenseQuery),
    getDocs(clubsQuery)
  ]);
  
  const expenses = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
  const clubs = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];

  const expensesToPrioritize = expenses.map((e) => ({
      expenseId: e.id,
      description: e.description,
      amount: e.amount,
  }));


  if (expensesToPrioritize.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No pending expenses to prioritize.
      </div>
    );
  }

  const prioritizedResult = await prioritizeExpenses(expensesToPrioritize);

  const prioritizedExpenses: PrioritizedExpense[] = prioritizedResult
    .map((p) => {
      const originalExpense = expenses.find((e) => e.id === p.expenseId);
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
    return clubs.find((c) => c.id === clubId)?.name || 'Unknown Club';
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
            <CardDescription>
              AI-flagged for immediate review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">
                {getClubName(expense.clubId)}
              </p>
              <p className="text-sm text-muted-foreground">
                {expense.description}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold">
                ${expense.amount.toFixed(2)}
              </p>
              <StatusBadge status={expense.status} />
            </div>
              <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
              <strong>AI Reason:</strong> {expense.reason}
            </p>
            <Button className="w-full">Review Expense</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
