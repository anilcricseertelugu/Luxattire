'use client';

import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCart();

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Shopping Cart</h1>
                <div className={styles.emptyCart}>
                    <p>Your cart is empty.</p>
                    <Link href="/shop" className={styles.checkoutBtn} style={{ display: 'inline-block', marginTop: '1rem' }}>
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shopping Cart</h1>

            <div className={styles.content}>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <div key={item.variantId} className={styles.item}>
                            <div className={styles.imageContainer}>
                                <img src={item.image} alt={item.name} className={styles.image} />
                            </div>
                            <div className={styles.itemDetails}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <span className={styles.itemVariant}>
                                    Size: {item.size} | Color: {item.color}
                                </span>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeItem(item.variantId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                                <span className={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <Link href="/checkout" className={styles.checkoutBtn}>
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
