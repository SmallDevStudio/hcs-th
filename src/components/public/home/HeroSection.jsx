"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export function HeroSection({ locale }) {
  const { t } = useTranslation("public");

  return (
    <section className="relative isolate min-h-[500px] overflow-hidden bg-[#071b2d] text-white sm:min-h-[540px] lg:min-h-[600px]">
      <Image
        src="/images/home/hcs-hero-main.jpg"
        alt={t("home.hero.imageAlt")}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#03182a]/95 via-[#052743]/67 to-transparent"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#061522]/35 via-transparent to-[#061522]/10"
      />

      <div className="container-hcs relative z-10 flex min-h-[500px] items-center py-14 sm:min-h-[540px] lg:min-h-[600px] lg:py-16">
        <div className="max-w-[620px]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#55b8f7] sm:text-sm">
            {t("home.hero.eyebrow")}
          </p>

          <h1 className="text-balance text-[42px] font-extrabold uppercase leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px]">
            <span className="block">{t("home.hero.titleLineOne")}</span>
            <span className="mt-1 block">{t("home.hero.titleLineTwo")}</span>
          </h1>

          <p className="mt-5 max-w-[520px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            {t("home.hero.description")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/products`}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover"
            >
              <span>{t("home.hero.primaryAction")}</span>
              <FiArrowRight aria-hidden="true" className="size-[18px]" />
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-white/75 bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#071b2d]"
            >
              <span>{t("home.hero.secondaryAction")}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        <span className="h-1.5 w-6 rounded-full bg-primary" />
        <span className="size-2 rounded-full bg-white" />
        <span className="size-2 rounded-full bg-white" />
      </div>
    </section>
  );
}


