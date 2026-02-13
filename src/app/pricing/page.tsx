'use client';

import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import styles from './pricing.module.css';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className={styles.page}>
            <Navbar />

            <header className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Simple, Transparent <span className="gradient-text">Pricing</span></h1>
                    <p className={styles.subtitle}>Choose the legend track that fits your family best. All plans include Caribbean cultural heritage and pride.</p>
                </div>
            </header>

            <main>
                <Pricing />
            </main>

            <section className={styles.faqPreview}>
                <div className={styles.container}>
                    <h2>Have Questions?</h2>
                    <p>We're here to help you start your journey.</p>
                    <Link href="/contact" className={styles.contactBtn}>Contact Support</Link>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerBrand}>
                            <span className="gradient-text">Likkle Legends</span>
                            <p>Bringing Caribbean culture, pride, and emotional literacy to children everywhere.</p>
                        </div>
                        <div className={styles.footerLinks}>
                            <h3>Platform</h3>
                            <Link href="/">Home</Link>
                            <Link href="/admin">Dashboard</Link>
                        </div>
                        <div className={styles.footerLinks}>
                            <h3>Legal</h3>
                            <Link href="/privacy">Privacy</Link>
                            <Link href="/terms">Terms</Link>
                        </div>
                    </div>
                    <div className={styles.copyright}>
                        <p>© 2026 Likkle Legends. Handcrafted for the diaspora.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
