import { SolutionsPage } from "@/components/public/solutions/SolutionsPage";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicSolutions } from "@/services/solutions/solution-query.service";

const metadataByLocale = {
  en: {
    title: "Complete Opening Solutions",
    description:
      "Explore complete opening solutions for hospitality, healthcare, commercial and industrial buildings from HCS Thailand.",
  },

  th: {
    title: "โซลูชันระบบประตูครบวงจร",
    description:
      "เลือกชมโซลูชันระบบประตูครบวงจรสำหรับโรงแรม โรงพยาบาล อาคารพาณิชย์ และโรงงานอุตสาหกรรมจาก HCS Thailand",
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
      canonical: `/${locale}/solutions`,

      languages: {
        en: "/en/solutions",
        th: "/th/solutions",
        "x-default": "/en/solutions",
      },
    },

    openGraph: {
      type: "website",
      title: metadata.title,
      description: metadata.description,
      url: `/${locale}/solutions`,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },
  };
}

async function loadSolutions() {
  try {
    return await getPublicSolutions();
  } catch (error) {
    console.error("Unable to load public solutions:", error);

    return [];
  }
}

export default async function PublicSolutionsPage({ params }) {
  const { locale } = await params;

  const solutions = await loadSolutions();

  return <SolutionsPage locale={locale} solutions={solutions} />;
}
