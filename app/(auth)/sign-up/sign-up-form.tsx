'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpDefaultValues } from '@/lib/constants';
import SignInDialog from '@/components/shared/auth/sign-in-dialog';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpUser } from '@/lib/actions/user.actions';
import { Loader } from 'lucide-react';

const SignUpForm = ({ callbackUrl: returnUrl, onSignIn }: { callbackUrl?: string; onSignIn?: () => void }) => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const callbackUrl = returnUrl || '/';

  const SignUpButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        disabled={pending}
        className='w-full bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white py-2.5 font-semibold'
      >
        {pending ? (
          <>
            <Loader className='w-4 h-4 animate-spin mr-2' />
            Đang tạo tài khoản...
          </>
        ) : (
          'Đăng ký'
        )}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='username'>Tên tài khoản</Label>
          <Input
            id='username'
            name='username'
            type='text'
            required
            autoComplete='username'
            placeholder='Ví dụ: nguyenvana'
            defaultValue={signUpDefaultValues.username}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='phone'>Số điện thoại</Label>
          <Input
            id='phone'
            name='phone'
            type='tel'
            required
            autoComplete='tel'
            placeholder='0901234567'
            defaultValue={signUpDefaultValues.phone}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='password'>Mật khẩu</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            placeholder='Ít nhất 6 ký tự'
            defaultValue={signUpDefaultValues.password}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            required
            autoComplete='new-password'
            placeholder='Nhập lại mật khẩu'
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>
        <div className='pt-2'>
          <SignUpButton />
        </div>

        {data && !data.success && data.message && (
          <div className='text-center text-sm text-destructive font-medium bg-red-50 p-2.5 rounded-lg'>
            {data.message}
          </div>
        )}

        <div className='text-sm text-center text-gray-600 pt-2'>
          Đã có tài khoản?{' '}
          {onSignIn ? (
            <button type='button' onClick={onSignIn} className='font-semibold text-primary hover:underline'>Đăng nhập</button>
          ) : (
            <SignInDialog callbackUrl={callbackUrl}>
              <button type='button' className='font-semibold text-primary hover:underline'>Đăng nhập</button>
            </SignInDialog>
          )}
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
