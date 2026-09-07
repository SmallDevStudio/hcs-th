"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FaConciergeBell } from "react-icons/fa";
import {
  TbArrowRight,
  TbBriefcase,
  TbBuilding,
  TbBuildingHospital,
  TbBuildingSkyscraper,
  TbFlame,
  TbLock,
  TbSettings,
} from "react-icons/tb";

const SOLUTION_ICONS = {
  hospitality: FaConciergeBell,
  healthcare: TbBuildingHospital,
  commercial: TbBriefcase,
  industrial: TbSettings,
  building: TbBuilding,
  security: TbLock,
  "fire-rated": TbFlame,
  "access-control": TbBuildingSkyscraper,
};

const FALLBACK_IMAGES = {
  hospitality: "/images/home/solutions/solution-hospitality.jpg",

  healthcare: "/images/home/solutions/solution-healthcare.jpg",

  commercial: "/images/home/solutions/solution-commercial.jpg",

  industrial: "/images/home/solutions/solution-industrial.jpg",
};

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function getSolutionImage(solution) {
  return (
    solution.image?.publicUrl ||
    FALLBACK_IMAGES[solution.slug] ||
    FALLBACK_IMAGES.commercial
  );
}

export default function SolutionsSection({ locale = "en", items = [] }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const visibleItems = (Array.isArray(items) ? items : [])
    .filter(
      (solution) =>
        solution && solution.status === "published" && solution.showOnHome,
    )
    .sort(
      (firstSolution, secondSolution) =>
        Number(firstSolution.sortOrder || 0) -
        Number(secondSolution.sortOrder || 0),
    )
    .slice(0, 4);

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section id="solutions" className="bg-background pb-14 pt-0 sm:pb-16">
      <div className="container-hcs">
        <div className="mb-4 flex items-end justify-between gap-5">
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
              {t("home.solutions.eyebrow")}
            </p>

            <h2 className="text-2xl font-extrabold uppercase leading-none tracking-[-0.025em] text-foreground sm:text-[28px]">
              {t("home.solutions.title")}
            </h2>
          </div>

          <Link
            href={`/${currentLocale}/solutions`}
            className="hidden items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary transition hover:text-[#065f9c] sm:inline-flex"
          >
            {t("common.viewAll")}

            <TbArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {visibleItems.map((solution, index) => {
            const Icon = SOLUTION_ICONS[solution.icon] || TbBuilding;

            const name = getLocalizedValue(
              solution.name,
              currentLocale,
              solution.slug,
            );

            const description = getLocalizedValue(
              solution.shortDescription,
              currentLocale,
            );

            const imageUrl = getSolutionImage(solution);

            const remoteImage = Boolean(solution.image?.publicUrl);

            return (
              <article
                key={solution.id || solution.slug}
                className="group relative aspect-[3/2] overflow-hidden rounded-md bg-[#071b2d] shadow-sm"
              >
                <Image
                  src={imageUrl}
                  alt={
                    getLocalizedValue(
                      solution.image?.altText,
                      currentLocale,
                      name,
                    ) || name
                  }
                  fill
                  unoptimized={remoteImage}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={remoteImage ? undefined : 86}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#061522]/95 via-[#061522]/38 to-transparent" />

                <Link
                  href={`/${currentLocale}/solutions#${solution.slug}`}
                  aria-label={`${t("common.exploreSolution")}: ${name}`}
                  className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <span className="sr-only">
                    {t("common.exploreSolution")}: {name}
                  </span>
                </Link>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="min-w-0 text-white">
                    <Icon aria-hidden="true" className="mb-2 size-9" />

                    <h3 className="truncate text-sm font-bold uppercase tracking-[0.01em] sm:text-[15px]">
                      {name}
                    </h3>

                    {description ? (
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/75">
                        {description}
                      </p>
                    ) : null}
                  </div>

                  <TbArrowRight
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="mb-0.5 size-5 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>

                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
              </article>
            );
          })}
        </div>

        <div className="mt-5 sm:hidden">
          <Link
            href={`/${currentLocale}/solutions`}
            className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary"
          >
            {t("common.viewAll")}

            <TbArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
