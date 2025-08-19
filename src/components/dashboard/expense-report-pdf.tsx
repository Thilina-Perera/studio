'use client';
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Expense, Club, User } from '@/lib/types';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E3A8A', // A nice blue color
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    borderBottomColor: '#D1D5DB',
    borderBottomWidth: 2,
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
    fontSize: 9,
  },
  descriptionCol: {
     width: '30%',
  },
  amountCol: {
      width: '15%',
      textAlign: 'right',
  },
  statusCol: {
       width: '15%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: '#1E3A8A',
  },
  totalLabel: {
    width: '85%',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    paddingRight: 10,
  },
  totalValue: {
    width: '15%',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

interface ExpenseReportPDFProps {
  expenses: Expense[];
  clubs: Club[];
  users: User[];
}

export function ExpenseReportPDF({ expenses, clubs, users }: ExpenseReportPDFProps) {
  
  const getClubName = (expense: Expense) => {
    if (expense.clubName) return expense.clubName;
    return clubs.find((c) => c.id === expense.clubId)?.name || 'Unknown';
  };

  const getSubmitterName = (expense: Expense) => {
    if (expense.submitterName) return expense.submitterName;
    return users.find((u) => u.id === expense.submitterId)?.name || 'Unknown';
  };
  
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.header}>Expense Report</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableColHeader, {width: '15%'}]}>Date</Text>
            <Text style={[styles.tableColHeader, {width: '15%'}]}>Club</Text>
            <Text style={[styles.tableColHeader, {width: '15%'}]}>Submitter</Text>
            <Text style={[styles.tableColHeader, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableColHeader, styles.statusCol]}>Status</Text>
            <Text style={[styles.tableColHeader, styles.amountCol]}>Amount</Text>
          </View>
          {/* Table Content */}
          {expenses.map((expense, index) => (
            <View style={index % 2 === 0 ? styles.tableRowAlt : styles.tableRow} key={expense.id}>
              <Text style={[styles.tableCol, {width: '15%'}]}>{format(new Date(expense.submittedDate), 'yyyy-MM-dd')}</Text>
              <Text style={[styles.tableCol, {width: '15%'}]}>{getClubName(expense)}</Text>
              <Text style={[styles.tableCol, {width: '15%'}]}>{getSubmitterName(expense)}</Text>
              <Text style={[styles.tableCol, styles.descriptionCol]}>{expense.description}</Text>
              <Text style={[styles.tableCol, styles.statusCol]}>{expense.status}</Text>
              <Text style={[styles.tableCol, styles.amountCol]}>${expense.amount.toFixed(2)}</Text>
            </View>
          ))}
           {/* Total Row */}
           <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>TOTAL:</Text>
             <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
           </View>
        </View>
        <Text style={styles.footer} fixed>
          Report generated on {format(new Date(), 'yyyy-MM-dd')} by ReimburseAI
        </Text>
      </Page>
    </Document>
  );
}
