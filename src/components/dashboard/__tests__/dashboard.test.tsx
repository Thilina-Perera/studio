
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../dashboard';
import { useUser } from '@/hooks/use-user';

// Mock the useUser hook
jest.mock('@/hooks/use-user', () => ({
  useUser: jest.fn(),
}));

// Cast the mock for TypeScript to provide type safety
const mockedUseUser = useUser as jest.Mock;

describe('Dashboard', () => {
  // Create mock components for each dashboard role to pass as props
  const mockAdminDashboard = <div data-testid="admin-dashboard">Admin Dashboard</div>;
  const mockRepresentativeDashboard = <div data-testid="representative-dashboard">Representative Dashboard</div>;
  const mockStudentDashboard = <div data-testid="student-dashboard">Student Dashboard</div>;

  beforeEach(() => {
    // Clear all mocks before each test to ensure a clean state
    mockedUseUser.mockClear();
  });

  it('should render the AdminDashboard for admin users', () => {
    // Arrange: Mock the useUser hook to return an admin user
    mockedUseUser.mockReturnValue({
      user: { id: 'admin-user-123' },
      role: 'admin',
    });

    // Act: Render the Dashboard component with the mock dashboards
    render(
      <Dashboard
        adminDashboard={mockAdminDashboard}
        representativeDashboard={mockRepresentativeDashboard}
        studentDashboard={mockStudentDashboard}
      />
    );

    // Assert: Verify that only the admin dashboard is visible
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('representative-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
  });

  it('should render the RepresentativeDashboard for representative users', () => {
    // Arrange: Mock the useUser hook to return a representative user
    mockedUseUser.mockReturnValue({
      user: { id: 'rep-user-456' },
      role: 'representative',
    });

    // Act
    render(
      <Dashboard
        adminDashboard={mockAdminDashboard}
        representativeDashboard={mockRepresentativeDashboard}
        studentDashboard={mockStudentDashboard}
      />
    );

    // Assert: Verify that only the representative dashboard is visible
    expect(screen.getByTestId('representative-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
  });

  it('should render the StudentDashboard for student users', () => {
    // Arrange: Mock the useUser hook to return a student user
    mockedUseUser.mockReturnValue({
      user: { id: 'student-user-789' },
      role: 'student',
    });

    // Act
    render(
      <Dashboard
        adminDashboard={mockAdminDashboard}
        representativeDashboard={mockRepresentativeDashboard}
        studentDashboard={mockStudentDashboard}
      />
    );

    // Assert: Verify that only the student dashboard is visible
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('representative-dashboard')).not.toBeInTheDocument();
  });

  it('should render a loading skeleton when the user data is not yet available', () => {
    // Arrange: Mock the useUser hook to simulate a loading state (no user)
    mockedUseUser.mockReturnValue({
      user: null,
      role: null,
    });

    // Act
    render(
      <Dashboard
        adminDashboard={mockAdminDashboard}
        representativeDashboard={mockRepresentativeDashboard}
        studentDashboard={mockStudentDashboard}
      />
    );

    // Assert: Verify that none of the dashboards are rendered, implying the skeleton is shown
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('representative-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-dashboard')).not.toBeInTheDocument();
  });
});
