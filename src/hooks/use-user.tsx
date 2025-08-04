
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { User as AppUser, UserRole } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const roles: UserRole[] = ['admin', 'representative', 'student'];

interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  role: UserRole | null;
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
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUserData) => {
            setLoading(true);
            if (authUserData) {
                setFirebaseUser(authUserData);
                const userDocRef = doc(db, "users", authUserData.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data() as AppUser;
                    setUser(userData);
                    setRole(userData.role);
                } else {
                    setUser(null);
                    setRole(null);
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
                setRole(null);
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
        router.push('/');
    };
    
    // The role toggling is for demo purposes. In a real app, roles would be managed by an admin.
    const toggleRole = useCallback(async () => {
        if (!user) return;
        const currentIndex = roles.indexOf(user.role);
        const nextIndex = (currentIndex + 1) % roles.length;
        const newRole = roles[nextIndex];
        // In a real app, you would have a secure way to update this, likely a cloud function.
        // For this demo, we'll just update the local state.
        setUser({...user, role: newRole});
        setRole(newRole);
    }, [user]);

    const getNextRole = () => {
        if (!role) return null;
        const currentIndex = roles.indexOf(role);
        const nextIndex = (currentIndex + 1) % roles.length;
        return roles[nextIndex];
    }
    
    const value = { user, firebaseUser, role, loading, logout, toggleRole, getNextRole };

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
