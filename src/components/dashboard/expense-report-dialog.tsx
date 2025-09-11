
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { ExpenseTable } from './expense-table';
import type { Club, Expense, User } from '@/lib/types';
import { format } from 'date-fns';

interface ExpenseReportDialogProps {
  expenses: Expense[];
  clubs: Club[];
  users: User[];
}

export function ExpenseReportDialog({
  expenses,
  clubs,
  users,
}: ExpenseReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getClubName = (expense: Expense) => {
    if (expense.clubName) return expense.clubName;
    return clubs.find((c) => c.id === expense.clubId)?.name || 'Unknown Club';
  };

  const getSubmitterName = (expense: Expense) => {
    if (expense.submitterName) return expense.submitterName;
    return users.find((u) => u.id === expense.submitterId)?.name || 'Unknown';
  };

  const downloadReport = () => {
    const headers = [
      'ID',
      'Club',
      'Submitter',
      'Description',
      'Amount',
      'Status',
      'Submitted Date',
      'Admin Comment',
    ];

    const rows = expenses.map((expense) =>
      [
        expense.id,
        getClubName(expense),
        getSubmitterName(expense),
        `"${expense.description.replace(/"/g, '""')}"`, // Handle quotes
        expense.amount.toFixed(2),
        expense.status,
        format(new Date(expense.submittedDate), 'yyyy-MM-dd'),
         `"${expense.adminComment?.replace(/"/g, '""') || ''}"`
      ].join(',')
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `expense_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          View Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Expense Report</DialogTitle>
          <DialogDescription>
            A detailed view of the filtered expenses. You can download this
            report as a CSV file.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
           <ExpenseTable expenses={expenses} clubs={clubs} users={users} />
        </div>
        <DialogFooter>
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
