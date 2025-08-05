
'use client';
import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { Club, Expense, ExpenseStatus } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { format } from 'date-fns';
import { useUser } from '@/hooks/use-user';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExpenseTableProps {
  expenses: Expense[];
  clubs: Club[];
}

export function ExpenseTable({ expenses, clubs }: ExpenseTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { role } = useUser();
  const { toast } = useToast();

  const getClubName = (expense: Expense) => {
    if (expense.clubName) return expense.clubName;
    return clubs.find((c) => c.id === expense.clubId)?.name || 'Unknown Club';
  };

  const handleStatusChange = async (
    expenseId: string,
    status: ExpenseStatus
  ) => {
    const expenseRef = doc(db, 'expenses', expenseId);
    try {
      await updateDoc(expenseRef, { status });
      toast({
        title: 'Status Updated',
        description: `Expense has been marked as ${status}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the expense status.',
      });
    }
  };
  
  const handleToggleExpand = (expenseId: string) => {
    setExpandedId(expandedId === expenseId ? null : expenseId);
  };


  const canChangeStatus = role === 'admin';
  const numColumns = canChangeStatus ? 6 : 5;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Club</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            {canChangeStatus && (
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <React.Fragment key={expense.id}>
              <TableRow 
                onClick={() => handleToggleExpand(expense.id)}
                className={cn(expense.adminComment && "cursor-pointer", expandedId === expense.id && "bg-muted/50")}
              >
                <TableCell className="font-medium">
                  {getClubName(expense)}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right">
                  ${expense.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {format(new Date(expense.submittedDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={expense.status} />
                </TableCell>
                {canChangeStatus && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(expense.id, 'Approved')}
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(expense.id, 'Rejected')}
                        >
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(expense.id, 'Under Review')
                          }
                        >
                          Mark as 'Under Review'
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
              {expandedId === expense.id && expense.adminComment && (
                <TableRow>
                    <TableCell colSpan={numColumns} className="bg-muted/50 p-4">
                        <div className="text-sm">
                            <h4 className="font-semibold mb-1">Admin Comment</h4>
                            <p className="text-muted-foreground pl-2 border-l-2">{expense.adminComment}</p>
                        </div>
                    </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
