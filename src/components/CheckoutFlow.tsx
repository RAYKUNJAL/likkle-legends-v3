'use client';

import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Link from 'next/link';
import { Check, ShieldCheck, Sparkles, Gift, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { SUBSCRIPTION_PLANS, getLocalizedPrice, SubscriptionTier } from '@/lib/paypal';
import { detectCountry, GeoInfo } from '@/lib/geo-routing';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/UserContext';
import { trackEvent } from '@/lib/analytics';
import { queueAbandonedCheckout, cancelAbandonedCheckout } from '@/lib/services/email-triggers';
import styles from './CheckoutFlow.module.css';

const supabase = createClient();

interface CheckoutFlowProps {
    selectedTier?: SubscriptionTier;
    initialBillingCycle?: 'month' | 'year';
    initialChildName?: string;
    onSuccess?: (subscriptionId: string) => void;
    onError?: (error: unknown) => void;
}

export default function CheckoutFlow({ selectedTier, initialBillingCycle, initialChildName, onSuccess, onError }: CheckoutFlowProps) {
    const [step, setStep] = useState<'plan' | 'shipping' | 'payment' | 'success'>('plan');
    const [activeTier, setActiveTier] = useState<SubscriptionTier>(selectedTier || 'plan_digital_legends');
    const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentBillingCycle, setPaymentBillingCycle] = useState<'month' | 'year'>(initialBillingCycle || 'month');
    const [shippingData, setShippingData] = useState({
        name: initialChildName || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const { user } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        detectCountry().then(setGeoInfo);
    }, []);

    if (!mounted) return <div className={styles.loaderWrap}><Loader2 className="animate-spin" size={32} /></div>;

    const plan = SUBSCRIPTION_PLANS[activeTier];
    const displayPrice = geoInfo
        ? getLocalizedPrice(paymentBillingCycle === 'year' ? (plan.priceYearly || plan.price * 10) : plan.price, geoInfo.countryCode)
        : { price: paymentBillingCycle === 'year' ? (plan.priceYearly || plan.price * 10) : plan.price, currency: 'USD', symbol: '$' };

    const handlePayPalApprove = async (data: any) => {
        setIsProcessing(true);
        try {
            const userId = user?.id;
            const response = await fetch('/api/payments/paypal/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId: data.subscriptionID,
                    tier: activeTier,
                    currency: displayPrice.currency,
                    billingCycle: paymentBillingCycle,
                    userId
                }),
            });

            if (!response.ok) throw new Error('Confirmation failed');

            setStep('success');
            if (user?.email) await cancelAbandonedCheckout(user.email);
            trackEvent('purchase', { value: displayPrice.price, currency: displayPrice.currency });
            onSuccess?.(data.subscriptionID || '');
        } catch (error) {
            console.error(error);
            alert('Confirmation failed. Please contact support.');
            onError?.(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {step !== 'success' && (
                <div className={styles.stepper}>
                    {['plan', 'shipping', 'payment'].map((s, i) => (
                        <div key={s} className={`${styles.step} ${step === s ? styles.active : ''}`}>
                            <div className={styles.stepCircle}>{i + 1}</div>
                            <span className={styles.stepLabel}>{s}</span>
                        </div>
                    ))}
                </div>
            )}

            {step === 'plan' && (
                <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Choose Your Plan</h2>
                    <div className={styles.planGrid}>
                        {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, typeof plan][]).map(([id, p]) => (
                            <button
                                key={id}
                                onClick={() => setActiveTier(id)}
                                className={`${styles.planCard} ${activeTier === id ? styles.selected : ''}`}
                            >
                                <h3>{p.name}</h3>
                                <p className={styles.pPrice}>{displayPrice.symbol}{p.price}/mo</p>
                                <ul className={styles.pFeatures}>
                                    {p.features.slice(0, 3).map((f, idx) => <li key={idx}><Check size={14} /> {f}</li>)}
                                </ul>
                            </button>
                        ))}
                    </div>
                    <button
                        className={styles.nextBtn}
                        onClick={() => {
                            setStep('shipping');
                            if (user?.email) queueAbandonedCheckout(user.email, user.first_name);
                        }}
                    >
                        Continue &rarr;
                    </button>
                </div>
            )}

            {step === 'shipping' && (
                <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Shipping Details</h2>
                    <div className={styles.form}>
                        <input placeholder="Full Name" value={shippingData.name} onChange={e => setShippingData({ ...shippingData, name: e.target.value })} className={styles.input} />
                        <input placeholder="Address Line 1" value={shippingData.line1} onChange={e => setShippingData({ ...shippingData, line1: e.target.value })} className={styles.input} />
                        <div className={styles.row}>
                            <input placeholder="City" value={shippingData.city} onChange={e => setShippingData({ ...shippingData, city: e.target.value })} className={styles.input} />
                            <input placeholder="Postcode" value={shippingData.postalCode} onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })} className={styles.input} />
                        </div>
                        <input placeholder="Country" value={shippingData.country} onChange={e => setShippingData({ ...shippingData, country: e.target.value })} className={styles.input} />
                    </div>
                    <div className={styles.actions}>
                        <button onClick={() => setStep('plan')} className={styles.backBtn}>Back</button>
                        <button onClick={() => setStep('payment')} className={styles.nextBtn}>Payment &rarr;</button>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>Secure Payment</h2>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryRow}>
                            <span>{plan.name}</span>
                            <span>{displayPrice.symbol}{displayPrice.price}</span>
                        </div>
                        <hr className={styles.divider} />
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>{displayPrice.symbol}{displayPrice.price}</span>
                        </div>
                    </div>
                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', vault: true, intent: 'subscription', currency: displayPrice.currency }}>
                        <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold' }}
                            createSubscription={(data, actions) => actions.subscription.create({
                                plan_id: paymentBillingCycle === 'year' ? (plan.paypalPlanIdYearly || '') : plan.paypalPlanId,
                                custom_id: user?.id
                            })}
                            onApprove={handlePayPalApprove}
                        />
                    </PayPalScriptProvider>
                </div>
            )}

            {step === 'success' && (
                <div className={styles.success}>
                    <Sparkles size={64} className={styles.successIcon} />
                    <h2>You're In! 🎉</h2>
                    <p>Welcome to the Likkle Legends family.</p>
                    <Link href="/admin" className={styles.nextBtn}>Enter Dashboard</Link>
                </div>
            )}
        </div>
    );
}
