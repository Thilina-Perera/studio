// Test your utility functions
import { formatDate, validateEmail, calculateTotal } from '../../src/utils/helpers';

describe('Utility Functions', () => {
  test('formatDate returns correct format', () => {
    const date = new Date('2023-12-25');
    expect(formatDate(date)).toBe('25/12/2023');
  });

  test('validateEmail returns true for valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('calculateTotal computes correctly', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });
});