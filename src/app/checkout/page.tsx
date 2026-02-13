'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import CheckoutFlow from '@/components/CheckoutFlow';
import { SubscriptionTier } from '@/lib/paypal';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') as SubscriptionTier | null;
    const cycle = searchParams.get('cycle') as 'month' | 'year' | null;
    const childName = searchParams.get('childName') || '';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <header style={{ borderBottom: '1px solid var(--border)', padding: '20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--success)' }}>
                        <ShieldCheck size={18} />
                        Secure Checkout
                    </div>
                </div>
            </header>

            <main style={{ padding: '40px 0' }}>
                <CheckoutFlow
                    selectedTier={plan || undefined}
                    initialBillingCycle={cycle || undefined}
                    initialChildName={childName}
                />
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
