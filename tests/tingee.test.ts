import {
  createTingeeSignature,
  getOrderIdFromTingeeReference,
  getTingeeReference,
  isFreshTingeeTimestamp,
  verifyTingeeSignature,
} from '../lib/tingee';

describe('Tingee payment helpers', () => {
  test('signs and verifies the exact webhook body', () => {
    const body = JSON.stringify({ transactionCode: 'TX001', amount: 150000 });
    const timestamp = '20260923120000123';
    const secret = 'test-secret';
    const signature = createTingeeSignature(timestamp, body, secret);

    expect(verifyTingeeSignature(timestamp, body, signature, secret)).toBe(true);
    expect(verifyTingeeSignature(timestamp, `${body} `, signature, secret)).toBe(false);
  });

  test('round-trips an order id through the transfer reference', () => {
    const orderId = '12345678-1234-1234-1234-123456789abc';
    expect(getOrderIdFromTingeeReference(getTingeeReference(orderId))).toBe(orderId);
  });

  test('accepts fresh timestamps and rejects stale or malformed timestamps', () => {
    const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const pad = (value: number, size = 2) => String(value).padStart(size, '0');
    const timestamp = [
      now.getUTCFullYear(),
      pad(now.getUTCMonth() + 1),
      pad(now.getUTCDate()),
      pad(now.getUTCHours()),
      pad(now.getUTCMinutes()),
      pad(now.getUTCSeconds()),
      pad(now.getUTCMilliseconds(), 3),
    ].join('');

    expect(isFreshTingeeTimestamp(timestamp)).toBe(true);
    expect(isFreshTingeeTimestamp('20200101000000000')).toBe(false);
    expect(isFreshTingeeTimestamp('invalid')).toBe(false);
  });
});
