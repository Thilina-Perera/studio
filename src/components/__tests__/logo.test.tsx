import { render, screen } from '@testing-library/react';
import { Logo } from '../logo';

describe('Logo', () => {
  it('renders the logo with the correct text', () => {
    render(<Logo />);
    const logoText = screen.getByText(/ReimburseAI/i);
    expect(logoText).toBeInTheDocument();
  });
});
