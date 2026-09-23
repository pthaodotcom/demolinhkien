'use client';

import { useTransition } from 'react';
import { ShoppingCart, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addItemToCart } from '@/lib/actions/cart.actions';
import { CartItem } from '@/types';

export default function CardAddToCart({ item }: { item: CartItem }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  return (
    <Button
      type='button'
      size='icon'
      aria-label={`Thêm ${item.name} vào giỏ hàng`}
      title='Thêm vào giỏ hàng'
      disabled={pending}
      onClick={() => startTransition(async () => {
        const result = await addItemToCart(item);
        toast({ description: result.message, variant: result.success ? 'default' : 'destructive' });
      })}
      className='shrink-0 bg-[hsl(213,80%,25%)] text-white hover:bg-[hsl(213,80%,20%)]'
    >
      {pending ? <LoaderCircle className='animate-spin' /> : <ShoppingCart />}
    </Button>
  );
}
