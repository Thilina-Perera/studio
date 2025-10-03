
import { renderHook, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '../use-user';
import { useRouter } from 'next/navigation';
import type { User, Notification } from '@/lib/types';

// --- Robust Mocks using jest.requireActual ---

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');
  return {
    ...originalModule,
    getAuth: jest.fn(), // Mock the initialization function
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
    const originalModule = jest.requireActual('firebase/firestore');
    return {
        ...originalModule,
        getFirestore: jest.fn(), // Mock the initialization function
        collection: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        onSnapshot: jest.fn(),
        addDoc: jest.fn(),
        updateDoc: jest.fn(),
    };
});

global.fetch = jest.fn();

// --- Import mocks and cast them for use in tests ---
import * as auth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

const mockedOnAuthStateChanged = auth.onAuthStateChanged as jest.Mock;
const mockedAddDoc = firestore.addDoc as jest.Mock;
const mockedUpdateDoc = firestore.updateDoc as jest.Mock;
const mockedGetDoc = firestore.getDoc as jest.Mock;
const mockedCollection = firestore.collection as jest.Mock;
const mockedOnSnapshot = firestore.onSnapshot as jest.Mock;
const mockedDoc = firestore.doc as jest.Mock;
const mockedFetch = global.fetch as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

// --- Test Suite ---

describe('useUser Hook - Notifications', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => <UserProvider>{children}</UserProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedUseRouter.mockReturnValue({ push: jest.fn() });

    const mockUser = { uid: 'user-123', email: 'test@example.com' };
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });
    
    mockedCollection.mockImplementation((db, path) => ({ path }));
    mockedDoc.mockImplementation(() => ({}));

    // CORRECTED: Add the default onSnapshot mock to beforeEach.
    // This ensures that all listeners return an unsubscribe function.
    mockedOnSnapshot.mockImplementation((query: any, onNext: (snapshot: any) => void) => {
        onNext({ docs: [] }); // Default to empty data
        return jest.fn(); // CRITICAL: Return a mock unsubscribe function
    });
  });

  describe('createNotification', () => {
    it('should add a notification to the database and send an email', async () => {
      const mockRecipient: User = { id: 'recipient-456', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'student' };
      mockedGetDoc.mockResolvedValue({ exists: () => true, data: () => mockRecipient });
      
      const { result } = renderHook(() => useUser(), { wrapper });
      
      const newNotification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
        userId: 'recipient-456',
        message: 'Your request has been approved.',
        link: '/requests/req-123',
      };

      await act(async () => {
        await result.current.createNotification(newNotification);
      });

      await waitFor(() => {
        expect(mockedAddDoc).toHaveBeenCalledTimes(1);
        expect(mockedAddDoc).toHaveBeenCalledWith(
          expect.objectContaining({ path: 'notifications' }),
          expect.objectContaining({ isRead: false, userId: 'recipient-456' })
        );
      });
      
      await waitFor(() => {
          expect(mockedFetch).toHaveBeenCalledTimes(1);
          expect(mockedFetch).toHaveBeenCalledWith('/api/send-email', expect.any(Object));
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should optimistically update the UI and then call the database', async () => {
      const initialNotifications: Notification[] = [
        { id: 'notif-1', userId: 'user-123', message: 'Msg 1', link: '/', isRead: false, createdAt: new Date().toISOString() },
        { id: 'notif-2', userId: 'user-123', message: 'Msg 2', link: '/', isRead: false, createdAt: new Date().toISOString() },
      ];
      
      // This test-specific override is still correct
      mockedOnSnapshot.mockImplementation((query: any, onNext: (snapshot: any) => void) => {
        if (query.path === 'notifications') {
            const mockSnapshot = { docs: initialNotifications.map(n => ({ id: n.id, data: () => n })) };
            onNext(mockSnapshot);
        } else {
            onNext({ docs: [] });
        }
        return jest.fn(); // Return unsubscribe function
      });

      const { result } = renderHook(() => useUser(), { wrapper });
      
      await waitFor(() => expect(result.current.notifications.length).toBe(2));
      expect(result.current.notifications[0].isRead).toBe(false);
      
      act(() => {
        result.current.markNotificationAsRead('notif-1');
      });
      
      expect(result.current.notifications.find(n => n.id === 'notif-1')?.isRead).toBe(true);
      
      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledTimes(1);
        expect(mockedUpdateDoc).toHaveBeenCalledWith(expect.anything(), { isRead: true });
      });
    });
  });
});
