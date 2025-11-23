'use client';

import { useState, useEffect } from 'react';
import { getUserOrders, requestReturn } from '@/app/actions/order';
import styles from './page.module.css';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [returnReason, setReturnReason] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        const data = await getUserOrders();
        setOrders(data);
        setLoading(false);
    }

    async function handleReturn(orderId: string) {
        if (!returnReason) {
            alert('Please provide a reason for return');
            return;
        }

        // For simplicity, returning all items in this demo
        // In a real app, we'd have a UI to select specific items
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const itemsToReturn = order.items.map((item: any) => ({
            orderItemId: item.id,
            quantity: item.quantity
        }));

        const result = await requestReturn(orderId, itemsToReturn, returnReason);
        if (result.success) {
            alert('Return requested successfully');
            setSelectedOrder(null);
            setReturnReason('');
        } else {
            alert('Error: ' + result.error);
        }
    }

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1>My Orders</h1>
            <div className={styles.orderList}>
                {orders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <div>
                                <span className={styles.orderId}>Order #{order.id.slice(-6)}</span>
                                <span className={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.statusBadge}>{order.status}</div>
                        </div>

                        <div className={styles.items}>
                            {order.items.map((item: any) => (
                                <div key={item.id} className={styles.item}>
                                    <span>{item.variant.product.name} ({item.variant.size}/{item.variant.color})</span>
                                    <span>x{item.quantity}</span>
                                    <span>${item.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.total}>Total: ${order.totalAmount.toFixed(2)}</div>
                            {order.status === 'DELIVERED' && order.isReturnable && (
                                <button
                                    className={styles.returnBtn}
                                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                >
                                    {selectedOrder === order.id ? 'Cancel Return' : 'Return Items'}
                                </button>
                            )}
                        </div>

                        {selectedOrder === order.id && (
                            <div className={styles.returnForm}>
                                <textarea
                                    placeholder="Why are you returning this?"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    className={styles.reasonInput}
                                />
                                <button
                                    className={styles.submitReturnBtn}
                                    onClick={() => handleReturn(order.id)}
                                >
                                    Submit Return Request
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
