"use client";

import { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiCheck, FiPackage, FiSearch } from "react-icons/fi";

import { PROJECT_LIMITS } from "@/constants/projects";

function localizedValue(value, locale) {
  return value?.[locale] || value?.en || value?.th || "";
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function filterProducts(products, search, locale) {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) {
    return products;
  }

  return products.filter((product) => {
    const values = [
      product.name?.en,
      product.name?.th,
      product.model,
      product.sku,
      product.slug,
    ];

    return values.some((value) =>
      normalizeSearch(value).includes(normalizedSearch),
    );
  });
}

function filterSolutions(solutions, search, locale) {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) {
    return solutions;
  }

  return solutions.filter((solution) => {
    const values = [
      solution.name?.en,
      solution.name?.th,
      solution.slug,
      solution.icon,
      localizedValue(solution.shortDescription, locale),
    ];

    return values.some((value) =>
      normalizeSearch(value).includes(normalizedSearch),
    );
  });
}

function SearchInput({ value, onChange, placeholder, disabled }) {
  return (
    <label className="relative block">
      <FiSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  );
}

function SelectionCard({ selected, title, subtitle, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "flex min-h-20 w-full items-center gap-3 rounded-xl border p-3 text-left transition",
        selected
          ? "border-[#0979c4] bg-[#0979c4]/5 ring-2 ring-[#0979c4]/10 dark:bg-sky-950/30"
          : "border-slate-200 bg-white hover:border-[#0979c4]/40 dark:border-slate-700 dark:bg-slate-900",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      <span
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          selected
            ? "bg-[#0979c4] text-white"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800",
        ].join(" ")}
      >
        {selected ? (
          <FiCheck aria-hidden="true" />
        ) : (
          <FiPackage aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </span>

        {subtitle ? (
          <span className="mt-1 block truncate text-xs text-slate-400">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function RelationshipGroup({
  title,
  hint,
  search,
  onSearchChange,
  searchPlaceholder,
  items,
  selectedIds,
  maximumSelection,
  emptyText,
  getTitle,
  getSubtitle,
  onToggle,
  disabled,
}) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
        </div>

        <p className="shrink-0 text-xs font-bold text-[#0979c4] dark:text-sky-400">
          {selectedIds.length} / {maximumSelection}
        </p>
      </div>

      <div className="mt-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          disabled={disabled}
        />
      </div>

      {items.length ? (
        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);

            const selectionFull = selectedIds.length >= maximumSelection;

            return (
              <SelectionCard
                key={item.id}
                selected={selected}
                title={getTitle(item)}
                subtitle={getSubtitle(item)}
                onClick={() => onToggle(item.id)}
                disabled={disabled || (!selected && selectionFull)}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400 dark:border-slate-700">
          {emptyText}
        </div>
      )}
    </div>
  );
}

export function ProjectRelationshipFields({
  control,
  products = [],
  solutions = [],
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const productController = useController({
    control,
    name: "relatedProductIds",
  });

  const solutionController = useController({
    control,
    name: "relatedSolutionIds",
  });

  const relatedProductIds = Array.isArray(productController.field.value)
    ? productController.field.value
    : [];

  const relatedSolutionIds = Array.isArray(solutionController.field.value)
    ? solutionController.field.value
    : [];

  const [productSearch, setProductSearch] = useState("");

  const [solutionSearch, setSolutionSearch] = useState("");

  const locale = i18n.resolvedLanguage || "en";

  const availableProducts = useMemo(
    () =>
      filterProducts(
        Array.isArray(products) ? products : [],
        productSearch,
        locale,
      ),
    [locale, productSearch, products],
  );

  const availableSolutions = useMemo(
    () =>
      filterSolutions(
        Array.isArray(solutions) ? solutions : [],
        solutionSearch,
        locale,
      ),
    [locale, solutionSearch, solutions],
  );

  function toggleProduct(productId) {
    const nextIds = relatedProductIds.includes(productId)
      ? relatedProductIds.filter((id) => id !== productId)
      : [...relatedProductIds, productId].slice(
          0,
          PROJECT_LIMITS.RELATED_PRODUCTS_MAX_ITEMS,
        );

    productController.field.onChange(nextIds);
  }

  function toggleSolution(solutionId) {
    const nextIds = relatedSolutionIds.includes(solutionId)
      ? relatedSolutionIds.filter((id) => id !== solutionId)
      : [...relatedSolutionIds, solutionId].slice(
          0,
          PROJECT_LIMITS.RELATED_SOLUTIONS_MAX_ITEMS,
        );

    solutionController.field.onChange(nextIds);
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
        {t("projects.form.relationshipsSection")}
      </h3>

      <div className="mt-5 space-y-7">
        <RelationshipGroup
          title={t("projects.fields.relatedProducts")}
          hint={t("projects.fields.relatedProductsHint")}
          search={productSearch}
          onSearchChange={setProductSearch}
          searchPlaceholder={t("projects.fields.productSearch")}
          items={availableProducts}
          selectedIds={relatedProductIds}
          maximumSelection={PROJECT_LIMITS.RELATED_PRODUCTS_MAX_ITEMS}
          emptyText={t("projects.fields.noProducts")}
          getTitle={(product) =>
            localizedValue(product.name, locale) ||
            product.model ||
            product.slug
          }
          getSubtitle={(product) =>
            [product.model, product.sku].filter(Boolean).join(" • ")
          }
          onToggle={toggleProduct}
          disabled={disabled}
        />

        <div className="border-t border-slate-200 pt-7 dark:border-slate-800">
          <RelationshipGroup
            title={t("projects.fields.relatedSolutions")}
            hint={t("projects.fields.relatedSolutionsHint")}
            search={solutionSearch}
            onSearchChange={setSolutionSearch}
            searchPlaceholder={t("projects.fields.solutionSearch")}
            items={availableSolutions}
            selectedIds={relatedSolutionIds}
            maximumSelection={PROJECT_LIMITS.RELATED_SOLUTIONS_MAX_ITEMS}
            emptyText={t("projects.fields.noSolutions")}
            getTitle={(solution) =>
              localizedValue(solution.name, locale) || solution.slug
            }
            getSubtitle={(solution) =>
              localizedValue(solution.shortDescription, locale)
            }
            onToggle={toggleSolution}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}
