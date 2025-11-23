'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';
import { useCart } from '@/context/CartContext';

export function CartCount() {
    const { totalItems } = useCart();
    return (
        <Link href="/cart" className={styles.iconBtn}>
            Cart ({totalItems})
        </Link>
    );
}
