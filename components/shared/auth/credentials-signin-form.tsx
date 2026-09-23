'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithCredentials } from '@/lib/actions/user.actions';

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type='submit'
      disabled={pending}
      className='min-h-11 w-full bg-[hsl(213,80%,25%)] font-semibold text-white hover:bg-[hsl(213,80%,20%)]'
    >
      {pending ? <Loader className='h-4 w-4 animate-spin' /> : null}
      {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
    </Button>
  );
}

export default function CredentialsSignInForm({ callbackUrl = '/', onSignUp }: { callbackUrl?: string; onSignUp?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: '',
  });
  const demoAuthEnabled =
    process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true';

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='account'>Tên tài khoản</Label>
          <Input
            id='account'
            name='account'
            type='text'
            required
            autoComplete='username'
            placeholder='Tên tài khoản của bạn'
            className='h-11 text-base'
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='password'>Mật khẩu</Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete='current-password'
              placeholder='Nhập mật khẩu'
              className='h-11 pr-11 text-base'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type='button'
              onClick={() => setShowPassword((visible) => !visible)}
              className='absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' aria-hidden='true' />
              ) : (
                <Eye className='h-4 w-4' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>
        <div className='pt-2'>
          <SignInButton />
        </div>

        {demoAuthEnabled && (
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950'>
            <p className='font-semibold'>Đăng nhập nhanh bản demo</p>
            <div className='mt-2 grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={() => {
                  setAccount('admin');
                  setPassword('Admin123');
                }}
                className='rounded-md border border-blue-300 bg-white px-3 py-2 font-medium hover:bg-blue-100'
              >
                Quản trị viên
              </button>
              <button
                type='button'
                onClick={() => {
                  setAccount('user');
                  setPassword('123456');
                }}
                className='rounded-md border border-blue-300 bg-white px-3 py-2 font-medium hover:bg-blue-100'
              >
                Khách hàng
              </button>
            </div>
            <p className='mt-2 text-xs text-blue-800'>
              Chọn vai trò để tự điền tài khoản, sau đó bấm Đăng nhập.
            </p>
          </div>
        )}

        {!data.success && data.message && (
          <div role='alert' className='rounded-md bg-red-50 p-2.5 text-center text-sm font-medium text-destructive'>
            {data.message}
          </div>
        )}

        <div className='pt-2 text-center text-sm text-gray-600'>
          Chưa có tài khoản?{' '}
          {onSignUp ? (
            <button type='button' onClick={onSignUp} className='font-semibold text-primary hover:underline'>Đăng ký ngay</button>
          ) : (
            <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='font-semibold text-primary hover:underline'>Đăng ký ngay</Link>
          )}
        </div>
      </div>
    </form>
  );
}
