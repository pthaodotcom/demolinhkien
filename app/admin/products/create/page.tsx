import { Metadata } from 'next';
import ProductForm from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Thêm sản phẩm mới',
};

const CreateProductPage = async () => {
  await requireAdmin();
  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Thêm sản phẩm mới</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Nhập thông tin chi tiết và giá bán của linh kiện máy tính
        </p>
      </div>
      <div>
        <ProductForm type='Create' />
      </div>
    </div>
  );
};

export default CreateProductPage;
