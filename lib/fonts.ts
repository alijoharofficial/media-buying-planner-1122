import { IBM_Plex_Sans_Arabic, Noto_Sans_SC, Plus_Jakarta_Sans } from 'next/font/google';

export const fontLatin = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-latin',
  display: 'swap',
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
});

export const fontCjk = Noto_Sans_SC({
  weight: ['400', '500', '700'],
  variable: '--font-cjk',
  display: 'swap',
  preload: false,
});

export const fontVariables = [fontLatin.variable, fontArabic.variable, fontCjk.variable].join(' ');
