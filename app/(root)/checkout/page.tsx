import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CheckoutForm from './checkout-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng',
};

const CheckoutPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId ? await getUserById(userId) : null;

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <div className='wrapper space-y-5 py-5 sm:space-y-6 sm:py-8'>
      <div className='border-b pb-4'>
        <h1 className='text-xl font-extrabold text-slate-900 sm:text-2xl'>
          Thanh toán & Đặt hàng
        </h1>
      </div>

      <CheckoutForm cart={cart} user={user} />
    </div>
  );
};

export default CheckoutPage;
