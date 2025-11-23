import { getInventory } from '@/app/actions/admin';
import styles from './page.module.css';
import InventoryTable from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const inventory = await getInventory();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Inventory Management</h1>
            </div>

            <div className={styles.tableContainer}>
                <InventoryTable initialInventory={inventory} />
            </div>
        </div>
    );
}
