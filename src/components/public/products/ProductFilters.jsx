"use client";

import { TbChevronDown, TbX } from "react-icons/tb";

import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

function FilterCheckbox({ checked, label, count, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5 text-sm text-[#37516a] transition hover:text-primary dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 rounded border-[#b9ccdb] accent-[#0979c4]"
      />

      <span className="min-w-0 flex-1 leading-5">
        {label}

        <span className="ml-1 text-xs text-muted-foreground">({count})</span>
      </span>
    </label>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className="border-t border-[#d7e3ec] py-5 first:border-t-0 first:pt-0 dark:border-border">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-[#071b30] dark:text-white">
          {title}
        </h3>

        <TbChevronDown
          aria-hidden="true"
          className="size-4 text-[#164e75] dark:text-sky-300"
        />
      </div>

      <div>{children}</div>
    </section>
  );
}

export function ProductFilters({
  locale,
  t,

  categories,
  categoryCounts,
  selectedCategorySlugs,
  onToggleCategory,

  productTypes,
  productTypeCounts,
  selectedProductTypes,
  onToggleProductType,

  standards,
  standardCounts,
  selectedStandards,
  onToggleStandard,

  hasFilters,
  onClear,
}) {
  return (
    <aside className="self-start rounded-lg border border-[#d8e4ec] bg-white p-5 shadow-sm dark:border-border dark:bg-surface lg:sticky lg:top-28">
      <h2 className="border-b border-[#d7e3ec] pb-4 text-xs font-extrabold uppercase tracking-[0.08em] text-primary dark:border-border">
        {t("products.filters.title")}
      </h2>

      <div className="pt-5">
        <FilterSection title={t("products.filters.category")}>
          {categories.map((category) => (
            <FilterCheckbox
              key={category.id}
              checked={selectedCategorySlugs.includes(category.slug)}
              label={getLocalizedValue(category.name, locale, category.slug)}
              count={categoryCounts.get(category.slug) || 0}
              onChange={() => onToggleCategory(category.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection title={t("products.filters.productType")}>
          {productTypes.map((productType) => (
            <FilterCheckbox
              key={productType.slug}
              checked={selectedProductTypes.includes(productType.slug)}
              label={productType.name}
              count={productTypeCounts.get(productType.slug) || 0}
              onChange={() => onToggleProductType(productType.slug)}
            />
          ))}
        </FilterSection>

        {standards.length ? (
          <FilterSection title={t("products.filters.standards")}>
            {standards.map((standardName) => (
              <FilterCheckbox
                key={standardName}
                checked={selectedStandards.includes(standardName)}
                label={standardName}
                count={standardCounts.get(standardName) || 0}
                onChange={() => onToggleStandard(standardName)}
              />
            ))}
          </FilterSection>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-primary text-xs font-bold text-primary transition hover:bg-primary hover:!text-white disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:opacity-50"
      >
        <TbX aria-hidden="true" className="size-4" />

        {t("products.filters.clear")}
      </button>
    </aside>
  );
}
