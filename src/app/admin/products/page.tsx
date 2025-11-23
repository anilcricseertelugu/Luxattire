'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { createProduct } from '@/app/actions/admin';

export default function ProductsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        brand: '',
        style: '',
        model: '',
        gender: '',
        material: '',
        images: [] as string[],
        variants: [] as any[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified for demo - assumes categoryId exists and minimal variant data
        await createProduct({
            ...formData,
            variants: [{ size: 'M', color: 'Black', inventory: [] }]
        });
        setIsCreating(false);
        alert('Product created successfully');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Products</h1>
                <button className={styles.createBtn} onClick={() => setIsCreating(true)}>
                    Add Product
                </button>
            </div>

            {isCreating && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2>New Product</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Brand"
                            value={formData.brand || ''}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Model"
                            value={formData.model || ''}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Style"
                            value={formData.style || ''}
                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        />
                        <select
                            value={formData.gender || ''}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                        >
                            <option value="">Select Gender</option>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                            <option value="Kids">Kids</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Material"
                            value={formData.material || ''}
                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        />
                    </div>
                    <input
                        type="number"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                    />
                    <div className={styles.actions}>
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                <p>Product list will be implemented here.</p>
            </div>
        </div>
    );
}
