import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
