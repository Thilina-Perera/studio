
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { User as AppUser, UserRole, Club, Expense } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
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
    const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUserData) => {
            setLoading(true);
            if (authUserData) {
                setFirebaseUser(authUserData);
                
                // Fetch user data, clubs, and expenses
                try {
                    const userDocRef = doc(db, "users", authUserData.uid);
                    const [userDoc, clubsSnapshot, expensesSnapshot] = await Promise.all([
                        getDoc(userDocRef),
                        getDocs(collection(db, "clubs")),
                        getDocs(collection(db, "expenses"))
                    ]);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as AppUser;
                        setUser(userData);
                        setRole(userData.role);
                    } else {
                         setUser(null);
                         setRole(null);
                    }
                    
                    const clubsData = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
                    setClubs(clubsData);

                    const expensesData = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
                    setExpenses(expensesData);

                } catch (error) {
                    console.error("Error fetching initial data:", error);
                    // Reset state on error
                    setUser(null);
                    setRole(null);
                    setClubs([]);
                    setExpenses([]);
                }
            } else {
                // No user logged in
                setFirebaseUser(null);
                setUser(null);
                setRole(null);
                setClubs([]);
                setExpenses([]);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        setRole(null);
        setClubs([]);
        setExpenses([]);
        router.push('/');
    };
    
    const toggleRole = useCallback(async () => {
        if (!user) return;
        const currentIndex = roles.indexOf(user.role);
        const nextIndex = (currentIndex + 1) % roles.length;
        const newRole = roles[nextIndex];
        setUser({...user, role: newRole});
        setRole(newRole);
    }, [user]);

    const getNextRole = () => {
        if (!role) return null;
        const currentIndex = roles.indexOf(role);
        const nextIndex = (currentIndex + 1) % roles.length;
        return roles[nextIndex];
    }
    
    const value = { user, firebaseUser, role, loading, clubs, expenses, logout, toggleRole, getNextRole };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
