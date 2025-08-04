'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import type { Club, Expense } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { useUser } from './use-user';

interface FirebaseContextType {
  clubs: Club[];
  expenses: Expense[];
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useUser();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
        setClubs([]);
        setExpenses([]);
        setLoading(false);
        return;
    }
    setLoading(true);

    const clubsCollection = collection(db, 'clubs');
    const expensesCollection = collection(db, 'expenses');

    const unsubscribeClubs = onSnapshot(
      clubsCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const clubsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Club[];
        setClubs(clubsData);
      },
      (error) => {
        console.error('Error fetching clubs:', error);
      }
    );

    const unsubscribeExpenses = onSnapshot(
      expensesCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const expensesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setExpenses(expensesData);
        setLoading(false); // Consider loading finished after both are attempted
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    );

    // Cleanup collection subscriptions on unmount or user change
    return () => {
      unsubscribeClubs();
      unsubscribeExpenses();
    };
  }, [firebaseUser]);

  const value = {
    clubs,
    expenses,
    loading,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
