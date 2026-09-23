'use client';

import { useRouter } from 'next/navigation';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { createOrder } from '@/lib/actions/order.actions';

const PlaceOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await createOrder();

    if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className='w-full bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white font-semibold py-3'
      >
        {pending ? (
          <Loader className='w-4 h-4 animate-spin mr-2' />
        ) : (
          <Check className='w-4 h-4 mr-2' />
        )}
        Xác nhận đặt hàng
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <PlaceOrderButton />
    </form>
  );
};

export default PlaceOrderForm;
