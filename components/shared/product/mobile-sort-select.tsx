'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MobileSortSelect({
  sort,
  query,
  category,
  brand,
  price,
}: {
  sort: string;
  query: string;
  category: string;
  brand: string;
  price: string;
}) {
  const router = useRouter();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams({
      q: query,
      category,
      brand,
      price,
      sort: newSort,
      page: '1',
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <Select value={sort} onValueChange={handleSortChange}>
      <SelectTrigger className='h-10 w-full bg-white text-xs sm:text-sm border-input'>
        <span className='mr-1 text-muted-foreground hidden sm:inline'>Sắp xếp:</span>
        <SelectValue placeholder='Sắp xếp' />
      </SelectTrigger>
      <SelectContent align='end'>
        <SelectItem value='newest'>Mới nhất</SelectItem>
        <SelectItem value='lowest'>Giá tăng dần</SelectItem>
        <SelectItem value='highest'>Giá giảm dần</SelectItem>
      </SelectContent>
    </Select>
  );
}
