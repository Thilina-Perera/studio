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
import { collection, doc, getDoc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  role: UserRole | null;
  clubs: Club[];
  expenses: Expense[];
  users: AppUser[];
  loading: boolean;
  logout: () => void;
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
  const [users, setUsers] = useState<AppUser[]>([]);
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
        } else {
          // No user logged in, reset all state
          setFirebaseUser(null);
          setUser(null);
          setRole(null);
          setClubs([]);
          setExpenses([]);
          setUsers([]);
          setLoading(false);
        }
      }
    );
    // Cleanup auth subscription on unmount
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    const clubsCollection = collection(db, 'clubs');
    const expensesCollection = collection(db, 'expenses');
    const usersCollection = collection(db, 'users');
    const userDocRef = doc(db, 'users', firebaseUser.uid);

    const unsubscribeUsers = onSnapshot(
      usersCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const usersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as AppUser[];
        setUsers(usersData);
      },
      (error) => {
          console.error('Error fetching users:', error);
      }
    )

    const unsubscribeClubs = onSnapshot(
      clubsCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const clubsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Club[];
        setClubs(clubsData);
        
        // After clubs are loaded, determine the role
        getDoc(userDocRef).then(userDoc => {
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() } as AppUser;
                setUser(userData);

                if (userData.role === 'admin') {
                    setRole('admin');
                } else {
                    const isRep = clubsData.some(club => club.representativeId === firebaseUser.uid);
                    if (isRep) {
                        setRole('representative');
                    } else {
                        setRole('student');
                    }
                }
            } else {
                setUser(null);
                setRole(null);
            }
        });
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
        setLoading(false); // Consider loading finished after all data is attempted
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeClubs();
      unsubscribeExpenses();
      unsubscribeUsers();
    };
  }, [firebaseUser]);
  
  const value = {
    user,
    firebaseUser,
    role,
    clubs,
    expenses,
    users,
    loading,
    logout: handleLogout,
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
