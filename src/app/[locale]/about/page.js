import { AboutBuilderRenderer } from "@/components/public/about/AboutBuilderRenderer";
import { AboutPage } from "@/components/public/about/AboutPage";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicAboutPage } from "@/services/about/about-query.service";

const fallbackMetadataByLocale = {
  en: {
    title: "About HCS",

    description:
      "Learn about HCS Thailand, our architectural hardware expertise, international standards and commitment to complete opening solutions.",

    imageAlt:
      "Modern commercial building representing HCS Thailand architectural hardware solutions",
  },

  th: {
    title: "เกี่ยวกับ HCS",

    description:
      "รู้จัก HCS Thailand ผู้เชี่ยวชาญด้านอุปกรณ์ประตูสถาปัตยกรรม มาตรฐานสากล และโซลูชันการเปิดประตูแบบครบวงจร",

    imageAlt:
      "อาคารพาณิชย์สมัยใหม่ที่สะท้อนโซลูชันอุปกรณ์ประตูจาก HCS Thailand",
  },
};

function resolveLocale(requestedLocale) {
  return isSupportedLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
}

function getLocalizedValue(value, locale, fallback = "") {
  return (
    value?.[locale] ||
    value?.[DEFAULT_LOCALE] ||
    value?.en ||
    value?.th ||
    fallback
  );
}

function createFallbackMetadata(locale) {
  return (
    fallbackMetadataByLocale[locale] || fallbackMetadataByLocale[DEFAULT_LOCALE]
  );
}

function createPageMetadata({ locale, publicPage }) {
  const fallback = createFallbackMetadata(locale);

  const seo = publicPage?.seo;

  const title = getLocalizedValue(seo?.title, locale, fallback.title);

  const description = getLocalizedValue(
    seo?.description,
    locale,
    fallback.description,
  );

  const imageUrl = seo?.image?.publicUrl || "/images/about/about-hero.jpg";

  const imageAlt = getLocalizedValue(
    seo?.imageAlt,
    locale,
    getLocalizedValue(seo?.image?.altText, locale, fallback.imageAlt),
  );

  return {
    title,
    description,

    alternates: {
      canonical: `/${locale}/about`,

      languages: {
        en: "/en/about",
        th: "/th/about",
        "x-default": "/en/about",
      },
    },

    openGraph: {
      type: "website",

      title,
      description,

      url: `/${locale}/about`,

      locale: locale === "th" ? "th_TH" : "en_US",

      alternateLocale: locale === "th" ? "en_US" : "th_TH",

      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,
      description,

      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
  };
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = resolveLocale(requestedLocale);

  const publicPage = await getPublicAboutPage();

  return createPageMetadata({
    locale,
    publicPage,
  });
}

export default async function PublicAboutPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = resolveLocale(requestedLocale);

  const publicPage = await getPublicAboutPage();

  if (!publicPage) {
    return <AboutPage locale={locale} />;
  }

  return (
    <AboutBuilderRenderer
      content={{
        seo: publicPage.seo,

        sections: publicPage.sections,
      }}
      locale={locale}
    />
  );
}
