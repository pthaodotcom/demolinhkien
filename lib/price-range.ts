export const MAX_FILTER_PRICE = 100_000_000;

export function parsePriceRange(value?: string): [number, number] | null {
  if (!value || !/^\d+-\d+$/.test(value)) return null;

  const [min, max] = value.split('-').map(Number);
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || min > max || max > MAX_FILTER_PRICE) {
    return null;
  }

  return [min, max];
}
