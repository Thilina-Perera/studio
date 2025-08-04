'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Club, Expense, Event } from '@/lib/types';
import { initialUsers, initialClubs, initialExpenses } from '@/lib/mock-data';

interface MockDataContextType {
  users: User[];
  clubs: Club[];
  expenses: Expense[];
  events: Event[];
  addExpense: (expense: Expense) => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const addExpense = (expense: Expense) => {
    setExpenses((prevExpenses) => [expense, ...prevExpenses]);
  };

  const value = {
    users,
    clubs,
    expenses,
    events: [],
    addExpense,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
