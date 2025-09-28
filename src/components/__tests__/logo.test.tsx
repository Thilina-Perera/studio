import { render, screen } from '@testing-library/react';
import { Logo } from '../logo';

jest.mock('lucide-react');

describe('Logo', () => {
  it('should render the logo', () => {
    render(<Logo />);
    const logo = screen.getByText(/ReimburseAI/i);
    expect(logo).toBeInTheDocument();
  });

  it('should have a link to the homepage', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('should have the correct accessibility attributes', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'ReimburseAI homepage');
  });

  it('should render the Wallet icon', () => {
    render(<Logo />);
    const icon = screen.getByText(/Wallet/i);
    expect(icon).toBeInTheDocument();
  });

  it('should apply the correct size classes to the Wallet icon', () => {
    render(<Logo />);
    const icon = screen.getByText(/Wallet/i);
    expect(icon).toHaveClass('h-6 w-6');
  });

  it('should apply the correct color class to the Wallet icon', () => {
    render(<Logo />);
    const icon = screen.getByText(/Wallet/i);
    expect(icon).toHaveClass('text-primary');
  });

  it('should render the text "ReimburseAI"', () => {
    render(<Logo />);
    const text = screen.getByText('ReimburseAI');
    expect(text).toBeInTheDocument();
  });

  it('should apply the correct classes to the text', () => {
    render(<Logo />);
    const text = screen.getByText('ReimburseAI');
    expect(text).toHaveClass('text-lg font-semibold');
  });

  it('should apply the correct classes to the link', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('flex items-center gap-2');
  });

  it('should match the snapshot', () => {
    const { container } = render(<Logo />);
    expect(container).toMatchSnapshot();
  });
});
