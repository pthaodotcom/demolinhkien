'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function MobileFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type='button' variant='outline' className='h-10 shrink-0 gap-2'>
          <SlidersHorizontal className='h-4 w-4' aria-hidden='true' />
          Bộ lọc
        </Button>
      </SheetTrigger>
      <SheetContent
        side='left'
        className='w-[86vw] max-w-sm overflow-y-auto bg-white px-5 pb-8 pt-5'
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a[href]')) setOpen(false);
        }}
      >
        <SheetTitle className='mb-6 text-left'>Bộ lọc</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
