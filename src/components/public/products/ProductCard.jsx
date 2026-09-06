import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbFlame } from "react-icons/tb";

import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

export function ProductCard({ product, locale, t }) {
  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const shortDescription = getLocalizedValue(product.shortDescription, locale);

  const imageAlt = getLocalizedValue(
    product.primaryImage?.altText,
    locale,
    productName,
  );

  const standards = Array.isArray(product.standards)
    ? product.standards.slice(0, 3)
    : [];

  return (
    <article className="group overflow-hidden rounded-lg border border-[#cbdbe7] bg-white shadow-[0_3px_12px_rgba(7,42,68,0.04)] transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_38px_rgba(7,42,68,0.12)] dark:border-border dark:bg-surface">
      <Link
        href={`/${locale}/products/${product.slug}`}
        aria-label={`${product.model} ${productName}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f7f8] dark:bg-[#13202b]">
          {product.primaryImage?.publicUrl ? (
            <Image
              src={product.primaryImage.publicUrl}
              alt={imageAlt}
              fill
              unoptimized
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-5 text-center text-sm font-semibold text-muted-foreground">
              {t("products.card.noImage")}
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.featured ? (
              <span className="rounded bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide !text-white shadow-sm">
                {t("products.card.featured")}
              </span>
            ) : null}

            {product.fireRated ? (
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide !text-white shadow-sm">
                <TbFlame aria-hidden="true" />

                {t("products.card.fireRated")}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-[210px] flex-1 flex-col px-5 pb-5 pt-4">
          {product.category ? (
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
              {getLocalizedValue(
                product.category.name,
                locale,
                product.category.slug,
              )}
            </p>
          ) : null}

          <h2 className="mt-2 text-[1.35rem] font-extrabold leading-none tracking-[-0.025em] text-[#071b30] dark:text-white">
            {product.model || productName}
          </h2>

          {product.model && productName !== product.model ? (
            <p className="mt-2 line-clamp-1 text-sm font-medium text-muted-foreground">
              {productName}
            </p>
          ) : shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {shortDescription}
            </p>
          ) : null}

          <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
            {standards.map((standard) => (
              <span
                key={standard.id || standard.name}
                className="rounded bg-[#e9f3fa] px-2 py-1 text-[10px] font-bold text-[#164e75] dark:bg-sky-950/60 dark:text-sky-300"
              >
                {standard.name}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-3 pt-4 text-xs font-extrabold uppercase tracking-[0.04em] text-primary">
            <span>{t("products.card.viewDetails")}</span>

            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
