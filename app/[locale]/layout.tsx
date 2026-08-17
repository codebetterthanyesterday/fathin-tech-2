import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, Locale } from '@/i18n/routing';
import { SearchProvider } from '@/components/public/search/search-context';
import CommandPalette from '@/components/public/search/command-palette';
import HtmlLangSetter from '@/components/public/layout/html-lang-setter';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is a valid locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <HtmlLangSetter locale={locale} />
      <SearchProvider>
        {children}
        <CommandPalette />
      </SearchProvider>
    </NextIntlClientProvider>
  );
}
