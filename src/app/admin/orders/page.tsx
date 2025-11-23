import { getOrders } from '@/app/actions/admin';
import styles from './page.module.css';
import OrdersTable from './OrdersTable';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Order Management</h1>
            </div>

            <div className={styles.tableContainer}>
                <OrdersTable initialOrders={orders} />
            </div>
        </div>
    );
}
