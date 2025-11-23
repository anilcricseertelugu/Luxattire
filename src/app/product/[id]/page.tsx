import { ProductService } from '@/services/product.service';
import styles from './page.module.css';
import { notFound } from 'next/navigation';
import AddToCartSection from './AddToCartSection';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await ProductService.getProductById(id);

    if (!product) {
        notFound();
    }

    const images = JSON.parse(product.images as string);
    const mainImage = images[0] || 'https://placehold.co/600x800?text=No+Image';

    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={mainImage} alt={product.name} className={styles.image} />
            </div>

            <div className={styles.details}>
                <div className={styles.header}>
                    <span className={styles.category}>{product.category.name}</span>
                    <h1 className={styles.title}>{product.name}</h1>
                    <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
                </div>

                <p className={styles.description}>{product.description}</p>

                <AddToCartSection product={product} />
            </div>
        </div>
    );
}
