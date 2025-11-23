'use client';

import { useState, useEffect } from 'react';
import { getReturns, updateReturnStatus } from '@/app/actions/admin';
import styles from './page.module.css';

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadReturns();
    }, []);

    async function loadReturns() {
        const data = await getReturns();
        setReturns(data);
        setLoading(false);
    }

    async function handleStatusUpdate(returnId: string, status: 'APPROVED' | 'REJECTED' | 'REFUNDED') {
        if (!confirm(`Are you sure you want to mark this return as ${status}?`)) return;

        setProcessing(returnId);
        const result = await updateReturnStatus(returnId, status);

        if (result.success) {
            await loadReturns();
        } else {
            alert('Failed to update status');
        }
        setProcessing(null);
    }

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Return Requests</h1>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Return ID</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Reason</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {returns.map((ret) => (
                        <tr key={ret.id}>
                            <td>#{ret.id.slice(-6)}</td>
                            <td>#{ret.orderId.slice(-6)}</td>
                            <td>{ret.order.user?.name || ret.order.user?.email || 'Guest'}</td>
                            <td className={styles.reason}>{ret.reason}</td>
                            <td>{new Date(ret.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span className={`${styles.status} ${styles[ret.status.toLowerCase()]}`}>
                                    {ret.status}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                {ret.status === 'REQUESTED' && (
                                    <>
                                        <button
                                            className={styles.approveBtn}
                                            onClick={() => handleStatusUpdate(ret.id, 'APPROVED')}
                                            disabled={!!processing}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={() => handleStatusUpdate(ret.id, 'REJECTED')}
                                            disabled={!!processing}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {ret.status === 'APPROVED' && (
                                    <button
                                        className={styles.refundBtn}
                                        onClick={() => handleStatusUpdate(ret.id, 'REFUNDED')}
                                        disabled={!!processing}
                                    >
                                        Process Refund
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {returns.length === 0 && (
                        <tr>
                            <td colSpan={7} className={styles.empty}>No return requests found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
