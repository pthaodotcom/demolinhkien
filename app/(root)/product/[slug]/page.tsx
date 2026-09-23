import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/product.actions';
import { notFound } from 'next/navigation';
import ProductPrice from '@/components/shared/product/product-price';
import ProductImages from '@/components/shared/product/product-images';
import AddToCart from '@/components/shared/product/add-to-cart';
import { getMyCart } from '@/lib/actions/cart.actions';
import ProductList from '@/components/shared/product/product-list';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, RefreshCw, Truck, Wrench } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();
  const relatedProducts = await getRelatedProducts(product.category, product.id);
  const discountPercent = product.discountPercent ?? 0;
  const salePrice = Math.round(
    Number(product.price) * (100 - discountPercent) / 100
  );

  return (
    <div className='wrapper py-6'>
      {/* Breadcrumb */}
      <nav className='flex items-center text-sm text-gray-500 mb-6 gap-2'>
        <Link href='/' className='hover:text-primary transition-colors'>
          Trang chủ
        </Link>
        <ChevronRight className='w-4 h-4' />
        <Link
          href={`/search?category=${product.category}`}
          className='hover:text-primary transition-colors'
        >
          {product.category}
        </Link>
        <ChevronRight className='w-4 h-4' />
        <span className='text-gray-900 font-medium truncate max-w-md'>
          {product.name}
        </span>
      </nav>

      <section>
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8'>
          {/* Images Column */}
          <div className='lg:col-span-5'>
            <ProductImages images={product.images} />
          </div>

          {/* Details Column */}
          <div className='contents lg:col-span-4 lg:flex lg:flex-col lg:gap-5'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Badge variant='outline' className='text-xs font-semibold text-primary border-primary/30'>
                  {product.brand}
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  {product.category}
                </Badge>
              </div>
              <h1 className='text-2xl font-bold text-gray-900 leading-snug'>
                {product.name}
              </h1>
            </div>

            <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
              <p className='text-xs text-gray-500 mb-1 font-medium'>Giá bán ưu đãi</p>
              <ProductPrice
                value={salePrice}
                className='text-3xl font-extrabold text-[hsl(35,95%,45%)]'
              />
              {discountPercent > 0 && (
                <div className='mt-1 flex items-center gap-2 text-sm'>
                  <span className='text-gray-400 line-through'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price))}
                  </span>
                  <Badge className='bg-red-600 text-white hover:bg-red-600'>
                    Giảm {discountPercent}%
                  </Badge>
                </div>
              )}
            </div>

            <div className='order-2 lg:order-none'>
              <h3 className='font-semibold text-gray-900 mb-2'>Mô tả sản phẩm</h3>
              <p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>
                {product.description}
              </p>
            </div>

            {/* Store policy commitments */}
            <div className='order-2 grid grid-cols-2 gap-3 border-t pt-4 text-xs text-gray-600 lg:order-none'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='w-4 h-4 text-primary shrink-0' />
                <span>Chính hãng 100%</span>
              </div>
              <div className='flex items-center gap-2'>
                <RefreshCw className='w-4 h-4 text-primary shrink-0' />
                <span>Đổi mới trong 30 ngày</span>
              </div>
              <div className='flex items-center gap-2'>
                <Truck className='w-4 h-4 text-primary shrink-0' />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className='flex items-center gap-2'>
                <Wrench className='w-4 h-4 text-primary shrink-0' />
                <span>Hỗ trợ lắp đặt miễn phí</span>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className='order-1 lg:order-none lg:col-span-3'>
            <Card className='border shadow-sm lg:sticky lg:top-40'>
              <CardContent className='p-5 flex flex-col gap-4'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-500'>Giá niêm yết</span>
                  <ProductPrice value={salePrice} className='text-xl' />
                </div>

                <div className='flex justify-between items-center text-sm border-t pt-3'>
                  <span className='text-gray-500'>Tình trạng</span>
                  {product.stock > 0 ? (
                    <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                      Còn hàng ({product.stock})
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>Hết hàng</Badge>
                  )}
                </div>

                <div className='flex justify-between items-center text-sm border-t pt-3'>
                  <span className='text-gray-500'>Bảo hành</span>
                  <span className='font-semibold text-gray-800'>36 Tháng</span>
                </div>

                {product.stock > 0 ? (
                  <div className='pt-2'>
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: String(salePrice),
                        qty: 1,
                        image: product.images![0],
                      }}
                    />
                  </div>
                ) : (
                  <div className='text-center py-2 text-sm text-red-500 font-medium'>
                    Sản phẩm tạm thời hết hàng
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className='mt-12 border-t pt-2'>
          <ProductList data={relatedProducts} title='Sản phẩm liên quan' />
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
