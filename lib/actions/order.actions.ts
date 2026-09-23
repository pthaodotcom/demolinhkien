'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem, PaymentResult, ShippingAddress } from '@/types';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';
import { sendPurchaseReceipt } from '@/email';
import sampleData from '@/db/sample-data';
import { generateTingeePayment, getTingeeDisplayConfig, getTingeeReference, TingeePayment } from '../tingee';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth-guard';
import { z } from 'zod';

const sampleOrderStatusSchema = z.record(
  z.string(),
  z.object({
    isPaid: z.boolean(),
    paidAt: z.string().nullable(),
    isDelivered: z.boolean(),
    deliveredAt: z.string().nullable(),
  })
);

async function getSampleOrders() {
  const cookieStore = await cookies();
  const rawOverrides = cookieStore.get('sample_order_statuses')?.value;
  let overrides: z.infer<typeof sampleOrderStatusSchema> = {};

  if (rawOverrides) {
    try {
      const parsed = sampleOrderStatusSchema.safeParse(JSON.parse(rawOverrides));
      if (parsed.success) overrides = parsed.data;
    } catch {
      overrides = {};
    }
  }

  return sampleData.orders.map((order) => {
    const override = overrides[order.id];
    if (!override) return order;

    return {
      ...order,
      isPaid: override.isPaid,
      paidAt: override.paidAt ? new Date(override.paidAt) : null,
      isDelivered: override.isDelivered,
      deliveredAt: override.deliveredAt ? new Date(override.deliveredAt) : null,
    };
  });
}

function getSampleOrderById(
  orderId: string,
  orders: Awaited<ReturnType<typeof getSampleOrders>>
) {
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  if (orderIndex < 0) return null;

  const order = orders[orderIndex];
  const productIndexes = [11, 1, 4, 0, 6, 9];
  const productIndex = productIndexes[orderIndex] ?? orderIndex;
  const product = sampleData.products[productIndex % sampleData.products.length];
  const user = sampleData.users.find((item) => item.username === order.user.name);

  return {
    ...order,
    shippingAddress: {
      fullName: order.user.name,
      phone: user?.phone || '0900000000',
      streetAddress: `${125 + orderIndex} Đường Nguyễn Huệ`,
      city: 'TP. Phước Long, Bình Phước',
      postalCode: '67000',
      country: 'Việt Nam',
      orderNote: orderIndex % 2 === 0 ? 'Gọi điện trước khi giao hàng.' : '',
    },
    paymentResult: null,
    orderitems: [
      {
        productId: `sample-prod-${productIndex + 1}`,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        qty: 1,
        price: order.itemsPrice,
      },
    ],
    user: {
      name: order.user.name,
      email: user?.email || '',
    },
  };
}

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart',
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address',
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method',
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get order by id
export async function getOrderById(orderId: string) {
  try {
    const data = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      },
    });

    return data
      ? convertToPlainObject(data)
      : getSampleOrderById(orderId, await getSampleOrders());
  } catch (error) {
    console.warn('Cannot fetch order:', (error as Error).message);
    return getSampleOrderById(orderId, await getSampleOrders());
  }
}

export async function prepareTingeePayment(orderId: string): Promise<{
  payment: TingeePayment | null;
  message?: string;
}> {
  try {
    const session = await auth();
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error('Không tìm thấy đơn hàng');
    if (order.userId !== session?.user?.id && session?.user?.role !== 'admin') throw new Error('Không có quyền truy cập đơn hàng');
    if (order.paymentMethod !== 'BankTransfer' || order.isPaid) return { payment: null };

    const saved = order.paymentResult as Partial<TingeePayment> | null;
    if (saved?.billId && saved.qrCode && saved.accountNumber && saved.reference) {
      return {
        payment: {
          billId: saved.billId,
          qrCode: saved.qrCode,
          accountNumber: saved.accountNumber,
          bankBin: saved.bankBin || getTingeeDisplayConfig().bankBin,
          bankName: saved.bankName || getTingeeDisplayConfig().bankName,
          accountName: saved.accountName || getTingeeDisplayConfig().accountName,
          reference: saved.reference,
        },
      };
    }

    const payment = await generateTingeePayment(orderId, Number(order.totalPrice));
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: payment.billId,
          status: 'PENDING',
          pricePaid: '0',
          provider: 'Tingee',
          ...payment,
        },
      },
    });

    return { payment };
  } catch (error) {
    const config = getTingeeDisplayConfig();
    const hasManualDetails = config.accountNumber && config.bankBin;
    return {
      payment: hasManualDetails
        ? {
            billId: '',
            qrCode: '',
            ...config,
            reference: getTingeeReference(orderId),
          }
        : null,
      message: formatError(error),
    };
  }
}

// Update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
    },
  });

  if (!order) throw new Error('Order not found');

  if (order.isPaid) throw new Error('Order is already paid');

  // Claim the unpaid order atomically so webhook retries cannot decrement stock twice.
  const markedPaid = await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, isPaid: false },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });

    if (claimed.count === 0) return false;

    // Decrement stock atomically and reject payment if an item is unavailable.
    for (const item of order.orderitems) {
      const stockUpdate = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      });
      if (stockUpdate.count !== 1) {
        throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho`);
      }
    }

    return true;
  });

  if (!markedPaid) return;

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error('Order not found');

  sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authorized');

    const data = await prisma.order.findMany({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const dataCount = await prisma.order.count({
      where: { userId: session?.user?.id },
    });

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.warn('Cannot fetch user orders:', (error as Error).message);
    return { data: [], totalPages: 1 };
  }
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  try {
    // Get counts for each resource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();

    // Calculate the total sales
    const totalSales = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    });

    // Get monthly sales
    const salesDataRaw = await prisma.$queryRaw<
      Array<{ month: string; totalSales: Prisma.Decimal }>
    >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

    const salesData: SalesDataType = salesDataRaw.map((entry) => ({
      month: entry.month,
      totalSales: Number(entry.totalSales),
    }));

    // Get latest sales
    const latestSales = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
      take: 6,
    });

    return {
      ordersCount,
      productsCount,
      usersCount,
      totalSales,
      latestSales,
      salesData,
    };
  } catch (error) {
    console.warn('Cannot fetch order summary:', (error as Error).message);
    const sampleOrders = await getSampleOrders();
    const totalPrice = sampleOrders.reduce(
      (total, order) => total + Number(order.totalPrice),
      0
    );
    return {
      ordersCount: sampleOrders.length,
      productsCount: sampleData.products.length,
      usersCount: sampleData.users.filter((user) => user.role === 'user').length,
      totalSales: { _sum: { totalPrice } },
      latestSales: sampleOrders,
      salesData: [
        { month: '07/26', totalSales: 28600000 },
        { month: '08/26', totalSales: 41750000 },
        { month: '09/26', totalSales: totalPrice },
      ],
    };
  }
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  try {
    const queryFilter: Prisma.OrderWhereInput =
      query && query !== 'all'
        ? {
            user: {
              name: {
                contains: query,
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
          }
        : {};

    const data = await prisma.order.findMany({
      where: {
        ...queryFilter,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: { user: { select: { name: true } } },
    });

    const dataCount = await prisma.order.count({
      where: {
        ...queryFilter,
      },
    });

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    console.warn('Cannot fetch all orders:', (error as Error).message);
    const sampleOrders = await getSampleOrders();
    const normalizedQuery = query?.trim().toLowerCase();
    const filteredOrders = normalizedQuery && normalizedQuery !== 'all'
      ? sampleOrders.filter((order) =>
          order.user.name.toLowerCase().includes(normalizedQuery)
        )
      : sampleOrders;
    return {
      data: filteredOrders.slice((page - 1) * limit, page * limit),
      totalPages: Math.max(1, Math.ceil(filteredOrders.length / limit)),
    };
  }
}

export async function updateAdminOrderStatus(data: {
  id: string;
  status: 'pending' | 'paid' | 'delivered';
}) {
  try {
    await requireAdmin();
    const input = z
      .object({
        id: z.string().min(1),
        status: z.enum(['pending', 'paid', 'delivered']),
      })
      .parse(data);

    const current = await getOrderById(input.id);
    if (!current) throw new Error('Không tìm thấy đơn hàng');

    const currentStatus = current.isDelivered
      ? 'delivered'
      : current.isPaid
        ? 'paid'
        : 'pending';
    const statusRank = { pending: 0, paid: 1, delivered: 2 } as const;

    if (statusRank[input.status] < statusRank[currentStatus]) {
      throw new Error('Không thể đưa đơn hàng về trạng thái trước đó');
    }
    if (statusRank[input.status] > statusRank[currentStatus] + 1) {
      throw new Error('Đơn hàng phải được cập nhật theo đúng thứ tự trạng thái');
    }

    const now = new Date();
    const update = {
      isPaid: input.status !== 'pending',
      paidAt: input.status !== 'pending' ? current.paidAt || now : null,
      isDelivered: input.status === 'delivered',
      deliveredAt: input.status === 'delivered' ? current.deliveredAt || now : null,
    };

    if (
      current.paymentMethod === 'BankTransfer' &&
      currentStatus === 'pending' &&
      input.status === 'paid'
    ) {
      throw new Error('Chuyển khoản chỉ được xác nhận qua đối soát Tingee');
    }

    if (input.id.startsWith('sample-order-')) {
      const cookieStore = await cookies();
      const raw = cookieStore.get('sample_order_statuses')?.value;
      let parsed: ReturnType<typeof sampleOrderStatusSchema.safeParse> | null = null;
      try {
        parsed = raw ? sampleOrderStatusSchema.safeParse(JSON.parse(raw)) : null;
      } catch {
        parsed = null;
      }
      const overrides = parsed?.success ? parsed.data : {};
      overrides[input.id] = {
        ...update,
        paidAt: update.paidAt?.toISOString() || null,
        deliveredAt: update.deliveredAt?.toISOString() || null,
      };
      cookieStore.set('sample_order_statuses', JSON.stringify(overrides), {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
      });
    } else if (currentStatus === 'pending' && input.status === 'paid') {
      await updateOrderToPaid({ orderId: input.id });
    } else if (currentStatus === 'paid' && input.status === 'delivered') {
      await prisma.order.update({ where: { id: input.id }, data: update });
    }

    revalidatePath('/admin/overview');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${input.id}`);
    return { success: true, message: 'Đã cập nhật trạng thái đơn hàng' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await requireAdmin();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentMethod !== 'CashOnDelivery') {
      throw new Error('Chỉ đơn COD mới được xác nhận thanh toán thủ công');
    }
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: 'Order marked as paid' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
  try {
    await requireAdmin();
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order has been marked delivered',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
