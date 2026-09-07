import { PublicProjectsCatalog } from "@/components/public/projects/PublicProjectsCatalog";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicProjects } from "@/services/projects/project-query.service";

const metadataByLocale = {
  en: {
    title: "Project References",
    description:
      "Explore HCS Thailand architectural hardware and security solutions delivered for hospitality, healthcare, commercial and residential projects.",
  },
  th: {
    title: "ผลงานโครงการอ้างอิง",
    description:
      "ชมผลงานอุปกรณ์ประตูและระบบรักษาความปลอดภัยของ HCS Thailand สำหรับโครงการโรงแรม โรงพยาบาล อาคารพาณิชย์ และที่อยู่อาศัย",
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
      canonical: `/${locale}/projects`,
      languages: {
        en: "/en/projects",
        th: "/th/projects",
        "x-default": "/en/projects",
      },
    },

    openGraph: {
      type: "website",
      title: metadata.title,
      description: metadata.description,
      url: `/${locale}/projects`,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },
  };
}

async function loadProjectsPageData() {
  try {
    const result = await getPublicProjects({
      limit: 100,
      cursor: undefined,
      buildingType: undefined,
      featured: undefined,
      search: undefined,
    });

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.items)) {
      return result.items;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    console.error("Unexpected public projects result:", result);

    return [];
  } catch (error) {
    console.error("Unable to load public projects page:", error);

    return [];
  }
}

export default async function PublicProjectsPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const projects = await loadProjectsPageData();

  return <PublicProjectsCatalog locale={locale} projects={projects} />;
}
