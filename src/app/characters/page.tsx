'use client';

import Navbar from '@/components/Navbar';
import styles from './Characters.module.css';
import { Shield, Zap, Heart, Star, Sparkles, Music } from 'lucide-react';
import Link from 'next/link';

const characters = [
    { name: 'Roti', role: 'Learning Buddy', icon: Zap, color: '#FF3366', desc: 'A friendly guide who makes learning island history fun and interactive.' },
    { name: 'Tanty Spice', role: 'Wisdom Guardian', icon: Heart, color: '#7000FF', desc: 'Warm and caring, she shares the hidden wisdom of Caribbean traditions.' },
    { name: 'Dilly Doubles', role: 'Joy Specialist', icon: Music, color: '#00F5FF', desc: 'The rhythm master of the islands, bringing music and movement to every lesson.' },
    { name: 'Mango Moko', role: 'Balance Protector', icon: Shield, color: '#00FF94', desc: 'Watching over the islands, ensuring every child grows with confidence and pride.' }
];

export default function CharactersPage() {
    return (
        <div className={styles.page}>
            <Navbar />

            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.badge}>
                        <Sparkles size={16} />
                        Meet the Guides
                    </div>
                    <h1 className={styles.title}>The <span className="gradient-text">Island Legends</span></h1>
                    <p className={styles.subtitle}>Meet the characters that will guide your child through their Caribbean learning adventure.</p>
                </div>
            </header>

            <main className={styles.container}>
                <div className={styles.grid}>
                    {characters.map((char) => (
                        <div key={char.name} className={`${styles.card} glass-card`}>
                            <div className={styles.iconBox} style={{ color: char.color, backgroundColor: `${char.color}15` }}>
                                <char.icon size={32} />
                            </div>
                            <h3>{char.name}</h3>
                            <span className={styles.role}>{char.role}</span>
                            <p>{char.desc}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.bottomCTA}>
                    <h2>Ready to meet them?</h2>
                    <Link href="/signup" className={styles.ctaBtn}>Start Your Adventure</Link>
                </div>
            </main>

            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.copyright}>
                        <p>© 2026 Likkle Legends. Handcrafted for the diaspora.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
