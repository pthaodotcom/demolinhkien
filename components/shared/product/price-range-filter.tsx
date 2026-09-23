'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MAX_FILTER_PRICE, parsePriceRange } from '@/lib/price-range';
import { formatNumber } from '@/lib/utils';

interface PriceRangeFilterProps {
  value: string;
  query: string;
  category: string;
  brand: string;
  sort: string;
  resetHref: string;
  onApply?: () => void;
  className?: string;
}

export default function PriceRangeFilter({
  value,
  query,
  category,
  brand,
  sort,
  resetHref,
  onApply,
  className = '',
}: PriceRangeFilterProps) {
  const router = useRouter();
  const initial = parsePriceRange(value) ?? ([0, MAX_FILTER_PRICE] as [number, number]);

  const [minVal, setMinVal] = useState<number>(initial[0]);
  const [maxVal, setMaxVal] = useState<number>(initial[1]);
  const [minInput, setMinInput] = useState<string>(formatNumber(initial[0]));
  const [maxInput, setMaxInput] = useState<string>(formatNumber(initial[1]));

  // Sync when external URL price value changes
  useEffect(() => {
    const parsed = parsePriceRange(value) ?? ([0, MAX_FILTER_PRICE] as [number, number]);
    setMinVal(parsed[0]);
    setMaxVal(parsed[1]);
    setMinInput(formatNumber(parsed[0]));
    setMaxInput(formatNumber(parsed[1]));
  }, [value]);

  const handleSliderChange = (newValues: number[]) => {
    const newMin = newValues[0];
    const newMax = newValues[1];
    setMinVal(newMin);
    setMaxVal(newMax);
    setMinInput(formatNumber(newMin));
    setMaxInput(formatNumber(newMax));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setMinInput(rawVal);
    if (rawVal !== '') {
      const num = Math.min(MAX_FILTER_PRICE, Math.max(0, Number(rawVal)));
      const clamped = Math.min(num, maxVal);
      setMinVal(clamped);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setMaxInput(rawVal);
    if (rawVal !== '') {
      const num = Math.min(MAX_FILTER_PRICE, Math.max(0, Number(rawVal)));
      const clamped = Math.max(num, minVal);
      setMaxVal(clamped);
    }
  };

  const handleMinInputBlur = () => {
    setMinInput(formatNumber(minVal));
  };

  const handleMaxInputBlur = () => {
    setMaxInput(formatNumber(maxVal));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPrice =
      minVal === 0 && maxVal === MAX_FILTER_PRICE
        ? 'all'
        : `${minVal}-${maxVal}`;

    const params = new URLSearchParams({
      q: query,
      category,
      brand,
      price: selectedPrice,
      sort,
      page: '1',
    });

    if (onApply) onApply();
    router.push(`/search?${params.toString()}`);
  };

  const isFiltered = Boolean(parsePriceRange(value));

  return (
    <form onSubmit={handleApply} className={`space-y-4 ${className}`}>
      {/* 2 input boxes */}
      <div className='grid grid-cols-2 gap-2'>
        <div className='relative flex items-center'>
          <Input
            type='text'
            inputMode='numeric'
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            placeholder='0'
            className='h-9 w-full pr-6 text-xs font-medium tabular-nums focus-visible:ring-primary'
          />
          <span className='pointer-events-none absolute right-2 text-xs text-muted-foreground'>
            đ
          </span>
        </div>
        <div className='relative flex items-center'>
          <Input
            type='text'
            inputMode='numeric'
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            placeholder={formatNumber(MAX_FILTER_PRICE)}
            className='h-9 w-full pr-6 text-xs font-medium tabular-nums focus-visible:ring-primary'
          />
          <span className='pointer-events-none absolute right-2 text-xs text-muted-foreground'>
            đ
          </span>
        </div>
      </div>

      {/* Dual thumb range slider */}
      <div className='pt-1 pb-2 px-1'>
        <Slider
          min={0}
          max={MAX_FILTER_PRICE}
          step={500_000}
          value={[minVal, maxVal]}
          onValueChange={handleSliderChange}
        />
      </div>

      {/* Action buttons */}
      <div className='flex items-center gap-2 pt-1'>
        <Button
          type='submit'
          className='w-full h-9 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90'
        >
          Áp dụng
        </Button>
        {isFiltered && (
          <Button
            type='button'
            variant='outline'
            className='h-9 text-xs shrink-0'
            onClick={() => {
              if (onApply) onApply();
              router.push(resetHref);
            }}
          >
            Xóa
          </Button>
        )}
      </div>
    </form>
  );
}
