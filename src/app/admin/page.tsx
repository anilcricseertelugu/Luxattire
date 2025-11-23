import { getDashboardStats } from '@/app/actions/admin';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Revenue</div>
                    <div className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Orders</div>
                    <div className={styles.statValue}>{stats.totalOrders}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Low Stock Alerts</div>
                    <div className={styles.statValue} style={{ color: stats.lowStockAlerts > 0 ? '#dc2626' : 'inherit' }}>
                        {stats.lowStockAlerts}
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id.slice(-6)}</td>
                                <td>{order.user?.name || order.customerName || 'Guest'}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>${Number(order.totalAmount).toFixed(2)}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${order.status === 'PENDING'
                                            ? styles.statusPending
                                            : order.status === 'SHIPPED'
                                                ? styles.statusShipped
                                                : styles.statusDelivered
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
