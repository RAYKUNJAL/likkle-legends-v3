"use server";

/**
 * EMAIL TRIGGER FUNCTIONS
 * Stubs for v3 - prevents errors until email_queue table is finalized
 */

export async function queueAbandonedCheckout(email: string, name: string, planName: string = 'Legends Plus') {
    console.log(`[STUB] Queue abandoned checkout for ${email}`);
    return { success: true };
}

export async function cancelAbandonedCheckout(email: string) {
    console.log(`[STUB] Cancel abandoned checkout for ${email}`);
    return { success: true };
}

export async function queueSubscriptionConfirmation(email: string, name: string, tier: string, childName?: string) {
    console.log(`[STUB] Queue subscription confirmation for ${email}`);
    return { success: true };
}
