import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Subscription types from '@/lib/paypal';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, orderId, tier, userId, billingCycle } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }

        const userIdToUpdate = userId;
        // In v3, we'd ideally verify the JWT here too.

        // Calculate next period end
        const daysToAdd = billingCycle === 'year' ? 365 : 30;
        const currentPeriodEnd = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

        // Update subscriptions table in v3
        const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
                user_id: userIdToUpdate,
                plan_id: tier,
                status: 'active',
                provider: 'paypal',
                provider_subscription_id: subscriptionId || orderId,
                current_period_end: currentPeriodEnd.toISOString(),
            }, { onConflict: 'provider_subscription_id' });

        if (subError) {
            console.error('Subscription update error:', subError);
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription confirmed',
            tier,
            subscriptionId: subscriptionId || orderId,
        });
    } catch (error: unknown) {
        console.error('PayPal confirmation error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
