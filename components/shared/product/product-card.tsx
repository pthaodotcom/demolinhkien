import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProductPrice from './product-price';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import CardAddToCart from './card-add-to-cart';

const ProductCard = ({ product }: { product: Product }) => {
  const discountPercent = product.discountPercent ?? 0;
  const salePrice = Math.round(
    Number(product.price) * (100 - discountPercent) / 100
  );

  return (
    <Card className='w-full min-w-0 overflow-hidden hover:shadow-lg transition-shadow duration-200'>
      <CardHeader className='p-0 items-center relative'>
        <Link href={`/product/${product.slug}`} className='block w-full'>
          <Image
            src={product.images[0]}
            alt={product.name}
            height={300}
            width={300}
            priority={true}
            className='aspect-square h-auto w-full rounded-t-lg object-contain'
          />
        </Link>
        {product.stock === 0 && (
          <Badge
            variant='destructive'
            className='absolute top-2 right-2'
          >
            Hết hàng
          </Badge>
        )}
        {product.stock > 0 && discountPercent > 0 && (
          <Badge className='absolute left-2 top-2 bg-red-600 text-white hover:bg-red-600'>
            -{discountPercent}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className='grid min-w-0 gap-2 p-2.5 sm:p-4'>
        <Badge variant='secondary' className='w-fit text-xs'>{product.category}</Badge>
        <Link href={`/product/${product.slug}`} className='min-w-0'>
          <h2 className='text-sm font-medium line-clamp-2 min-h-10 hover:text-primary transition-colors'>
            {product.name}
          </h2>
        </Link>
        <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
          {product.stock > 0 ? (
            <>
              <div className='min-w-0'>
                <ProductPrice value={salePrice} className='min-w-0 text-sm sm:text-lg' />
                {discountPercent > 0 && (
                  <div className='text-xs text-gray-400 line-through'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price))}
                  </div>
                )}
              </div>
              <CardAddToCart item={{ productId: product.id, name: product.name, slug: product.slug, price: String(salePrice), qty: 1, image: product.images[0] }} />
            </>
          ) : (
            <p className='text-destructive text-sm font-medium'>Hết hàng</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
