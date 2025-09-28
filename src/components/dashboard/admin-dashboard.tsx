
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
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '@/lib/types';
import { AiExpensePrioritization } from './ai-expense-prioritization';
import { useUser } from '@/hooks/use-user';
import { ExpenseReportDialog } from './expense-report-dialog';
import { ChatbotPopup } from './chatbot-popup';

interface AdminDashboardProps {
  allExpenses: Expense[];
  allClubs: Club[];
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'default';


export function AdminDashboard({ allExpenses, allClubs }: AdminDashboardProps) {
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const { users } = useUser();

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
    
    if (categoryFilter !== 'all') {
        expenses = expenses.filter((expense) => expense.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      expenses = expenses.filter((expense) => expense.status === statusFilter);
    }

    if (dateFilter?.from) {
      expenses = expenses.filter((expense) => {
        const submittedDate = new Date(expense.submittedDate);
        const fromDate = new Date(dateFilter.from!);
        const toDate = dateFilter.to ? new Date(dateFilter.to) : new Date();
        if (dateFilter.to) {
          // Set time to end of day for 'to' date to include all of it
          toDate.setHours(23, 59, 59, 999);
          return submittedDate >= fromDate && submittedDate <= toDate;
        } else {
          return submittedDate >= fromDate;
        }
      });
    }

    // Sorting logic
    const sortedExpenses = [...expenses].sort((a, b) => {
        switch (sortOption) {
            case 'date-desc':
                return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
            case 'date-asc':
                return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            default:
                 // Default sort by date descending
                return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
        }
    });

    setFilteredExpenses(sortedExpenses);
  }, [descriptionFilter, clubFilter, categoryFilter, statusFilter, dateFilter, sortOption, allExpenses]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Review, approve, and manage all club expenses.
          </p>
        </div>
        <ExpenseReportDialog expenses={filteredExpenses} clubs={allClubs} users={users} />
      </div>

      <AiExpensePrioritization expenses={allExpenses} clubs={allClubs} users={users} />

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
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {EXPENSE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Sort by Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                    <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                </SelectContent>
            </Select>
            <DateRangePicker date={dateFilter} onDateChange={setDateFilter} />
          </div>
          <ExpenseTable expenses={filteredExpenses} clubs={allClubs} users={users} />
        </CardContent>
      </Card>
      <ChatbotPopup />
    </div>
  );
}
