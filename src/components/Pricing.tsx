'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Gift, Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS, getLocalizedPrice, SubscriptionTier } from '@/lib/paypal';
import { detectCountry, GeoInfo } from '@/lib/geo-routing';
import { siteContent } from '@/lib/content';
import styles from './Pricing.module.css';

interface PricingProps {
    content?: typeof siteContent.pricing;
}

export default function Pricing({ content }: PricingProps) {
    const pricing = content || siteContent.pricing;
    const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    useEffect(() => {
        detectCountry().then(setGeoInfo);
    }, []);

    const getPlanIcon = (id: string) => {
        switch (id) {
            case 'plan_free_forever': return '🌱';
            case 'plan_digital_legends': return '📱';
            case 'plan_mail_intro': return '📬';
            case 'plan_legends_plus': return '⭐';
            case 'plan_family_legacy': return '👑';
            default: return '✨';
        }
    };

    return (
        <section id="pricing" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}>
                        <Gift size={16} />
                        Pricing & Plans
                    </span>
                    <h2 className={styles.title}>
                        Choose Your <span className="gradient-text">Adventure</span>
                    </h2>
                    <p className={styles.subtitle}>
                        {pricing.subtitle}
                    </p>
                </div>

                <div className={styles.toggleRow}>
                    <div className={styles.toggleGroup}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`${styles.toggleBtn} ${billingCycle === 'annual' ? styles.active : ''}`}
                        >
                            Annual
                            <span className={styles.saveBadge}>Save 20%</span>
                        </button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, typeof SUBSCRIPTION_PLANS.plan_free_forever][]).map(([id, plan]) => {
                        const isFree = id === 'plan_free_forever';
                        const priceInfo = isFree
                            ? { price: 0, symbol: '', currency: 'USD' }
                            : geoInfo
                                ? getLocalizedPrice(plan.price, geoInfo.countryCode)
                                : { price: plan.price, symbol: '$', currency: 'USD' };

                        return (
                            <div key={id} className={`${styles.card} glass-card`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.planIcon}>{getPlanIcon(id)}</div>
                                    <h3 className={styles.planName}>{plan.name}</h3>
                                    <p className={styles.planDesc}>{plan.description}</p>
                                </div>

                                <div className={styles.priceContainer}>
                                    {isFree ? (
                                        <span className={styles.price}>Free</span>
                                    ) : (
                                        <>
                                            <span className={styles.price}>
                                                {priceInfo.symbol}{priceInfo.price}
                                            </span>
                                            <span className={styles.interval}>/mo</span>
                                        </>
                                    )}
                                </div>

                                <ul className={styles.featureList}>
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className={styles.featureItem}>
                                            <Check size={14} className={styles.checkIcon} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={`/checkout?plan=${id}&cycle=${billingCycle}`}
                                    className={`${styles.cta} ${id === 'plan_digital_legends' ? styles.primary : ''}`}
                                >
                                    {isFree ? 'Start Free' : 'Choose Plan'}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.footerCTA}>
                    <Crown size={32} className={styles.crown} />
                    <h3>{pricing.educator_block.title}</h3>
                    <p>{pricing.educator_block.description}</p>
                    <Link href={pricing.educator_block.cta.href} className={styles.educatorBtn}>
                        {pricing.educator_block.cta.label}
                    </Link>
                </div>
            </div>
        </section>
    );
}
