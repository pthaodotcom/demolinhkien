import { cn, formatCurrency } from '@/lib/utils';

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  return (
    <span className={cn('text-2xl font-bold text-[hsl(35,95%,45%)]', className)}>
      {formatCurrency(value)}
    </span>
  );
};

export default ProductPrice;
