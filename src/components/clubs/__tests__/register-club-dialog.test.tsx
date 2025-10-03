
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterClubDialog } from '../register-club-dialog';

// --- Mocks ---

// 1. Service, Hook, and Library Mocks
jest.mock('@/hooks/use-user', () => ({ useUser: jest.fn() }));
jest.mock('@/hooks/use-toast', () => ({ useToast: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: jest.fn(() => ['mockApp']), getApp: jest.fn(() => 'mockApp') }));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase/storage', () => ({ getStorage: jest.fn() }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn(), collection: jest.fn(), addDoc: jest.fn() }));

// THE CORRECT AND COMPLETE MOCK FOR LUCIDE-REACT
jest.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-circle-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// --- Typed Mocks ---
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as firestore from 'firebase/firestore';

const mockedUseUser = useUser as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedAddDoc = firestore.addDoc as jest.Mock;
const mockedCollection = firestore.collection as jest.Mock;

// --- Test Suite ---

describe('RegisterClubDialog', () => {
  let mockToast: jest.Mock;
  let mockRouterRefresh: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseUser.mockReturnValue({
      user: { id: 'user-rep-123', name: 'Test User', role: 'representative' },
    });

    mockToast = jest.fn();
    mockedUseToast.mockReturnValue({ toast: mockToast });
    
    mockRouterRefresh = jest.fn();
    mockedUseRouter.mockReturnValue({ refresh: mockRouterRefresh });
    
    mockedCollection.mockImplementation((_db, path) => ({ path }));
  });

  it('should allow a user to register a new club and call the correct services', async () => {
    mockedAddDoc.mockResolvedValue({ id: 'new-club-id' });
    const user = userEvent.setup();
    render(<RegisterClubDialog />);

    const registerButton = screen.getByRole('button', { name: /register new club/i });
    await user.click(registerButton);

    const nameInput = screen.getByLabelText(/club name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: 'Register Club' });

    const clubName = 'The Coding Club';
    const clubDescription = 'A place for passionate coders.';

    await user.type(nameInput, clubName);
    await user.type(descriptionInput, clubDescription);
    
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAddDoc).toHaveBeenCalledTimes(1);
      expect(mockedAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'clubs' }),
        {
          name: clubName,
          description: clubDescription,
          representativeId: 'user-rep-123',
        }
      );
    });

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Club Registered!',
            description: `${clubName} has been successfully registered.`,
        });
    });

    await waitFor(() => {
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should show an error toast if club registration fails', async () => {
    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const errorMessage = 'Failed to register club';
    mockedAddDoc.mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(<RegisterClubDialog />);

    const registerButton = screen.getByRole('button', { name: /register new club/i });
    await user.click(registerButton);

    const nameInput = screen.getByLabelText(/club name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: 'Register Club' });

    const clubName = 'The Coding Club';
    const clubDescription = 'A place for passionate coders.';

    await user.type(nameInput, clubName);
    await user.type(descriptionInput, clubDescription);
    
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAddDoc).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Could not register the new club. Please try again.',
      });
    });

    expect(mockRouterRefresh).not.toHaveBeenCalled();
    
    // Check that the error was logged to the console
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error registering club:', expect.any(Error));
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
