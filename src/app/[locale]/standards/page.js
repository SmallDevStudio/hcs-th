import { StandardsPage } from "@/components/public/standards/StandardsPage";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicStandards } from "@/services/standards/standard-query.service";

const metadataByLocale = {
  en: {
    title: "Standards & Compliance",

    description:
      "Explore HCS Thailand product standards, fire-test compliance, certificates and declarations for architectural door hardware.",
  },

  th: {
    title: "มาตรฐานและการรับรอง",

    description:
      "ดูมาตรฐานผลิตภัณฑ์ การทดสอบการทนไฟ ใบรับรอง และเอกสารรับรองสำหรับอุปกรณ์ประตูสถาปัตยกรรมจาก HCS Thailand",
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
      canonical: `/${locale}/standards`,

      languages: {
        en: "/en/standards",
        th: "/th/standards",
        "x-default": "/en/standards",
      },
    },

    openGraph: {
      type: "website",

      title: metadata.title,

      description: metadata.description,

      url: `/${locale}/standards`,

      locale: locale === "th" ? "th_TH" : "en_US",

      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },
  };
}

async function loadStandardsPageData() {
  try {
    const result = await getPublicStandards();

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.items)) {
      return result.items;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    console.error("Unexpected public standards result:", result);

    return [];
  } catch (error) {
    console.error("Unable to load public standards page:", error);

    return [];
  }
}

export default async function PublicStandardsPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const standards = await loadStandardsPageData();

  return <StandardsPage locale={locale} standards={standards} />;
}
