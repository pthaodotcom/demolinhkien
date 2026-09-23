import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản',
};

const SignUpPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || '/');
  }

  return (
    <div className='w-full max-w-md mx-auto p-4'>
      <Card className='border shadow-sm rounded-2xl'>
        <CardHeader className='space-y-3'>
          <Link href='/' className='flex-center mb-2'>
            <Image
              src='/images/logo.jpg'
              width={140}
              height={50}
              alt={`${APP_NAME} logo`}
              priority={true}
              className='h-12 w-auto object-contain rounded'
            />
          </Link>
          <CardTitle className='text-center text-2xl font-bold text-gray-900'>
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className='text-center text-sm text-gray-500'>
            Nhập thông tin bên dưới để đăng ký tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <SignUpForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
