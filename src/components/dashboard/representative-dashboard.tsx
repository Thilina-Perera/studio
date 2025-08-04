'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { mockClubs, mockExpenses } from '@/lib/mock-data';
import { DollarSign, FileText, Hourglass, Users } from 'lucide-react';
import { ExpenseTable } from './expense-table';
import Link from 'next/link';
import { Button } from '../ui/button';

export function RepresentativeDashboard() {
  const { user } = useUser();
  const userClubs = mockClubs.filter(
    (club) => club.representativeId === user?.id
  );
  const userClubIds = userClubs.map((club) => club.id);
  const userExpenses = mockExpenses.filter((expense) =>
    userClubIds.includes(expense.clubId)
  );
  
  const totalExpenses = userExpenses.length;
  const pendingAmount = userExpenses.filter(e => e.status === 'Pending' || e.status === 'Under Review').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your club's financial activities.
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
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Clubs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{userClubs.length}</div>
                 <p className="text-xs text-muted-foreground">
                   {userClubs.map(c => c.name).join(', ')}
                 </p>
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
