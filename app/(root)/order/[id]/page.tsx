import { Metadata } from 'next';
import { getOrderById, prepareTingeePayment } from '@/lib/actions/order.actions';
import { notFound, redirect } from 'next/navigation';
import OrderDetailsTable from './order-details-table';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng',
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  if (session?.user.role === 'admin') {
    redirect(`/admin/orders/${id}`);
  }

  // Redirect the user if they don't own the order
  if (order.userId !== session?.user.id && session?.user.role !== 'admin') {
    return redirect('/unauthorized');
  }

  const tingeeResult = order.paymentMethod === 'BankTransfer' && !order.isPaid
    ? await prepareTingeePayment(order.id)
    : { payment: null };
  const tingeeQrImage = tingeeResult.payment?.qrCode
    ? await QRCode.toDataURL(tingeeResult.payment.qrCode, { margin: 1, width: 320 })
    : null;

  return (
    <div className='wrapper py-6'>
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        tingeePayment={tingeeResult.payment}
        tingeeQrImage={tingeeQrImage}
        tingeeMessage={tingeeResult.message}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    </div>
  );
};

export default OrderDetailsPage;
