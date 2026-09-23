'use client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { ArrowRight, Loader, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Cart, CartItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

function AddButton({ item }: { item: CartItem }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      variant='outline'
      size='icon'
      className='h-8 w-8'
      type='button'
      onClick={() =>
        startTransition(async () => {
          const res = await addItemToCart(item);

          if (!res.success) {
            toast({
              variant: 'destructive',
              description: res.message,
            });
          }
        })
      }
    >
      {isPending ? (
        <Loader className='w-3.5 h-3.5 animate-spin' />
      ) : (
        <Plus className='w-3.5 h-3.5' />
      )}
    </Button>
  );
}

function RemoveButton({ item }: { item: CartItem }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      variant='outline'
      size='icon'
      className='h-8 w-8'
      type='button'
      onClick={() =>
        startTransition(async () => {
          const res = await removeItemFromCart(item.productId);

          if (!res.success) {
            toast({
              variant: 'destructive',
              description: res.message,
            });
          }
        })
      }
    >
      {isPending ? (
        <Loader className='w-3.5 h-3.5 animate-spin' />
      ) : (
        <Minus className='w-3.5 h-3.5' />
      )}
    </Button>
  );
}

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalQty = cart?.items.reduce((a, c) => a + c.qty, 0) || 0;

  return (
    <>
      <h1 className='py-4 h2-bold'>Giỏ hàng của bạn</h1>
      {!cart || cart.items.length === 0 ? (
        <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center'>
          <ShoppingBag className='h-16 w-16 text-muted-foreground' aria-hidden='true' />
          <p className='text-lg font-semibold'>Giỏ hàng trống</p>
          <Button asChild>
            <Link href='/search'>Tiếp tục mua sắm</Link>
          </Button>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 gap-6 items-start'>
          <div className='overflow-x-auto md:col-span-3 border rounded-xl bg-white shadow-sm'>
            <Table>
              <TableHeader className='bg-slate-50'>
                <TableRow>
                  <TableHead className='font-bold text-slate-900'>Sản phẩm</TableHead>
                  <TableHead className='text-center font-bold text-slate-900'>Số lượng</TableHead>
                  <TableHead className='text-right font-bold text-slate-900'>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center gap-3 group'
                      >
                        <div className='relative w-14 h-14 rounded-lg border bg-white overflow-hidden shrink-0'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className='object-contain p-1'
                          />
                        </div>
                        <span className='font-medium text-sm text-slate-800 group-hover:text-primary transition-colors line-clamp-2'>
                          {item.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center gap-2'>
                        <RemoveButton item={item} />
                        <span className='w-6 text-center font-semibold text-sm'>{item.qty}</span>
                        <AddButton item={item} />
                      </div>
                    </TableCell>
                    <TableCell className='text-right font-bold text-slate-900 text-sm'>
                      {formatCurrency(Number(item.price) * item.qty)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Form Tóm tắt đơn hàng (h-fit để không kéo dài khoảng trắng thừa) */}
          <Card className='h-fit shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white'>
            <CardContent className='p-5 space-y-4'>
              <div className='border-b pb-3 space-y-1'>
                <p className='text-sm text-slate-500 font-medium'>
                  Tạm tính ({totalQty} sản phẩm):
                </p>
                <p className='text-2xl font-extrabold text-[hsl(35,95%,45%)]'>
                  {formatCurrency(cart.itemsPrice)}
                </p>
              </div>

              <Button
                className='w-full h-11 text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow rounded-xl flex items-center justify-center gap-2'
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push('/checkout'))
                }
              >
                {isPending ? (
                  <Loader className='w-4 h-4 animate-spin' />
                ) : (
                  <>
                    <span>Tiến hành thanh toán</span>
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
