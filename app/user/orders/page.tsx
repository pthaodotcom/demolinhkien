import { Metadata } from 'next';
import { getMyOrders } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi',
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;

  const orders = await getMyOrders({
    page: Number(page) || 1,
  });

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Đơn hàng của tôi</h2>
        <p className='text-sm text-gray-500 mt-1'>
          Theo dõi trạng thái và lịch sử các đơn hàng linh kiện bạn đã đặt
        </p>
      </div>

      <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableHead>MÃ ĐƠN</TableHead>
                <TableHead>NGÀY ĐẶT</TableHead>
                <TableHead>TỔNG TIỀN</TableHead>
                <TableHead>THANH TOÁN</TableHead>
                <TableHead>GIAO HÀNG</TableHead>
                <TableHead className='text-right'>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-10 text-gray-500'>
                    Bạn chưa có đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                orders.data.map((order) => (
                  <TableRow key={order.id} className='hover:bg-gray-50'>
                    <TableCell className='font-semibold'>#{formatId(order.id)}</TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {formatDateTime(order.createdAt).dateTime}
                    </TableCell>
                    <TableCell className='font-bold text-[hsl(35,95%,45%)]'>
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      {order.isPaid && order.paidAt ? (
                        <Badge variant='secondary' className='bg-green-100 text-green-800 border-green-200'>
                          Đã thanh toán
                        </Badge>
                      ) : (
                        <Badge variant='destructive'>Chưa thanh toán</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.isDelivered && order.deliveredAt ? (
                        <Badge variant='secondary' className='bg-blue-100 text-blue-800 border-blue-200'>
                          Đã giao hàng
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='bg-amber-50 text-amber-800 border-amber-300'>
                          Đang xử lý
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/order/${order.id}`}
                        className='text-sm font-semibold text-primary hover:underline px-2 py-1'
                      >
                        Xem chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {orders.totalPages > 1 && (
          <div className='p-4 border-t'>
            <Pagination
              page={Number(page) || 1}
              totalPages={orders?.totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
