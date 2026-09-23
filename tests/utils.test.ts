import { formatCurrency, formatNumber, round2 } from '../lib/utils';

describe('Vietnamese Utils & Formatting', () => {
  test('formats currency as VND without decimals', () => {
    const formatted = formatCurrency(4590000);
    // In Vietnamese locale, 4590000 format contains 4.590.000 and currency symbol
    expect(formatted).toContain('4.590.000');
    expect(formatted).toContain('₫');
  });

  test('formats number with Vietnamese thousand separator', () => {
    const formatted = formatNumber(1000000);
    expect(formatted).toBe('1.000.000');
  });

  test('rounds VND to nearest whole number', () => {
    expect(round2(4590000.45)).toBe(4590000);
    expect(round2('1500000')).toBe(1500000);
  });
});
