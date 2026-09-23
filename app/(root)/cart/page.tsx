import CartTable from './cart-table';
import { getMyCart } from '@/lib/actions/cart.actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Giỏ hàng',
};

const CartPage = async () => {
  const cart = await getMyCart();

  return (
    <div className='wrapper py-6'>
      <CartTable cart={cart} />
    </div>
  );
};

export default CartPage;
