import Link from 'next/link';
import styles from './Navbar.module.css';
import { auth, signOut } from '@/auth';
import { CartCount } from './CartCount';

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    LUXE ATTIRE
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/shop" className={styles.link}>
                        Shop
                    </Link>
                    <Link href="/new-arrivals" className={styles.link}>
                        New Arrivals
                    </Link>
                    <Link href="/collections" className={styles.link}>
                        Collections
                    </Link>
                </div>

                <div className={styles.actions}>
                    <Link href="/search" className={styles.iconBtn}>
                        Search
                    </Link>
                    <CartCount />
                    {session ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link href="/profile" className={styles.link}>
                                Profile
                            </Link>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut();
                                }}
                            >
                                <button className={styles.btn + ' ' + styles.btnPrimary}>Sign Out</button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.btn + ' ' + styles.btnPrimary}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
