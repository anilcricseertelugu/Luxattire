'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { orders, orderItems, inventory, users, returns, returnItems } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface CartItem {
    variantId: string;
    quantity: number;
    price: number;
}

export async function placeOrder(
    items: CartItem[],
    totalAmount: number,
    options?: {
        locationId?: string;
        customerDetails?: { name: string; email: string };
        paymentMethod?: string;
        // Enterprise Options
        orderType?: 'SELF' | 'GIFT' | 'THIRD_PARTY';
        recipientDetails?: { name: string; phone: string };
        paymentProvider?: string;
        shippingAddress?: any; // In real app, strict type
        billingAddress?: any;
    }
) {
    const session = await auth();
    let userId = null;

    // 1. Determine User
    if (session?.user?.email) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email),
        });
        if (user) userId = user.id;
    }

    // POS orders might not have a logged-in user, but must have customer details or be anonymous
    if (!userId && !options?.customerDetails && !options?.locationId) {
        return { error: 'You must be logged in to place an online order.' };
    }

    try {
        // Start transaction
        const orderId = await db.transaction(async (tx) => {
            // 2. Create Order
            const [newOrder] = await tx.insert(orders).values({
                userId: userId, // Can be null for POS
                locationId: options?.locationId,
                customerName: options?.customerDetails?.name,
                customerEmail: options?.customerDetails?.email,
                totalAmount,
                status: options?.locationId ? 'DELIVERED' : 'PENDING', // POS orders are immediate
                paymentStatus: options?.locationId ? 'PAID' : 'PENDING', // POS orders are paid immediately
                paymentMethod: options?.paymentMethod || 'ONLINE',

                // Enterprise Fields
                orderType: options?.orderType || 'SELF',
                recipientName: options?.recipientDetails?.name,
                recipientPhone: options?.recipientDetails?.phone,
                paymentProvider: options?.paymentProvider,
                shippingAddress: options?.shippingAddress ? JSON.stringify(options.shippingAddress) : undefined,
                billingAddress: options?.billingAddress ? JSON.stringify(options.billingAddress) : undefined,

                // Mock Transaction ID for Online Orders
                transactionId: options?.paymentProvider ? `txn_${crypto.randomUUID()}` : undefined,
            }).returning();

            // 3. Create Order Items & Update Inventory
            for (const item of items) {
                let stock;

                if (options?.locationId) {
                    // POS: Deduct from specific location
                    stock = await tx.query.inventory.findFirst({
                        where: and(
                            eq(inventory.variantId, item.variantId),
                            eq(inventory.locationId, options.locationId),
                            gte(inventory.quantity, item.quantity)
                        ),
                    });
                } else {
                    // Online: Find any location with stock (preferably Warehouse)
                    // For simplicity, we take the first one with enough stock
                    stock = await tx.query.inventory.findFirst({
                        where: and(
                            eq(inventory.variantId, item.variantId),
                            gte(inventory.quantity, item.quantity)
                        ),
                    });
                }

                if (!stock) {
                    throw new Error(`Insufficient stock for item ${item.variantId} at selected location`);
                }

                // Create Order Item
                await tx.insert(orderItems).values({
                    orderId: newOrder.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                });

                // Decrement Inventory
                await tx.update(inventory)
                    .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
                    .where(eq(inventory.id, stock.id));
            }

            return newOrder.id;
        });

        revalidatePath('/shop');
        revalidatePath('/product/[id]');
        revalidatePath('/admin/inventory');

        return { success: true, orderId };
    } catch (error) {
        console.error('Order placement failed:', error);
        return { error: error instanceof Error ? error.message : 'Failed to place order.' };
    }
}

export async function getUserOrders() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
    });

    if (!user) return [];

    return await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        with: {
            items: {
                with: {
                    variant: {
                        with: { product: true }
                    }
                }
            }
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
}

export async function requestReturn(orderId: string, items: { orderItemId: string; quantity: number }[], reason: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: 'Unauthorized' };

    const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
    });

    if (!user) return { error: 'User not found' };

    // Verify order belongs to user
    const order = await db.query.orders.findFirst({
        where: and(
            eq(orders.id, orderId),
            eq(orders.userId, user.id)
        ),
    });

    if (!order) return { error: 'Order not found' };

    if (!order.isReturnable) {
        return { error: 'This order is not eligible for return' };
    }

    try {
        await db.transaction(async (tx) => {
            const [newReturn] = await tx.insert(returns).values({
                orderId,
                reason,
                status: 'REQUESTED'
            }).returning();

            for (const item of items) {
                await tx.insert(returnItems).values({
                    returnId: newReturn.id,
                    orderItemId: item.orderItemId,
                    quantity: item.quantity
                });
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Return request failed:', error);
        return { error: 'Failed to request return' };
    }
}
