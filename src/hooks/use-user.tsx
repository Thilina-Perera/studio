'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import type { User as AppUser, UserRole, Club, Expense } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const roles: UserRole[] = ['admin', 'representative', 'student'];

interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  role: UserRole | null;
  clubs: Club[];
  expenses: Expense[];
  loading: boolean;
  logout: () => void;
  toggleRole: () => void;
  getNextRole: () => UserRole | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(
    null
  );
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('/');
  }, [router]);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authUserData) => {
        setLoading(true);
        if (authUserData) {
          setFirebaseUser(authUserData);

          const userDocRef = doc(db, 'users', authUserData.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            setUser(userData);
            setRole(userData.role);
          } else {
             setUser(null);
             setRole(null);
             setLoading(false);
          }
        } else {
          // No user logged in, reset all state
          setFirebaseUser(null);
          setUser(null);
          setRole(null);
          setClubs([]);
          setExpenses([]);
          setLoading(false);
        }
      }
    );
    // Cleanup auth subscription on unmount
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return; // Don't listen to collections if no user is logged in

    const clubsCollection = collection(db, 'clubs');
    const expensesCollection = collection(db, 'expenses');

    const unsubscribeClubs = onSnapshot(clubsCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const clubsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
      setClubs(clubsData);
      setLoading(false); // Consider loading finished after first data comes in
    }, (error) => {
      console.error("Error fetching clubs:", error);
      setLoading(false);
    });

    const unsubscribeExpenses = onSnapshot(expensesCollection, (snapshot: QuerySnapshot<DocumentData>) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
      setExpenses(expensesData);
       setLoading(false); // Consider loading finished after first data comes in
    }, (error) => {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    });

    // Cleanup collection subscriptions on unmount or user change
    return () => {
      unsubscribeClubs();
      unsubscribeExpenses();
    };
  }, [firebaseUser]);

  const toggleRole = useCallback(async () => {
    if (!user) return;
    const currentIndex = roles.indexOf(user.role);
    const nextIndex = (currentIndex + 1) % roles.length;
    const newRole = roles[nextIndex];
    setUser({ ...user, role: newRole });
    setRole(newRole);
  }, [user]);

  const getNextRole = () => {
    if (!role) return null;
    const currentIndex = roles.indexOf(role);
    const nextIndex = (currentIndex + 1) % roles.length;
    return roles[nextIndex];
  };

  const value = {
    user,
    firebaseUser,
    role,
    loading,
    clubs,
    expenses,
    logout: handleLogout,
    toggleRole,
    getNextRole,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
