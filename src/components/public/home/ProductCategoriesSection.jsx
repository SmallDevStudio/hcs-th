"use client";

import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbAutomaticGearbox,
  TbColumns,
  TbDoor,
  TbDoorExit,
  TbFlame,
  TbKey,
  TbLockPassword,
  TbRulerMeasure2,
} from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { productCategories } from "@/constants/productCategories";

const categoryIcons = {
  doorCloser: TbAutomaticGearbox,
  leverHandle: TbDoor,
  lock: TbKey,
  hinge: TbColumns,
  exit: TbDoorExit,
  seal: TbRulerMeasure2,
  fire: TbFlame,
  electronicLock: TbLockPassword,
};

function CategoryIcon({ icon }) {
  const Icon = categoryIcons[icon] || TbDoor;

  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/6 text-primary transition duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
      <Icon aria-hidden="true" strokeWidth={1.7} className="size-[22px]" />
    </span>
  );
}

function CategoryCard({ category, locale }) {
  const { t } = useTranslation("public");

  const name = t(`home.categories.${category.translationKey}.name`);

  const description = t(
    `home.categories.${category.translationKey}.description`,
  );

  return (
    <article
      className={`group relative h-[320px] overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_45px_rgba(7,42,68,0.12)] lg:h-auto ${
        category.featured ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
      }`}
    >
      <Link
        href={`/${locale}/products/category/${category.slug}`}
        className="flex h-full flex-col"
        aria-label={name}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#eef2f5] dark:bg-[#13202b]">
          <Image
            src={category.image}
            alt={t("home.categories.imageAlt", {
              category: name,
            })}
            fill
            quality={88}
            sizes={
              category.featured
                ? "(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 33vw"
                : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            }
            className={`object-cover object-center transition duration-500 ease-out group-hover:scale-[1.035] ${
              category.featured ? "lg:object-cover" : ""
            }`}
          />

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />

          <span className="absolute left-0 top-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
        </div>

        <div
          className={`relative flex shrink-0 items-center justify-between gap-4 bg-surface px-5 py-4 ${
            category.featured
              ? "min-h-[126px] sm:px-6 sm:py-5 lg:min-h-[132px]"
              : "min-h-[92px]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-4">
            <CategoryIcon icon={category.icon} />

            <div className="min-w-0">
              <h3
                className={`font-bold tracking-[-0.02em] text-foreground transition group-hover:text-primary ${
                  category.featured
                    ? "text-xl sm:text-2xl"
                    : "text-base sm:text-lg"
                }`}
              >
                {name}
              </h3>

              {category.featured && (
                <p className="mt-1.5 line-clamp-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            <TbArrowRight
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ProductCategoriesSection({ locale }) {
  const { t } = useTranslation("public");

  return (
    <section className="overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      <div className="container-hcs">
        <div className="mb-9 flex flex-col justify-between gap-6 sm:mb-11 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">
              <span aria-hidden="true" className="h-px w-9 bg-primary" />

              <span>{t("home.categories.eyebrow")}</span>
            </div>

            <h2 className="text-balance text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {t("home.categories.title")}
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg lg:leading-8">
              {t("home.categories.description")}
            </p>
          </div>

          <Link
            href={`/${locale}/products`}
            className="group/link inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary"
          >
            <span className="border-b border-primary/40 pb-1 transition group-hover/link:border-primary">
              {t("common.viewAllProducts")}
            </span>

            <TbArrowRight
              aria-hidden="true"
              className="size-5 transition-transform group-hover/link:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[220px_220px_250px] lg:gap-5">
          {productCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


