
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StudentDashboard } from '../student-dashboard';
import { useUser } from '@/hooks/use-user';
import { Club, Expense } from '@/lib/types';

// --- Mocks ---

// Correctly mock local dependencies using relative paths from the test file's location.
// This was the source of all previous errors.
jest.mock('../expense-table', () => ({
  __esModule: true,
  ExpenseTable: () => <div data-testid="expense-table"></div>,
}));

jest.mock('../become-representative-dialog', () => ({
  __esModule: true,
  BecomeRepresentativeDialog: () => <div data-testid="become-representative-dialog"></div>,
}));

// Note the path goes up two levels to reach the 'ui' directory.
jest.mock('../../ui/button', () => ({
  __esModule: true,
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    return asChild ? <>{children}</> : <button>{children}</button>;
  },
}));

// Mocks for globally aliased imports remain the same.
jest.mock('@/hooks/use-user', () => ({
  __esModule: true,
  useUser: jest.fn(),
}));

jest.mock('@/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  DollarSign: () => <div data-testid="icon-dollar"></div>,
  FileText: () => <div data-testid="icon-file"></div>,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// --- Typed Mocks ---
const mockedUseUser = useUser as jest.Mock;

// --- Test Data ---
const mockStudentUser = { id: 'student-123', name: 'Test Student', role: 'student' };
const mockRepresentativeUser = { id: 'rep-456', name: 'Test Rep', role: 'representative' };

const mockExpenses: Expense[] = [
  { id: 'exp-1', submitterId: 'student-123', amount: 100, status: 'Pending', clubId: 'club-1', description: '...', submittedDate: '2024-01-01', userId: 'student-123' },
  { id: 'exp-2', submitterId: 'student-123', amount: 200, status: 'Under Review', clubId: 'club-1', description: '...', submittedDate: '2024-01-01', userId: 'student-123' },
  { id: 'exp-3', submitterId: 'student-123', amount: 50, status: 'Approved', clubId: 'club-1', description: '...', submittedDate: '2024-01-01', userId: 'student-123' },
  { id: 'exp-4', submitterId: 'student-123', amount: 75, status: 'Approved', clubId: 'club-1', description: '...', submittedDate: '2024-01-01', userId: 'student-123' },
  { id: 'exp-5', submitterId: 'other-user', amount: 1000, status: 'Approved', clubId: 'club-2', description: '...', submittedDate: '2024-01-01', userId: 'other-user' },
];

const mockClubs: Club[] = [
  { id: 'club-1', name: 'Coding Club', description: '...', representativeId: 'rep-456' },
];

describe('StudentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate and display expense summaries', () => {
    // Arrange
    mockedUseUser.mockReturnValue({ user: mockStudentUser, role: 'student' });

    // Act
    render(<StudentDashboard allExpenses={mockExpenses} allClubs={mockClubs} />);

    // Assert
    const pendingCard = screen.getByText(/Pending Amount/i).closest('[data-testid="card"]');
    const approvedCard = screen.getByText(/Approved Amount/i).closest('[data-testid="card"]');

    expect(pendingCard).toHaveTextContent('$300.00'); // 100 (Pending) + 200 (Under Review)
    expect(approvedCard).toHaveTextContent('$125.00'); // 50 + 75
  });

  it('should display the "Become a Representative" button for a student', () => {
    // Arrange
    mockedUseUser.mockReturnValue({ user: mockStudentUser, role: 'student' });

    // Act
    render(<StudentDashboard allExpenses={[]} allClubs={mockClubs} />);

    // Assert
    expect(screen.getByTestId('become-representative-dialog')).toBeInTheDocument();
  });

  it('should NOT display the "Become a Representative" button for a non-student', () => {
    // Arrange
    mockedUseUser.mockReturnValue({ user: mockRepresentativeUser, role: 'representative' });

    // Act
    render(<StudentDashboard allExpenses={[]} allClubs={mockClubs} />);

    // Assert
    expect(screen.queryByTestId('become-representative-dialog')).not.toBeInTheDocument();
  });
});
