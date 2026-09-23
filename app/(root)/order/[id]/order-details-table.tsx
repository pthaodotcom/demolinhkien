'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Order } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import {
  updateOrderToPaidCOD,
  deliverOrder,
} from '@/lib/actions/order.actions';
import type { TingeePayment } from '@/lib/tingee';
import { Copy, QrCode } from 'lucide-react';

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  CashOnDelivery: 'Thanh toán khi nhận hàng (COD)',
  BankTransfer: 'Chuyển khoản ngân hàng (Tingee VA)',
};

const OrderDetailsTable = ({
  order,
  isAdmin,
  tingeePayment,
  tingeeQrImage,
  tingeeMessage,
}: {
  order: Omit<Order, 'paymentResult'>;
  isAdmin: boolean;
  tingeePayment: TingeePayment | null;
  tingeeQrImage: string | null;
  tingeeMessage?: string;
}) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  const { toast } = useToast();

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast({ description: 'Đã sao chép' });
  };

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type='button'
        disabled={isPending}
        className='w-full bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white'
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            });
          })
        }
      >
        {isPending ? 'Đang cập nhật...' : 'Xác nhận đã thanh toán'}
      </Button>
    );
  };

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type='button'
        disabled={isPending}
        className='w-full bg-green-700 hover:bg-green-800 text-white'
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            });
          })
        }
      >
        {isPending ? 'Đang cập nhật...' : 'Xác nhận đã giao hàng'}
      </Button>
    );
  };

  return (
    <>
      <div className='flex items-center justify-between pb-6 border-b mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Đơn hàng #{formatId(id)}
          </h1>
          <p className='text-xs text-gray-500 mt-1'>Mã đơn: {id}</p>
        </div>
      </div>

      <div className='grid md:grid-cols-3 md:gap-6'>
        <div className='col-span-2 space-y-4'>
          {/* Payment card */}
          <Card className='border shadow-sm'>
            <CardContent className='p-5 space-y-3'>
              <h2 className='text-lg font-bold text-[hsl(213,80%,25%)]'>
                Phương thức thanh toán
              </h2>
              <p className='text-sm text-gray-700 font-medium'>
                {PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod}
              </p>
              <div>
                {isPaid ? (
                  <Badge variant='secondary' className='bg-green-100 text-green-800 border-green-200'>
                    Đã thanh toán ({formatDateTime(paidAt!).dateTime})
                  </Badge>
                ) : (
                  <Badge variant='destructive'>Chưa thanh toán</Badge>
                )}
              </div>
              {!isPaid && paymentMethod === 'BankTransfer' && tingeePayment && (
                <div className='grid gap-5 border-t pt-4 sm:grid-cols-[180px_1fr] sm:items-center'>
                  <div className='flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-white'>
                    {tingeeQrImage ? (
                      <Image src={tingeeQrImage} alt='Mã QR thanh toán Tingee' width={180} height={180} unoptimized />
                    ) : (
                      <QrCode className='h-16 w-16 text-slate-300' />
                    )}
                  </div>
                  <div className='space-y-3 text-sm'>
                    <p className='font-semibold text-slate-900'>Quét QR hoặc chuyển khoản đúng thông tin</p>
                    {tingeePayment.bankName && <p><span className='text-slate-500'>Ngân hàng:</span> {tingeePayment.bankName}</p>}
                    {tingeePayment.accountName && <p><span className='text-slate-500'>Chủ tài khoản:</span> {tingeePayment.accountName}</p>}
                    <div className='flex items-center justify-between gap-2'>
                      <p className='min-w-0'><span className='text-slate-500'>Số tài khoản:</span> <strong>{tingeePayment.accountNumber}</strong></p>
                      <Button type='button' variant='ghost' size='icon' onClick={() => copyValue(tingeePayment.accountNumber)} aria-label='Sao chép số tài khoản'><Copy className='h-4 w-4' /></Button>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='min-w-0 break-all'><span className='text-slate-500'>Nội dung:</span> <strong>{tingeePayment.reference}</strong></p>
                      <Button type='button' variant='ghost' size='icon' onClick={() => copyValue(tingeePayment.reference)} aria-label='Sao chép nội dung'><Copy className='h-4 w-4' /></Button>
                    </div>
                    <p className='text-xs text-slate-500'>Đơn hàng tự động cập nhật sau khi Tingee xác nhận giao dịch.</p>
                  </div>
                </div>
              )}
              {!isPaid && paymentMethod === 'BankTransfer' && !tingeePayment && (
                <p className='border-t pt-4 text-sm text-amber-700'>{tingeeMessage || 'Chưa cấu hình tài khoản Tingee.'}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping card */}
          <Card className='border shadow-sm'>
            <CardContent className='p-5 space-y-3'>
              <h2 className='text-lg font-bold text-[hsl(213,80%,25%)]'>
                Địa chỉ giao hàng
              </h2>
              <div className='text-sm text-gray-700'>
                <p className='font-semibold'>{shippingAddress.fullName}</p>
                {shippingAddress.phone && <p className='mt-1'>{shippingAddress.phone}</p>}
                <p className='text-gray-600 mt-1'>
                  {[shippingAddress.streetAddress, shippingAddress.city, shippingAddress.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {shippingAddress.orderNote && (
                  <p className='mt-2'>Ghi chú: {shippingAddress.orderNote}</p>
                )}
              </div>
              <div>
                {isDelivered ? (
                  <Badge variant='secondary' className='bg-blue-100 text-blue-800 border-blue-200'>
                    Đã giao ({formatDateTime(deliveredAt!).dateTime})
                  </Badge>
                ) : (
                  <Badge variant='outline' className='bg-amber-50 text-amber-800 border-amber-300'>
                    Đang chuẩn bị hàng / Đang giao
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items card */}
          <Card className='border shadow-sm'>
            <CardContent className='p-5'>
              <h2 className='text-lg font-bold text-[hsl(213,80%,25%)] mb-4'>
                Sản phẩm đặt mua
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className='text-center'>Số lượng</TableHead>
                    <TableHead className='text-right'>Đơn giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center gap-3 hover:text-primary transition-colors'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                            className='rounded-md border object-cover'
                          />
                          <span className='font-medium text-sm'>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className='text-center font-medium'>
                        {item.qty}
                      </TableCell>
                      <TableCell className='text-right font-semibold'>
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card className='border shadow-sm sticky top-24'>
            <CardContent className='p-5 space-y-4'>
              <h2 className='text-lg font-bold text-[hsl(213,80%,25%)] pb-2 border-b'>
                Tổng kết đơn hàng
              </h2>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Tạm tính</span>
                <span className='font-medium'>{formatCurrency(itemsPrice)}</span>
              </div>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Thuế VAT</span>
                <span className='font-medium'>{formatCurrency(taxPrice)}</span>
              </div>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Phí vận chuyển</span>
                <span className='font-medium'>
                  {Number(shippingPrice) === 0 ? 'Miễn phí' : formatCurrency(shippingPrice)}
                </span>
              </div>
              <div className='flex justify-between text-base font-bold text-gray-900 border-t pt-3'>
                <span>Tổng thanh toán</span>
                <span className='text-lg text-[hsl(35,95%,45%)]'>
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {/* Cash On Delivery Admin Controls */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <div className='pt-2'>
                  <MarkAsPaidButton />
                </div>
              )}
              {isAdmin && isPaid && !isDelivered && (
                <div className='pt-2'>
                  <MarkAsDeliveredButton />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
