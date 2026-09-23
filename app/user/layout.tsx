import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import Menu from '@/components/shared/header/menu';
import MainNav from './main-nav';

export const dynamic = 'force-dynamic';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col min-h-screen'>
      <div className='border-b bg-white'>
        <div className='wrapper flex items-center h-16'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/images/logo.jpg'
              height={40}
              width={120}
              alt={APP_NAME}
              className='h-10 w-auto object-contain rounded'
            />
          </Link>
          <MainNav className='mx-6' />
          <div className='ml-auto items-center flex space-x-4'>
            <Menu />
          </div>
        </div>
      </div>

      <div className='flex-1 wrapper py-6'>
        {children}
      </div>
    </div>
  );
}
