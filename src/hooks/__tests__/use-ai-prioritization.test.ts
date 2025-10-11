
import { renderHook, act } from '@testing-library/react';
import { useAiPrioritization } from '../use-ai-prioritization';
import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import { Club, Expense, User } from '@/lib/types';

// Mocks
jest.mock('@/ai/flows/prioritize-expenses', () => ({
  __esModule: true,
  prioritizeExpenses: jest.fn(),
}));

// Type Definitions
type PrioritizationResult = {
  expenseId: string;
  priorityScore: number;
  reason: string;
};

const mockedPrioritizeExpenses = prioritizeExpenses as jest.Mock;

// Test Data
const mockClubs: Club[] = [{ id: 'club-1', name: 'Chess Club', description: 'A club for chess enthusiasts', representativeId: 'user-1' }];
const mockUsers: User[] = [{ id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'student' }];
const mockExpenses: Expense[] = [
  { id: 'exp-1', description: 'New chess boards', amount: 100, status: 'Pending', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString(), userId: 'user-1' },
  { id: 'exp-2', description: 'Snacks for meeting', amount: 50, status: 'Under Review', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString(), userId: 'user-1' },
  { id: 'exp-3', description: 'T-shirts', amount: 200, status: 'Approved', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString(), userId: 'user-1' },
];

describe('useAiPrioritization', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedPrioritizeExpenses.mockClear();
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should set loading state correctly when running prioritization', async () => {
    mockedPrioritizeExpenses.mockResolvedValue([]);
    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    expect(result.current.loading).toBe(false);

    let promise: Promise<void>;
    act(() => {
      promise = result.current.runPrioritization();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should return prioritized expenses when the run function is called', async () => {
    const prioritizedOutput: PrioritizationResult[] = [
      { expenseId: 'exp-1', priorityScore: 9, reason: 'High-impact item for the club.' },
      { expenseId: 'exp-2', priorityScore: 5, reason: 'Standard operational cost.' },
    ];
    mockedPrioritizeExpenses.mockResolvedValue(prioritizedOutput);

    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    await act(async () => {
      await result.current.runPrioritization();
    });

    const expectedResult = [
      expect.objectContaining({ id: 'exp-1', priorityScore: 9, reason: 'High-impact item for the club.' }),
      expect.objectContaining({ id: 'exp-2', priorityScore: 5, reason: 'Standard operational cost.' }),
    ];

    expect(result.current.prioritizedExpenses).toEqual(expectedResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set an error when prioritization fails', async () => {
    const errorMessage = 'AI prioritization failed';
    mockedPrioritizeExpenses.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    await act(async () => {
      await result.current.runPrioritization();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
    expect(result.current.prioritizedExpenses).toEqual([]);
  });

  it('should retain error state when dependencies change before a new run', async () => {
    const errorMessage = 'Old error';
    mockedPrioritizeExpenses.mockRejectedValue(new Error(errorMessage));

    const { result, rerender } = renderHook(
      ({ expenses }) => useAiPrioritization({ expenses, clubs: mockClubs, users: mockUsers }),
      { initialProps: { expenses: mockExpenses } }
    );

    await act(async () => {
      await result.current.runPrioritization();
    });

    expect(result.current.error).toBe(errorMessage);

    const newExpenses = [...mockExpenses, { ...mockExpenses[0], id: 'exp-4', userId: 'user-1' }];
    rerender({ expenses: newExpenses });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.prioritizedExpenses).toEqual([]);
  });
});
