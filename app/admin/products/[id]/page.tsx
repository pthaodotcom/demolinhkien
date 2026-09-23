import ProductForm from '@/components/admin/product-form';
import { getProductById } from '@/lib/actions/product.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Cập nhật sản phẩm',
};

const AdminProductUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const product = await getProductById(id);

  if (!product) return notFound();

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Cập nhật sản phẩm</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Chỉnh sửa thông số, hình ảnh và giá bán linh kiện #{product.name}
        </p>
      </div>

      <ProductForm type='Update' product={product} productId={product.id} />
    </div>
  );
};

export default AdminProductUpdatePage;
