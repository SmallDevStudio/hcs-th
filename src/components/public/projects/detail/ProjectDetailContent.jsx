"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  TbArrowLeft,
  TbArrowRight,
  TbBuilding,
  TbCalendar,
  TbMapPin,
  TbUser,
} from "react-icons/tb";

import { ProjectDetailGallery } from "@/components/public/projects/detail/ProjectDetailGallery";
import { getLocalizedValue } from "@/components/public/projects/project-catalog.utils";

function ContentSection({ eyebrow, title, children, muted = false }) {
  return (
    <section
      className={
        muted
          ? "bg-[#f3f8fb] py-12 dark:bg-background sm:py-14 lg:py-16"
          : "bg-white py-12 dark:bg-surface sm:py-14 lg:py-16"
      }
    >
      <div className="container-hcs">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[1.08] tracking-[-0.035em] text-[#071b30] dark:text-white sm:text-4xl">
          {title}
        </h2>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function ProjectMetadataItem({ icon: Icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded border border-primary/20 bg-primary/5 text-primary">
        <Icon aria-hidden="true" strokeWidth={1.8} className="size-5" />
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-[#071b30] dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function RelatedProductCard({ product, locale, t }) {
  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const image = product.primaryImage || product.image || null;

  return (
    <article className="group overflow-hidden rounded-lg border border-[#cbdbe7] bg-white transition hover:-translate-y-1 hover:border-primary hover:shadow-lg dark:border-border dark:bg-surface">
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/10] bg-[#f3f5f6] dark:bg-[#13202b]">
          {image?.publicUrl ? (
            <Image
              src={image.publicUrl}
              alt={getLocalizedValue(image.altText, locale, productName)}
              fill
              unoptimized
              sizes="(max-width: 639px) 100vw, 33vw"
              className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {product.model ? (
            <p className="text-lg font-extrabold text-primary">
              {product.model}
            </p>
          ) : null}

          <h3 className="mt-1 line-clamp-2 font-bold text-[#071b30] dark:text-white">
            {productName}
          </h3>

          <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
            {t("projects.detail.viewProduct")}

            <TbArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

function RelatedSolutionCard({ solution, locale, t }) {
  const solutionName = getLocalizedValue(
    solution.title || solution.name,
    locale,
    solution.slug,
  );

  const image =
    solution.coverImage || solution.primaryImage || solution.image || null;

  return (
    <article className="group relative min-h-[310px] overflow-hidden rounded-lg bg-[#062a48]">
      <Link
        href={`/${locale}/solutions/${solution.slug}`}
        className="absolute inset-0"
      >
        {image?.publicUrl ? (
          <Image
            src={image.publicUrl}
            alt={getLocalizedValue(image.altText, locale, solutionName)}
            fill
            unoptimized
            sizes="(max-width: 639px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-[#041b2d] via-[#041b2d]/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <h3 className="text-xl font-extrabold">{solutionName}</h3>

          <span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase text-sky-300">
            {t("projects.detail.viewSolution")}

            <TbArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ProjectDetailContent({ project, locale = "en" }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const projectName = getLocalizedValue(
    project.name,
    currentLocale,
    project.slug,
  );

  const shortDescription = getLocalizedValue(
    project.shortDescription,
    currentLocale,
  );

  const description = getLocalizedValue(project.description, currentLocale);

  const challenge = getLocalizedValue(project.challenge, currentLocale);

  const solution = getLocalizedValue(project.solution, currentLocale);

  const results = getLocalizedValue(project.results, currentLocale);

  const location = getLocalizedValue(project.location, currentLocale);

  const client = getLocalizedValue(project.client, currentLocale);

  const buildingType = project.buildingType
    ? t(`projects.buildingTypes.${project.buildingType}`, {
        defaultValue: project.buildingType,
      })
    : "";

  const relatedProducts = Array.isArray(project.relatedProducts)
    ? project.relatedProducts
    : [];

  const relatedSolutions = Array.isArray(project.relatedSolutions)
    ? project.relatedSolutions
    : [];

  return (
    <>
      <section className="bg-white dark:bg-surface">
        <div className="container-hcs py-5">
          <nav
            aria-label={t("projects.detail.breadcrumbLabel")}
            className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground"
          >
            <Link
              href={`/${currentLocale}`}
              className="transition hover:text-primary"
            >
              {t("projects.breadcrumbHome")}
            </Link>

            <span aria-hidden="true">/</span>

            <Link
              href={`/${currentLocale}/projects`}
              className="transition hover:text-primary"
            >
              {t("projects.breadcrumbProjects")}
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-primary">{projectName}</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#f3f8fb] pb-12 dark:bg-background sm:pb-14 lg:pb-16">
        <div className="container-hcs">
          <ProjectDetailGallery
            project={project}
            locale={currentLocale}
            t={t}
          />

          <div className="relative z-10 mx-auto -mt-1 grid max-w-[1180px] overflow-hidden rounded-b-lg border border-[#cbdbe7] bg-white shadow-[0_20px_45px_rgba(7,42,68,0.12)] dark:border-border dark:bg-surface lg:grid-cols-[1.55fr_1fr]">
            <div className="px-6 py-8 sm:px-9 lg:px-12 lg:py-11">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                {buildingType}
              </p>

              <h1 className="mt-3 text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.04em] text-[#071b30] dark:text-white sm:text-4xl lg:text-5xl">
                {projectName}
              </h1>

              {shortDescription ? (
                <p className="mt-5 max-w-[720px] text-base leading-7 text-muted-foreground">
                  {shortDescription}
                </p>
              ) : null}

              <Link
                href={`/${currentLocale}/projects`}
                className="mt-7 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.05em] text-primary"
              >
                <TbArrowLeft aria-hidden="true" className="size-[18px]" />

                {t("projects.detail.backToProjects")}
              </Link>
            </div>

            <div className="grid gap-6 border-t border-[#d8e4ed] bg-[#f8fbfd] px-6 py-8 dark:border-border dark:bg-background sm:grid-cols-2 sm:px-9 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:px-10">
              <ProjectMetadataItem
                icon={TbMapPin}
                label={t("projects.detail.location")}
                value={location}
              />

              <ProjectMetadataItem
                icon={TbUser}
                label={t("projects.detail.client")}
                value={client}
              />

              <ProjectMetadataItem
                icon={TbCalendar}
                label={t("projects.detail.completionYear")}
                value={project.year}
              />

              <ProjectMetadataItem
                icon={TbBuilding}
                label={t("projects.detail.buildingType")}
                value={buildingType}
              />
            </div>
          </div>
        </div>
      </section>

      {description ? (
        <ContentSection
          eyebrow={t("projects.detail.overviewEyebrow")}
          title={t("projects.detail.overview")}
        >
          <div className="max-w-[900px] whitespace-pre-line text-base leading-8 text-muted-foreground">
            {description}
          </div>
        </ContentSection>
      ) : null}

      {challenge ? (
        <ContentSection
          eyebrow={t("projects.detail.challengeEyebrow")}
          title={t("projects.detail.challenge")}
          muted
        >
          <div className="max-w-[900px] whitespace-pre-line text-base leading-8 text-muted-foreground">
            {challenge}
          </div>
        </ContentSection>
      ) : null}

      {solution ? (
        <ContentSection
          eyebrow={t("projects.detail.solutionEyebrow")}
          title={t("projects.detail.solution")}
        >
          <div className="max-w-[900px] whitespace-pre-line text-base leading-8 text-muted-foreground">
            {solution}
          </div>
        </ContentSection>
      ) : null}

      {results ? (
        <ContentSection
          eyebrow={t("projects.detail.resultsEyebrow")}
          title={t("projects.detail.results")}
          muted
        >
          <div className="max-w-[900px] whitespace-pre-line text-base leading-8 text-muted-foreground">
            {results}
          </div>
        </ContentSection>
      ) : null}

      {relatedProducts.length ? (
        <ContentSection
          eyebrow={t("projects.detail.productsEyebrow")}
          title={t("projects.detail.relatedProducts")}
          muted
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <RelatedProductCard
                key={product.id || product.slug}
                product={product}
                locale={currentLocale}
                t={t}
              />
            ))}
          </div>
        </ContentSection>
      ) : null}

      {relatedSolutions.length ? (
        <ContentSection
          eyebrow={t("projects.detail.solutionsEyebrow")}
          title={t("projects.detail.relatedSolutions")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {relatedSolutions.map((relatedSolution) => (
              <RelatedSolutionCard
                key={relatedSolution.id || relatedSolution.slug}
                solution={relatedSolution}
                locale={currentLocale}
                t={t}
              />
            ))}
          </div>
        </ContentSection>
      ) : null}
    </>
  );
}
