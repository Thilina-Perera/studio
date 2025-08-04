
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExpenseTable } from '@/components/dashboard/expense-table';
import { useUser } from '@/hooks/use-user';
import { useFirebase } from '@/hooks/use-firebase';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function ExpensesPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
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
    );
}


export default function ExpensesPage() {
  const { user, role, loading: userLoading } = useUser();
  const { clubs, expenses, loading: firebaseLoading } = useFirebase();

  if (userLoading || firebaseLoading) {
    return <ExpensesPageSkeleton />;
  }
  
  const userExpenses = expenses.filter((expense) => {
    if (role === 'representative') {
        const userClubs = clubs.filter(
            (club) => club.representativeId === user?.id
        );
        const userClubIds = userClubs.map((club) => club.id);
        return userClubIds.includes(expense.clubId);
    }
    if (role === 'student') {
        return expense.submitterId === user?.id;
    }
    // Admin sees all expenses, so we shouldn't filter for them on this page
    // but this page isn't for admins anyway based on nav.
    // However, if an admin gets here, show no expenses.
    return false;
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Expenses</CardTitle>
            <CardDescription>
              All expenses you've submitted.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/expenses/new">New Expense</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={userExpenses} />
        </CardContent>
      </Card>
    </div>
  );
}
