import { Metadata } from 'next';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import PaymentMethodForm from './payment-method-form';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Phương thức thanh toán',
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/sign-in?callbackUrl=/payment-method');

  const user = await getUserById(userId);

  return (
    <div className='wrapper py-6'>
      <PaymentMethodForm preferredPaymentMethod={user?.paymentMethod || 'CashOnDelivery'} />
    </div>
  );
};

export default PaymentMethodPage;
