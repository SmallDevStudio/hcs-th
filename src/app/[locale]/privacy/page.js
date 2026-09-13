import { LegalPage } from "@/components/public/legal/LegalPage";
import {
  LEGAL_PAGE_TYPES,
  getLegalContent,
} from "@/content/legal/legal-content";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicSiteSettings } from "@/services/site-settings/public-site-settings.service";

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const content = getLegalContent(LEGAL_PAGE_TYPES.PRIVACY, locale);

  return {
    title: content.title,

    description: content.description,

    alternates: {
      canonical: `/${locale}/privacy`,

      languages: {
        en: "/en/privacy",
        th: "/th/privacy",
        "x-default": "/en/privacy",
      },
    },

    openGraph: {
      type: "website",

      title: content.title,

      description: content.description,

      url: `/${locale}/privacy`,

      locale: locale === "th" ? "th_TH" : "en_US",

      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },

    twitter: {
      card: "summary",

      title: content.title,

      description: content.description,
    },
  };
}

export default async function PrivacyPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const settings = await getPublicSiteSettings();

  const companyName =
    settings.company?.displayName?.[locale] ||
    settings.company?.displayName?.[DEFAULT_LOCALE] ||
    "HCS (Thailand) Co., Ltd.";

  const email = settings.contact?.email || settings.contact?.salesEmail || "";

  return (
    <LegalPage
      type={LEGAL_PAGE_TYPES.PRIVACY}
      locale={locale}
      companyName={companyName}
      email={email}
    />
  );
}
