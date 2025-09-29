import { render, screen } from '@testing-library/react';
import NewExpensePage from '../page';

// Mock for Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock for useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

// Mock for useUser hook to provide necessary data including clubs
jest.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: { id: 'test-uid', name: 'Test User' },
    role: 'student',
    clubs: [
      { id: 'club-1', name: 'Test Club 1' },
      { id: 'club-2', name: 'Test Club 2' },
    ],
    loading: false,
  }),
}));

// Comprehensive mock for lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: (props: any) => <div {...props} />,
  ChevronUp: (props: any) => <div {...props} />,
  Check: (props: any) => <div {...props} />,
  CheckCircle: (props: any) => <div {...props} />,
  FileUp: (props: any) => <div {...props} />,
}));

// Mock for zodResolver
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => (values: any) => Promise.resolve({ values, errors: {} })),
}));

describe('NewExpensePage', () => {
  it('should render the expense submission form correctly', () => {
    render(<NewExpensePage />);

    // Check for the main heading text
    expect(screen.getByText(/submit new expense/i)).toBeInTheDocument();

    // Check for essential form fields by their labels
    expect(screen.getByLabelText(/club/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    
    // Verify the file input for the receipt
    const fileInput = screen.getByLabelText(/receipt/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');

    // Check for the submit button
    expect(screen.getByRole('button', { name: /submit expense/i })).toBeInTheDocument();
  });
});
