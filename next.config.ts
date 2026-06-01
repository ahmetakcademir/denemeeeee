import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    disableDevLogs: true
  }
});

const nextConfig = {
  output: 'standalone' as const,
  reactStrictMode: true
};

export default withNextIntl(withPWA(nextConfig));
