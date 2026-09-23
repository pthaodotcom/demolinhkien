import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import MainNav from './main-nav';
import UserButton from '@/components/shared/header/user-button';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50/50'>
      <div className='border-b bg-white'>
        <div className='wrapper flex items-center h-16'>
          <Link href='/admin/overview' className='flex items-center gap-2'>
            <Image
              src='/images/logo.jpg'
              height={40}
              width={120}
              alt={APP_NAME}
              className='h-10 w-auto object-contain rounded'
            />
          </Link>
          <MainNav className='mx-6' />
          <div className='ml-auto flex items-center'>
            <UserButton />
          </div>
        </div>
      </div>

      <div className='flex-1 wrapper py-6'>
        {children}
      </div>
    </div>
  );
}
