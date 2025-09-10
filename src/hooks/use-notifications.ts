import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Notification } from '@/lib/notifications';

export const useNotifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userNotifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          userNotifications.push({ id: doc.id, ...doc.data() } as Notification);
        });
        setNotifications(userNotifications);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const createNotification = async (userId: string, title: string, message: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(notifications => notifications.filter(n => n.id !== notificationId));
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return { notifications, createNotification, deleteNotification };
};