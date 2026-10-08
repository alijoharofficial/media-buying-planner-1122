export const CONSENT_KEY = 'mbp:consent:v1';

/**
 * Inline script for the layout: marks <html> when a cookie choice is saved, so the banner (rendered
 * on the server to keep it off the late-paint path for Largest Contentful Paint) never flashes.
 */
export const CONSENT_PRECHECK = `try{if(/^(accepted|rejected)$/.test(localStorage.getItem('${CONSENT_KEY}')||''))document.documentElement.dataset.consent='1'}catch(e){}`;
