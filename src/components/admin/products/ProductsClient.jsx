"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiEdit3,
  FiFilter,
  FiImage,
  FiLoader,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { PRODUCT_STATUSES, PRODUCT_STATUS_VALUES } from "@/constants/products";
import {
  deleteProduct,
  getProducts,
  reorderProducts,
} from "@/services/http/products.api";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  categoryId: "",
  fireRated: "",
};

function isDarkModeActive() {
  return document.documentElement.classList.contains("dark");
}

function createDeleteConfirmation({
  darkMode,
  title,
  text,
  confirmText,
  cancelText,
}) {
  return {
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    background: darkMode ? "#071522" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#0f172a",
  };
}

function getLocalizedValue(value, language, fallback = "") {
  return value?.[language] || value?.en || value?.th || fallback;
}

function normalizeAppliedFilters(filters) {
  const search = filters.search.trim();

  /*
   * Search uses a separate Firestore query path.
   * Do not combine it with the remaining filters unless matching
   * composite indexes are added later.
   */
  if (search) {
    return {
      search,
      status: "",
      categoryId: "",
      fireRated: "",
    };
  }

  /*
   * Fire-rated filtering also uses a separate query path so the UI
   * cannot accidentally request an unsupported index combination.
   */
  if (filters.fireRated !== "") {
    return {
      search: "",
      status: "",
      categoryId: "",
      fireRated: filters.fireRated,
    };
  }

  return {
    search: "",
    status: filters.status,
    categoryId: filters.categoryId,
    fireRated: "",
  };
}

function getStatusClassName(status) {
  if (status === PRODUCT_STATUSES.PUBLISHED) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (status === PRODUCT_STATUSES.INACTIVE) {
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }

  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

function ProductImage({ product, language, eager = false }) {
  const productName = getLocalizedValue(
    product.name,
    language,
    product.model || product.slug,
  );

  if (product.primaryImage?.publicUrl) {
    return (
      <Image
        src={product.primaryImage.publicUrl}
        alt={
          getLocalizedValue(
            product.primaryImage.altText,
            language,
            productName,
          ) || productName
        }
        fill
        unoptimized
        loading={eager ? "eager" : "lazy"}
        sizes="72px"
        className="object-contain p-1.5"
      />
    );
  }

  return (
    <FiImage
      aria-hidden="true"
      className="text-2xl text-slate-300 dark:text-slate-600"
    />
  );
}

export function ProductsClient({
  initialItems,
  initialPagination,
  categories,
  canCreate,
  canUpdate,
  canDelete,
}) {
  const { t, i18n } = useTranslation("admin");

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const [items, setItems] = useState(
    Array.isArray(initialItems) ? initialItems : [],
  );

  const [pagination, setPagination] = useState(initialPagination);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [formState, setFormState] = useState(null);

  const [orderDirty, setOrderDirty] = useState(false);

  const [savingOrder, setSavingOrder] = useState(false);

  function updateDraftFilter(field, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  async function requestItems({ filters, cursor, append = false }) {
    setLoading(true);

    try {
      const result = await getProducts({
        limit: 25,
        cursor,
        search: filters.search || undefined,
        status: filters.status || undefined,
        categoryId: filters.categoryId || undefined,
        fireRated:
          filters.fireRated === "" ? undefined : filters.fireRated === "true",
      });

      setItems((currentItems) =>
        append ? [...currentItems, ...result.items] : result.items,
      );

      setPagination(result.pagination);

      if (!append) {
        setOrderDirty(false);
      }
    } catch (error) {
      toast.error(error?.message || t("products.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    const normalizedFilters = normalizeAppliedFilters(draftFilters);

    setDraftFilters(normalizedFilters);

    setAppliedFilters(normalizedFilters);

    await requestItems({
      filters: normalizedFilters,
    });
  }

  async function handleClearFilters() {
    setDraftFilters(INITIAL_FILTERS);

    setAppliedFilters(INITIAL_FILTERS);

    await requestItems({
      filters: INITIAL_FILTERS,
    });
  }

  async function handleRefresh() {
    await requestItems({
      filters: appliedFilters,
    });
  }

  async function handleLoadMore() {
    if (loading || !pagination?.nextCursor) {
      return;
    }

    await requestItems({
      filters: appliedFilters,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  function handleSaved(savedProduct) {
    setItems((currentItems) => {
      const exists = currentItems.some(
        (product) => product.id === savedProduct.id,
      );

      const nextItems = exists
        ? currentItems.map((product) =>
            product.id === savedProduct.id ? savedProduct : product,
          )
        : [savedProduct, ...currentItems];

      return [...nextItems].sort(
        (firstProduct, secondProduct) =>
          firstProduct.sortOrder - secondProduct.sortOrder,
      );
    });

    setFormState(null);
  }

  async function handleDelete(product) {
    const confirmation = await Swal.fire(
      createDeleteConfirmation({
        darkMode: isDarkModeActive(),
        title: t("products.confirmDelete.title"),
        text: t("products.confirmDelete.text"),
        confirmText: t("products.confirmDelete.confirm"),
        cancelText: t("products.confirmDelete.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(product.id);

    try {
      await deleteProduct(product.id);

      setItems((currentItems) =>
        currentItems.filter(
          (currentProduct) => currentProduct.id !== product.id,
        ),
      );

      toast.success(t("products.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("products.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function handleMove(productId, direction) {
    setItems((currentItems) => {
      const currentIndex = currentItems.findIndex(
        (product) => product.id === productId,
      );

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= currentItems.length
      ) {
        return currentItems;
      }

      const nextItems = [...currentItems];

      [nextItems[currentIndex], nextItems[targetIndex]] = [
        nextItems[targetIndex],
        nextItems[currentIndex],
      ];

      return nextItems.map((product, index) => ({
        ...product,
        sortOrder: (index + 1) * 10,
      }));
    });

    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    if (!orderDirty || savingOrder) {
      return;
    }

    setSavingOrder(true);

    try {
      await reorderProducts({
        items: items.map((product) => ({
          productId: product.id,
          sortOrder: product.sortOrder,
        })),
      });

      setOrderDirty(false);

      toast.success(t("products.messages.orderSuccess"));
    } catch (error) {
      toast.error(error?.message || t("products.messages.orderFailed"));
    } finally {
      setSavingOrder(false);
    }
  }

  const hasFilters =
    Boolean(appliedFilters.search) ||
    Boolean(appliedFilters.status) ||
    Boolean(appliedFilters.categoryId) ||
    appliedFilters.fireRated !== "";

  const canReorder = canUpdate && !hasFilters && !pagination?.hasMore;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("products.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("products.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("products.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canReorder && orderDirty ? (
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold !text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingOrder ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiSave aria-hidden="true" />
              )}

              {t("products.actions.saveOrder")}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />

            {t("products.actions.refresh")}
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  product: null,
                })
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa]"
            >
              <FiPlus aria-hidden="true" />

              {t("products.actions.create")}
            </button>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_180px_220px_190px_auto] xl:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("products.filters.search")}
            </span>

            <span className="relative block">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={draftFilters.search}
                onChange={(event) =>
                  updateDraftFilter("search", event.target.value)
                }
                placeholder={t("products.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("products.filters.status")}
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) =>
                updateDraftFilter("status", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("products.filters.allStatuses")}</option>

              {PRODUCT_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {t(`products.statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("products.filters.category")}
            </span>

            <select
              value={draftFilters.categoryId}
              onChange={(event) =>
                updateDraftFilter("categoryId", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("products.filters.allCategories")}</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getLocalizedValue(category.name, language, category.slug)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("products.filters.fireRated")}
            </span>

            <select
              value={draftFilters.fireRated}
              onChange={(event) =>
                updateDraftFilter("fireRated", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("products.filters.allFireRatings")}</option>

              <option value="true">
                {t("products.filters.fireRatedOnly")}
              </option>

              <option value="false">
                {t("products.filters.nonFireRatedOnly")}
              </option>
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50 xl:flex-none"
            >
              <FiFilter aria-hidden="true" />

              {t("products.actions.search")}
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              aria-label={t("products.actions.clear")}
              title={t("products.actions.clear")}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        {items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {[
                      "product",
                      "model",
                      "category",
                      "type",
                      "status",
                      "home",
                      "fireRated",
                      "order",
                      "actions",
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {t(`products.table.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((product, index) => {
                    const productName = getLocalizedValue(
                      product.name,
                      language,
                      product.model || product.slug,
                    );

                    const categoryName = product.category
                      ? getLocalizedValue(
                          product.category.name,
                          language,
                          product.category.slug,
                        )
                      : categories.find(
                            (category) => category.id === product.categoryId,
                          )
                        ? getLocalizedValue(
                            categories.find(
                              (category) => category.id === product.categoryId,
                            )?.name,
                            language,
                            product.categoryId,
                          )
                        : product.categoryId || "—";

                    const productType = getLocalizedValue(
                      product.productType,
                      language,
                      product.productTypeSlug || "—",
                    );

                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                              <ProductImage
                                product={product}
                                language={language}
                                eager={index === 0}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-72 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                                {productName}
                              </p>

                              <p className="mt-1 max-w-72 truncate font-mono text-xs text-slate-400">
                                {product.slug}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {product.featured ? (
                                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                    {t("products.badges.featured")}
                                  </span>
                                ) : null}

                                {product.showOnHome ? (
                                  <span className="rounded-full bg-[#0979c4]/10 px-2 py-1 text-[10px] font-bold text-[#0979c4] dark:text-sky-300">
                                    {t("products.badges.showOnHome")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {product.model || "—"}
                          </p>

                          {product.sku ? (
                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {product.sku}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {categoryName}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {productType}
                          </p>

                          {product.productTypeSlug ? (
                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {product.productTypeSlug}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-bold",
                              getStatusClassName(product.status),
                            ].join(" ")}
                          >
                            {t(`products.statuses.${product.status}`)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {product.showOnHome
                              ? t("products.badges.showOnHome")
                              : "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {product.fireRated ? (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                              {t("products.badges.fireRated")}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                              {product.sortOrder}
                            </span>

                            {canReorder ? (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMove(product.id, "up")}
                                  aria-label="Move up"
                                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-[#0979c4] disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowUp aria-hidden="true" />
                                </button>

                                <button
                                  type="button"
                                  disabled={index === items.length - 1}
                                  onClick={() => handleMove(product.id, "down")}
                                  aria-label="Move down"
                                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-[#0979c4] disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowDown aria-hidden="true" />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormState({
                                    mode: "edit",
                                    product,
                                  })
                                }
                                aria-label={t("products.actions.edit")}
                                title={t("products.actions.edit")}
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400"
                              >
                                <FiEdit3 aria-hidden="true" />
                              </button>
                            ) : null}

                            {canDelete ? (
                              <button
                                type="button"
                                disabled={processingId === product.id}
                                onClick={() => handleDelete(product)}
                                aria-label={t("products.actions.delete")}
                                title={t("products.actions.delete")}
                                className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400"
                              >
                                {processingId === product.id ? (
                                  <FiLoader
                                    className="animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <FiTrash2 aria-hidden="true" />
                                )}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination?.hasMore ? (
              <footer className="flex justify-center border-t border-slate-200 px-4 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" aria-hidden="true" />
                  ) : (
                    <FiChevronDown aria-hidden="true" />
                  )}

                  {loading
                    ? t("products.actions.loadingMore")
                    : t("products.actions.loadMore")}
                </button>
              </footer>
            ) : null}
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <FiPackage
              aria-hidden="true"
              className="mx-auto text-4xl text-slate-300 dark:text-slate-600"
            />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("products.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("products.empty.filteredDescription")
                : t("products.empty.description")}
            </p>
          </div>
        )}
      </section>

      {formState ? (
        <ProductFormModal
          key={formState.product?.id || "new-product"}
          product={formState.product}
          categories={categories}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
