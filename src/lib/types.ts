export type UserRole = 'admin' | 'representative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  representativeId: string;
}

export type ExpenseStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

export interface Expense {
  id: string;
  clubId: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  submittedDate: string;
  receiptUrl?: string;
}

export interface PrioritizedExpense extends Expense {
    priorityScore: number;
    reason: string;
}

export interface Event {
  id: string;
  name: string;
  clubId: string;
  date: string;
}
