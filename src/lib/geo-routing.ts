// Geo-routing and Fulfillment Logic
// Routes orders to Maryland (US) or Print-on-Demand (UK/Canada)

export type FulfillmentHub = 'maryland' | 'stannp_uk' | 'stannp_canada';

export interface GeoInfo {
    country: string;
    countryCode: string;
    currency: string;
    fulfillmentHub: FulfillmentHub;
}

// Detect country from IP using free API
export async function detectCountry(): Promise<GeoInfo> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        return {
            country: data.country_name || 'United States',
            countryCode: data.country_code || 'US',
            currency: getCurrencyForCountry(data.country_code),
            fulfillmentHub: getFulfillmentHub(data.country_code),
        };
    } catch {
        // Default to US if detection fails
        return {
            country: 'United States',
            countryCode: 'US',
            currency: 'USD',
            fulfillmentHub: 'maryland',
        };
    }
}

function getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
        US: 'USD',
        GB: 'GBP',
        CA: 'CAD',
        // Caribbean countries use USD
        JM: 'USD', TT: 'USD', BB: 'USD', LC: 'USD', GD: 'USD',
        VC: 'USD', AG: 'USD', DM: 'USD', KN: 'USD', BS: 'USD',
        GY: 'USD', SR: 'USD', HT: 'USD', BZ: 'USD',
    };
    return currencyMap[countryCode] || 'USD';
}

export function getFulfillmentHub(countryCode: string): FulfillmentHub {
    if (countryCode === 'GB') return 'stannp_uk';
    if (countryCode === 'CA') return 'stannp_canada';
    // US and Caribbean ship from Maryland
    return 'maryland';
}
