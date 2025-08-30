'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/hooks/use-firebase';
import { Expense } from '@/lib/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { CSVLink } from 'react-csv';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';

import ExpenseBarChart from './ExpenseBarChart';
import ExpensePieChart from './ExpensePieChart';

interface ClubReportsProps {}

const ClubReports: React.FC<ClubReportsProps> = () => {
  const { user } = useUser();
  const { expenses, clubs } = useFirebase();

 const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [aggregatedData, setAggregatedData] = useState<{ category: string; total: number }[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  useEffect(() => {
    if (!expenses) return;

    let dataToFilter = expenses;

    if (selectedClub) {
      dataToFilter = dataToFilter.filter(expense => expense.clubId === selectedClub);
    }

    if (dateRange?.from && dateRange?.to) { // Ensure date comparison is correct
      dataToFilter = dataToFilter.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= dateRange.from! && expenseDate <= dateRange.to!;
      });
    }

    if (selectedCategory) {
      dataToFilter = dataToFilter.filter(expense => expense.category === selectedCategory);
    }

    setFilteredExpenses(dataToFilter);

    const uniqueCategories = Array.from(new Set(dataToFilter.map(expense => expense.category)));
    setAvailableCategories(uniqueCategories);

    const categoryTotals: { [key: string]: number } = {};
    dataToFilter.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const aggregatedArray = Object.keys(categoryTotals).map(category => ({
      category,
      total: categoryTotals[category],
    }));
    setAggregatedData(aggregatedArray);
  }, [expenses, selectedClub, dateRange, selectedCategory]);

  // TODO: Implement CSV export using react-csv
  const handleExportCSV = () => {
    if (!filteredExpenses.length) {
      return; // Do nothing if no data
    }
    // The CSVLink component is already in the JSX and triggers the download programmatically
  };

  // TODO: Implement PDF export (client-side or server-side)
  const handleExportPDF = () => {
    if (!filteredExpenses.length) {
      return; // Do nothing if no data
    }

    const doc = new jsPDF();

    doc.text('Club Expense Report', 10, 10);

    const tableColumn = ['Date', 'Category', 'Amount', 'Status', 'Club'];
    const tableRows: (string | number)[][] = filteredExpenses.map(expense => [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      expense.category,
      expense.amount.toFixed(2),
        expense.status || 'N/A', // Handle potential missing status
        expense.clubName || selectedClub, // Include club name if available, or selected ID (fallback)
    ]);

    // Apply some basic styling using autoTable options
    (doc as any).autoTable(tableColumn, tableRows, {
      startY: 20,
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
      bodyStyles: { textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20, right: 10, bottom: 10, left: 10 },
      didDrawPage: function (data: any) {
        // Footer
        doc.setFontSize(10);
        doc.text('Generated on ' + new Date().toLocaleDateString(), 10, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('club_expenses.pdf');

    // TODO: Enhance PDF styling and layout for better presentation
    // TODO: Consider server-side PDF generation for complex reports or large datasets
  };

  // TODO: Implement access control based on user roles

  // TODO: Add comprehensive unit tests for data fetch, filtering, and export logic

  // Frontend access control
  if (!user || (user.role !== 'admin' && user.role !== 'representative')) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Club Financial Reports</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="club-select" className="block text-sm font-medium text-gray-700">
            Select Club
          </label>
          <select
            id="club-select"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 
                       pl-3 pr-10 py-2 text-base focus:outline-none 
                       focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date-range-picker" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <DateRangePicker
            date={dateRange} onDateChange={setDateRange} id="date-range-picker" />
        </div>

        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
            Expense Category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 
                       pl-3 pr-10 py-2 text-base focus:outline-none 
                       focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            {/* If you still want to include specific fixed categories, add them here */}
          </select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex space-x-4">
        <Button onClick={() => document.getElementById('csv-download-link')?.click()}>
          Export to CSV
        </Button>
        <CSVLink
          data={filteredExpenses.map((expense) => ({
            Date: format(new Date(expense.date), 'yyyy-MM-dd'),
            Category: expense.category,
            Amount: expense.amount.toFixed(2),
            Status: expense.status,
            Club: expense.clubName || selectedClub,
          }))}
          filename="club_expenses.csv"
          className="hidden"
          id="csv-download-link"
        >
          Download CSV
        </CSVLink> {/* Hidden link for programmatic download */}
 <Button onClick={handleExportPDF}>Export to PDF</Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-medium mb-2">Expenses by Category (Bar Chart)</h3>
          <ExpenseBarChart data={aggregatedData} />
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-medium mb-2">Expense Distribution (Pie Chart)</h3>
          <ExpensePieChart data={aggregatedData} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 shadow rounded-lg overflow-x-auto">
        <h3 className="text-lg font-medium mb-2">Filtered Expenses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No expenses found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClubReports;
