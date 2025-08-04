
'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { ExpenseTable } from './expense-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import type { Expense } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function AdminDashboard({ children }: { children: React.ReactNode }) {
  const { expenses: allExpenses, clubs, loading } = useUser();
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setFilteredExpenses(allExpenses);
  }, [allExpenses]);


  const handleFilter = () => {
    let expenses = allExpenses;

    if (descriptionFilter) {
      expenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }

    if (clubFilter !== 'all') {
      expenses = expenses.filter(expense => expense.clubId === clubFilter);
    }

    if (dateFilter?.from && dateFilter?.to) {
      expenses = expenses.filter(expense => {
        const submittedDate = new Date(expense.submittedDate);
        return submittedDate >= dateFilter.from! && submittedDate <= dateFilter.to!;
      });
    }

    setFilteredExpenses(expenses);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review, approve, and manage all club expenses.
        </p>
      </div>

      {children}

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            Browse and manage all submitted expenses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input 
              placeholder="Filter by description..." 
              className="max-w-xs" 
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
            />
             <Select value={clubFilter} onValueChange={setClubFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by club" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {clubs.map(club => (
                        <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="hidden md:block">
                <DateRangePicker 
                  date={dateFilter}
                  onDateChange={setDateFilter}
                />
            </div>
            <Button onClick={handleFilter}>Filter</Button>
          </div>
          {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
          ) : (
            <ExpenseTable expenses={filteredExpenses} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
