import { db } from '@/db';
import { products, productVariants, inventory, categories, locations } from '@/db/schema';
import { eq, like, or, desc, asc, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export class ProductService {
    static async getProducts(params?: {
        categoryId?: string;
        search?: string;
        sort?: 'price_asc' | 'price_desc' | 'newest';
    }) {
        const { categoryId, search, sort } = params || {};

        const cacheKey = `products-${JSON.stringify(params)}`;

        return unstable_cache(
            async () => {
                return db.query.products.findMany({
                    with: {
                        variants: {
                            with: {
                                inventory: true,
                            },
                        },
                        category: true,
                    },
                    where: (products, { and, eq, or, like }) => {
                        const conditions = [];
                        if (categoryId) conditions.push(eq(products.categoryId, categoryId));
                        if (search) {
                            conditions.push(
                                or(
                                    like(products.name, `%${search}%`),
                                    like(products.description, `%${search}%`)
                                )
                            );
                        }
                        return and(...conditions);
                    },
                    orderBy: (products, { asc, desc }) => {
                        if (sort === 'price_asc') return [asc(products.price)];
                        if (sort === 'price_desc') return [desc(products.price)];
                        return [desc(products.createdAt)];
                    },
                });
            },
            [cacheKey],
            { tags: ['products'] }
        )();
    }

    static async getProductById(id: string) {
        return unstable_cache(
            async () => {
                return db.query.products.findFirst({
                    where: eq(products.id, id),
                    with: {
                        variants: {
                            with: {
                                inventory: {
                                    with: {
                                        location: true,
                                    },
                                },
                            },
                        },
                        category: true,
                    },
                });
            },
            [`product-${id}`],
            { tags: [`product-${id}`, 'products'] }
        )();
    }

    static async createProduct(data: {
        name: string;
        description: string;
        price: number;
        categoryId: string;
        images: string[];
        variants: { size: string; color: string; inventory: { locationId: string; quantity: number }[] }[];
    }) {
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

            return newProduct;
        });
    }
}
