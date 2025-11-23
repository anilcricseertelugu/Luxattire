'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { createEmployee, updateEmployee } from '@/app/actions/admin';

export default function UsersPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', passwordHash: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createEmployee(formData);
        setIsCreating(false);
        setFormData({ name: '', email: '', passwordHash: '' });
        alert('Employee created successfully');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>User Management</h1>
                <button className={styles.createBtn} onClick={() => setIsCreating(true)}>
                    Add Employee
                </button>
            </div>

            {isCreating && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2>New Employee</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Temporary Password"
                        value={formData.passwordHash}
                        onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                        required
                    />
                    <div className={styles.actions}>
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                <p>Employee list will be implemented here (requires fetching users).</p>
            </div>
        </div>
    );
}
