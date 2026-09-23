import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/actions/user.actions';
import UpdateUserForm from './update-user-form';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Cập nhật người dùng',
};

const AdminUserUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) notFound();

  return (
    <div className='space-y-6 max-w-lg mx-auto bg-white p-6 rounded-2xl border shadow-sm'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Cập nhật người dùng</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Thay đổi quyền hạn và thông tin tài khoản #{user.name}
        </p>
      </div>
      <UpdateUserForm user={user} />
    </div>
  );
};

export default AdminUserUpdatePage;
