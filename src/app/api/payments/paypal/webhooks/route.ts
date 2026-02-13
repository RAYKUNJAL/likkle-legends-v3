import { NextRequest, NextResponse } from 'next/server';
// Service role client for webhooks
// In v3, we should probably use a service role client for webhooks to bypass RLS.
// I'll check if there's a service role client.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const event = JSON.parse(body);
        const eventType = event.event_type;
        const resource = event.resource;

        console.log('PayPal Webhook v3:', eventType);

        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
            case 'BILLING.SUBSCRIPTION.RENEWED': {
                const subscriptionId = resource.id;
                const subscriberEmail = resource.subscriber?.email_address;
                const planId = resource.plan_id;

                // 1. Find the user by email or provider_subscription_id
                // (In a real app, you'd match by user_id passed in custom_id or similar)
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', subscriberEmail)
                    .single();

                if (user) {
                    // 2. Update or Insert subscription record
                    await supabaseAdmin
                        .from('subscriptions')
                        .upsert({
                            user_id: user.id,
                            plan_id: planId, // This might need mapping to our logic IDs
                            status: 'active',
                            provider: 'paypal',
                            provider_subscription_id: subscriptionId,
                            current_period_end: resource.billing_info?.next_billing_time
                        }, { onConflict: 'provider_subscription_id' });

                    console.log(`Updated subscription for user ${user.id}`);
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED': {
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('provider_subscription_id', resource.id);
                break;
            }

            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'past_due' })
                    .eq('provider_subscription_id', resource.id);
                break;
            }

            default:
                console.log('Unhandled PayPal event:', eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
