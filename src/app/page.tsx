import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/hero.png"
            alt="Fashion Hero"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Elevate Your Style</h1>
          <p className={styles.subtitle}>
            Discover the latest collection of premium apparel designed for the modern individual.
          </p>
          <Link href="/shop" className={styles.btn}>
            Shop Collection
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shop by Category</h2>
        <div className={styles.grid}>
          <Link href="/shop?category=Men" className={styles.categoryCard}>
            <Image
              src="https://placehold.co/600x800?text=Men"
              alt="Men's Collection"
              fill
              className={styles.categoryImage}
            />
            <div className={styles.categoryOverlay}>
              <span className={styles.categoryName}>Men</span>
            </div>
          </Link>
          <Link href="/shop?category=Women" className={styles.categoryCard}>
            <Image
              src="https://placehold.co/600x800?text=Women"
              alt="Women's Collection"
              fill
              className={styles.categoryImage}
            />
            <div className={styles.categoryOverlay}>
              <span className={styles.categoryName}>Women</span>
            </div>
          </Link>
          <Link href="/shop?category=Accessories" className={styles.categoryCard}>
            <Image
              src="https://placehold.co/600x800?text=Accessories"
              alt="Accessories"
              fill
              className={styles.categoryImage}
            />
            <div className={styles.categoryOverlay}>
              <span className={styles.categoryName}>Accessories</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
