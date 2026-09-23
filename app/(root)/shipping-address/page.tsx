import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import ShippingAddressForm from './shipping-address-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Địa chỉ giao hàng',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/sign-in?callbackUrl=/shipping-address');

  const user = await getUserById(userId);

  return (
    <div className='wrapper py-6'>
      <ShippingAddressForm address={(user?.address as ShippingAddress) || null} />
    </div>
  );
};

export default ShippingAddressPage;
