import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './index';
import { categories, products, productVariants, locations, inventory } from './schema';

async function main() {
    console.log('Seeding database...');

    // 1. Create Categories
    const [menCategory] = await db.insert(categories).values({ name: 'Men' }).returning();
    const [womenCategory] = await db.insert(categories).values({ name: 'Women' }).returning();

    // 2. Create Locations
    const [warehouse] = await db.insert(locations).values({
        name: 'Central Warehouse',
        type: 'WAREHOUSE',
        address: '123 Warehouse Dr',
    }).returning();

    const [outlet] = await db.insert(locations).values({
        name: 'Downtown Outlet',
        type: 'OUTLET',
        address: '456 Main St',
    }).returning();

    // 3. Create Products
    if (menCategory) {
        const [tshirt] = await db.insert(products).values({
            name: 'Classic T-Shirt',
            description: 'A comfortable cotton t-shirt.',
            price: 29.99,
            categoryId: menCategory.id,
            images: JSON.stringify(['https://placehold.co/600x400?text=T-Shirt']),
        }).returning();

        // Variants
        const [variantM] = await db.insert(productVariants).values({
            productId: tshirt.id,
            size: 'M',
            color: 'Black',
        }).returning();

        // Inventory
        await db.insert(inventory).values([
            { locationId: warehouse.id, variantId: variantM.id, quantity: 100 },
            { locationId: outlet.id, variantId: variantM.id, quantity: 20 },
        ]);
    }

    console.log('Seeding finished.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
