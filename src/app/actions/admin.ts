'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { inventory, orders, products, productVariants, locations, users, returns, returnItems } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function getDashboardStats() {
    await checkAdmin();

    const [orderStats] = await db
        .select({
            count: sql<number>`count(*)`,
            revenue: sql<number>`sum(${orders.totalAmount})`,
        })
        .from(orders);

    const [lowStock] = await db
        .select({
            count: sql<number>`count(*)`,
        })
        .from(inventory)
        .where(sql`${inventory.quantity} < 10`);

    const recentOrders = await db.query.orders.findMany({
        limit: 5,
        orderBy: [desc(orders.createdAt)],
        with: {
            user: true,
        },
    });

    return {
        totalOrders: Number(orderStats?.count || 0),
        totalRevenue: Number(orderStats?.revenue || 0),
        lowStockAlerts: Number(lowStock?.count || 0),
        recentOrders,
    };
}

export async function getInventory() {
    await checkAdmin();

    return db.query.inventory.findMany({
        with: {
            variant: {
                with: {
                    product: true,
                },
            },
            location: true,
        },
        orderBy: [desc(inventory.updatedAt)],
    });
}

export async function updateInventory(inventoryId: string, quantity: number) {
    await checkAdmin();

    await db
        .update(inventory)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(inventory.id, inventoryId));

    return { success: true };
}

export async function createLocation(data: { name: string; type: 'WAREHOUSE' | 'OUTLET'; address: string }) {
    await checkAdmin();
    await db.insert(locations).values(data);
    return { success: true };
}

export async function updateLocation(id: string, data: { name: string; type: 'WAREHOUSE' | 'OUTLET'; address: string }) {
    await checkAdmin();
    await db.update(locations).set(data).where(eq(locations.id, id));
    return { success: true };
}

export async function createProduct(data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    brand?: string;
    style?: string;
    model?: string;
    gender?: string;
    material?: string;
    images: string[];
    variants: { size: string; color: string; inventory: { locationId: string; quantity: number }[] }[];
}) {
    await checkAdmin();
    const { variants, images, ...productData } = data;

    return await db.transaction(async (tx) => {
        const [newProduct] = await tx
            .insert(products)
            .values({
                ...productData,
                images: JSON.stringify(images),
            })
            .returning();

        for (const v of variants) {
            const [newVariant] = await tx
                .insert(productVariants)
                .values({
                    productId: newProduct.id,
                    size: v.size,
                    color: v.color,
                })
                .returning();

            if (v.inventory.length > 0) {
                await tx.insert(inventory).values(
                    v.inventory.map((inv) => ({
                        variantId: newVariant.id,
                        locationId: inv.locationId,
                        quantity: inv.quantity,
                    }))
                );
            }
        }
        return { success: true, productId: newProduct.id };
    });
}

export async function updateProduct(id: string, data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    brand?: string;
    style?: string;
    model?: string;
    gender?: string;
    material?: string;
    images: string[];
}) {
    await checkAdmin();
    await db.update(products)
        .set({ ...data, images: JSON.stringify(data.images), updatedAt: new Date() })
        .where(eq(products.id, id));
    return { success: true };
}

export async function getReturns() {
    await checkAdmin();
    return await db.query.returns.findMany({
        with: {
            order: {
                with: { user: true }
            }
        },
        orderBy: (returns, { desc }) => [desc(returns.createdAt)],
    });
}

export async function updateReturnStatus(returnId: string, status: 'APPROVED' | 'REJECTED' | 'REFUNDED') {
    await checkAdmin();
    await db.update(returns)
        .set({ status, updatedAt: new Date() })
        .where(eq(returns.id, returnId));
    return { success: true };
}

export async function deleteProduct(id: string) {
    await checkAdmin();
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
}

export async function createEmployee(data: { name: string; email: string; passwordHash: string }) {
    await checkAdmin();
    // In a real app, you'd hash the password here. For this demo, we assume it's pre-hashed or handled securely.
    // Since we are using NextAuth with an adapter, creating a user directly is fine, but password handling depends on the provider.
    // For Credentials provider, we need to store the hash.
    // IMPORTANT: This is a simplified example.
    await db.insert(users).values({
        ...data,
        role: 'EMPLOYEE',
        emailVerified: new Date(),
    });
    return { success: true };
}

export async function updateEmployee(id: string, data: { name: string; email: string; role: string }) {
    await checkAdmin();
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
    return { success: true };
}

export async function overrideOrderPayment(orderId: string) {
    await checkAdmin();
    await db.update(orders)
        .set({
            paymentStatus: 'PAID',
            paymentMethod: 'MANUAL_OVERRIDE',
            status: 'PROCESSING', // Auto-advance status
            updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
    return { success: true };
}

export async function getOrders() {
    await checkAdmin();

    return db.query.orders.findMany({
        with: {
            user: true,
            items: {
                with: {
                    variant: {
                        with: {
                            product: true,
                        },
                    },
                },
            },
        },
        orderBy: [desc(orders.createdAt)],
    });
}

export async function updateOrderStatus(orderId: string, status: string) {
    await checkAdmin();

    await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

    return { success: true };
}
