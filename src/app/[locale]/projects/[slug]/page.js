import { notFound } from "next/navigation";

import { ProjectDetailContent } from "@/components/public/projects/detail/ProjectDetailContent";
import { getLocalizedValue } from "@/components/public/projects/project-catalog.utils";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicProjectBySlug } from "@/services/projects/project-query.service";

function normalizeProjectResult(result) {
  if (!result) {
    return null;
  }

  if (result.data && !Array.isArray(result.data)) {
    return result.data;
  }

  if (result.item) {
    return result.item;
  }

  return result;
}

async function loadProject(slug) {
  try {
    const result = await getPublicProjectBySlug(slug);

    return normalizeProjectResult(result);
  } catch (error) {
    console.error(`Unable to load public project "${slug}":`, error);

    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale, slug } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const project = await loadProject(slug);

  if (!project) {
    return {
      title: locale === "th" ? "ไม่พบโครงการ" : "Project Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const projectName = getLocalizedValue(
    project.seo?.title,
    locale,
    getLocalizedValue(project.name, locale, project.slug),
  );

  const description = getLocalizedValue(
    project.seo?.description,
    locale,
    getLocalizedValue(project.shortDescription, locale),
  );

  const imageUrl = project.coverImage?.publicUrl || undefined;

  return {
    title: projectName,
    description,

    keywords:
      project.seo?.keywords?.[locale] || project.seo?.keywords?.en || undefined,

    alternates: {
      canonical: `/${locale}/projects/${project.slug}`,

      languages: {
        en: `/en/projects/${project.slug}`,
        th: `/th/projects/${project.slug}`,
        "x-default": `/en/projects/${project.slug}`,
      },
    },

    openGraph: {
      type: "article",
      title: projectName,
      description,
      url: `/${locale}/projects/${project.slug}`,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",

      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: projectName,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: projectName,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PublicProjectDetailPage({ params }) {
  const { locale: requestedLocale, slug } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const project = await loadProject(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailContent project={project} locale={locale} />;
}
