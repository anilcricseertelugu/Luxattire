'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';

interface ProductWithVariants {
    id: string;
    name: string;
    price: number;
    images: string;
    variants: {
        id: string;
        size: string;
        color: string;
        inventory: {
            quantity: number;
        }[];
    }[];
}

export default function AddToCartSection({ product }: { product: ProductWithVariants }) {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const { addItem } = useCart();

    // Get unique sizes and colors
    const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const colors = Array.from(new Set(product.variants.map((v) => v.color)));

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) return;

        const variant = product.variants.find(
            (v) => v.size === selectedSize && v.color === selectedColor
        );

        if (!variant) return;

        const images = JSON.parse(product.images as string);
        const image = images[0] || '';

        addItem({
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            image,
            size: selectedSize,
            color: selectedColor,
            quantity: 1,
        });

        alert('Added to cart!');
    };

    const getStockForSelection = () => {
        if (!selectedSize || !selectedColor) return null;
        const variant = product.variants.find(
            (v) => v.size === selectedSize && v.color === selectedColor
        );
        if (!variant) return 0;
        return variant.inventory.reduce((acc, inv) => acc + inv.quantity, 0);
    };

    const stock = getStockForSelection();

    return (
        <>
            <div>
                <span className={styles.sectionTitle}>Select Size</span>
                <div className={styles.options}>
                    {sizes.map((size) => (
                        <button
                            key={size}
                            className={`${styles.optionBtn} ${selectedSize === size ? styles.selected : ''}`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <span className={styles.sectionTitle}>Select Color</span>
                <div className={styles.options}>
                    {colors.map((color) => (
                        <button
                            key={color}
                            className={`${styles.optionBtn} ${selectedColor === color ? styles.selected : ''}`}
                            onClick={() => setSelectedColor(color)}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </div>

            {stock !== null && (
                <div className={styles.stockInfo}>
                    {stock > 0 ? `In Stock: ${stock}` : 'Out of Stock'}
                </div>
            )}

            <button
                className={styles.addToCartBtn}
                disabled={!selectedSize || !selectedColor || stock === 0}
                onClick={handleAddToCart}
            >
                Add to Cart
            </button>
        </>
    );
}
