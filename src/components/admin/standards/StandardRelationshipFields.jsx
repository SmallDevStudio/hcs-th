"use client";

import { useEffect, useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FiBox,
  FiCheck,
  FiFolder,
  FiLoader,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";

import { CATEGORY_STATUSES } from "@/constants/categories";
import { STANDARD_LIMITS } from "@/constants/standards";
import { getCategories } from "@/services/http/categories.api";
import { getProducts } from "@/services/http/products.api";

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function toggleValue(currentValues, value, maximumSelection) {
  if (currentValues.includes(value)) {
    return currentValues.filter((currentValue) => currentValue !== value);
  }

  if (currentValues.length >= maximumSelection) {
    return currentValues;
  }

  return [...currentValues, value];
}

function SelectionBadge({ label, onRemove, disabled }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
      <span className="truncate">{label}</span>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${label}`}
        className="flex size-4 shrink-0 items-center justify-center rounded-full transition hover:bg-primary/10 disabled:cursor-not-allowed"
      >
        <FiX aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}

function RelationshipSelector({
  title,
  hint,
  searchPlaceholder,
  emptyLabel,
  loading,
  items,
  selectedIds,
  search,
  onSearchChange,
  onToggle,
  onRemove,
  getItemLabel,
  getItemDescription,
  icon: Icon,
  maximumSelection,
  disabled,
  error,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      </div>

      {selectedIds.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedIds.map((selectedId) => {
            const selectedItem = items.find((item) => item.id === selectedId);

            return (
              <SelectionBadge
                key={selectedId}
                label={selectedItem ? getItemLabel(selectedItem) : selectedId}
                disabled={disabled}
                onRemove={() => onRemove(selectedId)}
              />
            );
          })}
        </div>
      ) : null}

      <div className="relative mt-4">
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          disabled={disabled}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500">
            <FiLoader aria-hidden="true" className="animate-spin" />

            <span>Loading...</span>
          </div>
        ) : items.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);

              const selectionDisabled =
                !selected && selectedIds.length >= maximumSelection;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  disabled={disabled || selectionDisabled}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    selected
                      ? "bg-primary/5"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {selected ? (
                      <FiCheck aria-hidden="true" />
                    ) : (
                      <Icon aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                      {getItemLabel(item)}
                    </p>

                    {getItemDescription(item) ? (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {getItemDescription(item)}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-32 items-center justify-center px-5 text-center text-sm text-slate-500">
            {emptyLabel}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {selectedIds.length} / {maximumSelection}
        </span>

        {selectedIds.length >= maximumSelection ? (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            Maximum selection reached
          </span>
        ) : null}
      </div>

      {error?.message ? (
        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          {error.message}
        </p>
      ) : null}
    </section>
  );
}

export function StandardRelationshipFields({
  control,
  standard = null,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const currentLocale = i18n.resolvedLanguage === "th" ? "th" : "en";

  const { field: categoryField, fieldState: categoryFieldState } =
    useController({
      control,
      name: "relatedCategoryIds",
    });

  const { field: productField, fieldState: productFieldState } = useController({
    control,
    name: "relatedProductIds",
  });

  const selectedCategoryIds = Array.isArray(categoryField.value)
    ? categoryField.value
    : [];

  const selectedProductIds = Array.isArray(productField.value)
    ? productField.value
    : [];

  const [categories, setCategories] = useState(() =>
    Array.isArray(standard?.relatedCategories)
      ? standard.relatedCategories
      : [],
  );

  const [products, setProducts] = useState(() =>
    Array.isArray(standard?.relatedProducts) ? standard.relatedProducts : [],
  );

  const [categorySearch, setCategorySearch] = useState("");

  const [productSearch, setProductSearch] = useState("");

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadRelationships() {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        getCategories({
          limit: 100,
          status: CATEGORY_STATUSES.ACTIVE,
          signal: abortController.signal,
        }),

        getProducts({
          limit: 100,
          signal: abortController.signal,
        }),
      ]);

      if (abortController.signal.aborted) {
        return;
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories((currentItems) => {
          const itemsById = new Map();

          for (const item of [
            ...currentItems,
            ...categoriesResult.value.items,
          ]) {
            if (item?.id) {
              itemsById.set(item.id, item);
            }
          }

          return [...itemsById.values()];
        });
      } else {
        toast.error(
          categoriesResult.reason?.message ||
            t("standards.messages.categoriesLoadFailed"),
        );
      }

      if (productsResult.status === "fulfilled") {
        setProducts((currentItems) => {
          const itemsById = new Map();

          for (const item of [...currentItems, ...productsResult.value.items]) {
            if (item?.id) {
              itemsById.set(item.id, item);
            }
          }

          return [...itemsById.values()];
        });
      } else {
        toast.error(
          productsResult.reason?.message ||
            t("standards.messages.productsLoadFailed"),
        );
      }

      setCategoriesLoading(false);
      setProductsLoading(false);
    }

    void loadRelationships();

    return () => {
      abortController.abort();
    };
  }, [t]);

  const visibleCategories = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(categorySearch);

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      const values = [category.slug, category.name?.en, category.name?.th];

      return values.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearch),
      );
    });
  }, [categories, categorySearch]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(productSearch);

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const values = [
        product.slug,
        product.model,
        product.sku,

        product.name?.en,
        product.name?.th,
      ];

      return values.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearch),
      );
    });
  }, [productSearch, products]);

  function toggleCategory(categoryId) {
    const nextValues = toggleValue(
      selectedCategoryIds,
      categoryId,
      STANDARD_LIMITS.CATEGORY_IDS_MAX_ITEMS,
    );

    if (
      nextValues.length === selectedCategoryIds.length &&
      !selectedCategoryIds.includes(categoryId)
    ) {
      toast.error(t("standards.messages.selectionLimit"));

      return;
    }

    categoryField.onChange(nextValues);
  }

  function toggleProduct(productId) {
    const nextValues = toggleValue(
      selectedProductIds,
      productId,
      STANDARD_LIMITS.PRODUCT_IDS_MAX_ITEMS,
    );

    if (
      nextValues.length === selectedProductIds.length &&
      !selectedProductIds.includes(productId)
    ) {
      toast.error(t("standards.messages.selectionLimit"));

      return;
    }

    productField.onChange(nextValues);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <RelationshipSelector
        title={t("standards.form.sections.categories")}
        hint={t("standards.form.hints.categories")}
        searchPlaceholder={t("standards.form.placeholders.categorySearch")}
        emptyLabel={t("standards.form.empty.categories")}
        loading={categoriesLoading}
        items={visibleCategories}
        selectedIds={selectedCategoryIds}
        search={categorySearch}
        onSearchChange={setCategorySearch}
        onToggle={toggleCategory}
        onRemove={toggleCategory}
        getItemLabel={(category) =>
          getLocalizedValue(category.name, currentLocale, category.slug)
        }
        getItemDescription={(category) => category.slug}
        icon={FiFolder}
        maximumSelection={STANDARD_LIMITS.CATEGORY_IDS_MAX_ITEMS}
        disabled={disabled}
        error={categoryFieldState.error}
      />

      <RelationshipSelector
        title={t("standards.form.sections.products")}
        hint={t("standards.form.hints.products")}
        searchPlaceholder={t("standards.form.placeholders.productSearch")}
        emptyLabel={t("standards.form.empty.products")}
        loading={productsLoading}
        items={visibleProducts}
        selectedIds={selectedProductIds}
        search={productSearch}
        onSearchChange={setProductSearch}
        onToggle={toggleProduct}
        onRemove={toggleProduct}
        getItemLabel={(product) => {
          const name = getLocalizedValue(
            product.name,
            currentLocale,
            product.slug,
          );

          return product.model ? `${product.model} — ${name}` : name;
        }}
        getItemDescription={(product) =>
          product.category
            ? getLocalizedValue(
                product.category.name,
                currentLocale,
                product.category.slug,
              )
            : product.sku || ""
        }
        icon={FiBox}
        maximumSelection={STANDARD_LIMITS.PRODUCT_IDS_MAX_ITEMS}
        disabled={disabled}
        error={productFieldState.error}
      />
    </div>
  );
}
