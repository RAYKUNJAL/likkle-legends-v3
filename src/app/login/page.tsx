'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import styles from './Auth.module.css';

const supabase = createClient();

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </Link>

                <div className={`${styles.card} glass-card`}>
                    <h1 className={styles.title}>Welcome <span className="gradient-text">Back</span></h1>
                    <p className={styles.subtitle}>Enter your credentials to access your dashboard.</p>

                    <form onSubmit={handleLogin} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.inputGroup}>
                            <label><Mail size={16} /> Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label><Lock size={16} /> Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className={styles.footerText}>
                        Don't have an account? <Link href="/signup">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
