import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderSummary } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import Charts from './charts';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống - Tổng quan',
};

const AdminOverviewPage = async () => {
  await requireAdmin();

  const summary = await getOrderSummary();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Bảng điều khiển quản trị</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Tổng quan số liệu kinh doanh linh kiện và đơn hàng
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Doanh thu tổng</CardTitle>
            <BadgeDollarSign className='w-5 h-5 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[hsl(35,95%,45%)]'>
              {formatCurrency(
                summary.totalSales._sum.totalPrice?.toString() || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Tổng đơn hàng</CardTitle>
            <CreditCard className='w-5 h-5 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {formatNumber(summary.ordersCount)}
            </div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Khách hàng</CardTitle>
            <Users className='w-5 h-5 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {formatNumber(summary.usersCount)}
            </div>
          </CardContent>
        </Card>

        <Card className='border shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Sản phẩm linh kiện</CardTitle>
            <Barcode className='w-5 h-5 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {formatNumber(summary.productsCount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 border shadow-sm'>
          <CardHeader>
            <CardTitle className='text-lg font-bold text-[hsl(213,80%,25%)]'>
              Biểu đồ doanh số theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Charts
              data={{
                salesData: summary.salesData,
              }}
            />
          </CardContent>
        </Card>

        <Card className='col-span-3 border shadow-sm'>
          <CardHeader>
            <CardTitle className='text-lg font-bold text-[hsl(213,80%,25%)]'>
              Đơn hàng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableHead>KHÁCH HÀNG</TableHead>
                  <TableHead>NGÀY ĐẶT</TableHead>
                  <TableHead>TỔNG TIỀN</TableHead>
                  <TableHead className='text-right'>THAO TÁC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-6 text-gray-500'>
                      Chưa có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.latestSales.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-medium'>
                        {order?.user?.name ? order.user.name : 'Khách vãng lai'}
                      </TableCell>
                      <TableCell className='text-xs text-gray-500'>
                        {formatDateTime(order.createdAt).dateOnly}
                      </TableCell>
                      <TableCell className='font-bold text-sm text-[hsl(35,95%,45%)]'>
                        {formatCurrency(order.totalPrice)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className='text-xs font-semibold text-primary hover:underline'
                        >
                          Chi tiết
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
