import type { Profile } from '@/lib/engine';

/** Niches grouped by profile. Labels live in planner.niches.<id>. */
export const NICHE_GROUPS: Array<{ profile: Profile; niches: string[] }> = [
  { profile: 'ecommerce', niches: ['fashion', 'beautyProducts', 'electronics', 'home', 'ecommerceOther'] },
  { profile: 'leads', niches: ['beautyClinic', 'bodyContouring', 'dental', 'realEstate', 'legal', 'education', 'leadsOther'] },
  { profile: 'messaging', niches: ['messaging'] },
];

export function profileOfNiche(niche: string): Profile | undefined {
  return NICHE_GROUPS.find((g) => g.niches.includes(niche))?.profile;
}

/** Country (ISO 3166) to currency (ISO 4217). Names come from Intl.DisplayNames. */
export const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
  GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', TR: 'TRY',
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', EG: 'EGP', JO: 'JOD', MA: 'MAD', LB: 'USD', IQ: 'IQD',
  ZA: 'ZAR', NG: 'NGN', KE: 'KES',
  IN: 'INR', PK: 'PKR', CN: 'CNY', HK: 'HKD', TW: 'TWD', JP: 'JPY', KR: 'KRW', SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND',
  AU: 'AUD', NZ: 'NZD',
};

export const COUNTRIES = Object.keys(COUNTRY_CURRENCY);
export const CURRENCIES = Array.from(new Set(['USD', 'EUR', 'GBP', ...Object.values(COUNTRY_CURRENCY)]));

/** Suggest a currency from the selected regions: the first region's currency, or EUR when all are euro countries. */
export function suggestCurrency(regions: string[]): string | undefined {
  const first = regions[0];
  return first ? COUNTRY_CURRENCY[first] : undefined;
}

export function displayName(locale: string, type: 'region' | 'currency', code: string) {
  try {
    return new Intl.DisplayNames([locale], { type }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function monthNames(locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(Date.UTC(2024, i, 1))));
}
