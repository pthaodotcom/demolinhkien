import { PrismaClient } from '@prisma/client';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true';

function createPrisma() {
  if (isDemoMode) {
    // In demo mode return a Proxy that lazily throws on any DB call
    // so that importing this module never attempts a real connection.
    return new Proxy({} as any, {
      get(_target, prop) {
        // Allow $extends so the chained call below doesn't explode
        if (prop === '$extends') {
          return (ext: any) =>
            new Proxy({} as any, {
              get(_t, p) {
                if (typeof p === 'string') {
                  return new Proxy(() => {}, {
                    get() {
                      return () => {
                        throw new Error(`[demo-mode] prisma.${String(p)} is not available without a database`);
                      };
                    },
                    apply() {
                      throw new Error(`[demo-mode] prisma is not available without a database`);
                    },
                  });
                }
              },
            });
        }
        return undefined;
      },
    });
  }

  // --- Real database connection (production / dev with DB) ---
  const { Pool, neonConfig } = require('@neondatabase/serverless');
  const { PrismaNeon } = require('@prisma/adapter-neon');
  const ws = require('ws');

  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);

  return new PrismaClient({ adapter });
}

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = (createPrisma() as PrismaClient).$extends({
  result: {
    product: {
      price: {
        compute(product: any) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product: any) {
          return product.rating.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: any) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: any) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart: any) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: any) {
          return cart.totalPrice.toString();
        },
      },
    },
    order: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: any) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: any) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart: any) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: any) {
          return cart.totalPrice.toString();
        },
      },
    },
    orderItem: {
      price: {
        compute(cart: any) {
          return cart.price.toString();
        },
      },
    },
  },
});
