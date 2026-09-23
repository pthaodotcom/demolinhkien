'use client';

import { useToast } from '@/hooks/use-toast';
import { productDefaultValues } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import slugify from 'slugify';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { UploadButton } from '@/lib/uploadthing';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === 'Update'
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    // On Create
    if (type === 'Create') {
      const res = await createProduct(values);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
      } else {
        toast({
          description: 'Thêm sản phẩm thành công',
        });
        router.push('/admin/products');
      }
    }

    // On Update
    if (type === 'Update') {
      if (!productId) {
        router.push('/admin/products');
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
      } else {
        toast({
          description: 'Cập nhật sản phẩm thành công',
        });
        router.push('/admin/products');
      }
    }
  };

  const images = form.watch('images');
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

  return (
    <Form {...form}>
      <form
        method='POST'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 bg-white p-6 rounded-2xl border shadow-sm'
      >
        <div className='flex flex-col md:flex-row gap-5'>
          {/* Name */}
          <FormField
            control={form.control}
            name='name'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'name'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Tên linh kiện / Sản phẩm</FormLabel>
                <FormControl>
                  <Input placeholder='Ví dụ: CPU Intel Core i5-14400F' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name='slug'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'slug'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Đường dẫn URL (Slug)</FormLabel>
                <FormControl>
                  <div>
                    <Input placeholder='cpu-intel-core-i5-14400f' {...field} />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='mt-2 text-xs'
                      onClick={() => {
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true })
                        );
                      }}
                    >
                      Tạo tự động từ tên
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col md:flex-row gap-5'>
          {/* Category */}
          <FormField
            control={form.control}
            name='category'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'category'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Danh mục (CPU, Mainboard, RAM, VGA, SSD, PSU, Case, PC...)</FormLabel>
                <FormControl>
                  <Input placeholder='Ví dụ: CPU' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Brand */}
          <FormField
            control={form.control}
            name='brand'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'brand'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Thương hiệu (Intel, AMD, ASUS, MSI, Gigabyte...)</FormLabel>
                <FormControl>
                  <Input placeholder='Ví dụ: Intel' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col md:flex-row gap-5'>
          {/* Price */}
          <FormField
            control={form.control}
            name='price'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'price'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Giá bán (VNĐ - số nguyên)</FormLabel>
                <FormControl>
                  <Input placeholder='Ví dụ: 4590000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}
          <FormField
            control={form.control}
            name='stock'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'stock'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Số lượng tồn kho</FormLabel>
                <FormControl>
                  <Input placeholder='Ví dụ: 20' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='upload-field flex flex-col md:flex-row gap-5'>
          {/* Images */}
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Hình ảnh sản phẩm</FormLabel>
                <Card>
                  <CardContent className='space-y-2 mt-2 min-h-36 p-4'>
                    <div className='flex flex-wrap items-center gap-3'>
                      {images.map((image: string) => (
                        <Image
                          key={image}
                          src={image}
                          alt='Hình ảnh sản phẩm'
                          className='w-20 h-20 object-cover object-center rounded-lg border'
                          width={100}
                          height={100}
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue('images', [...images, res[0].url]);
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: 'destructive',
                              description: `Lỗi tải ảnh: ${error.message}`,
                            });
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='upload-field'>
          <FormLabel>Sản phẩm nổi bật / Banner</FormLabel>
          <Card className='mt-2'>
            <CardContent className='space-y-3 p-4'>
              <FormField
                control={form.control}
                name='isFeatured'
                render={({ field }) => (
                  <FormItem className='flex items-center space-x-2 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal cursor-pointer'>
                      Đánh dấu là sản phẩm nổi bật (Hiển thị trang chủ)
                    </FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt='Banner sản phẩm'
                  className='w-full object-cover object-center rounded-lg max-h-48'
                  width={1920}
                  height={480}
                />
              )}

              {isFeatured && !banner && (
                <UploadButton
                  endpoint='imageUploader'
                  onClientUploadComplete={(res: { url: string }[]) => {
                    form.setValue('banner', res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      variant: 'destructive',
                      description: `Lỗi tải banner: ${error.message}`,
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'description'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Mô tả chi tiết & Thông số kỹ thuật</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder='Nhập thông số, tính năng nổi bật của linh kiện...'
                    className='resize-y'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='w-full bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white font-semibold py-3'
          >
            {form.formState.isSubmitting
              ? 'Đang lưu...'
              : type === 'Create'
              ? 'Thêm sản phẩm'
              : 'Cập nhật sản phẩm'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
