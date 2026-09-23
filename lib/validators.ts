import { z } from 'zod';
import { PAYMENT_METHODS } from './constants';

// VND currency: whole numbers only
const currency = z
  .string()
  .refine(
    (value) => /^\d+$/.test(String(Math.round(Number(value)))),
    'Giá phải là số nguyên'
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
  slug: z.string().min(3, 'Slug phải có ít nhất 3 ký tự'),
  category: z.string().min(1, 'Danh mục không được để trống'),
  brand: z.string().min(1, 'Thương hiệu không được để trống'),
  description: z.string().min(3, 'Mô tả phải có ít nhất 3 ký tự'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Sản phẩm cần ít nhất 1 hình ảnh'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating products
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'ID không được để trống'),
});

// Schema for signing users in
export const signInFormSchema = z.object({
  account: z.string().min(3, 'Tên tài khoản phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Tên tài khoản phải có ít nhất 3 ký tự')
      .max(32, 'Tên tài khoản không được quá 32 ký tự')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Tên tài khoản chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang'
      ),
    phone: z
      .string()
      .trim()
      .min(9, 'Số điện thoại phải có ít nhất 9 số')
      .max(15, 'Số điện thoại không được quá 15 số')
      .regex(/^[0-9+\s.-]+$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
      .string()
      .min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Sản phẩm không được để trống'),
  name: z.string().min(1, 'Tên không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  qty: z.number().int().nonnegative('Số lượng phải lớn hơn 0'),
  image: z.string().min(1, 'Hình ảnh không được để trống'),
  price: currency,
  originalPrice: currency.optional(),
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart ID không được để trống'),
  userId: z.string().optional().nullable(),
});

// Schema for the shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  streetAddress: z.string().min(3, 'Địa chỉ phải có ít nhất 3 ký tự'),
  city: z.string(),
  postalCode: z.string().min(1, 'Mã bưu điện không được để trống'),
  country: z.string().min(1, 'Quốc gia không được để trống'),
  phone: z.string().optional(),
  orderNote: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Schema for payment method
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Phương thức thanh toán không được để trống'),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Phương thức thanh toán không hợp lệ',
  });

// Schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'Người dùng không được để trống'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: 'Phương thức thanh toán không hợp lệ',
  }),
  shippingAddress: shippingAddressSchema,
});

// Schema for inserting an order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

// Payment result shared by external payment providers.
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string().optional(),
  pricePaid: z.string(),
  provider: z.string().optional(),
  billId: z.string().optional(),
  transactionCode: z.string().optional(),
  qrCode: z.string().optional(),
  accountNumber: z.string().optional(),
  reference: z.string().optional(),
});

// Schema for updating the user profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Tên tài khoản phải có ít nhất 3 ký tự'),
});

// Schema to update users
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'ID không được để trống'),
  role: z.string().min(1, 'Vai trò không được để trống'),
});

// Schema to insert reviews
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  description: z.string().min(3, 'Nội dung phải có ít nhất 3 ký tự'),
  productId: z.string().min(1, 'Sản phẩm không được để trống'),
  userId: z.string().min(1, 'Người dùng không được để trống'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
});
