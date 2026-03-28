// src/app/api/payments/paypal/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── Env validation ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── PayPal base URL ───────────────────────────────────────────────────────────
const PAYPAL_BASE =
    process.env.PAYPAL_ENV === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

// ── Get PayPal access token ───────────────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('Missing PayPal credentials');
    }
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
    const data = await res.json() as { access_token: string };
    return data.access_token;
}

// ── Verify PayPal webhook signature ──────────────────────────────────────────
// Uses PayPal's /v1/notifications/verify-webhook-signature API.
// Returns true only if PayPal confirms the signature is valid.
async function verifyWebhookSignature(
    request: NextRequest,
    rawBody: string
): Promise<boolean> {
    if (!PAYPAL_WEBHOOK_ID) {
        // If no webhook ID is configured, log and reject — never silently pass
        console.error('PAYPAL_WEBHOOK_ID is not set — rejecting webhook');
        return false;
    }

    const transmissionId = request.headers.get('paypal-transmission-id');
    const transmissionTime = request.headers.get('paypal-transmission-time');
    const certUrl = request.headers.get('paypal-cert-url');
    const authAlgo = request.headers.get('paypal-auth-algo');
    const transmissionSig = request.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        console.error('PayPal webhook: missing required signature headers');
        return false;
    }

    // Cert URL must be a PayPal domain — prevent SSRF
    const certHostname = new URL(certUrl).hostname;
    if (!certHostname.endsWith('.paypal.com')) {
        console.error('PayPal webhook: cert URL is not from paypal.com domain');
        return false;
    }

    try {
        const accessToken = await getPayPalAccessToken();
        const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transmission_id: transmissionId,
                transmission_time: transmissionTime,
                cert_url: certUrl,
                auth_algo: authAlgo,
                transmission_sig: transmissionSig,
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: JSON.parse(rawBody),
            }),
        });

        if (!verifyRes.ok) {
            console.error(`PayPal signature verify API error: ${verifyRes.status}`);
            return false;
        }

        const verifyData = await verifyRes.json() as { verification_status: string };
        return verifyData.verification_status === 'SUCCESS';
    } catch (err) {
        console.error('PayPal webhook signature verification threw:', err);
        return false;
    }
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    // 1. Read raw body BEFORE parsing — needed for signature verification
    const rawBody = await request.text();

    // 2. Verify signature — reject anything that doesn't pass
    const isValid = await verifyWebhookSignature(request, rawBody);
    if (!isValid) {
        console.error('PayPal webhook: signature verification FAILED — rejecting');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 3. Parse event
    let event: {
        event_type: string;
        resource: {
            id: string;
            plan_id?: string;
            subscriber?: { email_address?: string };
            billing_info?: { next_billing_time?: string };
            custom_id?: string;
        };
    };

    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { event_type: eventType, resource } = event;

    try {
        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
            case 'BILLING.SUBSCRIPTION.RENEWED': {
                const subscriptionId = resource.id;
                const planId = resource.plan_id;
                // Prefer custom_id (user UUID we set during subscription creation)
                // over email lookup — more reliable and avoids email-change edge cases
                const userId = resource.custom_id ?? null;
                const subscriberEmail = resource.subscriber?.email_address ?? null;

                let resolvedUserId: string | null = userId;

                if (!resolvedUserId && subscriberEmail) {
                    const { data: user } = await supabaseAdmin
                        .from('users')
                        .select('id')
                        .eq('email', subscriberEmail)
                        .single();
                    resolvedUserId = user?.id ?? null;
                }

                if (!resolvedUserId) {
                    console.error('PayPal webhook: cannot resolve user for subscription', subscriptionId);
                    break;
                }

                const { error } = await supabaseAdmin
                    .from('subscriptions')
                    .upsert({
                        user_id: resolvedUserId,
                        plan_id: planId,
                        status: 'active',
                        provider: 'paypal',
                        provider_subscription_id: subscriptionId,
                        current_period_end: resource.billing_info?.next_billing_time ?? null,
                    }, { onConflict: 'provider_subscription_id' });

                if (error) {
                    console.error('Subscription upsert error:', error.message);
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
                // Non-critical — just acknowledge
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error('PayPal webhook handler error:', error);
        // Return 500 so PayPal retries
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal error' },
            { status: 500 }
        );
    }
}
