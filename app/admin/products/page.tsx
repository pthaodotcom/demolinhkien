import Link from 'next/link';
import Image from 'next/image';
import {
  getAllProducts,
  getAllCategories,
  deleteProduct,
} from '@/lib/actions/product.actions';
import { formatCurrency, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import { requireAdmin } from '@/lib/auth-guard';
import { Plus, Search, X } from 'lucide-react';
import BulkSalePricing, {
  ProductSaleCheckbox,
  SaleSelection,
} from '@/components/admin/bulk-sale-pricing';

export const dynamic = 'force-dynamic';

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';
  const category = searchParams.category || '';

  const [products, categories] = await Promise.all([
    getAllProducts({
      query: searchText,
      limit: 10,
      page,
      category,
    }),
    getAllCategories(),
  ]);
  const hasFilters = Boolean(searchText || category);

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <h1 className='text-2xl font-bold text-gray-900'>Quản lý sản phẩm</h1>
        <Button asChild className='bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white'>
          <Link href='/admin/products/create'>
            <Plus className='w-4 h-4 mr-1.5' />
            Thêm sản phẩm mới
          </Link>
        </Button>
      </div>

      <SaleSelection>
      <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
        <form
          action='/admin/products'
          method='GET'
          className='flex flex-col gap-3 border-b bg-gray-50/60 p-4 sm:flex-row sm:items-center'
        >
          <div className='relative min-w-0 flex-1'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
              aria-hidden='true'
            />
            <Input
              type='search'
              name='query'
              defaultValue={searchText}
              placeholder='Tìm theo tên sản phẩm...'
              aria-label='Tìm theo tên sản phẩm'
              className='bg-white pl-9'
            />
          </div>
          <select
            name='category'
            defaultValue={category}
            aria-label='Lọc theo danh mục'
            className='h-10 min-w-48 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          >
            <option value=''>Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.category} value={item.category}>
                {item.category}
              </option>
            ))}
          </select>
          <Button type='submit' className='shrink-0'>
            <Search className='h-4 w-4' />
            Lọc sản phẩm
          </Button>
          {hasFilters && (
            <Button asChild type='button' variant='outline' className='shrink-0'>
              <Link href='/admin/products'>
                <X className='h-4 w-4' />
                Xóa lọc
              </Link>
            </Button>
          )}
        </form>
        <BulkSalePricing ids={products.data.map((product) => product.id)} />
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableHead className='w-10' />
                <TableHead className='w-16'>ẢNH</TableHead>
                <TableHead>MÃ</TableHead>
                <TableHead>TÊN SẢN PHẨM</TableHead>
                <TableHead className='text-right'>GIÁ BÁN</TableHead>
                <TableHead>DANH MỤC</TableHead>
                <TableHead className='text-center'>TỒN KHO</TableHead>
                <TableHead className='text-right w-[140px]'>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-10 text-gray-500'>
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.data.map((product) => (
                  <TableRow key={product.id} className='hover:bg-gray-50'>
                    <TableCell>
                      <ProductSaleCheckbox id={product.id} name={product.name} />
                    </TableCell>
                    <TableCell>
                      <div className='relative h-11 w-11 overflow-hidden rounded-md border bg-white'>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes='44px'
                          className='object-contain p-1'
                        />
                      </div>
                    </TableCell>
                    <TableCell className='text-xs font-mono'>{formatId(product.id)}</TableCell>
                    <TableCell className='font-medium text-gray-900 max-w-xs truncate'>
                      {product.name}
                    </TableCell>
                    <TableCell className='text-right font-bold text-[hsl(35,95%,45%)]'>
                      {(product.discountPercent ?? 0) > 0 ? (
                        <div>
                          <div>
                            {formatCurrency(
                              Math.round(
                                Number(product.price) *
                                  (100 - (product.discountPercent ?? 0)) /
                                  100
                              )
                            )}
                          </div>
                          <div className='text-xs font-normal text-gray-400 line-through'>
                            {formatCurrency(product.price)}
                          </div>
                          <div className='text-xs font-semibold text-red-600'>
                            Giảm {product.discountPercent}%
                          </div>
                        </div>
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>{product.category}</TableCell>
                    <TableCell className='text-center'>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        product.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button asChild variant='outline' size='sm' className='h-8 text-xs'>
                          <Link href={`/admin/products/${product.id}`}>Sửa</Link>
                        </Button>
                        <DeleteDialog id={product.id} action={deleteProduct} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {products.totalPages > 1 && (
          <div className='flex justify-end border-t bg-white p-4'>
            <Pagination page={page} totalPages={products.totalPages} />
          </div>
          )}
        </div>
      </div>
      </SaleSelection>
    </div>
  );
};

export default AdminProductsPage;
