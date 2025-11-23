'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { placeOrder } from '@/app/actions/order';
import { useRouter } from 'next/navigation';

// Mock data fetcher - in real app, use server actions or SWR
async function fetchLocations() {
    // This would be a server action
    return [];
}

export default function POSPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [cart, setCart] = useState<any[]>([]);
    const [customer, setCustomer] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);

    // Product Search State
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Load locations on mount (mock for now, or fetch if we had a public action)
    // For this demo, we'll ask the user to input Location ID manually if not fetched

    const addToCart = (variant: any, product: any) => {
        const existing = cart.find(item => item.variantId === variant.id);
        if (existing) {
            setCart(cart.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, {
                variantId: variant.id,
                name: product.name,
                price: product.price,
                size: variant.size,
                color: variant.color,
                quantity: 1
            }]);
        }
    };

    const removeFromCart = (variantId: string) => {
        setCart(cart.filter(item => item.variantId !== variantId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (!selectedLocation) {
            alert('Please select a location first');
            return;
        }
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setLoading(true);
        try {
            const result = await placeOrder(
                cart.map(item => ({ variantId: item.variantId, quantity: item.quantity, price: item.price })),
                calculateTotal(),
                {
                    locationId: selectedLocation,
                    customerDetails: customer.name ? customer : undefined,
                    paymentMethod: 'POS_CASH'
                }
            );

            if (result.success) {
                alert('Order placed successfully! Order ID: ' + result.orderId);
                setCart([]);
                setCustomer({ name: '', email: '' });
            } else {
                alert('Error: ' + result.error);
            }
        } catch (e) {
            alert('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>POS Terminal</h1>
                <div className={styles.locationSelector}>
                    <label>Store Location ID:</label>
                    <input
                        type="text"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="Enter Location UUID"
                    />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.leftPanel}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search Products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {/* In a real app, this would trigger a search */}
                        <p className={styles.hint}>* Search functionality requires client-side fetch implementation or use existing product list</p>
                    </div>

                    <div className={styles.productList}>
                        <p>Product selection would appear here. For demo, please use the Shop page to find Variant IDs or implement a full product fetcher.</p>
                        {/* 
                           To make this fully functional, we need a server action to search products 
                           that returns variants and their stock at the selected location.
                        */}
                    </div>
                </div>

                <div className={styles.rightPanel}>
                    <div className={styles.cartHeader}>
                        <h2>Current Order</h2>
                        <button onClick={() => setCart([])}>Clear</button>
                    </div>

                    <div className={styles.customerForm}>
                        <input
                            type="text"
                            placeholder="Customer Name (Optional)"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Customer Email (Optional)"
                            value={customer.email}
                            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        />
                    </div>

                    <div className={styles.cartItems}>
                        {cart.map(item => (
                            <div key={item.variantId} className={styles.cartItem}>
                                <div>
                                    <div className={styles.itemName}>{item.name}</div>
                                    <div className={styles.itemVariant}>{item.size} / {item.color}</div>
                                </div>
                                <div className={styles.itemQty}>
                                    x{item.quantity}
                                </div>
                                <div className={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button onClick={() => removeFromCart(item.variantId)}>×</button>
                            </div>
                        ))}
                        {cart.length === 0 && <p className={styles.emptyCart}>Cart is empty</p>}
                    </div>

                    <div className={styles.totalSection}>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <button
                            className={styles.payBtn}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
