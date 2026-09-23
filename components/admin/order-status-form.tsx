'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateAdminOrderStatus } from '@/lib/actions/order.actions';

type OrderStatus = 'pending' | 'paid' | 'delivered';

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'delivered', label: 'Đã giao hàng' },
];

export default function OrderStatusForm({
  orderId,
  currentStatus,
  paymentMethod,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  paymentMethod: string;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const currentRank = statusOptions.findIndex((option) => option.value === currentStatus);
  const isPendingBankTransfer =
    paymentMethod === 'BankTransfer' && currentStatus === 'pending';

  return (
    <div className='flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='space-y-1.5'>
        <label htmlFor='order-status' className='text-sm font-semibold text-gray-900'>
          Trạng thái đơn hàng
        </label>
        <select
          id='order-status'
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className='block h-10 min-w-56 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        >
          {statusOptions.map((option, index) => (
            <option
              key={option.value}
              value={option.value}
              disabled={
                index < currentRank ||
                index > currentRank + 1 ||
                (isPendingBankTransfer && option.value !== 'pending')
              }
            >
              {option.label}
            </option>
          ))}
        </select>
        {isPendingBankTransfer && (
          <p className='max-w-xl text-xs text-gray-500'>
            Chuyển khoản chỉ được xác nhận tự động sau khi Tingee đối chiếu đúng giao dịch và số tiền.
          </p>
        )}
      </div>
      <Button
        type='button'
        disabled={isPending || status === currentStatus}
        onClick={() =>
          startTransition(async () => {
            const result = await updateAdminOrderStatus({ id: orderId, status });
            toast({
              variant: result.success ? 'default' : 'destructive',
              description: result.message,
            });
            if (result.success) router.refresh();
          })
        }
      >
        <Save className='h-4 w-4' />
        {isPending ? 'Đang lưu...' : 'Lưu trạng thái'}
      </Button>
    </div>
  );
}
