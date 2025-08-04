
'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Club, Expense, Event } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface FirebaseContextType {
  users: User[];
  clubs: Club[];
  expenses: Expense[];
  events: Event[];
  addExpense: (expense: Expense) => void;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            setUsers(usersData);
            
            const clubsSnapshot = await getDocs(collection(db, "clubs"));
            const clubsData = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
            setClubs(clubsData);

            const expensesSnapshot = await getDocs(collection(db, "expenses"));
            const expensesData = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
            setExpenses(expensesData);

        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const addExpense = (expense: Expense) => {
    // This will be updated to write to Firestore
    setExpenses((prevExpenses) => [expense, ...prevExpenses]);
  };

  const value = {
    users,
    clubs,
    expenses,
    events: [],
    addExpense,
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
