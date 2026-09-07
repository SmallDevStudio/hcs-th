"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbChevronLeft,
  TbChevronRight,
  TbPhotoOff,
} from "react-icons/tb";

const contentByLocale = {
  en: {
    title: "Featured Products",
    viewAll: "View All Products",
    viewDetails: "View Details",
    previous: "Previous products",
    next: "Next products",
    noImage: "No product image",
  },

  th: {
    title: "ผลิตภัณฑ์แนะนำ",
    viewAll: "ดูผลิตภัณฑ์ทั้งหมด",
    viewDetails: "ดูรายละเอียด",
    previous: "ดูผลิตภัณฑ์ก่อนหน้า",
    next: "ดูผลิตภัณฑ์ถัดไป",
    noImage: "ไม่มีรูปผลิตภัณฑ์",
  },
};

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function getProductTags(product) {
  const standardNames = Array.isArray(product.standards)
    ? product.standards
        .map((standard) => {
          if (typeof standard === "string") {
            return standard;
          }

          return standard?.name || standard?.classification || "";
        })
        .filter(Boolean)
    : [];

  if (standardNames.length) {
    return [...new Set(standardNames)].slice(0, 3);
  }

  if (Array.isArray(product.standardKeys)) {
    return [...new Set(product.standardKeys)].slice(0, 3);
  }

  return [];
}

function ProductImage({ product, locale, productName, eager, noImageLabel }) {
  if (!product.primaryImage?.publicUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <TbPhotoOff aria-hidden="true" className="size-8" />

        <span className="text-[10px] font-semibold">{noImageLabel}</span>
      </div>
    );
  }

  return (
    <Image
      src={product.primaryImage.publicUrl}
      alt={
        getLocalizedValue(product.primaryImage.altText, locale, productName) ||
        productName
      }
      fill
      unoptimized
      loading={eager ? "eager" : "lazy"}
      sizes="(max-width: 639px) 78vw, (max-width: 1023px) 42vw, 25vw"
      className="object-contain p-4 transition duration-500 ease-out group-hover:scale-[1.035]"
    />
  );
}

function ProductCard({ product, locale, content, eager }) {
  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const productCode = product.model || product.sku || product.slug;

  const tags = getProductTags(product);

  return (
    <article className="group min-w-[260px] snap-start overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:min-w-[300px] lg:min-w-0">
      <Link
        href={`/${locale}/products/${product.slug}`}
        aria-label={`${productCode} ${productName}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[#f3f5f6] dark:bg-[#13202b]">
          <ProductImage
            product={product}
            locale={locale}
            productName={productName}
            eager={eager}
            noImageLabel={content.noImage}
          />

          {product.featured ? (
            <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide !text-white">
              {content.title}
            </span>
          ) : null}
        </div>

        <div className="flex min-h-[132px] flex-1 flex-col px-4 pb-4 pt-3.5">
          <p className="text-base font-extrabold leading-none tracking-[-0.02em] text-primary">
            {productCode}
          </p>

          <h3 className="mt-2 line-clamp-1 text-sm font-medium text-foreground">
            {productName}
          </h3>

          <div className="mt-2 flex min-h-5 flex-wrap gap-1.5">
            {tags.map((tag) => (
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

export function FeaturedProductsSection({ locale = "en", products = [] }) {
  const currentLocale = locale === "th" ? "th" : "en";

  const content = contentByLocale[currentLocale];

  const sliderRef = useRef(null);

  const visibleProducts = (Array.isArray(products) ? products : [])
    .filter(
      (product) =>
        product && product.status === "published" && product.showOnHome,
    )
    .sort(
      (firstProduct, secondProduct) =>
        Number(firstProduct.sortOrder || 0) -
        Number(secondProduct.sortOrder || 0),
    )
    .slice(0, 8);

  const showSliderNavigation = visibleProducts.length > 4;

  function moveSlider(direction) {
    sliderRef.current?.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  }

  if (!visibleProducts.length) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-background pb-7 pt-12 sm:pt-14 lg:pt-16">
      <div className="container-hcs relative">
        <div className="mb-4 flex items-center justify-between gap-5">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.04em] text-primary sm:text-base">
            {content.title}
          </h2>

          <Link
            href={`/${currentLocale}/products`}
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
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={currentLocale}
                content={content}
                eager={index === 0}
              />
            ))}
          </div>
        </div>

        {showSliderNavigation ? (
          <button
            type="button"
            onClick={() => moveSlider(-1)}
            aria-label={content.previous}
            className="absolute left-[-22px] top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition hover:border-primary hover:text-primary xl:flex"
          >
            <TbChevronLeft aria-hidden="true" className="size-6" />
          </button>
        ) : null}

        {showSliderNavigation ? (
          <button
            type="button"
            onClick={() => moveSlider(1)}
            aria-label={content.next}
            className="absolute right-[-22px] top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition hover:border-primary hover:text-primary xl:flex"
          >
            <TbChevronRight aria-hidden="true" className="size-6" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
