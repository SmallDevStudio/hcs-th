"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbSearch, TbX } from "react-icons/tb";

import { ProductCard } from "@/components/public/products/ProductCard";
import { ProductCategoryNav } from "@/components/public/products/ProductCategoryNav";
import { ProductFilters } from "@/components/public/products/ProductFilters";
import { ProductHero } from "@/components/public/products/ProductHero";
import { ProductPagination } from "@/components/public/products/ProductPagination";
import {
  PRODUCTS_PER_PAGE,
  createCountMap,
  getLocalizedValue,
  productMatchesSearch,
  sortProducts,
  toggleArrayValue,
} from "@/components/public/products/product-catalog.utils";

export function PublicProductsCatalog({
  locale,
  products = [],
  categories = [],
  initialCategorySlug = "",
}) {
  const { t } = useTranslation("public");

  const [search, setSearch] = useState("");

  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState(
    initialCategorySlug ? [initialCategorySlug] : [],
  );

  const [selectedProductTypes, setSelectedProductTypes] = useState([]);

  const [selectedStandards, setSelectedStandards] = useState([]);

  const [sortBy, setSortBy] = useState("relevant");

  const [currentPage, setCurrentPage] = useState(1);

  const categoryCounts = useMemo(
    () => createCountMap(products.map((product) => product.category?.slug)),
    [products],
  );

  const productTypes = useMemo(() => {
    const valuesBySlug = new Map();

    products.forEach((product) => {
      if (!product.productTypeSlug) {
        return;
      }

      if (!valuesBySlug.has(product.productTypeSlug)) {
        valuesBySlug.set(product.productTypeSlug, {
          slug: product.productTypeSlug,

          name: getLocalizedValue(
            product.productType,
            locale,
            product.productTypeSlug,
          ),
        });
      }
    });

    return [...valuesBySlug.values()].sort((firstValue, secondValue) =>
      firstValue.name.localeCompare(secondValue.name, locale),
    );
  }, [locale, products]);

  const productTypeCounts = useMemo(
    () => createCountMap(products.map((product) => product.productTypeSlug)),
    [products],
  );

  const standards = useMemo(() => {
    const standardNames = new Set();

    products.forEach((product) => {
      product.standards?.forEach((standard) => {
        if (standard.name) {
          standardNames.add(standard.name);
        }
      });
    });

    return [...standardNames].sort((firstStandard, secondStandard) =>
      firstStandard.localeCompare(secondStandard),
    );
  }, [products]);

  const standardCounts = useMemo(
    () =>
      createCountMap(
        products.flatMap(
          (product) =>
            product.standards?.map((standard) => standard.name) || [],
        ),
      ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const matchingProducts = products.filter((product) => {
      if (
        selectedCategorySlugs.length &&
        !selectedCategorySlugs.includes(product.category?.slug)
      ) {
        return false;
      }

      if (
        selectedProductTypes.length &&
        !selectedProductTypes.includes(product.productTypeSlug)
      ) {
        return false;
      }

      if (
        selectedStandards.length &&
        !selectedStandards.every((selectedStandard) =>
          product.standards?.some(
            (standard) => standard.name === selectedStandard,
          ),
        )
      ) {
        return false;
      }

      return productMatchesSearch(product, search, locale);
    });

    return sortProducts(matchingProducts, sortBy, locale);
  }, [
    locale,
    products,
    search,
    selectedCategorySlugs,
    selectedProductTypes,
    selectedStandards,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const firstItemIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

  const visibleProducts = filteredProducts.slice(
    firstItemIndex,
    firstItemIndex + PRODUCTS_PER_PAGE,
  );

  const rangeFrom = filteredProducts.length ? firstItemIndex + 1 : 0;

  const rangeTo = Math.min(
    firstItemIndex + PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  const hasFilters =
    Boolean(search) ||
    selectedCategorySlugs.length > 0 ||
    selectedProductTypes.length > 0 ||
    selectedStandards.length > 0;

  function toggleCategory(categorySlug) {
    setSelectedCategorySlugs((currentValues) =>
      toggleArrayValue(currentValues, categorySlug),
    );

    setCurrentPage(1);
  }

  function toggleProductType(productTypeSlug) {
    setSelectedProductTypes((currentValues) =>
      toggleArrayValue(currentValues, productTypeSlug),
    );

    setCurrentPage(1);
  }

  function toggleStandard(standardName) {
    setSelectedStandards((currentValues) =>
      toggleArrayValue(currentValues, standardName),
    );

    setCurrentPage(1);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategorySlugs([]);
    setSelectedProductTypes([]);
    setSelectedStandards([]);
    setCurrentPage(1);
  }

  function changePage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));

    window.scrollTo({
      top: 520,
      behavior: "smooth",
    });
  }

  return (
    <>
      <ProductHero locale={locale} t={t} />

      <ProductCategoryNav
        locale={locale}
        categories={categories}
        selectedCategorySlugs={selectedCategorySlugs}
        allProductsLabel={t("products.allProducts")}
        onSelectAll={() => {
          setSelectedCategorySlugs([]);
          setCurrentPage(1);
        }}
        onToggleCategory={toggleCategory}
      />

      <section className="bg-[#f3f8fb] py-10 dark:bg-background sm:py-12 lg:py-14">
        <div className="container-hcs">
          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <ProductFilters
              locale={locale}
              t={t}
              categories={categories}
              categoryCounts={categoryCounts}
              selectedCategorySlugs={selectedCategorySlugs}
              onToggleCategory={toggleCategory}
              productTypes={productTypes}
              productTypeCounts={productTypeCounts}
              selectedProductTypes={selectedProductTypes}
              onToggleProductType={toggleProductType}
              standards={standards}
              standardCounts={standardCounts}
              selectedStandards={selectedStandards}
              onToggleStandard={toggleStandard}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />

            <div className="min-w-0">
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div>
                  <h2 className="text-2xl font-extrabold uppercase tracking-[-0.025em] text-[#071b30] dark:text-white sm:text-3xl">
                    {t("products.allProducts")}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("products.results.showing", {
                      from: rangeFrom,
                      to: rangeTo,
                      total: filteredProducts.length,
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative block sm:w-[290px]">
                    <span className="sr-only">
                      {t("products.filters.search")}
                    </span>

                    <TbSearch
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);

                        setCurrentPage(1);
                      }}
                      placeholder={t("products.filters.searchPlaceholder")}
                      className="h-11 w-full rounded border border-[#cbdbe7] bg-white pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-surface"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs font-bold text-[#12324d] dark:text-slate-300">
                      {t("products.sort.label")}
                    </span>

                    <select
                      value={sortBy}
                      onChange={(event) => {
                        setSortBy(event.target.value);

                        setCurrentPage(1);
                      }}
                      className="h-11 min-w-[160px] rounded border border-[#cbdbe7] bg-white px-3 text-sm font-semibold text-[#12324d] outline-none focus:border-primary dark:border-border dark:bg-surface dark:text-white"
                    >
                      <option value="relevant">
                        {t("products.sort.relevant")}
                      </option>

                      <option value="nameAscending">
                        {t("products.sort.nameAscending")}
                      </option>

                      <option value="nameDescending">
                        {t("products.sort.nameDescending")}
                      </option>

                      <option value="modelAscending">
                        {t("products.sort.modelAscending")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {visibleProducts.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-[#cbdbe7] bg-white px-6 py-20 text-center dark:border-border dark:bg-surface">
                  <TbSearch
                    aria-hidden="true"
                    className="mx-auto size-10 text-muted-foreground"
                  />

                  <h2 className="mt-5 text-xl font-extrabold text-foreground">
                    {t("products.empty.title")}
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    {t("products.empty.description")}
                  </p>

                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded bg-primary px-5 text-sm font-bold text-primary-foreground"
                    >
                      <TbX aria-hidden="true" />

                      {t("products.filters.clear")}
                    </button>
                  ) : null}
                </div>
              )}

              <ProductPagination
                t={t}
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onChange={changePage}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
