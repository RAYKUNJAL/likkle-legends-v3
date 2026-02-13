/**
 * Defensive analytics wrapper to handle blocked tracking scripts
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    try {
        if (typeof window !== 'undefined') {
            // Google Analytics
            if ((window as any).gtag) {
                (window as any).gtag('event', eventName, params);
            }
        }
    } catch (error) {
        console.warn('Analytics event blocked or failed:', eventName);
    }
};
