'use client';

import { register } from '@/app/actions/auth';
import styles from '../login/page.module.css'; // Reuse login styles
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await register(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            router.push('/login');
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1 className={styles.title}>Create Account</h1>
                <form action={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="name">
                            Full Name
                        </label>
                        <input
                            className={styles.input}
                            id="name"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                            Email
                        </label>
                        <input
                            className={styles.input}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">
                            Password
                        </label>
                        <input
                            className={styles.input}
                            id="password"
                            type="password"
                            name="password"
                            placeholder="******"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className={styles.submitBtn}>Sign Up</button>
                </form>
                <div className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.link}>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
