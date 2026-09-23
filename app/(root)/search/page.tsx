import ProductCard from '@/components/shared/product/product-card';
import { Button } from '@/components/ui/button';
import {
  getAllProducts,
  getAllCategories,
  getAllBrands,
} from '@/lib/actions/product.actions';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import MobileFilters from '@/components/shared/product/mobile-filters';
import PriceRangeFilter from '@/components/shared/product/price-range-filter';
import ProductFilterBar from '@/components/shared/product/product-filter-bar';
import MobileSortSelect from '@/components/shared/product/mobile-sort-select';
import { formatCurrency } from '@/lib/utils';
import { parsePriceRange } from '@/lib/price-range';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
  }>;
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet =
    category && category !== 'all' && category.trim() !== '';
  const isPriceSet = Boolean(parsePriceRange(price));

  if (isQuerySet || isCategorySet || isPriceSet) {
    return {
      title: `Tìm kiếm ${isQuerySet ? q : ''} ${
        isCategorySet ? `: Danh mục ${category}` : ''
      } ${isPriceSet ? `: Mức giá ${price}` : ''}`,
    };
  } else {
    return {
      title: 'Tìm kiếm sản phẩm',
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    price?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;
  const selectedPriceRange = parsePriceRange(price);
  const normalizedPrice = selectedPriceRange ? price : 'all';
  const requestedPage = Number(page);
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  // Construct filter url
  const getFilterUrl = ({
    c,
    b,
    p,
    s,
    pg,
  }: {
    c?: string;
    b?: string;
    p?: string;
    s?: string;
    pg?: string;
  }) => {
    const params = { q, category, brand, price: normalizedPrice, sort, page: '1' };

    if (c) params.category = c;
    if (b) params.brand = b;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    brand,
    price: normalizedPrice,
    sort,
    page: currentPage,
    limit: 12,
  });

  const pageNumbers = [1, currentPage - 1, currentPage, currentPage + 1, products.totalPages]
    .filter((value, index, values) => value > 0 && value <= products.totalPages && values.indexOf(value) === index)
    .sort((a, b) => a - b);

  const categories = await getAllCategories();
  const brands = await getAllBrands();

  const filters = (
    <div className='space-y-5'>
      {/* Danh mục compact pill grid */}
      <div>
        <div className='font-bold text-sm text-[hsl(213,80%,25%)] mb-2.5 pb-1 border-b flex items-center justify-between'>
          <span>Danh mục</span>
          {category !== 'all' && category !== '' && (
            <Link href={getFilterUrl({ c: 'all' })} className='text-xs text-muted-foreground hover:text-primary font-normal hover:underline'>
              Xóa chọn
            </Link>
          )}
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <Link
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              category === 'all' || category === ''
                ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            href={getFilterUrl({ c: 'all' })}
          >
            Tất cả
          </Link>
          {categories.map((x) => (
            <Link
              key={x.category}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                category === x.category
                  ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              href={getFilterUrl({ c: x.category })}
            >
              {x.category}
            </Link>
          ))}
        </div>
      </div>

      {/* Hãng compact pill grid */}
      <div>
        <div className='font-bold text-sm text-[hsl(213,80%,25%)] mb-2.5 pb-1 border-b flex items-center justify-between'>
          <span>Hãng</span>
          {brand !== 'all' && brand !== '' && (
            <Link href={getFilterUrl({ b: 'all' })} className='text-xs text-muted-foreground hover:text-primary font-normal hover:underline'>
              Xóa chọn
            </Link>
          )}
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <Link
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              brand === 'all' || brand === ''
                ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            href={getFilterUrl({ b: 'all' })}
          >
            Tất cả hãng
          </Link>
          {brands.map((item) => (
            <Link
              key={item.brand}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                brand === item.brand
                  ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              href={getFilterUrl({ b: item.brand })}
            >
              {item.brand}
            </Link>
          ))}
        </div>
      </div>

      {/* Mức giá (Dual Slider + Inputs) */}
      <div>
        <div className='font-bold text-sm text-[hsl(213,80%,25%)] mb-2.5 pb-1 border-b'>
          Mức giá
        </div>
        <PriceRangeFilter
          key={normalizedPrice}
          value={normalizedPrice}
          query={q}
          category={category}
          brand={brand}
          sort={sort}
          resetHref={getFilterUrl({ p: 'all' })}
        />
      </div>
    </div>
  );

  return (
    <div className='wrapper pb-12 pt-6 sm:pb-16'>
      {/* Mobile filter & search header */}
      <div className='mb-5 space-y-3 md:hidden'>
        <div className='flex items-center justify-between gap-2'>
          <h1 className='text-xl font-bold leading-tight'>Tất cả sản phẩm</h1>
          <span className='text-xs text-muted-foreground'>{products.data.length} sản phẩm</span>
        </div>

        <form action='/search' method='GET' className='flex gap-2'>
          <div className='relative min-w-0 flex-1'>
            <SearchIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' />
            <input
              name='q'
              type='search'
              defaultValue={q === 'all' ? '' : q}
              placeholder='Tìm kiếm sản phẩm...'
              aria-label='Tìm kiếm sản phẩm'
              className='h-10 w-full min-w-0 rounded-md border bg-white pl-9 pr-3 text-sm'
            />
          </div>
          <input type='hidden' name='category' value={category} />
          <input type='hidden' name='brand' value={brand} />
          <input type='hidden' name='price' value={normalizedPrice} />
          <input type='hidden' name='sort' value={sort} />
          <Button type='submit' className='h-10 shrink-0'>Tìm</Button>
        </form>

        {/* Quick Filter button + Standalone Sort dropdown under search bar on mobile */}
        <div className='flex items-center gap-2 pt-1'>
          <MobileFilters>{filters}</MobileFilters>
          <div className='flex-1 min-w-0'>
            <MobileSortSelect
              sort={sort}
              query={q}
              category={category}
              brand={brand}
              price={normalizedPrice}
            />
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <ProductFilterBar
          query={q}
          category={category}
          brand={brand}
          price={normalizedPrice}
          sort={sort}
          categories={categories.map((item) => ({ label: item.category, value: item.category }))}
          brands={brands.map((item) => ({ label: item.brand, value: item.brand }))}
        />

        {/* Active Filter Chips */}
        <div className='space-y-4'>
          {(q !== 'all' && q !== '' || category !== 'all' && category !== '' || brand !== 'all' && brand !== '' || selectedPriceRange) && (
            <div className='hidden items-center flex-wrap gap-4 bg-white p-4 rounded-lg border md:flex'>
              <div className='flex items-center flex-wrap gap-2 text-sm text-gray-700'>
                {q !== 'all' && q !== '' && (
                  <span className='bg-gray-100 px-2.5 py-1 rounded-md'>
                    Từ khóa: <strong>{q}</strong>
                  </span>
                )}
                {category !== 'all' && category !== '' && (
                  <span className='bg-gray-100 px-2.5 py-1 rounded-md'>
                    Danh mục: <strong>{category}</strong>
                  </span>
                )}
                {brand !== 'all' && brand !== '' && (
                  <span className='bg-gray-100 px-2.5 py-1 rounded-md'>
                    Hãng: <strong>{brand}</strong>
                  </span>
                )}
                {selectedPriceRange && (
                  <span className='bg-gray-100 px-2.5 py-1 rounded-md'>
                    Giá:{' '}
                    <strong>
                      {formatCurrency(selectedPriceRange[0])} - {formatCurrency(selectedPriceRange[1])}
                    </strong>
                  </span>
                )}
                <Button variant='link' size='sm' asChild className='text-primary p-0 h-auto ml-2 hover:underline'>
                  <Link href='/search'>Xóa tất cả bộ lọc</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'>
            {products.data.length === 0 ? (
              <div className='col-span-full text-center py-16 bg-white rounded-xl border text-gray-500'>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            ) : (
              products.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          {products.totalPages > 1 && (
            <nav aria-label='Phân trang sản phẩm' className='flex flex-wrap items-center justify-center gap-2 pt-6'>
              {currentPage > 1 && (
                <Link href={getFilterUrl({ pg: String(currentPage - 1) })} aria-label='Trang trước' className='flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 hover:border-primary hover:text-primary'>
                  <ChevronLeft className='h-4 w-4' />
                </Link>
              )}
              {pageNumbers.map((pageNumber, index) => (
                <div key={pageNumber} className='flex items-center gap-2'>
                  {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span className='px-1 text-slate-400'>...</span>}
                  <Link href={getFilterUrl({ pg: String(pageNumber) })} aria-current={pageNumber === currentPage ? 'page' : undefined} className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-semibold ${pageNumber === currentPage ? 'border-primary bg-primary text-white' : 'border-slate-200 hover:border-primary hover:text-primary'}`}>
                    {pageNumber}
                  </Link>
                </div>
              ))}
              {currentPage < products.totalPages && (
                <Link href={getFilterUrl({ pg: String(currentPage + 1) })} aria-label='Trang sau' className='flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 hover:border-primary hover:text-primary'>
                  <ChevronRight className='h-4 w-4' />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
