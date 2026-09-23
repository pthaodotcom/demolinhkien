import { Metadata } from 'next';
import { getAllUsers, deleteUser } from '@/lib/actions/user.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import DeleteDialog from '@/components/shared/delete-dialog';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản trị - Người dùng',
};

const AdminUserPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  const { page = '1', query: searchText } = await props.searchParams;

  const users = await getAllUsers({ page: Number(page), query: searchText });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-gray-900'>Quản lý người dùng</h1>
          {searchText && (
            <div className='text-sm text-gray-500'>
              Lọc theo: <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/users'>
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
                <TableHead>MÃ</TableHead>
                <TableHead>TÊN TÀI KHOẢN</TableHead>
                <TableHead className='text-center'>VAI TRÒ</TableHead>
                <TableHead className='text-right w-[140px]'>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-10 text-gray-500'>
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.data.map((user) => (
                  <TableRow key={user.id} className='hover:bg-gray-50'>
                    <TableCell className='text-xs font-mono'>{formatId(user.id)}</TableCell>
                    <TableCell className='font-medium text-gray-900'>{user.name}</TableCell>
                    <TableCell className='text-center'>
                      {user.role === 'user' ? (
                        <Badge variant='secondary' className='text-xs'>
                          Khách hàng
                        </Badge>
                      ) : (
                        <Badge variant='default' className='bg-[hsl(213,80%,25%)] text-white text-xs'>
                          Quản trị viên
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button asChild variant='outline' size='sm' className='h-8 text-xs'>
                          <Link href={`/admin/users/${user.id}`}>Sửa</Link>
                        </Button>
                        <DeleteDialog id={user.id} action={deleteUser} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {users.totalPages > 1 && (
          <div className='p-4 border-t'>
            <Pagination page={Number(page) || 1} totalPages={users?.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
