'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CredentialsSignInForm from './credentials-signin-form';
import SignUpForm from '@/app/(auth)/sign-up/sign-up-form';

export default function SignInDialog({
  children,
  callbackUrl,
}: {
  children: ReactNode;
  callbackUrl?: string;
}) {
  const pathname = usePathname();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const returnUrl = callbackUrl || pathname || '/';

  return (
    <Dialog onOpenChange={(open) => { if (!open) setMode('sign-in'); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-lg p-5 sm:p-6'>
        <DialogHeader className='items-center space-y-2 text-center sm:text-center'>
          <Image src='/images/logo.jpg' width={48} height={48} alt='Lập Trình Viên' className='h-12 w-12 rounded-md object-cover' />
          <DialogTitle className='text-xl font-bold text-gray-900 sm:text-2xl'>{mode === 'sign-in' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
          <DialogDescription>{mode === 'sign-in' ? 'Nhập tên tài khoản và mật khẩu để tiếp tục' : 'Đăng ký bằng tên tài khoản, mật khẩu và số điện thoại'}</DialogDescription>
        </DialogHeader>
        {mode === 'sign-in' ? (
          <CredentialsSignInForm callbackUrl={returnUrl} onSignUp={() => setMode('sign-up')} />
        ) : (
          <SignUpForm callbackUrl={returnUrl} onSignIn={() => setMode('sign-in')} />
        )}
      </DialogContent>
    </Dialog>
  );
}
