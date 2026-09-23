'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { formUrlQuery } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (btnType: string) => {
    const pageValue = btnType === 'next' ? Number(page) + 1 : Number(page) - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || 'page',
      value: pageValue.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        size='sm'
        variant='outline'
        className='min-w-24'
        disabled={Number(page) <= 1}
        onClick={() => handleClick('prev')}
      >
        <ChevronLeft className='h-4 w-4' />
        Trang trước
      </Button>
      <span className='min-w-20 text-center text-sm font-medium text-gray-600'>
        {page} / {totalPages}
      </span>
      <Button
        size='sm'
        variant='outline'
        className='min-w-24'
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick('next')}
      >
        Trang sau
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
};

export default Pagination;
