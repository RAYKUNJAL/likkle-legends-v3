/**
 * Defensive analytics wrapper to handle blocked tracking scripts
 */
export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
    try {
        if (typeof window !== 'undefined') {
            // Google Analytics
            const win = window as unknown as { gtag?: (command: string, event: string, params: Record<string, unknown>) => void };
            if (win.gtag) {
                win.gtag('event', eventName, params);
            }
        }
    } catch {
        console.warn('Analytics event blocked or failed:', eventName);
    }
};
