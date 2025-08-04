'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExpenseTable } from './expense-table';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import type { Club, Expense } from '@/lib/types';
import { AiExpensePrioritization } from './ai-expense-prioritization';

interface AdminDashboardProps {
  allExpenses: Expense[];
  allClubs: Club[];
}

export function AdminDashboard({ allExpenses, allClubs }: AdminDashboardProps) {
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    let expenses = allExpenses;

    if (descriptionFilter) {
      expenses = expenses.filter((expense) =>
        expense.description
          .toLowerCase()
          .includes(descriptionFilter.toLowerCase())
      );
    }

    if (clubFilter !== 'all') {
      expenses = expenses.filter((expense) => expense.clubId === clubFilter);
    }

    if (dateFilter?.from) {
      expenses = expenses.filter((expense) => {
        const submittedDate = new Date(expense.submittedDate);
        const fromDate = new Date(dateFilter.from!);
        const toDate = dateFilter.to ? new Date(dateFilter.to) : new Date();
        if (dateFilter.to) {
          return submittedDate >= fromDate && submittedDate <= toDate;
        } else {
          return submittedDate >= fromDate;
        }
      });
    }

    setFilteredExpenses(expenses);
  }, [descriptionFilter, clubFilter, dateFilter, allExpenses]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review, approve, and manage all club expenses.
        </p>
      </div>

      <AiExpensePrioritization expenses={allExpenses} clubs={allClubs} />

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            Browse and manage all submitted expenses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
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
                {allClubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker date={dateFilter} onDateChange={setDateFilter} />
          </div>
          <ExpenseTable expenses={filteredExpenses} clubs={allClubs} />
        </CardContent>
      </Card>
    </div>
  );
}
