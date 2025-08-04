'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockExpenses, mockClubs } from '@/lib/mock-data';
import { ExpenseTable } from './expense-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';

export function AdminDashboard({ children }: { children: React.ReactNode }) {
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
            <Input placeholder="Filter by description..." className="max-w-xs" />
             <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by club" />
                </SelectTrigger>
                <SelectContent>
                    {mockClubs.map(club => (
                        <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="hidden md:block">
                <DateRangePicker />
            </div>
            <Button>Filter</Button>
          </div>
          <ExpenseTable expenses={mockExpenses} />
        </CardContent>
      </Card>
    </div>
  );
}
