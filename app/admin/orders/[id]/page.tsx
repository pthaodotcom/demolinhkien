import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import OrderDetailsTable from '@/app/(root)/order/[id]/order-details-table';
import { getOrderById, prepareTingeePayment } from '@/lib/actions/order.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { ShippingAddress } from '@/types';
import OrderStatusForm from '@/components/admin/order-status-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản trị - Chi tiết đơn hàng',
};

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const tingeeResult =
    order.paymentMethod === 'BankTransfer' && !order.isPaid
      ? await prepareTingeePayment(order.id)
      : { payment: null };
  const tingeeQrImage = tingeeResult.payment?.qrCode
    ? await QRCode.toDataURL(tingeeResult.payment.qrCode, {
        margin: 1,
        width: 320,
      })
    : null;

  const currentStatus = order.isDelivered
    ? 'delivered'
    : order.isPaid
      ? 'paid'
      : 'pending';

  return (
    <div className='space-y-5'>
      <OrderStatusForm
        orderId={order.id}
        currentStatus={currentStatus}
        paymentMethod={order.paymentMethod}
      />
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        tingeePayment={tingeeResult.payment}
        tingeeQrImage={tingeeQrImage}
        tingeeMessage={tingeeResult.message}
        isAdmin={false}
      />
    </div>
  );
}
