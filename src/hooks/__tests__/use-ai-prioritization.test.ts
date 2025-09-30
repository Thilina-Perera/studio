
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAiPrioritization } from '../use-ai-prioritization';
import { prioritizeExpenses } from '@/ai/flows/prioritize-expenses';
import type { Expense, Club, User } from '@/lib/types';

// Mock the AI flow module
jest.mock('@/ai/flows/prioritize-expenses', () => ({
  prioritizeExpenses: jest.fn(),
}));

// Cast the mock to be able to use mock-specific methods like mockResolvedValue
const mockedPrioritizeExpenses = prioritizeExpenses as jest.Mock;

// --- Test Data ---
const mockClubs: Club[] = [{ id: 'club-1', name: 'Chess Club', description: 'A club for chess enthusiasts', representativeId: 'user-1' }];
const mockUsers: User[] = [{ id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'student' }];
const mockExpenses: Expense[] = [
  { id: 'exp-1', description: 'New chess boards', amount: 100, status: 'Pending', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString() },
  { id: 'exp-2', description: 'Snacks for meeting', amount: 50, status: 'Under Review', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString() },
  { id: 'exp-3', description: 'T-shirts', amount: 200, status: 'Approved', clubId: 'club-1', submitterId: 'user-1', submittedDate: new Date().toISOString() },
];

describe('useAiPrioritization', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockedPrioritizeExpenses.mockClear();
  });

  it('✓ should set loading state correctly when running prioritization', async () => {
    // Ensure the mock returns a value to prevent a TypeError on `.map()`
    mockedPrioritizeExpenses.mockResolvedValue([]);

    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    // Use act to wrap the state-updating call
    act(() => {
      result.current.runPrioritization();
    });

    expect(result.current.loading).toBe(true);

    // Wait for the async operation to complete to avoid test warnings
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('✓ should not call prioritization if there are no pending expenses', async () => {
    const approvedExpenses = mockExpenses.filter(e => e.status === 'Approved');
    const { result } = renderHook(() => useAiPrioritization({ expenses: approvedExpenses, clubs: mockClubs, users: mockUsers }));

    await act(async () => {
      await result.current.runPrioritization();
    });

    expect(mockedPrioritizeExpenses).not.toHaveBeenCalled();
    expect(result.current.prioritizedExpenses).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('✓ should correctly process a successful API response', async () => {
    const mockApiResponse = [
      { expenseId: 'exp-2', priorityScore: 9, reason: 'High impact' },
      { expenseId: 'exp-1', priorityScore: 7, reason: 'Medium impact' },
    ];
    mockedPrioritizeExpenses.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    await act(async () => {
      await result.current.runPrioritization();
    });

    // Wait for the state to be updated
    await waitFor(() => {
      expect(result.current.prioritizedExpenses.length).toBe(2);
      // Check if it's sorted correctly (highest score first)
      expect(result.current.prioritizedExpenses[0].id).toBe('exp-2');
      expect(result.current.prioritizedExpenses[0].priorityScore).toBe(9);
      expect(result.current.prioritizedExpenses[1].id).toBe('exp-1');
      expect(result.current.loading).toBe(false);
    });
  });

  it('✓ should handle an API error and set the error state', async () => {
    // Suppress console.error for this test because we expect an error to be logged
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const errorMessage = 'An unknown error occurred.';
    mockedPrioritizeExpenses.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAiPrioritization({ expenses: mockExpenses, clubs: mockClubs, users: mockUsers }));

    await act(async () => {
      await result.current.runPrioritization();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(result.current.prioritizedExpenses).toEqual([]);
    });

    // Restore original console.error
    consoleErrorSpy.mockRestore();
  });
});
