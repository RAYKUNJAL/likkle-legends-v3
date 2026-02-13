'use client';

import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import { Sparkles, BookOpen, Music, Globe, ArrowRight, Shield } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              <span>Version 3.1.0 Now Live</span>
            </div>
            <h1 className={styles.title}>
              Raise Proud, <span className="gradient-text">Confident</span> Caribbean Kids.
            </h1>
            <p className={styles.subtitle}>
              The monthly mail club that delivers personalized letters, cultural activities, and AI-powered stories to help your child love their roots.
            </p>
            <div className={styles.ctas}>
              <Link href="/signup" className={styles.primaryCTA}>
                Start Your child&apos;s Adventure <ArrowRight size={20} />
              </Link>
              <Link href="/#pricing" className={styles.secondaryCTA}>
                View Plans
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            {/* Abstract visual representative of the app */}
            <div className={styles.floatingCard}>
              <BookOpen size={40} className={styles.icon1} />
              <div className={styles.cardInfo}>
                <strong>Personalized Letters</strong>
                <span>Tailored Stories</span>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <Music size={40} className={styles.icon2} />
              <div className={styles.cardInfo}>
                <strong>Island Nursery Songs</strong>
                <span>Cultural Rhythm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Simple steps to bring the islands home.</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} glass-card`}>
              <div className={styles.featureIcon}><BookOpen /></div>
              <h3>Choose Age Path</h3>
              <p>Pick Mini Legends (4-5) or Big Legends (6-8) to match your child&apos;s stage.</p>
            </div>
            <div className={`${styles.featureCard} glass-card`}>
              <div className={styles.featureIcon}><Globe /></div>
              <h3>Monthly Mail</h3>
              <p>Personalized letters and cultural flashcards arrive in your mailbox.</p>
            </div>
            <div className={`${styles.featureCard} glass-card`}>
              <div className={styles.featureIcon}><Sparkles /></div>
              <h3>Digital Portal</h3>
              <p>Unlock stories, songs, and missions in a safe digital environment.</p>
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <span className="gradient-text">Likkle Legends</span>
              <p>Bringing Caribbean culture, pride, and emotional literacy to children everywhere.</p>
            </div>
            <div className={styles.footerLinks}>
              <h3>Platform</h3>
              <Link href="/pricing">Pricing</Link>
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
