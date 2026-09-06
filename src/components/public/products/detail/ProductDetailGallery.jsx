"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

function createGalleryItems(product) {
  const items = [product.primaryImage, ...(product.gallery || [])].filter(
    (item) => item?.publicUrl,
  );

  const uniqueItems = [];
  const keys = new Set();

  items.forEach((item) => {
    const key = item.id || item.publicUrl;

    if (!keys.has(key)) {
      keys.add(key);
      uniqueItems.push(item);
    }
  });

  return uniqueItems;
}

export function ProductDetailGallery({ product, locale, t }) {
  const galleryItems = useMemo(() => createGalleryItems(product), [product]);

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = galleryItems[activeIndex] || null;

  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  function showPreviousImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1,
    );
  }

  function showNextImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#d4e0e9] bg-[#f6f8fa] dark:border-border dark:bg-[#111d27]">
        {activeImage ? (
          <Image
            src={activeImage.publicUrl}
            alt={getLocalizedValue(activeImage.altText, locale, productName)}
            fill
            unoptimized
            priority
            sizes="(max-width: 1023px) 100vw, 48vw"
            className="object-contain p-6 sm:p-10"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <FiImage aria-hidden="true" className="size-12" />

            <span className="text-sm font-semibold">
              {t("products.card.noImage")}
            </span>
          </div>
        )}

        {galleryItems.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label={t("products.detail.gallery.previous")}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4e0e9] bg-white/95 text-[#09233a] shadow-sm transition hover:border-primary hover:text-primary dark:border-border dark:bg-slate-900/95 dark:text-white"
            >
              <FiChevronLeft aria-hidden="true" className="size-5" />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label={t("products.detail.gallery.next")}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4e0e9] bg-white/95 text-[#09233a] shadow-sm transition hover:border-primary hover:text-primary dark:border-border dark:bg-slate-900/95 dark:text-white"
            >
              <FiChevronRight aria-hidden="true" className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {galleryItems.length > 1 ? (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          aria-label={t("products.detail.gallery.label")}
        >
          {galleryItems.map((image, index) => {
            const selected = index === activeIndex;

            return (
              <button
                key={image.id || image.publicUrl}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={t("products.detail.gallery.select", {
                  number: index + 1,
                })}
                aria-current={selected ? "true" : undefined}
                className={`relative aspect-square w-[82px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f6f8fa] transition dark:bg-[#111d27] ${
                  selected
                    ? "border-primary shadow-[0_0_0_2px_rgba(9,121,196,0.12)]"
                    : "border-[#d9e3ea] hover:border-primary/50 dark:border-border"
                }`}
              >
                <Image
                  src={image.publicUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="82px"
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
