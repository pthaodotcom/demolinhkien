'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import PriceRangeFilter from '@/components/shared/product/price-range-filter';
import { parsePriceRange } from '@/lib/price-range';
import { formatNumber } from '@/lib/utils';

type FilterOption = { label: string; value: string };

export default function ProductFilterBar({
  query,
  category,
  brand,
  price,
  sort,
  categories,
  brands,
}: {
  query: string;
  category: string;
  brand: string;
  price: string;
  sort: string;
  categories: FilterOption[];
  brands: FilterOption[];
}) {
  const router = useRouter();
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const updateFilter = (key: 'category' | 'brand' | 'sort' | 'price', value: string) => {
    const params = new URLSearchParams({
      q: query,
      category,
      brand,
      price,
      sort,
      page: '1',
    });
    params.set(key, value);
    router.push(`/search?${params.toString()}`);
  };

  const parsedPrice = parsePriceRange(price);
  const isPriceActive = Boolean(parsedPrice);

  let priceLabel = 'Mức giá';
  if (parsedPrice) {
    priceLabel = `${formatNumber(parsedPrice[0])}đ - ${formatNumber(parsedPrice[1])}đ`;
  }

  return (
    <div className='hidden md:flex flex-wrap items-center gap-2 border-b bg-[#f4f7f9] px-4 py-3 md:border-0 md:bg-transparent md:px-0'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground mr-1'>
        <ListFilter className='h-4 w-4' aria-hidden='true' />
        <span className='hidden sm:inline'>Lọc sản phẩm:</span>
      </div>

      {/* Popover filter Mức Giá */}
      <Popover open={isPriceOpen} onOpenChange={setIsPriceOpen}>
        <PopoverTrigger
          className={`flex h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none bg-white ${
            isPriceOpen || isPriceActive
              ? 'border-primary text-primary font-medium ring-1 ring-primary/20 bg-primary/5'
              : 'border-input text-foreground hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <span className='max-w-[160px] truncate'>{priceLabel}</span>
          {isPriceOpen ? (
            <ChevronUp className='h-4 w-4 shrink-0 opacity-70 text-primary' />
          ) : (
            <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
          )}
        </PopoverTrigger>
        <PopoverContent align='start' sideOffset={6} className='w-80 p-4 shadow-xl border rounded-xl bg-white'>
          <div className='mb-3 font-semibold text-sm text-foreground'>Lọc theo mức giá</div>
          <PriceRangeFilter
            value={price}
            query={query}
            category={category}
            brand={brand}
            sort={sort}
            resetHref={`/search?${new URLSearchParams({ q: query, category, brand, price: 'all', sort, page: '1' }).toString()}`}
            onApply={() => setIsPriceOpen(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Select Danh mục */}
      <Select value={category} onValueChange={(value) => updateFilter('category', value)}>
        <SelectTrigger className={`h-10 w-auto min-w-[132px] bg-white transition-colors hover:bg-slate-100 hover:border-slate-300 ${category !== 'all' && category !== '' ? 'border-primary text-primary font-medium bg-primary/5' : ''}`}>
          <SelectValue placeholder='Danh mục' />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>Tất cả danh mục</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select Hãng */}
      <Select value={brand} onValueChange={(value) => updateFilter('brand', value)}>
        <SelectTrigger className={`h-10 w-auto min-w-[108px] bg-white transition-colors hover:bg-slate-100 hover:border-slate-300 ${brand !== 'all' && brand !== '' ? 'border-primary text-primary font-medium bg-primary/5' : ''}`}>
          <SelectValue placeholder='Hãng' />
        </SelectTrigger>
        <SelectContent align='start'>
          <SelectItem value='all'>Tất cả hãng</SelectItem>
          {brands.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sắp xếp theo: Đặt bên phải màn hình Desktop */}
      <div className='ml-auto flex items-center gap-2'>
        <span className='text-sm text-slate-600 font-medium whitespace-nowrap hidden sm:inline'>
          Sắp xếp theo:
        </span>
        <Select value={sort} onValueChange={(value) => updateFilter('sort', value)}>
          <SelectTrigger className='h-10 w-auto min-w-[140px] bg-white transition-colors hover:bg-slate-100 hover:border-slate-300'>
            <SelectValue placeholder='Sắp xếp' />
          </SelectTrigger>
          <SelectContent align='end'>
            <SelectItem value='newest'>Mới nhất</SelectItem>
            <SelectItem value='lowest'>Giá tăng dần</SelectItem>
            <SelectItem value='highest'>Giá giảm dần</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}