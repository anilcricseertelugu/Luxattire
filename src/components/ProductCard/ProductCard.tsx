import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string;
    category: {
        name: string;
    };
}

export default function ProductCard({ product }: { product: Product }) {
    const images = JSON.parse(product.images as string);
    const image = images[0] || 'https://placehold.co/600x400?text=No+Image';

    return (
        <Link href={`/product/${product.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={image} alt={product.name} className={styles.image} />
            </div>
            <div className={styles.info}>
                <span className={styles.category}>{product.category.name}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
            </div>
        </Link>
    );
}
