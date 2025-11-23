'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { createLocation } from '@/app/actions/admin';

export default function LocationsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'OUTLET' as 'OUTLET' | 'WAREHOUSE', address: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createLocation(formData);
        setIsCreating(false);
        setFormData({ name: '', type: 'OUTLET', address: '' });
        alert('Location created successfully');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Locations</h1>
                <button className={styles.createBtn} onClick={() => setIsCreating(true)}>
                    Add Location
                </button>
            </div>

            {isCreating && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2>New Location</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'OUTLET' | 'WAREHOUSE' })}
                    >
                        <option value="OUTLET">Outlet</option>
                        <option value="WAREHOUSE">Warehouse</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                    <div className={styles.actions}>
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                <p>Location list will be implemented here.</p>
            </div>
        </div>
    );
}
