import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from 'next/font/google';

// display 'optional': text paints once (no late font swap that would push back Largest Contentful
// Paint); the cached font is used from the next page view on.
export const fontLatin = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-latin',
  display: 'optional',
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'optional',
  preload: false,
});

// Chinese uses system fonts (PingFang SC, Microsoft YaHei, Noto Sans CJK SC): a CJK web font adds
// about 300 @font-face rules to the shared CSS of every page, in every language.
export const fontVariables = [fontLatin.variable, fontArabic.variable].join(' ');
