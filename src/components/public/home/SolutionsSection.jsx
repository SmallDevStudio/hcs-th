"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { MdOutlineRoomService } from "react-icons/md";
import {
  TbArrowRight,
  TbBriefcase,
  TbSettings,
  TbSquareRoundedPlus,
} from "react-icons/tb";
import { FaConciergeBell } from "react-icons/fa";

const solutionIcons = {
  hospitality: FaConciergeBell,
  healthcare: TbSquareRoundedPlus,
  commercial: TbBriefcase,
  industrial: TbSettings,
};

const DEFAULT_SOLUTIONS = [
  {
    id: "hospitality",
    slug: "hospitality",
    translationKey: "hospitality",
    image: "/images/home/solutions/solution-hospitality.jpg",
    icon: "hospitality",
    order: 1,
    isPublished: true,
  },
  {
    id: "healthcare",
    slug: "healthcare",
    translationKey: "healthcare",
    image: "/images/home/solutions/solution-healthcare.jpg",
    icon: "healthcare",
    order: 2,
    isPublished: true,
  },
  {
    id: "commercial",
    slug: "commercial",
    translationKey: "commercial",
    image: "/images/home/solutions/solution-commercial.jpg",
    icon: "commercial",
    order: 3,
    isPublished: true,
  },
  {
    id: "industrial",
    slug: "industrial",
    translationKey: "industrial",
    image: "/images/home/solutions/solution-industrial.jpg",
    icon: "industrial",
    order: 4,
    isPublished: true,
  },
];

export default function SolutionsSection({
  locale = "en",
  items = DEFAULT_SOLUTIONS,
}) {
  const { t } = useTranslation("public");
  const currentLocale = locale === "th" ? "th" : "en";

  const visibleItems = [...items]
    .filter((item) => item.isPublished !== false)
    .sort((firstItem, secondItem) => {
      return (firstItem.order ?? 0) - (secondItem.order ?? 0);
    });

  return (
    <section id="solutions" className="bg-background pb-14 pt-0 sm:pb-16">
      <div className="container-hcs">
        <div className="mb-4">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
            {t("home.solutions.eyebrow")}
          </p>

          <h2 className="text-2xl font-extrabold uppercase leading-none tracking-[-0.025em] text-foreground sm:text-[28px]">
            {t("home.solutions.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {visibleItems.map((solution) => {
            const Icon = solutionIcons[solution.icon] || TbBriefcase;
            const translatedName = t(
              `home.solutions.${solution.translationKey}.name`,
            );
            const name =
              solution.name?.[currentLocale] ||
              solution.name?.en ||
              translatedName;

            return (
              <article
                key={solution.id || solution.slug}
                className="group relative aspect-[3/2] overflow-hidden rounded-md bg-[#071b2d] shadow-sm"
              >
                <Image
                  src={solution.image}
                  alt={t("home.solutions.imageAlt", { solution: name })}
                  fill
                  quality={86}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#061522]/95 via-[#061522]/18 to-transparent" />

                <Link
                  href={`/${currentLocale}/solutions/${solution.slug}`}
                  aria-label={`${t("common.exploreSolution")}: ${name}`}
                  className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <span className="sr-only">
                    {t("common.exploreSolution")}: {name}
                  </span>
                </Link>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="min-w-0 text-white">
                    <Icon
                      aria-hidden="true"
                      className="mb-2.5 size-9"
                      strokeWidth={1.7}
                    />

                    <h3 className="truncate text-sm font-bold uppercase tracking-[0.01em] sm:text-[15px]">
                      {name}
                    </h3>
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
      </div>
    </section>
  );
}


