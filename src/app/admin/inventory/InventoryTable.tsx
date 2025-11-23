'use client';

import { useState } from 'react';
import { updateInventory } from '@/app/actions/admin';
import styles from './page.module.css';

export default function InventoryTable({ initialInventory }: { initialInventory: any[] }) {
    const [inventory, setInventory] = useState(initialInventory);
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpdate = async (id: string, quantity: number) => {
        setLoading(id);
        try {
            await updateInventory(id, quantity);
            alert('Stock updated!');
        } catch (error) {
            alert('Failed to update stock');
        } finally {
            setLoading(null);
        }
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {inventory.map((item) => (
                    <tr key={item.id}>
                        <td>{item.variant.product.name}</td>
                        <td>
                            {item.variant.size} / {item.variant.color}
                        </td>
                        <td>{item.location.name}</td>
                        <td>
                            <input
                                type="number"
                                className={styles.input}
                                defaultValue={item.quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                        // Optimistic update could go here
                                    }
                                }}
                                id={`qty-${item.id}`}
                            />
                        </td>
                        <td>
                            <button
                                className={styles.updateBtn}
                                disabled={loading === item.id}
                                onClick={() => {
                                    const input = document.getElementById(`qty-${item.id}`) as HTMLInputElement;
                                    handleUpdate(item.id, parseInt(input.value));
                                }}
                            >
                                {loading === item.id ? 'Saving...' : 'Update'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
