'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { placeOrder } from '@/app/actions/order';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGift, setIsGift] = useState(false);
    const [recipient, setRecipient] = useState({ name: '', phone: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await placeOrder(
            items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice,
            {
                orderType: isGift ? 'GIFT' : 'SELF',
                recipientDetails: isGift ? recipient : undefined,
                paymentMethod: 'CREDIT_CARD',
                paymentProvider: 'STRIPE_MOCK' // Simulated
            }
        );

        if (result.error) {
            alert(result.error);
            setIsSubmitting(false);
            return;
        }

        // Success
        clearCart();
        alert('Order placed successfully!');
        router.push('/profile');
    };

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Checkout</h1>
                <p style={{ textAlign: 'center' }}>Your cart is empty.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Order Type</h2>
                    <div className={styles.field}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isGift}
                                onChange={(e) => setIsGift(e.target.checked)}
                            />
                            Ordering for someone else (Gift/Third-party)
                        </label>
                    </div>
                </div>

                {isGift && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Recipient Details</h2>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Recipient Name</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.input}
                                    value={recipient.name}
                                    onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Recipient Phone</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.input}
                                    value={recipient.phone}
                                    onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Shipping Information</h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>First Name</label>
                            <input type="text" required className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Last Name</label>
                            <input type="text" required className={styles.input} />
                        </div>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.label}>Address</label>
                            <input type="text" required className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>City</label>
                            <input type="text" required className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Zip Code</label>
                            <input type="text" required className={styles.input} />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Payment</h2>
                    <div className={styles.field}>
                        <label className={styles.label}>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" required className={styles.input} />
                    </div>
                    <div className={styles.grid} style={{ marginTop: '1rem' }}>
                        <div className={styles.field}>
                            <label className={styles.label}>Expiry</label>
                            <input type="text" placeholder="MM/YY" required className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>CVC</label>
                            <input type="text" placeholder="123" required className={styles.input} />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
                </button>
            </form>
        </div>
    );
}
