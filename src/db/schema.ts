import {
    pgTable,
    text,
    integer,
    timestamp,
    boolean,
    doublePrecision,
    primaryKey,
    index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

export const users = pgTable('user', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    passwordHash: text('passwordHash'),
    role: text('role').default('USER'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
    'account',
    {
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').$type<AdapterAccountType>().notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('providerAccountId').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable('session', {
    sessionToken: text('sessionToken').primaryKey(),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
    'verificationToken',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
);

export const authenticators = pgTable(
    'authenticator',
    {
        credentialID: text('credentialID').notNull().unique(),
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        providerAccountId: text('providerAccountId').notNull(),
        credentialPublicKey: text('credentialPublicKey').notNull(),
        counter: integer('counter').notNull(),
        credentialDeviceType: text('credentialDeviceType').notNull(),
        credentialBackedUp: boolean('credentialBackedUp').notNull(),
        transports: text('transports'),
    },
    (authenticator) => ({
        compositePK: primaryKey({
            columns: [authenticator.userId, authenticator.credentialID],
        }),
    })
);

// App Domain Models

export const categories = pgTable('category', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').unique().notNull(),
});

export const products = pgTable('product', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: doublePrecision('price').notNull(),
    categoryId: text('categoryId')
        .notNull()
        .references(() => categories.id),
    brand: text('brand'),
    style: text('style'),
    model: text('model'),
    gender: text('gender'), // Men, Women, Unisex, Kids
    material: text('material'),
    images: text('images').notNull(), // JSON string
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
    categoryIdIdx: index('product_categoryId_idx').on(table.categoryId),
    priceIdx: index('product_price_idx').on(table.price),
}));

export const productVariants = pgTable('productVariant', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    productId: text('productId')
        .notNull()
        .references(() => products.id),
    size: text('size').notNull(),
    color: text('color').notNull(),
}, (table) => ({
    productIdIdx: index('variant_productId_idx').on(table.productId),
}));

export const locations = pgTable('location', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    type: text('type').default('OUTLET'),
    address: text('address'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    locationId: text('locationId')
        .notNull()
        .references(() => locations.id),
    variantId: text('variantId')
        .notNull()
        .references(() => productVariants.id),
    quantity: integer('quantity').default(0).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
    locationIdIdx: index('inventory_locationId_idx').on(table.locationId),
    variantIdIdx: index('inventory_variantId_idx').on(table.variantId),
}));

export const orders = pgTable('order', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
        .references(() => users.id), // Nullable for POS guest checkout
    locationId: text('locationId')
        .references(() => locations.id), // Nullable for online orders (or default to warehouse)
    customerName: text('customerName'),
    customerEmail: text('customerEmail'),
    status: text('status').default('PENDING'),
    paymentStatus: text('paymentStatus').default('PENDING'), // PENDING, PAID, FAILED
    paymentMethod: text('paymentMethod'),
    paymentProvider: text('paymentProvider'), // STRIPE, PAYPAL, etc.
    transactionId: text('transactionId'),

    // Enterprise Fields
    orderType: text('orderType').default('SELF'), // SELF, GIFT, THIRD_PARTY
    recipientName: text('recipientName'),
    recipientPhone: text('recipientPhone'),
    shippingAddress: text('shippingAddress'), // JSON string snapshot
    billingAddress: text('billingAddress'), // JSON string snapshot
    isReturnable: boolean('isReturnable').default(true),

    totalAmount: doublePrecision('totalAmount').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('order_userId_idx').on(table.userId),
    createdAtIdx: index('order_createdAt_idx').on(table.createdAt),
}));

export const returns = pgTable('return', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: text('orderId')
        .notNull()
        .references(() => orders.id),
    status: text('status').default('REQUESTED'), // REQUESTED, APPROVED, REJECTED, REFUNDED
    reason: text('reason').notNull(),
    refundAmount: doublePrecision('refundAmount'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

export const returnItems = pgTable('returnItem', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    returnId: text('returnId')
        .notNull()
        .references(() => returns.id),
    orderItemId: text('orderItemId')
        .notNull()
        .references(() => orderItems.id),
    quantity: integer('quantity').notNull(),
});

export const orderItems = pgTable('orderItem', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: text('orderId')
        .notNull()
        .references(() => orders.id),
    variantId: text('variantId')
        .notNull()
        .references(() => productVariants.id),
    quantity: integer('quantity').notNull(),
    price: doublePrecision('price').notNull(),
}, (table) => ({
    orderIdIdx: index('orderItem_orderId_idx').on(table.orderId),
    variantIdIdx: index('orderItem_variantId_idx').on(table.variantId),
}));

// Relations

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
    }),
    inventory: many(inventory),
    orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
    inventory: many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
    location: one(locations, {
        fields: [inventory.locationId],
        references: [locations.id],
    }),
    variant: one(productVariants, {
        fields: [inventory.variantId],
        references: [productVariants.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    variant: one(productVariants, {
        fields: [orderItems.variantId],
        references: [productVariants.id],
    }),
}));
