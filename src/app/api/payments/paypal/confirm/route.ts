import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const VALID_PLANS = [
    'plan_free_forever',
    'plan_digital_legends',
    'plan_mail_intro',
    'plan_legends_plus',
    'plan_family_legacy',
];

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
            SUPABASE_URL!,
            SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized — no valid session' },
                { status: 401 }
            );
        }

        const verifiedUserId = user.id;

        let body: {
            subscriptionId?: string;
            orderId?: string;
            tier?: string;
            billingCycle?: string;
            currency?: string;
        };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { subscriptionId, orderId, tier, billingCycle, currency } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json(
                { error: 'Missing subscriptionId or orderId' },
                { status: 400 }
            );
        }

        if (!tier || !VALID_PLANS.includes(tier)) {
            return NextResponse.json(
                { error: 'Invalid or missing plan tier' },
                { status: 400 }
            );
        }

        const providerSubscriptionId = subscriptionId ?? orderId!;
        const daysToAdd = billingCycle === 'year' ? 365 : 30;
        const currentimport { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Subscription types from '@/lib/paypal';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
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
