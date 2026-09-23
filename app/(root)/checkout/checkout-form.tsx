'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Cart, ShippingAddress } from '@/types';
import { updateUserAddress, updateUserPaymentMethod } from '@/lib/actions/user.actions';
import { createOrder } from '@/lib/actions/order.actions';
import SignInDialog from '@/components/shared/auth/sign-in-dialog';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Loader,
  ShoppingBag,
  QrCode,
  MapPin,
  Phone,
  User as UserIcon,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function CheckoutForm({
  cart,
  user,
}: {
  cart: Cart;
  user: {
    name?: string | null;
    address?: unknown;
    paymentMethod?: string | null;
  } | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isLoggedIn = Boolean(user);
  const savedAddress = (user?.address as ShippingAddress) || {};

  const [fullName, setFullName] = useState(savedAddress.fullName || user?.name || '');
  const [phone, setPhone] = useState(savedAddress.phone || '');
  const [streetAddress, setStreetAddress] = useState(savedAddress.streetAddress || '');
  const [paymentMethod, setPaymentMethod] = useState(
    user?.paymentMethod === 'BankTransfer' ? 'BankTransfer' : 'CashOnDelivery'
  );
  const [orderNote, setOrderNote] = useState(savedAddress.orderNote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast({
        variant: 'destructive',
        description: 'Vui lòng đăng nhập trước khi đặt hàng để lưu đơn hàng vào tài khoản.',
      });
      return;
    }

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim()) {
      toast({
        variant: 'destructive',
        description: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.',
      });
      return;
    }

    startTransition(async () => {
      const addrRes = await updateUserAddress({
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        city: '',
        postalCode: savedAddress.postalCode || '100000',
        country: 'Việt Nam',
        orderNote: orderNote.trim(),
      });

      if (!addrRes.success) {
        toast({ variant: 'destructive', description: addrRes.message });
        return;
      }

      const payRes = await updateUserPaymentMethod({ type: paymentMethod });
      if (!payRes.success) {
        toast({ variant: 'destructive', description: payRes.message });
        return;
      }

      const orderRes = await createOrder();
      if (!orderRes.success) {
        toast({ variant: 'destructive', description: orderRes.message });
        if (orderRes.redirectTo) router.push(orderRes.redirectTo);
        return;
      }

      toast({
        description: 'Đặt hàng thành công! Đang chuyển hướng...',
      });

      if (orderRes.redirectTo) {
        router.push(orderRes.redirectTo);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className='grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6'>
      {/* Cột trái: Thông tin nhận hàng & Phương thức thanh toán (lg:col-span-7) */}
      <div className='min-w-0 space-y-5 lg:col-span-7 lg:space-y-6'>
        {!isLoggedIn && (
          <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm'>
            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
            <p>
              Bạn chưa đăng nhập.{' '}
              <SignInDialog callbackUrl='/checkout'>
                <button type='button' className='font-bold underline underline-offset-2 hover:text-amber-700'>
                  Đăng nhập ngay
                </button>
              </SignInDialog>{' '}
              để lưu đơn hàng vào tài khoản.
            </p>
          </div>
        )}

        {/* Thông tin người nhận & Giao hàng */}
        <Card className='overflow-hidden rounded-lg border-slate-200 shadow-sm'>
          <CardHeader className='border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:px-5'>
            <CardTitle className='text-base font-bold text-slate-900 flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-primary' />
              Thông tin nhận hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 p-4 sm:p-5'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='fullName' className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <UserIcon className='w-3.5 h-3.5 text-slate-400' />
                  Họ và tên <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='fullName'
                  required
                  placeholder='Nguyễn Văn A'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className='h-11 text-base'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='phone' className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <Phone className='w-3.5 h-3.5 text-slate-400' />
                  Số điện thoại <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='phone'
                  type='tel'
                  inputMode='tel'
                  autoComplete='tel'
                  required
                  placeholder='09xxxxxxxx'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='h-11 text-base'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='streetAddress' className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                <MapPin className='w-3.5 h-3.5 text-slate-400' />
                Địa chỉ giao hàng <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                id='streetAddress'
                required
                placeholder='Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố'
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className='min-h-20 text-base'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='orderNote' className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                <FileText className='w-3.5 h-3.5 text-slate-400' />
                Ghi chú đơn hàng
              </Label>
              <Textarea
                id='orderNote'
                placeholder='Ghi chú thêm cho đơn hàng (tùy chọn)'
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className='min-h-16 text-base'
              />
            </div>
          </CardContent>
        </Card>

        {/* Phương thức thanh toán */}
        <Card className='overflow-hidden rounded-lg border-slate-200 shadow-sm'>
          <CardHeader className='border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:px-5'>
            <CardTitle className='text-base font-bold text-slate-900 flex items-center gap-2'>
              <CreditCard className='w-4 h-4 text-primary' />
              Phương thức thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 sm:p-5'>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className='space-y-3'
            >
              <div
                className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === 'CashOnDelivery'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setPaymentMethod('CashOnDelivery')}
              >
                <RadioGroupItem value='CashOnDelivery' id='cod' className='mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <Label htmlFor='cod' className='font-semibold text-sm cursor-pointer flex items-center gap-2 text-slate-900'>
                    <Truck className='w-4 h-4 text-emerald-600' />
                    Thanh toán khi nhận hàng
                  </Label>
                  <p className='text-xs text-slate-500 mt-1'>
                    Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận hàng.
                  </p>
                </div>
              </div>

              <div
                className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === 'BankTransfer'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setPaymentMethod('BankTransfer')}
              >
                <RadioGroupItem value='BankTransfer' id='bank' className='mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <Label htmlFor='bank' className='font-semibold text-sm cursor-pointer flex items-center gap-2 text-slate-900'>
                    <QrCode className='w-4 h-4 text-blue-600' />
                    Chuyển khoản ngân hàng (Tingee VA)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Tóm tắt đơn hàng & Xác nhận (lg:col-span-5) */}
      <div className='min-w-0 space-y-6 lg:col-span-5'>
        <Card className='overflow-hidden rounded-lg border-slate-200 shadow-sm lg:sticky lg:top-24'>
          <CardHeader className='flex flex-col items-start gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5'>
            <CardTitle className='text-base font-bold text-slate-900 flex items-center gap-2'>
              <ShoppingBag className='w-4 h-4 text-primary' />
              Đơn hàng ({cart.items.reduce((acc, item) => acc + item.qty, 0)} sản phẩm)
            </CardTitle>
            <Link href='/cart' className='text-xs text-primary hover:underline font-medium'>
              Sửa giỏ hàng
            </Link>
          </CardHeader>

          <CardContent className='space-y-4 p-4 sm:p-5'>
            {/* List products */}
            <div className='space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100'>
              {cart.items.map((item) => (
                <div key={item.slug} className='flex min-w-0 items-center gap-3 pt-3 first:pt-0'>
                  <div className='relative w-14 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className='object-contain p-1'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs font-semibold text-slate-800 line-clamp-2 leading-tight'>
                      {item.name}
                    </h4>
                    <p className='text-xs text-slate-500 mt-1'>
                      Số lượng: <span className='font-medium text-slate-700'>{item.qty}</span>
                    </p>
                  </div>
                  <div className='max-w-24 shrink-0 text-right sm:max-w-none'>
                    <p className='text-xs font-bold text-slate-900'>
                      {formatCurrency(Number(item.price) * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className='my-3 border-slate-200' />

            {/* Total summary */}
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between text-slate-600'>
                <span>Tạm tính tiền hàng:</span>
                <span className='font-medium text-slate-900'>{formatCurrency(cart.itemsPrice)}</span>
              </div>
              <div className='flex justify-between text-slate-600'>
                <span>Phí vận chuyển:</span>
                <span className='font-medium text-emerald-600'>
                  {Number(cart.shippingPrice) === 0 ? 'Miễn phí' : formatCurrency(cart.shippingPrice)}
                </span>
              </div>
              <div className='flex justify-between text-slate-600'>
                <span>Thuế VAT:</span>
                <span className='font-medium text-slate-900'>{formatCurrency(cart.taxPrice)}</span>
              </div>

              <hr className='my-3 border-slate-200' />

              <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-1 text-base'>
                <span className='font-bold text-slate-900'>Tổng tiền thanh toán:</span>
                <span className='text-xl font-extrabold text-[hsl(35,95%,45%)]'>
                  {formatCurrency(cart.totalPrice)}
                </span>
              </div>
            </div>

            <Button
              type='submit'
              disabled={isPending || !isLoggedIn}
              className='mt-4 min-h-12 h-auto w-full whitespace-normal rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base'
            >
              {isPending ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader className='w-5 h-5 animate-spin' />
                  Đang xử lý đơn hàng...
                </span>
              ) : !isLoggedIn ? (
                'VUI LÒNG ĐĂNG NHẬP ĐỂ ĐẶT HÀNG'
              ) : (
                'XÁC NHẬN ĐẶT HÀNG'
              )}
            </Button>

            <div className='flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 text-center'>
              <ShieldCheck className='w-4 h-4 text-emerald-600 shrink-0' />
              <span>Bảo mật 100%. Kiểm tra hàng trước khi thanh toán.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
