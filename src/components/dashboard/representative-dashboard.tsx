
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { DollarSign, FileText, Users } from 'lucide-react';
import { ExpenseTable } from './expense-table';
import Link from 'next/link';
import { Button } from '../ui/button';
import type { Club, Expense } from '@/lib/types';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '@/lib/types';
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

interface RepresentativeDashboardProps {
  allClubs: Club[];
  allExpenses: Expense[];
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'default';

export function RepresentativeDashboard({ allClubs, allExpenses }: RepresentativeDashboardProps) {
  const { user, users } = useUser();

  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  const userClubs = useMemo(() => {
    if (!user) return [];
    return allClubs.filter((club) => club.representativeId === user.id);
  }, [allClubs, user]);

  const userClubIds = useMemo(() => userClubs.map((club) => club.id), [userClubs]);

  useEffect(() => {
    let expenses = allExpenses.filter((expense) =>
      userClubIds.includes(expense.clubId)
    );

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
          toDate.setHours(23, 59, 59, 999);
          return submittedDate >= fromDate && submittedDate <= toDate;
        } else {
          return submittedDate >= fromDate;
        }
      });
    }

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
          return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      }
    });

    setFilteredExpenses(sortedExpenses);
  }, [descriptionFilter, clubFilter, categoryFilter, statusFilter, dateFilter, sortOption, allExpenses, userClubIds]);

  const totalExpenses = filteredExpenses.length;
  const pendingAmount = filteredExpenses
    .filter((e) => e.status === 'Pending' || e.status === 'Under Review')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user!.name}
        </h1>
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
            <p className="text-xs text-muted-foreground truncate">
              {userClubs.length > 0
                ? userClubs.map((c) => c.name).join(', ')
                : 'No clubs assigned'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Club Expenses</CardTitle>
            <CardDescription>
              Browse and manage your club's submitted expenses.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/expenses/new">New Expense</Link>
          </Button>
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
                <SelectItem value="all">All Your Clubs</SelectItem>
                {userClubs.map((club) => (
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
          <ExpenseTable expenses={filteredExpenses} clubs={allClubs} users={users}/>
        </CardContent>
      </Card>
    </div>
  );
}

    