
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  it('15. renders the input with the correct placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('16. allows the user to type in the input', async () => {
    render(<Input placeholder="Enter text" />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    await user.type(input, 'Hello, world!');
    expect(input.value).toBe('Hello, world!');
  });

  it('17. disables the input when the disabled prop is true', () => {
    render(<Input placeholder="Enter text" disabled />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeDisabled();
  });

  it('18. does not allow the user to type when disabled', async () => {
    render(<Input placeholder="Enter text" disabled />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    await user.type(input, 'Hello, world!');
    expect(input.value).toBe('');
  });
});
