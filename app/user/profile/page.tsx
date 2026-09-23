import { Metadata } from 'next';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import ProfileForm from './profile-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hồ sơ người dùng',
};

const Profile = async () => {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className='max-w-lg mx-auto space-y-6 bg-white p-6 md:p-8 rounded-2xl border shadow-sm'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Thông tin tài khoản</h2>
          <p className='text-sm text-gray-500 mt-1'>
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>
        </div>
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default Profile;
