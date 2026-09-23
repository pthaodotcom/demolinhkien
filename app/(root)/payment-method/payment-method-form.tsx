'use client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { paymentMethodSchema } from '@/lib/validators';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader, Banknote } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';

const PAYMENT_METHOD_NAMES: Record<string, { title: string; desc: string }> = {
  CashOnDelivery: {
    title: 'Thanh toán khi nhận hàng',
    desc: 'Thanh toán khi nhận hàng.',
  },
  BankTransfer: {
    title: 'Chuyển khoản ngân hàng (Tingee VA)',
    desc: '',
  },
};

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: PAYMENT_METHODS.includes(preferredPaymentMethod || '')
        ? preferredPaymentMethod!
        : DEFAULT_PAYMENT_METHOD,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
        return;
      }

      router.push('/place-order');
    });
  };

  return (
    <div className='mx-auto my-2 w-full max-w-xl space-y-6 rounded-lg border bg-white p-4 shadow-sm sm:my-6 sm:p-6 md:p-8'>
      <div>
        <h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>Phương thức thanh toán</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Vui lòng chọn hình thức thanh toán thuận tiện nhất cho bạn
        </p>
      </div>

      <Form {...form}>
        <form
          method='post'
          className='space-y-6'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className='flex flex-col space-y-3'
                    value={field.value}
                  >
                    {PAYMENT_METHODS.map((paymentMethod) => {
                      const methodInfo = PAYMENT_METHOD_NAMES[paymentMethod] || {
                        title: paymentMethod,
                        desc: '',
                      };
                      return (
                        <label
                          key={paymentMethod}
                          htmlFor={`pm-${paymentMethod}`}
                          className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors sm:gap-4 ${
                            field.value === paymentMethod
                              ? 'border-primary bg-blue-50/30'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <RadioGroupItem
                            id={`pm-${paymentMethod}`}
                            value={paymentMethod}
                            className='mt-1'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <Banknote className='w-4 h-4 text-primary' />
                              <span className='font-semibold text-gray-900 text-sm'>
                                {methodInfo.title}
                              </span>
                            </div>
                            {methodInfo.desc && (
                              <p className='text-xs text-gray-500 mt-1'>
                                {methodInfo.desc}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-stretch sm:justify-end'>
            <Button
              type='submit'
              disabled={isPending}
              className='min-h-11 w-full bg-[hsl(213,80%,25%)] px-5 text-white hover:bg-[hsl(213,80%,20%)] sm:w-auto sm:px-8'
            >
              {isPending ? (
                <Loader className='w-4 h-4 animate-spin mr-2' />
              ) : (
                <ArrowRight className='w-4 h-4 mr-2' />
              )}
              Tiếp tục đến đặt hàng
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentMethodForm;
