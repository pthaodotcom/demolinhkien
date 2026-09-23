'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Loader, ShoppingCart, ArrowRight } from 'lucide-react';
import { Cart, CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { useTransition } from 'react';

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
        return;
      }

      // Handle success add to cart
      toast({
        description: res.message,
        action: (
          <ToastAction
            className='bg-[hsl(213,80%,25%)] text-white hover:bg-[hsl(213,80%,20%)]'
            altText='Xem giỏ hàng'
            onClick={() => router.push('/cart')}
          >
            Xem giỏ hàng
          </ToastAction>
        ),
      });
    });
  };

  const handleBuyNow = () => {
    startTransition(async () => {
      if (!existItem) {
        const res = await addItemToCart(item);
        if (!res.success) {
          toast({ variant: 'destructive', description: res.message });
          return;
        }
      }

      router.push('/checkout');
    });
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      });

      return;
    });
  };

  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return (
    <div className='flex flex-col gap-3'>
      {existItem && (
        <div className='flex items-center gap-2' aria-label='Số lượng trong giỏ'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10'
            aria-label='Giảm số lượng trong giỏ'
            disabled={isPending}
            onClick={handleRemoveFromCart}
          >
            <Minus className='h-4 w-4' />
          </Button>
          <span className='min-w-7 text-center text-sm font-semibold'>{existItem.qty}</span>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10'
            aria-label='Tăng số lượng trong giỏ'
            disabled={isPending}
            onClick={handleAddToCart}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      )}
      <Button
        type='button'
        variant='outline'
        className='min-h-11 w-full border-primary text-primary hover:bg-primary/5 hover:text-primary'
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? <Loader className='h-4 w-4 animate-spin' /> : <ShoppingCart className='h-4 w-4' />}
        Thêm vào giỏ
      </Button>
      <Button
        type='button'
        className='min-h-11 w-full bg-[hsl(213,80%,25%)] text-white hover:bg-[hsl(213,80%,20%)]'
        disabled={isPending}
        onClick={handleBuyNow}
      >
        {isPending ? <Loader className='h-4 w-4 animate-spin' /> : <ArrowRight className='h-4 w-4' />}
        Mua ngay
      </Button>
    </div>
  );
};

export default AddToCart;
