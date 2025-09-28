
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '../signup-form';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock Firebase, Next.js, and other dependencies
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('SignupForm', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (createUserWithEmailAndPassword as jest.Mock).mockClear();
    (updateProfile as jest.Mock).mockClear();
    (setDoc as jest.Mock).mockClear();
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    mockToast.mockClear();
  });

  it('1. renders all form fields and the submit button', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/re-enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('2. shows validation errors for empty fields on submit', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Name must be at least 2 characters.')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email address.')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  it("3. shows a validation error if passwords don't match", async () => {
    render(<SignupForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password456');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
  });

  it('4. successfully signs up a user and redirects', async () => {
    const mockUser = { uid: '12345', email: 'test@example.com' };
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
    (updateProfile as jest.Mock).mockResolvedValue(undefined);
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), mockUser.email);
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), mockUser.email, 'password123');
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
      expect(setDoc).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/api/send-email', expect.any(Object));
      expect(mockToast).toHaveBeenCalledWith({ title: 'Account Created!', description: 'Your account has been successfully created.' });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it("5. shows an error toast if the email is already in use", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/email-already-in-use' });
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: 'An account with this email already exists. Please log in or use a different email.',
      });
    });
  });

  it('6. toggles password visibility correctly and independently', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/re-enter password/i);
    const passwordToggle = screen.getByTestId('password-visibility-toggle');
    const confirmPasswordToggle = screen.getByTestId('confirm-password-visibility-toggle');

    // Initial state: both are passwords
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click first toggle
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click second toggle
    await user.click(confirmPasswordToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Click first toggle again
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('7. shows a generic error toast for other signup failures', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/some-other-error' });
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: 'Could not create your account. Please try again.',
      });
    });
  });

  it('8. ensures the submit button is disabled during form submission', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("9. shows 'Creating account...' on the button while submitting", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/re-enter password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account.../i })).toBeInTheDocument();
    });
  });

  it('10. shows validation error for short password', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^password$/i), '123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });
});
