
import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../admin-dashboard';
import { useUser } from '../../../hooks/use-user';
import { useToast } from '../../../hooks/use-toast';
import { Club, Expense, User } from '../../../lib/types';

// --- Mocks ---

// Mock application hooks
jest.mock('../../../hooks/use-user');
jest.mock('../../../hooks/use-toast');

// Mock libraries and types. jest.mock calls are hoisted, so we define the
// categories array directly inside the mock to avoid a ReferenceError.
jest.mock('../../../lib/types', () => ({
  __esModule: true,
  ...jest.requireActual('../../../lib/types'),
  EXPENSE_STATUSES: ['Pending', 'Under Review', 'Approved', 'Rejected'],
  EXPENSE_CATEGORIES: [
    "Other", 
    "Food & Beverage", 
    "Stationary", 
    "Event Materials", 
    "Transport", 
    "Venue", 
    "Subscriptions", 
    "Advertising", 
    "Entertainment"
  ],
}));

// Mock all child components to isolate the dashboard
jest.mock('../expense-table', () => ({
  __esModule: true,
  ExpenseTable: ({ expenses }: { expenses: Expense[] }) => (
    <div data-testid="expense-table">
      {expenses.map((e) => (
        <div key={e.id}>{e.description}</div>
      ))}
    </div>
  ),
}));

jest.mock('../ai-expense-prioritization', () => ({
  __esModule: true,
  AiExpensePrioritization: ({ expenses }: { expenses: Expense[] }) => {
    const priority = expenses.filter(e => e.status === 'Pending' || e.status === 'Under Review');
    return (
        <div data-testid="ai-priority-queue">
          {priority.map((e) => <div key={e.id}>{e.description}</div>)}
        </div>
    );
  }
}));

jest.mock('../expense-report-dialog', () => ({
  __esModule: true,
  ExpenseReportDialog: () => <div data-testid="expense-report-dialog"></div>,
}));

jest.mock('../chatbot-popup', () => ({
  __esModule: true,
  ChatbotPopup: () => <div data-testid="chatbot-popup"></div>,
}));

// Mock UI library components
jest.mock('../../../components/ui/card', () => ({
  __esModule: true,
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../../components/ui/input', () => ({
    __esModule: true,
    Input: (props: any) => <input data-testid="input-description" {...props} />,
}));

// We use a context to correctly isolate multiple instances of the Select component,
// ensuring each one calls its own onValueChange handler.
const SelectContext = React.createContext<{ onValueChange: (value: string) => void } | null>(null);

jest.mock('../../../components/ui/select', () => ({
  __esModule: true,
  Select: ({ children, value, onValueChange }: { children: React.ReactNode, value: string, onValueChange: (value: string) => void }) => (
    <SelectContext.Provider value={{ onValueChange }}>
      <div data-value={value}>{children}</div>
    </SelectContext.Provider>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode, value: string }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = React.useContext(SelectContext);
    return (
      <button data-testid={`select-item-${value}`} onClick={() => context?.onValueChange(value)}>
        {children}
      </button>
    );
  },
}));

jest.mock('../../../components/ui/date-range-picker', () => ({
  __esModule: true,
  DateRangePicker: () => <div data-testid="date-range-picker"></div>,
}));

// --- Test Setup ---

const mockedUseUser = useUser as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const mockAdminUser: User = { id: 'admin-1', name: 'Admin User', email: 'admin@test.com', role: 'admin' };

const mockClubs: Club[] = [
  { id: 'club-1', name: 'Chess Club', description: 'desc', representativeId: 'user-1' },
  { id: 'club-2', name: 'Art Club', description: 'desc', representativeId: 'user-2' },
  { id: 'club-3', name: 'Science Club', description: 'desc', representativeId: 'user-3' },
];

const mockExpenses: Expense[] = [
  { id: 'exp-1', userId: 'user-1', description: 'New chess boards', amount: 100, status: 'Pending', clubId: 'club-1', submittedDate: '2024-05-01T12:00:00.000Z', category: 'Event Materials', submitterId: 'user-1' },
  { id: 'exp-2', userId: 'user-2', description: 'Paint supplies', amount: 50, status: 'Pending', clubId: 'club-2', submittedDate: '2024-05-02T12:00:00.000Z', category: 'Event Materials', submitterId: 'user-2' },
  { id: 'exp-3', userId: 'user-1', description: 'Snacks for meeting', amount: 25, status: 'Under Review', clubId: 'club-1', submittedDate: '2024-05-03T12:00:00.000Z', category: 'Food & Beverage', submitterId: 'user-1' },
  { id: 'exp-4', userId: 'user-2', description: 'Canvases', amount: 150, status: 'Approved', clubId: 'club-2', submittedDate: '2024-04-22T12:00:00.000Z', category: 'Event Materials', submitterId: 'user-2' },
  { id: 'exp-5', userId: 'user-3', description: 'Lab coats', amount: 200, status: 'Approved', clubId: 'club-3', submittedDate: '2024-04-23T12:00:00.000Z', category: 'Event Materials', submitterId: 'user-3' },
  { id: 'exp-6', userId: 'user-1', description: 'Tournament fee', amount: 75, status: 'Rejected', clubId: 'club-1', submittedDate: '2024-04-25T12:00:00.000Z', category: 'Other', submitterId: 'user-1' },
];

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockedUseUser.mockReturnValue({ user: mockAdminUser, users: [mockAdminUser] });
    mockedUseToast.mockReturnValue({ toast: jest.fn() });
  });

  it('should render the main components and initial stats', () => {
    render(<AdminDashboard allExpenses={mockExpenses} allClubs={mockClubs} />);
    
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
    expect(screen.getByTestId('ai-priority-queue')).toBeInTheDocument();
    expect(screen.getByTestId('expense-table')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-popup')).toBeInTheDocument();
  });

  it('should display pending and under review expenses in the AI Priority Queue', () => {
    render(<AdminDashboard allExpenses={mockExpenses} allClubs={mockClubs} />);
    
    const priorityQueue = within(screen.getByTestId('ai-priority-queue'));
    
    expect(priorityQueue.getByText('New chess boards')).toBeInTheDocument();
    expect(priorityQueue.getByText('Paint supplies')).toBeInTheDocument();
    expect(priorityQueue.getByText('Snacks for meeting')).toBeInTheDocument();
    
    expect(priorityQueue.queryByText('Canvases')).not.toBeInTheDocument();
    expect(priorityQueue.queryByText('Tournament fee')).not.toBeInTheDocument();
  });

  it('should filter the expense list by status', async () => {
    render(<AdminDashboard allExpenses={mockExpenses} allClubs={mockClubs} />);

    const expenseTable = within(screen.getByTestId('expense-table'));
    expect(expenseTable.getByText('New chess boards')).toBeInTheDocument();
    expect(expenseTable.getByText('Canvases')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('select-item-Approved'));

    await waitFor(() => {
      expect(expenseTable.queryByText('New chess boards')).not.toBeInTheDocument();
      expect(expenseTable.getByText('Canvases')).toBeInTheDocument();
      expect(expenseTable.getByText('Lab coats')).toBeInTheDocument();
    });
  });

  it('should filter expenses by description', async () => {
    render(<AdminDashboard allExpenses={mockExpenses} allClubs={mockClubs} />);
    
    const expenseTable = within(screen.getByTestId('expense-table'));
    expect(expenseTable.getByText('New chess boards')).toBeInTheDocument();
    expect(expenseTable.getByText('Paint supplies')).toBeInTheDocument();

    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'chess' } });

    await waitFor(() => {
        expect(expenseTable.getByText('New chess boards')).toBeInTheDocument();
        expect(expenseTable.queryByText('Paint supplies')).not.toBeInTheDocument();
    });
  });
});
