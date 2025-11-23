import { ProductService } from '@/services/product.service';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const products = await ProductService.getProducts();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>All Products</h1>
                <p className={styles.subtitle}>Explore our latest collection of premium clothing.</p>
            </header>

            <div className={styles.grid}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
