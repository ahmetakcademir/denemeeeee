import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig = {
  reactStrictMode: true,
  output: 'export' as const,
  trailingSlash: true,
  images: { unoptimized: true }
};

export default withNextIntl(nextConfig);
