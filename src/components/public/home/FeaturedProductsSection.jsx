"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { featuredProducts } from "@/constants/featuredProducts";

const contentByLocale = {
  en: {
    title: "Featured Products",
    viewAll: "View All Products",
    viewDetails: "View Details",
    previous: "Previous products",
    next: "Next products",
  },
  th: {
    title: "ผลิตภัณฑ์แนะนำ",
    viewAll: "ดูผลิตภัณฑ์ทั้งหมด",
    viewDetails: "ดูรายละเอียด",
    previous: "ดูผลิตภัณฑ์ก่อนหน้า",
    next: "ดูผลิตภัณฑ์ถัดไป",
  },
};

function ProductCard({ product, locale, content }) {
  const productName = product.name[locale] || product.name.en;
  const imageAlt = product.imageAlt[locale] || product.imageAlt.en;

  return (
    <article className="group min-w-[260px] snap-start overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:min-w-[300px] lg:min-w-0">
      <Link
        href={`/${locale}/products/${product.slug}`}
        aria-label={`${product.code} ${productName}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[#f3f5f6] dark:bg-[#13202b]">
          <Image
            src={product.image}
            alt={imageAlt}
            fill
            quality={86}
            sizes="(max-width: 639px) 78vw, (max-width: 1023px) 42vw, 25vw"
            className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.035]"
          />
        </div>

        <div className="flex min-h-[132px] flex-1 flex-col px-4 pb-4 pt-3.5">
          <p className="text-base font-extrabold leading-none tracking-[-0.02em] text-primary">
            {product.code}
          </p>

          <h3 className="mt-2 line-clamp-1 text-sm font-medium text-foreground">
            {productName}
          </h3>

          <div className="mt-2 flex min-h-5 flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <span className="text-xs font-bold text-primary">
              {content.viewDetails}
            </span>

            <TbArrowRight
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[18px] text-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
            />
          </div>
        </div>

        <span className="block h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      </Link>
    </article>
  );
}

export function FeaturedProductsSection({ locale }) {
  const content = contentByLocale[locale] || contentByLocale.en;
  const sliderRef = useRef(null);

  const moveSlider = (direction) => {
    sliderRef.current?.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  return (
    <section className="overflow-hidden bg-background pb-7 pt-12 sm:pt-14 lg:pt-16">
      <div className="container-hcs relative">
        <div className="mb-4 flex items-center justify-between gap-5">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.04em] text-primary sm:text-base">
            {content.title}
          </h2>

          <Link
            href={`/${locale}/products`}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"
          >
            <span>{content.viewAll}</span>
            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div
          ref={sliderRef}
          className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          <div className="flex snap-x snap-mandatory gap-4 lg:contents">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                content={content}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => moveSlider(-1)}
          aria-label={content.previous}
          className="absolute left-[-22px] top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition hover:border-primary hover:text-primary xl:flex"
        >
          <TbChevronLeft aria-hidden="true" className="size-6" />
        </button>

        <button
          type="button"
          onClick={() => moveSlider(1)}
          aria-label={content.next}
          className="absolute right-[-22px] top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition hover:border-primary hover:text-primary xl:flex"
        >
          <TbChevronRight aria-hidden="true" className="size-6" />
        </button>
      </div>
    </section>
  );
}
