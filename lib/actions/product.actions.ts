'use server';
import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatError } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE, PRODUCT_CATEGORIES } from '../constants';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import sampleData from '@/db/sample-data';
import { requireAdmin } from '@/lib/auth-guard';
import { Product } from '@/types';
import { cookies } from 'next/headers';

const productDiscountOverridesSchema = z.record(
  z.string(),
  z.number().int().min(0).max(99)
);

async function getProductDiscountOverrides() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('sample_product_discounts')?.value;
  if (!raw) return {};

  try {
    const parsed = productDiscountOverridesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

// Helper to convert sample data to product shape
const getSampleProductObjects = async () => {
  const overrides = await getProductDiscountOverrides();
  return sampleData.products.map((p, index) => ({
    ...p,
    id: `sample-prod-${index + 1}`,
    price: p.price.toString(),
    discountPercent: overrides[`sample-prod-${index + 1}`] || 0,
    rating: p.rating.toString(),
    createdAt: new Date(),
  }));
};

// Get latest products
export async function getLatestProducts() {
  try {
    const data = await prisma.product.findMany({
      take: LATEST_PRODUCTS_LIMIT,
      orderBy: { createdAt: 'desc' },
    });
    if (data.length > 0) return convertToPlainObject(data);
    return convertToPlainObject((await getSampleProductObjects()).slice(0, LATEST_PRODUCTS_LIMIT));
  } catch (error) {
    console.warn('Prisma not reachable, using sample data:', (error as Error).message);
    return convertToPlainObject((await getSampleProductObjects()).slice(0, LATEST_PRODUCTS_LIMIT));
  }
}

// Get single product by it's slug
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: slug },
    });
    if (product) return product;
    const sample = (await getSampleProductObjects()).find((p) => p.slug === slug);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (sample as any) || null;
  } catch (error) {
    console.warn('Prisma not reachable, using sample data:', (error as Error).message);
    const sample = (await getSampleProductObjects()).find((p) => p.slug === slug);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (sample as any) || null;
  }
}

// Get single product by it's ID
export async function getProductById(productId: string) {
  try {
    const data = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (data) return convertToPlainObject(data);
    const sample = (await getSampleProductObjects()).find((p) => p.id === productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (sample as any) || null;
  } catch (error) {
    console.warn('Prisma not reachable, using sample data:', (error as Error).message);
    const sample = (await getSampleProductObjects()).find((p) => p.id === productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (sample as any) || null;
  }
}

export async function getRelatedProducts(category: string, productId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { category, id: { not: productId } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
    if (products.length > 0) return convertToPlainObject(products);
    return (await getSampleProductObjects())
      .filter((product) => product.category === category && product.id !== productId)
      .slice(0, 4);
  } catch {
    return (await getSampleProductObjects())
      .filter((product) => product.category === category && product.id !== productId)
      .slice(0, 4);
  }
}

export async function updateProductsSale(ids: string[], percent: number) {
  try {
    await requireAdmin();
    const uniqueIds = [...new Set(ids)];
    if (!uniqueIds.length || uniqueIds.length > 100) {
      return { success: false, message: 'Hãy chọn từ 1 đến 100 sản phẩm.' };
    }
    if (!Number.isInteger(percent) || percent < 0 || percent > 99) {
      return { success: false, message: 'Mức giảm phải là số nguyên từ 0 đến 99%.' };
    }

    const sampleIds = uniqueIds.filter((id) => /^sample-prod-\d+$/.test(id));
    const databaseIds = uniqueIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
    if (sampleIds.length + databaseIds.length !== uniqueIds.length) {
      return { success: false, message: 'Danh sách sản phẩm không hợp lệ.' };
    }

    if (databaseIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: databaseIds } },
        data: { discountCode: null, discountPercent: percent },
      });
    }

    if (sampleIds.length > 0) {
      const cookieStore = await cookies();
      const overrides = await getProductDiscountOverrides();
      sampleIds.forEach((id) => {
        if (percent === 0) delete overrides[id];
        else overrides[id] = percent;
      });
      cookieStore.set('sample_product_discounts', JSON.stringify(overrides), {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/search');
    return {
      success: true,
      message: percent
        ? `Đã áp dụng giảm ${percent}% cho ${uniqueIds.length} sản phẩm.`
        : `Đã gỡ giá khuyến mãi khỏi ${uniqueIds.length} sản phẩm.`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  brand,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  brand?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  try {
    // Query filter
    const queryFilter: Prisma.ProductWhereInput =
      query && query !== 'all'
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          }
        : {};

    // Category filter
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const brandFilter = brand && brand !== 'all' ? { brand } : {};

    // Price filter
    const priceFilter: Prisma.ProductWhereInput =
      price && price !== 'all'
        ? {
            price: {
              gte: Number(price.split('-')[0]),
              lte: Number(price.split('-')[1]),
            },
          }
        : {};

    // Rating filter
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              gte: Number(rating),
            },
          }
        : {};

    const data = await prisma.product.findMany({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...brandFilter,
        ...priceFilter,
        ...ratingFilter,
      },
      orderBy:
        sort === 'lowest'
          ? { price: 'asc' }
          : sort === 'highest'
          ? { price: 'desc' }
          : sort === 'rating'
          ? { rating: 'desc' }
          : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const dataCount = await prisma.product.count({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...brandFilter,
        ...priceFilter,
        ...ratingFilter,
      },
    });

    if (data.length > 0 || dataCount > 0) {
      return {
        data,
        totalPages: Math.ceil(dataCount / limit),
      };
    }

    // Fallback if db is empty
    throw new Error('Database empty');
  } catch (error) {
    console.warn('Prisma not reachable or empty, using sample data:', (error as Error).message);
    let sampleItems = await getSampleProductObjects();

    if (query && query !== 'all') {
      sampleItems = sampleItems.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (category && category !== 'all') {
      sampleItems = sampleItems.filter((p) => p.category === category);
    }
    if (brand && brand !== 'all') {
      sampleItems = sampleItems.filter((p) => p.brand === brand);
    }
    if (price && price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      sampleItems = sampleItems.filter((p) => Number(p.price) >= min && Number(p.price) <= max);
    }
    if (rating && rating !== 'all') {
      sampleItems = sampleItems.filter((p) => Number(p.rating) >= Number(rating));
    }

    if (sort === 'lowest') {
      sampleItems.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'highest') {
      sampleItems.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'rating') {
      sampleItems.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    const totalPages = Math.max(1, Math.ceil(sampleItems.length / limit));
    const paginated = sampleItems.slice((page - 1) * limit, page * limit);

    return {
      data: paginated as Product[],
      totalPages,
    };
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) throw new Error('Product not found');

    await prisma.product.delete({ where: { id } });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Xóa sản phẩm thành công',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Thêm sản phẩm thành công',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error('Product not found');

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Cập nhật sản phẩm thành công',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories
export async function getAllCategories() {
  const sortCategories = <T extends { category: string }>(categories: T[]) =>
    categories.sort((a, b) => {
      const aIndex = PRODUCT_CATEGORIES.indexOf(a.category);
      const bIndex = PRODUCT_CATEGORIES.indexOf(b.category);
      if (aIndex !== bIndex) {
        return (aIndex < 0 ? Infinity : aIndex) - (bIndex < 0 ? Infinity : bIndex);
      }
      return a.category.localeCompare(b.category, 'vi');
    });

  try {
    const data = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
    });
    if (data.length > 0) return sortCategories(data);
    throw new Error('No categories in DB');
  } catch (error) {
    console.warn('Prisma not reachable, using sample categories:', (error as Error).message);
    const catMap: Record<string, number> = {};
    sampleData.products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    return sortCategories(Object.entries(catMap).map(([category, count]) => ({
      category,
      _count: count,
    })));
  }
}

export async function getAllBrands() {
  try {
    const data = await prisma.product.groupBy({
      by: ['brand'],
      _count: true,
      orderBy: { brand: 'asc' },
    });
    if (data.length > 0) return data;
    throw new Error('No brands in DB');
  } catch (error) {
    console.warn('Prisma not reachable, using sample brands:', (error as Error).message);
    const brandMap: Record<string, number> = {};
    sampleData.products.forEach((p) => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    return Object.entries(brandMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([brand, count]) => ({ brand, _count: count }));
  }
}

// Get featured products
export async function getFeaturedProducts() {
  try {
    const data = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });
    if (data.length > 0) return convertToPlainObject(data);
    throw new Error('No featured in DB');
  } catch (error) {
    console.warn('Prisma not reachable, using sample featured:', (error as Error).message);
    const featured = (await getSampleProductObjects()).filter((p) => p.isFeatured).slice(0, 4);
    return convertToPlainObject(featured);
  }
}
