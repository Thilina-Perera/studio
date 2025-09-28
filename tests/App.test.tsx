import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../src/app/page';

describe('Home Component', () => {
  test('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText(/Streamline Your Club's Finances with ReimburseAI/i)).toBeInTheDocument();
  });

  test('displays call to action buttons', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });
});
