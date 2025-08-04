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
import { mockClubs, mockExpenses } from '@/lib/mock-data';
import Link from 'next/link';

export default function ExpensesPage() {
  const { user, role } = useUser();
  
  const userExpenses = mockExpenses.filter((expense) => {
    if (role === 'representative') {
        const userClubs = mockClubs.filter(
            (club) => club.representativeId === user?.id
        );
        const userClubIds = userClubs.map((club) => club.id);
        return userClubIds.includes(expense.clubId);
    }
    if (role === 'student') {
        return expense.submitterId === user?.id;
    }
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
