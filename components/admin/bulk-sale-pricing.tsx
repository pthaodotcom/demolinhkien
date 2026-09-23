'use client';

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useRouter } from 'next/navigation';
import { Percent, Tags, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProductsSale } from '@/lib/actions/product.actions';

const SelectionContext = createContext<{
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
} | null>(null);

export function SaleSelection({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <SelectionContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function ProductSaleCheckbox({ id, name }: { id: string; name: string }) {
  const context = useContext(SelectionContext);
  if (!context) return null;

  return (
    <Checkbox
      aria-label={`Chọn ${name}`}
      checked={context.selected.includes(id)}
      onCheckedChange={(checked) =>
        context.setSelected((current) =>
          checked
            ? [...new Set([...current, id])]
            : current.filter((item) => item !== id)
        )
      }
    />
  );
}

export default function BulkSalePricing({ ids }: { ids: string[] }) {
  const context = useContext(SelectionContext);
  const [percent, setPercent] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  if (!context) return null;
  const { selected, setSelected } = context;
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));

  const submit = (remove = false) => {
    startTransition(async () => {
      const result = await updateProductsSale(
        selected,
        remove ? 0 : Number(percent)
      );
      toast({
        variant: result.success ? 'default' : 'destructive',
        description: result.message,
      });
      if (result.success) {
        setSelected([]);
        setPercent('');
        router.refresh();
      }
    });
  };

  return (
    <div className='flex flex-col gap-3 border-b bg-blue-50/60 px-4 py-3 lg:flex-row lg:items-center'>
      <div className='flex items-center gap-3'>
        <Checkbox
          aria-label='Chọn tất cả sản phẩm trên trang'
          checked={allSelected}
          onCheckedChange={(checked) => setSelected(checked ? ids : [])}
        />
        <div className='flex min-w-36 items-center gap-2 text-sm font-medium text-gray-800'>
          <Tags className='h-4 w-4 text-primary' aria-hidden='true' />
          {selected.length} sản phẩm đã chọn
        </div>
      </div>

      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <div className='relative w-32'>
          <Input
            type='number'
            min={1}
            max={99}
            step={1}
            inputMode='numeric'
            value={percent}
            onChange={(event) => setPercent(event.target.value)}
            placeholder='Mức giảm'
            aria-label='Phần trăm giảm giá'
            className='bg-white pr-9'
          />
          <Percent className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        </div>
        <Button
          type='button'
          disabled={isPending || selected.length === 0 || !percent}
          onClick={() => submit(false)}
        >
          <Percent className='h-4 w-4' />
          {isPending ? 'Đang áp dụng...' : 'Áp dụng giá giảm'}
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={isPending || selected.length === 0}
          onClick={() => submit(true)}
        >
          <X className='h-4 w-4' />
          Gỡ giá giảm
        </Button>
      </div>
    </div>
  );
}
