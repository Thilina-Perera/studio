
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock the necessary modules and hooks
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('LoginForm', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (signInWithEmailAndPassword as jest.Mock).mockClear();
    mockPush.mockClear();
    mockToast.mockClear();
  });

  it('renders the login form with email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid email and password', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email address.')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  it('submits the form with valid data and redirects on successful login', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: {} });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@example.com', 'password123');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Logged In!',
        description: "You've been successfully logged in.",
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error toast on failed login', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'wrong@example.com', 'wrongpassword');
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
