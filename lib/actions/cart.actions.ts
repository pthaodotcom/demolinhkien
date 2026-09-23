'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import sampleData from '@/db/sample-data';

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 5000000 ? 0 : 30000);
  const taxPrice = 0; // Price already includes VAT
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toString(),
    shippingPrice: shippingPrice.toString(),
    taxPrice: taxPrice.toString(),
    totalPrice: totalPrice.toString(),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const cookieStore = await cookies();
    let sessionCartId = cookieStore.get('sessionCartId')?.value;
    if (!sessionCartId) {
      sessionCartId = crypto.randomUUID();
      cookieStore.set('sessionCartId', sessionCartId);
    }

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();
    const item = cartItemSchema.parse(data);

    // Look for product in DB or sample data
    let product: { id: string; name: string; slug: string; stock: number; price?: unknown; discountPercent?: number } | null = null;
    try {
      product = await prisma.product.findFirst({
        where: { id: item.productId },
      });
    } catch {
      // DB offline
    }

    if (!product) {
      const sample = sampleData.products.find(
        (p, idx) => p.slug === item.slug || `sample-prod-${idx + 1}` === item.productId
      );
      if (sample) {
        let discountPercent = 0;
        try {
          const overrides = JSON.parse(
            cookieStore.get('sample_product_discounts')?.value || '{}'
          ) as Record<string, number>;
          discountPercent = overrides[item.productId] || 0;
        } catch {}
        product = {
          id: item.productId,
          name: sample.name,
          slug: sample.slug,
          stock: sample.stock,
          price: sample.price,
          discountPercent,
        };
      } else {
        product = {
          id: item.productId,
          name: item.name,
          slug: item.slug,
          stock: 99,
          price: item.price,
        };
      }
    }

    item.price = String(Number(product.price ?? item.price));
    if (product.discountPercent) {
      item.originalPrice = item.price;
      item.price = String(Math.round(Number(item.price) * (100 - product.discountPercent) / 100));
    }

    // Try Prisma DB first
    try {
      if (!cart || cart.id === 'cookie-cart-id') {
        const newCart = insertCartSchema.parse({
          userId: userId,
          items: [item],
          sessionCartId: sessionCartId,
          ...calcPrice([item]),
        });

        await prisma.cart.create({
          data: newCart,
        });
      } else {
        const existItem = (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        );

        if (existItem) {
          if (product.stock < existItem.qty + 1) {
            throw new Error('Số lượng sản phẩm trong kho không đủ');
          }
          (cart.items as CartItem[]).find(
            (x) => x.productId === item.productId
          )!.qty = existItem.qty + 1;
        } else {
          if (product.stock < 1) throw new Error('Sản phẩm đã hết hàng');
          cart.items.push(item);
        }

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calcPrice(cart.items as CartItem[]),
          },
        });
      }

      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/cart');
      revalidatePath('/', 'layout');

      return {
        success: true,
        message: `Đã thêm "${product.name}" vào giỏ hàng`,
      };
    } catch {
      // Prisma DB failed or offline -> Fallback to cookie storage
      const cartItems: CartItem[] = cart?.items ? [...cart.items] : [];
      const existIndex = cartItems.findIndex((x) => x.productId === item.productId);

      if (existIndex > -1) {
        cartItems[existIndex] = {
          ...cartItems[existIndex],
          qty: cartItems[existIndex].qty + 1,
        };
      } else {
        cartItems.push(item);
      }

      const calculated = calcPrice(cartItems);
      const fallbackCart = {
        id: 'cookie-cart-id',
        userId: userId || null,
        sessionCartId,
        items: cartItems,
        ...calculated,
      };

      cookieStore.set('cart_fallback_data', JSON.stringify(fallbackCart), {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
      });

      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/cart');
      revalidatePath('/', 'layout');

      return {
        success: true,
        message: `Đã thêm "${product.name}" vào giỏ hàng`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  try {
    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get('sessionCartId')?.value;

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Try DB first
    try {
      if (sessionCartId) {
        const cart = await prisma.cart.findFirst({
          where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
        });

        if (cart) {
          return convertToPlainObject({
            ...cart,
            items: cart.items as CartItem[],
            itemsPrice: cart.itemsPrice.toString(),
            totalPrice: cart.totalPrice.toString(),
            shippingPrice: cart.shippingPrice.toString(),
            taxPrice: cart.taxPrice.toString(),
          });
        }
      }
    } catch {
      // Prisma DB not available
    }

    // Check cookie fallback
    const fallbackCookie = cookieStore.get('cart_fallback_data')?.value;
    if (fallbackCookie) {
      try {
        const parsed = JSON.parse(fallbackCookie);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed;
        }
      } catch {
        // invalid cookie
      }
    }

    return undefined;
  } catch (error) {
    console.warn('Cannot fetch cart:', (error as Error).message);
    return undefined;
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    const cookieStore = await cookies();
    const cart = await getMyCart();
    if (!cart) throw new Error('Không tìm thấy giỏ hàng');

    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

    let updatedItems: CartItem[] = [];
    if (exist.qty === 1) {
      updatedItems = (cart.items as CartItem[]).filter(
        (x) => x.productId !== productId
      );
    } else {
      updatedItems = (cart.items as CartItem[]).map((x) =>
        x.productId === productId ? { ...x, qty: x.qty - 1 } : x
      );
    }

    const calculated = calcPrice(updatedItems);

    // Try updating DB if cart came from DB
    try {
      if (cart.id && cart.id !== 'cookie-cart-id') {
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: updatedItems as Prisma.CartUpdateitemsInput[],
            ...calculated,
          },
        });
      }
    } catch {
      // DB offline
    }

    // Sync cookie fallback
    const fallbackCart = {
      ...cart,
      items: updatedItems,
      ...calculated,
    };

    cookieStore.set('cart_fallback_data', JSON.stringify(fallbackCart), {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    revalidatePath('/cart');
    revalidatePath('/', 'layout');

    return {
      success: true,
      message: 'Đã cập nhật giỏ hàng',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
