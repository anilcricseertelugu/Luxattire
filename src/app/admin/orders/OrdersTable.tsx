'use client';

import { useState } from 'react';
import { updateOrderStatus, overrideOrderPayment } from '@/app/actions/admin';
import styles from './page.module.css';

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [loading, setLoading] = useState<string | null>(null);

    const handleStatusChange = async (id: string, status: string) => {
        setLoading(id);
        try {
            await updateOrderStatus(id, status);
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            alert('Status updated!');
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setLoading(null);
        }
    };

    const handlePaymentOverride = async (id: string) => {
        if (!confirm('Are you sure you want to mark this order as PAID manually?')) return;
        setLoading(id);
        try {
            await overrideOrderPayment(id);
            setOrders(orders.map(o => o.id === id ? { ...o, paymentStatus: 'PAID', status: 'PROCESSING' } : o));
            alert('Payment overridden successfully!');
        } catch (error) {
            alert('Failed to override payment');
        } finally {
            setLoading(null);
        }
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>#{order.id.slice(-6)}</td>
                        <td>{order.user?.name || order.customerName || 'Guest'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${Number(order.totalAmount).toFixed(2)}</td>
                        <td>
                            <span style={{
                                color: order.paymentStatus === 'PAID' ? 'green' : 'orange',
                                fontWeight: 500
                            }}>
                                {order.paymentStatus || 'PENDING'}
                            </span>
                        </td>
                        <td>{order.status}</td>
                        <td className={styles.actions}>
                            <select
                                className={styles.select}
                                value={order.status}
                                disabled={loading === order.id}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            {order.paymentStatus !== 'PAID' && (
                                <button
                                    className={styles.overrideBtn}
                                    onClick={() => handlePaymentOverride(order.id)}
                                    disabled={loading === order.id}
                                >
                                    Mark Paid
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
