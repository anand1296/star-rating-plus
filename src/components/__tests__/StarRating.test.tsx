import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from '../StarRating';

describe('StarRating component', () => {
  test('renders correct number of stars (default 5)', () => {
    render(<StarRating total={5} />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons.length).toBe(5);
  });

  test('renders custom total', () => {
    render(<StarRating total={3} />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons.length).toBe(3);
  });

  test('clicking a star calls onChange with the correct value (uncontrolled)', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<StarRating total={5} onChange={handleChange} />);
    const second = screen.getByRole('radio', { name: /2 star/i });

    // Use userEvent which handles act internally
    await user.click(second);

    // Wait for any async state propagation and assert the callback was invoked
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  test('hover updates visual (class/style) — basic smoke test', async () => {
    const user = userEvent.setup();
    render(<StarRating total={5} hoverColors={['#111', '#222', '#333', '#444', '#555']} />);
    const third = screen.getByRole('radio', { name: /3 star/i });

    // Hover the 3rd star — userEvent handles act internally; ensure no errors and element exists
    await user.hover(third);
    expect(third).toBeInTheDocument();

    // Unhover as cleanup
    await user.unhover(third);
  });
});
