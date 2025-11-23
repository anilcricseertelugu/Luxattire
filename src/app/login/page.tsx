'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions/auth';
import styles from './page.module.css';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button className={styles.submitBtn} disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1 className={styles.title}>Welcome Back</h1>
                <form action={dispatch} className={styles.form}>
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
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                    <SubmitButton />
                </form>
                <div className={styles.footer}>
                    Don't have an account?{' '}
                    <Link href="/register" className={styles.link}>
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
