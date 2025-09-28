import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '@/app/(auth)/signup/page';

describe('User Flow Integration', () => {
  test('complete user registration flow', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API failure
    const fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));
    
    const user = userEvent.setup();
    render(<SignUpPage />);

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
    
    fetchSpy.mockRestore();
  });
});
