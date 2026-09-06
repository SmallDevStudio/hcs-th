"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMessageSquare,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { ProductCard } from "@/components/public/products/ProductCard";
import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";
import { ProductDetailGallery } from "@/components/public/products/detail/ProductDetailGallery";
import {
  ProductDescriptionSection,
  ProductDocumentsSection,
  ProductFinishesSection,
  ProductSpecificationsSection,
  ProductStandardsSection,
} from "@/components/public/products/detail/ProductDetailSections";

export function ProductDetailContent({
  product,
  relatedProducts = [],
  locale,
}) {
  const { t } = useTranslation("public");

  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const shortDescription = getLocalizedValue(product.shortDescription, locale);

  const productType = getLocalizedValue(product.productType, locale);

  const series = getLocalizedValue(product.series, locale);

  const categoryName = getLocalizedValue(
    product.category?.name,
    locale,
    product.category?.slug,
  );

  return (
    <main>
      <section className="border-b border-[#d6e2eb] bg-[#f3f7fa] dark:border-border dark:bg-background">
        <div className="container-hcs py-5">
          <nav
            aria-label={t("products.detail.breadcrumbLabel")}
            className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]"
          >
            <Link
              href={`/${locale}`}
              className="text-muted-foreground transition hover:text-primary"
            >
              {t("products.breadcrumbHome")}
            </Link>

            <span className="text-slate-400">/</span>

            <Link
              href={`/${locale}/products`}
              className="text-muted-foreground transition hover:text-primary"
            >
              {t("products.breadcrumbProducts")}
            </Link>

            {categoryName ? (
              <>
                <span className="text-slate-400">/</span>

                <span className="text-primary">{categoryName}</span>
              </>
            ) : null}
          </nav>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14 lg:py-16 dark:bg-background">
        <div className="container-hcs grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(390px,0.98fr)] lg:gap-14">
          <ProductDetailGallery product={product} locale={locale} t={t} />

          <div className="flex flex-col">
            {categoryName ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                {categoryName}
              </p>
            ) : null}

            <h1 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-[#071b30] sm:text-5xl dark:text-white">
              {product.model || productName}
            </h1>

            {product.model && productName !== product.model ? (
              <p className="mt-4 text-xl font-bold text-[#31485e] dark:text-slate-200">
                {productName}
              </p>
            ) : null}

            {shortDescription ? (
              <p className="mt-5 text-[15px] leading-8 text-[#52677a] dark:text-slate-300">
                {shortDescription}
              </p>
            ) : null}

            <dl className="mt-7 divide-y divide-[#d7e2ea] border-y border-[#d7e2ea] dark:divide-border dark:border-border">
              {productType ? (
                <div className="grid grid-cols-[120px_1fr] gap-5 py-4 text-sm">
                  <dt className="font-bold text-[#17334b] dark:text-slate-200">
                    {t("products.detail.productType")}
                  </dt>

                  <dd className="text-[#52677a] dark:text-slate-300">
                    {productType}
                  </dd>
                </div>
              ) : null}

              {series ? (
                <div className="grid grid-cols-[120px_1fr] gap-5 py-4 text-sm">
                  <dt className="font-bold text-[#17334b] dark:text-slate-200">
                    {t("products.detail.series")}
                  </dt>

                  <dd className="text-[#52677a] dark:text-slate-300">
                    {series}
                  </dd>
                </div>
              ) : null}

              {product.sku ? (
                <div className="grid grid-cols-[120px_1fr] gap-5 py-4 text-sm">
                  <dt className="font-bold text-[#17334b] dark:text-slate-200">
                    {t("products.detail.sku")}
                  </dt>

                  <dd className="text-[#52677a] dark:text-slate-300">
                    {product.sku}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-7 flex flex-wrap gap-2">
              {product.featured ? (
                <span className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide !text-white">
                  <FiCheck aria-hidden="true" />

                  {t("products.card.featured")}
                </span>
              ) : null}

              {(product.standards || []).slice(0, 4).map((standard) => (
                <span
                  key={standard.id || standard.name}
                  className="rounded-md bg-[#eaf4fb] px-3 py-2 text-xs font-bold text-[#164e75] dark:bg-sky-950/60 dark:text-sky-300"
                >
                  {standard.name}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/${locale}/contact?product=${encodeURIComponent(
                  product.model || product.slug,
                )}`}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-extrabold uppercase tracking-[0.04em] !text-white transition hover:bg-[#0568aa]"
              >
                <FiMessageSquare aria-hidden="true" />

                {t("products.detail.enquire")}

                <FiArrowRight aria-hidden="true" />
              </Link>

              <Link
                href={`/${locale}/products`}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#b9cddd] bg-white px-5 text-sm font-extrabold uppercase tracking-[0.04em] text-[#17334b] transition hover:border-primary hover:text-primary dark:border-border dark:bg-surface dark:text-white"
              >
                <FiArrowLeft aria-hidden="true" />

                {t("products.detail.backToProducts")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#d6e2eb] bg-[#f7fafc] dark:border-border dark:bg-[#0b1620]">
        <div className="container-hcs">
          <ProductDescriptionSection product={product} locale={locale} t={t} />

          <ProductSpecificationsSection
            product={product}
            locale={locale}
            t={t}
          />

          <ProductFinishesSection product={product} locale={locale} t={t} />

          <ProductStandardsSection product={product} t={t} />

          <ProductDocumentsSection product={product} locale={locale} t={t} />
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="bg-white py-12 sm:py-16 dark:bg-background">
          <div className="container-hcs">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                  {t("products.detail.relatedEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[#071b30] sm:text-3xl dark:text-white">
                  {t("products.detail.relatedProducts")}
                </h2>
              </div>

              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.05em] text-primary"
              >
                {t("products.allProducts")}

                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
