import { notFound } from "next/navigation";

import { HtmlLangSync } from "@/components/common/HtmlLangSync";
import { PublicSiteShell } from "@/components/public/layout/PublicSiteShell";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/constants/locales";
import { getPublicSiteSettings } from "@/services/site-settings/public-site-settings.service";

const localeMetadata = {
  en: {
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "th_TH",
  },

  th: {
    openGraphLocale: "th_TH",
    alternateOpenGraphLocale: "en_US",
  },
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }));
}

function createSocialImage(imagePath, siteName) {
  if (!imagePath) {
    return undefined;
  }

  return [
    {
      url: imagePath,
      alt: siteName,
    },
  ];
}

function createVerificationMetadata(integrations) {
  const verification = {};

  if (integrations.googleSiteVerification) {
    verification.google = integrations.googleSiteVerification;
  }

  if (integrations.bingSiteVerification) {
    verification.other = {
      "msvalidate.01": [integrations.bingSiteVerification],
    };
  }

  return Object.keys(verification).length ? verification : undefined;
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const settings = await getPublicSiteSettings();

  const seo = settings.seo[locale] || settings.seo[DEFAULT_LOCALE];

  const siteName =
    settings.company.displayName[locale] ||
    settings.company.displayName[DEFAULT_LOCALE] ||
    "HCS Thailand";

  const socialImages = createSocialImage(
    settings.branding.defaultOgImage,
    siteName,
  );

  const localeConfig = localeMetadata[locale] || localeMetadata[DEFAULT_LOCALE];

  const canonicalPath = `/${locale}`;

  return {
    title: {
      absolute: seo.title,
    },

    description: seo.description,
    keywords: seo.keywords,

    applicationName: siteName,

    alternates: {
      canonical: canonicalPath,

      languages: {
        en: "/en",
        th: "/th",
        "x-default": "/en",
      },
    },

    robots: {
      index: settings.seo.indexable,
      follow: settings.seo.indexable,

      googleBot: {
        index: settings.seo.indexable,
        follow: settings.seo.indexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    verification: createVerificationMetadata(settings.integrations),

    openGraph: {
      type: "website",
      siteName,
      title: seo.title,
      description: seo.description,
      url: canonicalPath,
      locale: localeConfig.openGraphLocale,
      alternateLocale: localeConfig.alternateOpenGraphLocale,
      ...(socialImages
        ? {
            images: socialImages,
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(socialImages
        ? {
            images: socialImages.map((image) => image.url),
          }
        : {}),
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <>
      <HtmlLangSync locale={locale} />

      <PublicSiteShell locale={locale}>{children}</PublicSiteShell>
    </>
  );
}
