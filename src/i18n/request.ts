import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['tr', 'en', 'de', 'fr'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
