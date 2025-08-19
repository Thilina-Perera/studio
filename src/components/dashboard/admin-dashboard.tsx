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
import { useUser } from '@/hooks/use-user';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ExpenseReportPDF } from './expense-report-pdf';

interface AdminDashboardProps {
  allExpenses: Expense[];
  allClubs: Club[];
}

export function AdminDashboard({ allExpenses, allClubs }: AdminDashboardProps) {
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const { users } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              Browse and manage all submitted expenses.
            </CardDescription>
          </div>
          {isClient && (
            <PDFDownloadLink
              document={<ExpenseReportPDF expenses={filteredExpenses} clubs={allClubs} users={users} />}
              fileName={`expense-report-${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {loading ? 'Generating PDF...' : 'Export to PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
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
          <ExpenseTable expenses={filteredExpenses} clubs={allClubs} users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
