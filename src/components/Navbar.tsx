'use client';

import Link from 'next/link';
import { useUser } from '@/components/UserContext';
import styles from './Navbar.module.css';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className="gradient-text">Likkle Legends</span>
                </Link>

                <div className={styles.desktopNav}>
                    <Link href="/#how-it-works">How It Works</Link>
                    <Link href="/characters">Characters</Link>
                    <Link href="/pricing">Pricing</Link>

                    {isAuthenticated ? (
                        <div className={styles.userSection}>
                            <Link href="/admin" className={styles.adminBtn}>Dashboard</Link>
                            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link href="/login" className={styles.loginBtn}>Login</Link>
                            <Link href="/signup" className={styles.signupBtn}>Get Started</Link>
                        </div>
                    )}
                </div>

                <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isOpen && (
                <div className={styles.mobileNav}>
                    <Link href="/#how-it-works" onClick={() => setIsOpen(false)}>How It Works</Link>
                    <Link href="/characters" onClick={() => setIsOpen(false)}>Characters</Link>
                    <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
                    {isAuthenticated ? (
                        <>
                            <Link href="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <button onClick={() => { logout(); setIsOpen(false); }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
