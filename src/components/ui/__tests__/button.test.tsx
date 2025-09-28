
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('11. renders the button with the correct text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('12. calls the onClick handler when clicked', async () => {
    const onClickMock = jest.fn();
    render(<Button onClick={onClickMock}>Click me</Button>);
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('13. disables the button when the disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it('14. does not call the onClick handler when disabled', async () => {
    const onClickMock = jest.fn();
    render(<Button onClick={onClickMock} disabled>Click me</Button>);
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    expect(onClickMock).not.toHaveBeenCalled();
  });
});
