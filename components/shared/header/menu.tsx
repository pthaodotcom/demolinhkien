import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from './user-button';
import { Menu as MenuIcon } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import Search from './search';
import { getMyCart } from '@/lib/actions/cart.actions';
import type { CartItem } from '@/types';

const Menu = async ({ categories = PRODUCT_CATEGORIES }: { categories?: string[] }) => {
  const cart = await getMyCart();
  const items: CartItem[] = cart?.items ?? [];
  const itemCount = items.reduce((total, item) => total + item.qty, 0);

  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <div className='group relative' tabIndex={-1}>
          <Button asChild variant='ghost' className='hover:bg-[hsl(213,80%,25%)] hover:text-white focus-visible:bg-[hsl(213,80%,25%)] focus-visible:text-white'>
            <Link href='/cart' prefetch={false} aria-label={`Giỏ hàng, ${itemCount} sản phẩm`} className='group/cart'>
              <span className='relative'>
                <ShoppingCart className='h-5 w-5' />
                {itemCount > 0 && (
                  <span className='absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white group-hover/cart:bg-white group-hover/cart:text-primary group-focus-visible/cart:bg-white group-focus-visible/cart:text-primary'>
                    {itemCount}
                  </span>
                )}
              </span>
              Giỏ hàng
            </Link>
          </Button>
          <div className='invisible absolute right-0 top-full z-50 w-80 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'>
            <div className='rounded-md border border-slate-200 bg-white p-4 shadow-lg'>
              <div className='mb-3 flex items-center justify-between border-b pb-3 text-sm font-semibold'>
                <span>Giỏ hàng</span>
                <span>{itemCount} sản phẩm</span>
              </div>
              {items.length === 0 ? (
                <p className='py-4 text-center text-sm text-slate-500'>Giỏ hàng trống</p>
              ) : (
                <div className='max-h-72 space-y-3 overflow-y-auto'>
                  {items.map((item) => (
                    <Link key={item.productId} href={`/product/${item.slug}`} className='flex items-center gap-3 rounded-sm hover:bg-slate-50'>
                      <span className='relative h-12 w-12 shrink-0 overflow-hidden rounded border bg-white'>
                        <Image src={item.image} alt={item.name} fill sizes='48px' className='object-contain p-1' />
                      </span>
                      <span className='min-w-0 flex-1 text-sm font-medium text-slate-800 line-clamp-2'>{item.name}</span>
                      <span className='shrink-0 text-xs text-slate-500'>x{item.qty}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link href='/cart' prefetch={false} className='mt-4 block border-t pt-3 text-center text-sm font-semibold text-primary hover:underline'>
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        </div>
        <UserButton />
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='inline-flex h-10 w-10 items-center justify-center rounded-md align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary' aria-label='Mở menu'>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent className='w-[min(88vw,360px)] overflow-y-auto p-5 sm:max-w-[360px]'>
            <SheetTitle className='mb-5 text-lg'>Menu</SheetTitle>
            <div className='mb-5 w-full'>
              <Search />
            </div>
            <div className='grid grid-cols-2 gap-2 border-b pb-5 [&_button]:w-full'>
              <SheetClose asChild>
                <Button asChild variant='outline' className='h-11 justify-center gap-2 px-2'>
                  <Link href='/cart' prefetch={false} aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}>
                    <span className='relative'>
                      <ShoppingCart className='h-4 w-4' />
                      {itemCount > 0 && <span className='absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white'>{itemCount}</span>}
                    </span>
                    Giỏ hàng
                  </Link>
                </Button>
              </SheetClose>
              <UserButton />
            </div>
            <div className='w-full pt-5'>
              <p className='mb-3 text-sm font-semibold text-muted-foreground'>
                Danh mục
              </p>
              <div className='grid grid-cols-2 gap-2'>
                {categories.map((cat) => (
                  <SheetClose asChild key={cat}>
                    <Link href={`/search?category=${encodeURIComponent(cat)}`} className='flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-800 transition-colors hover:border-primary hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
                      {cat}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
