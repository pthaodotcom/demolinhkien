export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || 'Lập Trình Viên';
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'Chuyên linh kiện máy tính, PC gaming, laptop – Lập Trình Viên';
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

// Store contact info
export const APP_PHONE = '0123 456 789';
export const APP_EMAIL = 'info@laptrinhvien.com';
export const APP_ADDRESS = '123 Đường Nguyễn Huệ, TP. Phước Long, Bình Phước';
export const APP_WORKING_HOURS = '8:00 – 21:00 (Thứ 2 – Chủ nhật)';

export const signUpDefaultValues = {
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export const shippingAddressDefaultValues = {
  fullName: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  country: 'Việt Nam',
};

export const PAYMENT_METHODS = ['CashOnDelivery', 'BankTransfer'];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || 'CashOnDelivery';

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: '0',
  stock: 0,
  rating: '0',
  numReviews: '0',
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(', ')
  : ['admin', 'user'];

export const reviewFormDefaultValues = {
  title: '',
  comment: '',
  rating: 0,
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

// Product categories for computer hardware
export const PRODUCT_CATEGORIES = [
  'CPU',
  'Mainboard',
  'RAM',
  'VGA',
  'SSD',
  'PSU',
  'Case',
  'PC',
  'Tản nhiệt',
  'Màn hình',
  'Bàn phím',
  'Chuột',
  'Phụ kiện',
];
