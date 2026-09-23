import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { updateOrderToPaid } from '@/lib/actions/order.actions';
import {
  findTingeeBillId,
  getOrderIdFromTingeeReference,
  TingeeWebhookPayload,
  isFreshTingeeTimestamp,
  verifyTingeeSignature,
} from '@/lib/tingee';

const success = () => NextResponse.json({ code: '00', message: 'Success' });

export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get('x-request-timestamp') || '';
  const signature = request.headers.get('x-signature') || '';
  const secret = process.env.TINGEE_WEBHOOK_SECRET || process.env.TINGEE_SECRET_TOKEN || '';

  if (
    !isFreshTingeeTimestamp(timestamp) ||
    !verifyTingeeSignature(timestamp, rawBody, signature, secret)
  ) {
    return NextResponse.json({ code: '01', message: 'Invalid signature' }, { status: 401 });
  }

  let payload: TingeeWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TingeeWebhookPayload;
  } catch {
    return NextResponse.json({ code: '02', message: 'Invalid payload' }, { status: 400 });
  }

  if (
    !payload.transactionCode ||
    !Number.isFinite(payload.amount) ||
    !Number.isInteger(payload.amount) ||
    payload.amount <= 0 ||
    (process.env.TINGEE_CLIENT_ID && payload.clientId !== process.env.TINGEE_CLIENT_ID)
  ) {
    return NextResponse.json({ code: '02', message: 'Invalid payload' }, { status: 400 });
  }

  const expectedAccount = process.env.TINGEE_VA_ACCOUNT_NUMBER;
  const receivedAccount = payload.vaAccountNumber || payload.accountNumber;
  if (expectedAccount && receivedAccount && receivedAccount !== expectedAccount) {
    return NextResponse.json({ code: '05', message: 'Account mismatch' }, { status: 422 });
  }

  const processed = await prisma.order.findFirst({
    where: { paymentResult: { path: ['transactionCode'], equals: payload.transactionCode } },
  });
  if (processed?.isPaid) return success();

  const billId = findTingeeBillId(payload.additionalData);
  const orderId = getOrderIdFromTingeeReference(`${payload.content || ''} ${JSON.stringify(payload.additionalData || '')}`);
  const orderByBill = billId
    ? await prisma.order.findFirst({ where: { paymentResult: { path: ['billId'], equals: billId } } })
    : null;
  const orderByReference = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : null;

  if (orderByBill && orderByReference && orderByBill.id !== orderByReference.id) {
    return NextResponse.json({ code: '06', message: 'Reference mismatch' }, { status: 422 });
  }

  const order = orderByBill || orderByReference;

  if (!order || order.paymentMethod !== 'BankTransfer') {
    return NextResponse.json({ code: '03', message: 'Order not found' }, { status: 404 });
  }

  if (order.isPaid) return success();
  if (Number(order.totalPrice) !== Number(payload.amount)) {
    return NextResponse.json({ code: '04', message: 'Amount mismatch' }, { status: 422 });
  }

  const previous = (order.paymentResult || {}) as Record<string, unknown>;
  await updateOrderToPaid({
    orderId: order.id,
    paymentResult: {
      ...previous,
      id: payload.transactionCode,
      status: 'COMPLETED',
      pricePaid: String(payload.amount),
      provider: 'Tingee',
      billId: billId || (typeof previous.billId === 'string' ? previous.billId : undefined),
      transactionCode: payload.transactionCode,
    },
  });

  return success();
}
