import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>Admin Panel</div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navLink}>
                        Overview
                    </Link>
                    <Link href="/admin/inventory" className={styles.navLink}>
                        Inventory
                    </Link>
                    <Link href="/admin/orders" className={styles.navLink}>
                        Orders
                    </Link>
                    <Link href="/admin/products" className={styles.navLink}>
                        Products
                    </Link>
                    <Link href="/admin/locations" className={styles.navLink}>
                        Locations
                    </Link>
                    <Link href="/admin/users" className={styles.navLink}>
                        Users
                    </Link>
                    <Link href="/admin/returns" className={styles.navLink}>
                        Returns
                    </Link>
                    <Link href="/" className={styles.navLink}>
                        Back to Store
                    </Link>
                </nav>
            </aside>
            <main className={styles.content}>{children}</main>
        </div >
    );
}
