import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { ShippingAddress } from '@/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PlaceOrderForm from './place-order-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đặt hàng',
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/sign-in?callbackUrl=/place-order');

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect('/cart');
  if (!user?.address) redirect('/shipping-address');
  if (!user?.paymentMethod) redirect('/payment-method');

  const userAddress = user.address as ShippingAddress;

  return (
    <div className='wrapper py-5 sm:py-8'>
      <h1 className='pb-5 text-xl font-bold text-gray-900 sm:text-2xl'>Xác nhận đơn hàng</h1>
      <div className='grid gap-5 lg:grid-cols-3'>
        <div className='min-w-0 space-y-4 lg:col-span-2'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='pb-3 text-lg font-semibold sm:text-xl'>Địa chỉ giao hàng</h2>
              <p>{userAddress.fullName}</p>
              {userAddress.phone && <p>{userAddress.phone}</p>}
              <p>
                {[userAddress.streetAddress, userAddress.city, userAddress.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {userAddress.orderNote && <p>Ghi chú: {userAddress.orderNote}</p>}
              <div className='mt-3'>
                <Link href='/shipping-address'>
                  <Button variant='outline'>Chỉnh sửa</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='pb-3 text-lg font-semibold sm:text-xl'>Phương thức thanh toán</h2>
              <p>
                {user.paymentMethod === 'CashOnDelivery'
                  ? 'Thanh toán khi nhận hàng'
                  : user.paymentMethod === 'BankTransfer'
                    ? 'Chuyển khoản ngân hàng (Tingee VA)'
                    : user.paymentMethod}
              </p>
              <div className='mt-3'>
                <Link href='/payment-method'>
                  <Button variant='outline'>Chỉnh sửa</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='pb-3 text-lg font-semibold sm:text-xl'>Sản phẩm đặt mua</h2>
              <div className='space-y-3 md:hidden'>
                {cart.items.map((item: CartItem) => (
                  <div key={item.slug} className='flex min-w-0 items-center gap-3 border-t pt-3 first:border-t-0 first:pt-0'>
                    <Image src={item.image} alt={item.name} width={56} height={56} className='h-14 w-14 shrink-0 object-contain' />
                    <div className='min-w-0 flex-1'>
                      <Link href={`/product/${item.slug}`} className='line-clamp-2 text-sm font-medium'>{item.name}</Link>
                      <span className='text-xs text-gray-500'>Số lượng: {item.qty}</span>
                    </div>
                    <span className='max-w-24 shrink-0 text-right text-sm font-semibold'>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className='hidden overflow-x-auto md:block'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map((item: CartItem) => (
                      <TableRow key={item.slug}>
                        <TableCell>
                          <Link
                            href={`/product/${item.slug}`}
                            className='flex items-center'
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            />
                            <span className='px-2'>{item.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className='px-2'>{item.qty}</span>
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex flex-wrap justify-between gap-x-3 gap-y-1'>
                <div>Tạm tính</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className='flex flex-wrap justify-between gap-x-3 gap-y-1'>
                <div>Thuế</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className='flex flex-wrap justify-between gap-x-3 gap-y-1'>
                <div>Phí vận chuyển</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className='flex flex-wrap justify-between gap-x-3 gap-y-1 text-lg font-bold'>
                <div>Tổng cộng</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
