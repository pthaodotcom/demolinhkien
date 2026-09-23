import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import dotenv from 'dotenv';
dotenv.config();

import PurchaseReceiptEmail from './purchase-receipt';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  if (!resend) {
    console.warn('RESEND_API_KEY chưa được cấu hình. Bỏ qua gửi email xác nhận đơn hàng.');
    return;
  }

  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Xác nhận đơn hàng #${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};
