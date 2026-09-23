import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_API_URL = 'https://open-api.tingee.vn';

export type TingeePayment = {
  billId: string;
  qrCode: string;
  accountNumber: string;
  bankBin: string;
  bankName: string;
  accountName: string;
  reference: string;
};

export type TingeeWebhookPayload = {
  clientId: string;
  transactionCode: string;
  amount: number;
  content?: string;
  bank?: string;
  accountNumber?: string;
  vaAccountNumber?: string;
  transactionDate?: string;
  type?: string;
  additionalData?: unknown;
};

function getTimestamp() {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const pad = (value: number, size = 2) => String(value).padStart(size, '0');

  return [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
    pad(now.getUTCSeconds()),
    pad(now.getUTCMilliseconds(), 3),
  ].join('');
}

export function createTingeeSignature(timestamp: string, rawBody: string, secret: string) {
  return createHmac('sha512', secret).update(`${timestamp}:${rawBody}`).digest('hex');
}

export function verifyTingeeSignature(timestamp: string, rawBody: string, signature: string, secret: string) {
  if (!timestamp || !signature || !secret) return false;

  const expected = Buffer.from(createTingeeSignature(timestamp, rawBody, secret), 'hex');
  const received = Buffer.from(signature, 'hex');

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function isFreshTingeeTimestamp(timestamp: string, maxAgeMs = 5 * 60 * 1000) {
  if (!/^\d{17}$/.test(timestamp)) return false;

  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(8, 10);
  const minute = timestamp.slice(10, 12);
  const second = timestamp.slice(12, 14);
  const millisecond = timestamp.slice(14, 17);
  const receivedAt = Date.parse(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}+07:00`
  );

  return Number.isFinite(receivedAt) && Math.abs(Date.now() - receivedAt) <= maxAgeMs;
}

export function getTingeeReference(orderId: string) {
  return `DH${orderId.replaceAll('-', '').toUpperCase()}`;
}

export function getOrderIdFromTingeeReference(value: string) {
  const match = value.toUpperCase().match(/DH([A-F0-9]{32})/);
  if (!match) return null;

  const id = match[1].toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export function findTingeeBillId(additionalData: unknown) {
  const values: string[] = [];

  const collect = (value: unknown) => {
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };

  collect(additionalData);
  return values.find((value) => value.startsWith('QR_') || value.startsWith('BILL_')) || null;
}

export function getTingeeDisplayConfig() {
  return {
    accountNumber: process.env.TINGEE_VA_ACCOUNT_NUMBER || '',
    bankBin: process.env.TINGEE_BANK_BIN || '',
    bankName: process.env.TINGEE_BANK_NAME || '',
    accountName: process.env.TINGEE_ACCOUNT_NAME || '',
  };
}

export async function generateTingeePayment(orderId: string, amount: number): Promise<TingeePayment> {
  const clientId = process.env.TINGEE_CLIENT_ID;
  const secret = process.env.TINGEE_SECRET_TOKEN;
  const config = getTingeeDisplayConfig();

  if (!clientId || !secret || !config.accountNumber || !config.bankBin) {
    throw new Error('Tingee chưa được cấu hình đầy đủ');
  }

  const reference = getTingeeReference(orderId);
  const body: Record<string, string | number> = {
    vaAccountNumber: config.accountNumber,
    qrCodeType: 'dynamic-one-time-payment',
    bankBin: config.bankBin,
    amount,
    expireInMinute: Number(process.env.TINGEE_QR_EXPIRE_MINUTES || 30),
    purpose: reference,
    extraInfo: orderId,
  };

  if (process.env.TINGEE_MERCHANT_ID) body.merchantId = Number(process.env.TINGEE_MERCHANT_ID);

  const rawBody = JSON.stringify(body);
  const timestamp = getTimestamp();
  const response = await fetch(`${process.env.TINGEE_API_URL || DEFAULT_API_URL}/v1/generate-dynamic-qr`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-client-id': clientId,
      'x-request-timestamp': timestamp,
      'x-signature': createTingeeSignature(timestamp, rawBody, secret),
    },
    body: rawBody,
    cache: 'no-store',
  });

  const result = (await response.json()) as {
    code?: string;
    message?: string;
    data?: { qrCode?: string; qrAccount?: string; billId?: string };
  };

  if (!response.ok || result.code !== '00' || !result.data?.qrCode || !result.data.billId) {
    throw new Error(result.message || 'Không thể tạo mã QR Tingee');
  }

  return {
    billId: result.data.billId,
    qrCode: result.data.qrCode,
    accountNumber: result.data.qrAccount || config.accountNumber,
    bankBin: config.bankBin,
    bankName: config.bankName,
    accountName: config.accountName,
    reference,
  };
}
