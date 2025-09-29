import { render, screen } from '@testing-library/react';
import { SignupForm } from '../signup-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('firebase/auth');

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('lucide-react', () => ({
  Eye: (props: any) => <div {...props} data-testid="password-visibility-toggle" />, 
  EyeOff: (props: any) => <div {...props} data-testid="password-visibility-toggle" />,
}));

describe('SignupForm', () => {
  it('should render the signup form', () => {
    const { container } = render(<SignupForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    const passwordInput = container.querySelector('input[name="password"]');
    expect(passwordInput).toBeInTheDocument();

    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    expect(confirmPasswordInput).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('password-visibility-toggle').length).toBe(2);
  });
});
