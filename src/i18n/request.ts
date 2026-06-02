import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['tr', 'en', 'de', 'fr'];

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) notFound();

  let messages;
  try {
    switch (locale) {
      case 'tr':
        messages = (await import('../../messages/tr.json')).default;
        break;
      case 'en':
        messages = (await import('../../messages/en.json')).default;
        break;
      case 'de':
        messages = (await import('../../messages/de.json')).default;
        break;
      case 'fr':
        messages = (await import('../../messages/fr.json')).default;
        break;
      default:
        notFound();
    }
  } catch (error) {
    console.error(`NARD i18n Error loading messages for ${locale}:`, error);
    notFound();
  }

  return {
    locale: locale as string,
    messages
  };
});
