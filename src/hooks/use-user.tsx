'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import type { User as AppUser, UserRole, Club, Expense, RepresentativeRequest, Notification } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, QuerySnapshot, DocumentData, addDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  role: UserRole | null;
  clubs: Club[];
  expenses: Expense[];
  users: AppUser[];
  representativeRequests: RepresentativeRequest[];
  notifications: Notification[];
  loading: boolean;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
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
  const [representativeRequests, setRepresentativeRequests] = useState<RepresentativeRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('/');
  }, [router]);

 const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      // 1. Create the notification in the database
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 2. Send an email notification
      const recipient = users.find(u => u.id === notification.userId);
      if (recipient?.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipient.email,
            subject: 'New Notification', // Or a more specific subject
            html: `<p>${notification.message}</p><p><a href="${notification.link}">View Details</a></p>`,
          }),
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }, [users]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    // Optimistically update the UI
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    
    // Update the database in the background
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      updateDoc(notifRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Note: In a real-world app, you might want to add logic to revert the optimistic update on failure.
    }
  }, []);


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
          setRepresentativeRequests([]);
          setNotifications([]);
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
    const requestsCollection = collection(db, 'representativeRequests');
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const notificationsCollection = collection(db, 'notifications');


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
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
    
    const unsubscribeRequests = onSnapshot(
      requestsCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const requestsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as RepresentativeRequest[];
        setRepresentativeRequests(requestsData);
        setLoading(false);
      },
      (error) => {
          console.error('Error fetching requests:', error);
          setLoading(false);
      }
    );
    
     const unsubscribeNotifications = onSnapshot(
      notificationsCollection,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const notificationsData = (snapshot.docs
         .map((doc) => ({
            id: doc.id,
            ...doc.data(),
         })) as Notification[])
         .filter(notif => notif.userId === firebaseUser.uid)
         .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setNotifications(notificationsData);
      },
      (error) => {
          console.error('Error fetching notifications:', error);
      }
    );


    return () => {
      unsubscribeClubs();
      unsubscribeExpenses();
      unsubscribeUsers();
      unsubscribeRequests();
      unsubscribeNotifications();
    };
  }, [firebaseUser]);
  
  const value = {
    user,
    firebaseUser,
    role,
    clubs,
    expenses,
    users,
    representativeRequests,
    notifications,
    loading,
    createNotification,
    markNotificationAsRead,
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
