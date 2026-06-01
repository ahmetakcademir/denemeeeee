import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en', 'de', 'fr'],
  defaultLocale: 'tr',
  localeDetection: true
});

export const config = {
  // Match all internationalized routes, excluding public assets or system files
  matcher: [
    '/',
    '/(tr|en|de|fr)/:path*',
    '/((?!_next|_vercel|api|manifest.json|icons|.*\\..*).*)'
  ]
};
