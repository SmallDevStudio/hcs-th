import { AboutPage } from "@/components/public/about/AboutPage";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";

const metadataByLocale = {
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

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const metadata = metadataByLocale[locale] || metadataByLocale[DEFAULT_LOCALE];

  return {
    title: metadata.title,
    description: metadata.description,

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
      title: metadata.title,
      description: metadata.description,
      url: `/${locale}/about`,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",

      images: [
        {
          url: "/images/about/about-hero.jpg",
          alt: metadata.imageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: ["/images/about/about-hero.jpg"],
    },
  };
}

export default async function PublicAboutPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  return <AboutPage locale={locale} />;
}
