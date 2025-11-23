import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
        with: {
            orders: {
                with: {
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
                orderBy: (orders, { desc }) => [desc(orders.createdAt)],
            },
        },
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.email}>{user.email}</p>
            </div>

            <h2 className={styles.sectionTitle}>Order History</h2>

            {user.orders.length === 0 ? (
                <div className={styles.emptyState}>You haven't placed any orders yet.</div>
            ) : (
                <div className={styles.ordersList}>
                    {user.orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderMeta}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Order ID</span>
                                        <span className={styles.value}>#{order.id.slice(-6)}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Date</span>
                                        <span className={styles.value}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Total</span>
                                        <span className={styles.value}>${Number(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.label}>Status</span>
                                        <span className={styles.value}>{order.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.orderItems}>
                                {order.items.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div>
                                            <span className={styles.itemName}>{item.variant.product.name}</span>
                                            <span style={{ color: '#666', marginLeft: '8px', fontSize: '0.9em' }}>
                                                ({item.variant.size} / {item.variant.color}) x {item.quantity}
                                            </span>
                                        </div>
                                        <span className={styles.itemPrice}>${Number(item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
