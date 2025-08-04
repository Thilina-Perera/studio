
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { useFirebase } from '@/hooks/use-firebase';
import { DollarSign, FileText } from 'lucide-react';
import { ExpenseTable } from './expense-table';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

function StudentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(2)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-6 w-1/3" />
                </CardContent>
            </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentDashboard() {
  const { user, loading: userLoading } = useUser();
  const { expenses, loading: firebaseLoading } = useFirebase();

  if (userLoading || firebaseLoading || !user) {
    return <StudentDashboardSkeleton />;
  }

  const userExpenses = expenses.filter(
    (expense) => expense.submitterId === user.id
  );
  
  const totalExpenses = userExpenses.length;
  const pendingAmount = userExpenses.filter(e => e.status === 'Pending' || e.status === 'Under Review').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your submitted expenses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalExpenses}</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                    Your most recently submitted expenses.
                </CardDescription>
            </div>
            <Button asChild>
                <Link href="/expenses/new">New Expense</Link>
            </Button>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={userExpenses.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}
