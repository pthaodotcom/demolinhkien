import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import { requireAdmin } from '@/lib/auth-guard';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản trị - Đơn hàng',
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = '1', query: searchText } = await props.searchParams;

  await requireAdmin();

  const orders = await getAllOrders({
    page: Number(page),
    query: searchText,
  });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-gray-900'>Quản lý đơn hàng</h1>
          {searchText && (
            <div className='text-sm text-gray-500'>
              Lọc theo: <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/orders'>
                <Button variant='outline' size='sm' className='ml-2 h-7 text-xs'>
                  Xóa lọc
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableHead>MÃ ĐƠN</TableHead>
                <TableHead>NGÀY ĐẶT</TableHead>
                <TableHead>KHÁCH HÀNG</TableHead>
                <TableHead className='text-right'>TỔNG TIỀN</TableHead>
                <TableHead className='text-center'>THANH TOÁN</TableHead>
                <TableHead className='text-center'>GIAO HÀNG</TableHead>
                <TableHead className='text-right w-[180px]'>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-10 text-gray-500'>
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.data.map((order) => (
                  <TableRow key={order.id} className='hover:bg-gray-50'>
                    <TableCell className='font-semibold text-xs font-mono'>
                      #{formatId(order.id)}
                    </TableCell>
                    <TableCell className='text-xs text-gray-600'>
                      {formatDateTime(order.createdAt).dateTime}
                    </TableCell>
                    <TableCell className='font-medium text-sm'>
                      {order.user ? order.user.name : 'Khách vãng lai'}
                    </TableCell>
                    <TableCell className='text-right font-bold text-[hsl(35,95%,45%)]'>
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell className='text-center'>
                      {order.isPaid && order.paidAt ? (
                        <Badge variant='secondary' className='bg-green-100 text-green-800 border-green-200 text-xs'>
                          Đã thanh toán
                        </Badge>
                      ) : (
                        <Badge variant='destructive' className='text-xs'>
                          Chưa thanh toán
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      {order.isDelivered && order.deliveredAt ? (
                        <Badge variant='secondary' className='bg-blue-100 text-blue-800 border-blue-200 text-xs'>
                          Đã giao
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='bg-amber-50 text-amber-800 border-amber-300 text-xs'>
                          Đang giao
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button asChild variant='outline' size='sm' className='h-8 text-xs'>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Pencil className='h-3.5 w-3.5' />
                            Chỉnh sửa
                          </Link>
                        </Button>
                        <DeleteDialog id={order.id} action={deleteOrder} />
                      </div>
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

export default AdminOrdersPage;
