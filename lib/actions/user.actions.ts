'use server';

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateUserSchema,
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hash } from '../encrypt';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { z } from 'zod';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { getMyCart } from './cart.actions';
import { cookies } from 'next/headers';
import sampleData from '@/db/sample-data';

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      account: formData.get('account'),
      password: formData.get('password'),
    });

    const requestedUrl = formData.get('callbackUrl');
    const isSafeUrl =
      typeof requestedUrl === 'string' &&
      requestedUrl.startsWith('/') &&
      !requestedUrl.startsWith('//');
    const redirectTo = user.account.toLowerCase() === 'admin'
      ? isSafeUrl && requestedUrl.startsWith('/admin')
        ? requestedUrl
        : '/admin/overview'
      : isSafeUrl
        ? requestedUrl
        : '/';

    await signIn('credentials', { ...user, redirectTo });

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng.' };
  }
}

// Sign user out
export async function signOutUser() {
  // Cart cleanup is optional while the app is running without a database.
  try {
    const currentCart = await getMyCart();

    if (currentCart?.id) {
      await prisma.cart.delete({ where: { id: currentCart.id } });
    }
  } catch (error) {
    console.warn('Cannot clear cart during sign out:', (error as Error).message);
  }

  await signOut({ redirectTo: '/' });
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      username: formData.get('username'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;
    const username = user.username.toLowerCase();

    user.password = await hash(user.password);

    await prisma.user.create({
      data: {
        name: user.username,
        email: `${username}@prostore.local`,
        password: user.password,
      },
    });

    const requestedUrl = formData.get('callbackUrl');
    const redirectTo =
      typeof requestedUrl === 'string' && requestedUrl.startsWith('/') && !requestedUrl.startsWith('//')
        ? requestedUrl
        : '/';

    await signIn('credentials', {
      account: username,
      password: plainPassword,
      redirectTo,
    });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (user) return user;
  } catch (error) {
    console.warn('Cannot fetch user from DB:', (error as Error).message);
  }

  // Fallback for sample user / admin session or cookie
  const cookieStore = await cookies();
  const addressCookie = cookieStore.get('user_address_fallback')?.value;
  let parsedAddress = null;
  if (addressCookie) {
    try {
      parsedAddress = JSON.parse(addressCookie);
    } catch {}
  }
  const paymentMethodCookie = cookieStore.get('user_payment_method_fallback')?.value;

  const session = await auth();
  return {
    id: userId,
    name: session?.user?.name || 'Quản Trị Viên',
    email: session?.user?.email || '',
    role: session?.user?.role || 'admin',
    address: parsedAddress,
    paymentMethod: paymentMethodCookie || 'CashOnDelivery',
  };
}

// Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const address = shippingAddressSchema.parse(data);

    try {
      if (session?.user?.id && !session.user.id.startsWith('sample-')) {
        const currentUser = await prisma.user.findFirst({
          where: { id: session?.user?.id },
        });

        if (currentUser) {
          await prisma.user.update({
            where: { id: currentUser.id },
            data: { address },
          });
        }
      }
    } catch {
      // DB offline
    }

    // Always persist to cookie fallback
    const cookieStore = await cookies();
    cookieStore.set('user_address_fallback', JSON.stringify(address), {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      success: true,
      message: 'Cập nhật địa chỉ thành công',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const paymentMethod = paymentMethodSchema.parse(data);

    try {
      if (session?.user?.id && !session.user.id.startsWith('sample-')) {
        const currentUser = await prisma.user.findFirst({
          where: { id: session?.user?.id },
        });

        if (currentUser) {
          await prisma.user.update({
            where: { id: currentUser.id },
            data: { paymentMethod: paymentMethod.type },
          });
        }
      }
    } catch {
      // DB offline
    }

    const cookieStore = await cookies();
    cookieStore.set('user_payment_method_fallback', paymentMethod.type, {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      success: true,
      message: 'Cập nhật phương thức thanh toán thành công',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update the user profile
export async function updateProfile(user: { name: string }) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all the users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  try {
    const queryFilter: Prisma.UserWhereInput =
      query && query !== 'all'
        ? {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                } as Prisma.StringFilter,
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                } as Prisma.StringFilter,
              },
            ],
          }
        : {};

    const data = await prisma.user.findMany({
      where: {
        ...queryFilter,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const dataCount = await prisma.user.count();

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.warn('Cannot fetch users:', (error as Error).message);
    const normalizedQuery = query?.trim().toLowerCase();
    const users = sampleData.users
      .filter((user) =>
        !normalizedQuery || normalizedQuery === 'all'
          ? true
          : user.username.toLowerCase().includes(normalizedQuery)
      )
      .map((user, index) => ({
        id: user.role === 'admin' ? 'sample-admin-id' : `sample-user-${index}`,
        name: user.username,
        email: '',
        role: user.role,
      }));
    return {
      data: users.slice((page - 1) * limit, page * limit),
      totalPages: Math.max(1, Math.ceil(users.length / limit)),
    };
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
