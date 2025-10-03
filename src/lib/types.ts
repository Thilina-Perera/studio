
export type UserRole = 'admin' | 'representative' | 'student';

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

export const EXPENSE_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'] as const;
export type ExpenseStatus = typeof EXPENSE_STATUSES[number];

export const EXPENSE_CATEGORIES = ['Food & Beverage', 'Stationary', 'Event Materials', 'Transport', 'Venue', 'Subscriptions', 'Advertising', 'Entertainment', 'Equipment', 'Other'] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];


export interface Expense {
  id:string;
  clubId: string;
  clubName?: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  submittedDate: string;
  receiptDataUri?: string;
  submitterId: string;
  submitterName?: string;
  adminComment?: string;
  isFlagged?: boolean;
  category?: ExpenseCategory;
  userId: string; 
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

export type RepresentativeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RepresentativeRequest {
  id: string;
  userId: string;
  userName: string;
  clubId: string;
  clubName: string;
  status: RepresentativeRequestStatus;
  requestDate: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}
