
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
import Link from 'next/link';

export default function ExpensesPage() {
  const { user, role, clubs, expenses } = useUser();

  // Data is guaranteed to be loaded by AppLayout
  const userExpenses = expenses.filter((expense) => {
    if (role === 'representative') {
        const userClubs = clubs.filter(
            (club) => club.representativeId === user!.id
        );
        const userClubIds = userClubs.map((club) => club.id);
        return userClubIds.includes(expense.clubId);
    }
    if (role === 'student') {
        return expense.submitterId === user!.id;
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
          <ExpenseTable expenses={userExpenses} clubs={clubs} />
        </CardContent>
      </Card>
    </div>
  );
}
