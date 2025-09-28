
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('19. renders the checkbox', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('20. can be checked and unchecked', async () => {
    render(<Checkbox />);
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('21. is disabled when the disabled prop is true', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('22. cannot be checked when disabled', async () => {
    render(<Checkbox disabled />);
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
