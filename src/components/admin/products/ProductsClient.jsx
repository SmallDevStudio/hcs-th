"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
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
  FiUploadCloud,
  FiXCircle,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { PRODUCT_STATUSES, PRODUCT_STATUS_VALUES } from "@/constants/products";
import {
  bulkUpdateProducts,
  deleteProduct,
  getProducts,
  reorderProducts,
  updateProduct,
} from "@/services/http/products.api";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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
  canPublish,
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

  const [pageSize, setPageSize] = useState(initialPagination?.limit || 20);

  const [pageNumber, setPageNumber] = useState(1);

  const [pageCursors, setPageCursors] = useState([null]);

  const [selectedIds, setSelectedIds] = useState([]);

  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [statusProcessingId, setStatusProcessingId] = useState(null);

  function updateDraftFilter(field, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  async function requestItems({
    filters,
    cursor,
    limit = pageSize,
    targetPage = 1,
  }) {
    setLoading(true);

    try {
      const result = await getProducts({
        limit,
        cursor,
        search: filters.search || undefined,
        status: filters.status || undefined,
        categoryId: filters.categoryId || undefined,
        fireRated:
          filters.fireRated === "" ? undefined : filters.fireRated === "true",
      });

      setItems(result.items);

      setPagination(result.pagination);
      setPageNumber(targetPage);
      setSelectedIds([]);
      setOrderDirty(false);
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
      cursor: undefined,
      targetPage: 1,
    });

    setPageCursors([null]);
  }

  async function handleClearFilters() {
    setDraftFilters(INITIAL_FILTERS);

    setAppliedFilters(INITIAL_FILTERS);

    await requestItems({
      filters: INITIAL_FILTERS,
      cursor: undefined,
      targetPage: 1,
    });

    setPageCursors([null]);
  }

  async function handleRefresh() {
    await requestItems({
      filters: appliedFilters,
      cursor: pageCursors[pageNumber - 1] || undefined,
      targetPage: pageNumber,
    });
  }

  async function handleNextPage() {
    if (loading || !pagination?.nextCursor) {
      return;
    }

    const nextPage = pageNumber + 1;

    setPageCursors((currentCursors) => {
      const nextCursors = currentCursors.slice(0, pageNumber);
      nextCursors[nextPage - 1] = pagination.nextCursor;
      return nextCursors;
    });

    await requestItems({
      filters: appliedFilters,
      cursor: pagination.nextCursor,
      targetPage: nextPage,
    });
  }

  async function handlePreviousPage() {
    if (loading || pageNumber <= 1) {
      return;
    }

    const previousPage = pageNumber - 1;

    await requestItems({
      filters: appliedFilters,
      cursor: pageCursors[previousPage - 1] || undefined,
      targetPage: previousPage,
    });
  }

  async function handlePageSizeChange(event) {
    const nextPageSize = Number(event.target.value);

    setPageSize(nextPageSize);
    setPageCursors([null]);

    await requestItems({
      filters: appliedFilters,
      cursor: undefined,
      limit: nextPageSize,
      targetPage: 1,
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

      await handleRefresh();

      toast.success(t("products.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("products.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function toggleProductSelection(productId) {
    setSelectedIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((currentId) => currentId !== productId)
        : [...currentIds, productId],
    );
  }

  function toggleCurrentPageSelection() {
    const currentPageIds = items.map((product) => product.id);
    const allSelected = currentPageIds.every((productId) =>
      selectedIds.includes(productId),
    );

    setSelectedIds(allSelected ? [] : currentPageIds);
  }

  async function handleStatusChange(product, status) {
    if (status === product.status) {
      return;
    }

    setStatusProcessingId(product.id);

    try {
      await updateProduct({
        productId: product.id,
        values: { status },
      });

      await handleRefresh();

      toast.success(t("products.messages.statusSuccess"));
    } catch (error) {
      toast.error(error?.message || t("products.messages.statusFailed"));
    } finally {
      setStatusProcessingId(null);
    }
  }

  async function handleBulkAction(action) {
    if (!selectedIds.length || bulkProcessing) {
      return;
    }

    const destructive = action === "delete";

    const confirmation = await Swal.fire({
      title: t(`products.bulk.confirm.${action}.title`),
      text: t(`products.bulk.confirm.${action}.text`, {
        count: selectedIds.length,
      }),
      icon: destructive ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: t(`products.bulk.actions.${action}`),
      cancelButtonText: t("products.actions.cancel"),
      confirmButtonColor: destructive ? "#dc2626" : "#0979c4",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      background: isDarkModeActive() ? "#071522" : "#ffffff",
      color: isDarkModeActive() ? "#f8fafc" : "#0f172a",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setBulkProcessing(true);

    try {
      const result = await bulkUpdateProducts({
        action,
        productIds: selectedIds,
      });

      if (result.failedCount) {
        toast.warning(
          t("products.messages.bulkPartial", {
            success: result.successCount,
            failed: result.failedCount,
          }),
        );

        console.table(result.failed);
      } else {
        toast.success(
          t("products.messages.bulkSuccess", {
            count: result.successCount,
          }),
        );
      }

      if (
        action === "delete" &&
        selectedIds.length === items.length &&
        pageNumber > 1
      ) {
        const previousPage = pageNumber - 1;

        await requestItems({
          filters: appliedFilters,
          cursor: pageCursors[previousPage - 1] || undefined,
          targetPage: previousPage,
        });
      } else {
        await handleRefresh();
      }
    } catch (error) {
      toast.error(error?.message || t("products.messages.bulkFailed"));
    } finally {
      setBulkProcessing(false);
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

  const canReorder =
    canUpdate && !hasFilters && Number(pagination?.total || 0) <= pageSize;

  const allCurrentPageSelected =
    items.length > 0 &&
    items.every((product) => selectedIds.includes(product.id));

  const rangeStart = items.length ? (pageNumber - 1) * pageSize + 1 : 0;

  const rangeEnd = items.length ? rangeStart + items.length - 1 : 0;

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

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {t("products.results.summary", {
              total: pagination?.total || 0,
            })}
          </p>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t("products.results.range", {
              start: rangeStart,
              end: rangeEnd,
              total: pagination?.total || 0,
            })}
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t("products.pagination.perPage")}

          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={loading || bulkProcessing}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedIds.length ? (
        <div className="sticky top-3 z-20 flex flex-col gap-3 rounded-2xl border border-[#0979c4]/30 bg-sky-50 p-4 shadow-lg shadow-sky-950/5 dark:border-sky-800 dark:bg-sky-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-sky-900 dark:text-sky-100">
              {t("products.bulk.selected", {
                count: selectedIds.length,
              })}
            </p>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={bulkProcessing}
              className="mt-1 text-xs font-bold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            >
              {t("products.bulk.clearSelection")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {canPublish ? (
              <>
                <button
                  type="button"
                  onClick={() => handleBulkAction("publish")}
                  disabled={bulkProcessing}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold !text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <FiUploadCloud aria-hidden="true" />
                  {t("products.bulk.actions.publish")}
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkAction("unpublish")}
                  disabled={bulkProcessing}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300"
                >
                  <FiXCircle aria-hidden="true" />
                  {t("products.bulk.actions.unpublish")}
                </button>
              </>
            ) : null}

            {canUpdate ? (
              <button
                type="button"
                onClick={() => handleBulkAction("deactivate")}
                disabled={bulkProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <FiXCircle aria-hidden="true" />
                {t("products.bulk.actions.deactivate")}
              </button>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={() => handleBulkAction("delete")}
                disabled={bulkProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold !text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <FiLoader className="animate-spin" aria-hidden="true" />
                ) : (
                  <FiTrash2 aria-hidden="true" />
                )}
                {t("products.bulk.actions.delete")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        {items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1230px]">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={toggleCurrentPageSelection}
                        aria-label={t("products.bulk.selectPage")}
                        className="size-4 rounded border-slate-300 text-[#0979c4] accent-[#0979c4]"
                      />
                    </th>

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
                        className={[
                          "transition hover:bg-slate-50 dark:hover:bg-slate-900/50",
                          selectedIds.includes(product.id)
                            ? "bg-sky-50/70 dark:bg-sky-950/30"
                            : "",
                        ].join(" ")}
                      >
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            aria-label={t("products.bulk.selectProduct", {
                              name: productName,
                            })}
                            className="mt-7 size-4 rounded border-slate-300 text-[#0979c4] accent-[#0979c4]"
                          />
                        </td>

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
                          {canUpdate || canPublish ? (
                            <div className="relative inline-flex items-center">
                              <select
                                value={product.status}
                                onChange={(event) =>
                                  handleStatusChange(
                                    product,
                                    event.target.value,
                                  )
                                }
                                disabled={
                                  statusProcessingId === product.id ||
                                  bulkProcessing
                                }
                                aria-label={t("products.quickStatus", {
                                  name: productName,
                                })}
                                className={[
                                  "h-9 appearance-none rounded-full border-0 py-1 pl-3 pr-8 text-xs font-bold outline-none ring-1 ring-inset ring-current/10 disabled:opacity-50",
                                  getStatusClassName(product.status),
                                ].join(" ")}
                              >
                                {PRODUCT_STATUS_VALUES.map((status) => {
                                  const requiresPublishPermission =
                                    status === PRODUCT_STATUSES.PUBLISHED ||
                                    product.status ===
                                      PRODUCT_STATUSES.PUBLISHED;

                                  return (
                                    <option
                                      key={status}
                                      value={status}
                                      disabled={
                                        requiresPublishPermission
                                          ? !canPublish
                                          : !canUpdate
                                      }
                                    >
                                      {t(`products.statuses.${status}`)}
                                    </option>
                                  );
                                })}
                              </select>

                              {statusProcessingId === product.id ? (
                                <FiLoader
                                  aria-hidden="true"
                                  className="pointer-events-none absolute right-2.5 animate-spin"
                                />
                              ) : (
                                <FiChevronRight
                                  aria-hidden="true"
                                  className="pointer-events-none absolute right-2.5 rotate-90"
                                />
                              )}
                            </div>
                          ) : (
                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-bold",
                                getStatusClassName(product.status),
                              ].join(" ")}
                            >
                              {t(`products.statuses.${product.status}`)}
                            </span>
                          )}
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

            <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t("products.pagination.page", {
                  page: pageNumber,
                  totalPages: pagination?.totalPages || 1,
                })}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={loading || pageNumber <= 1}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <FiChevronLeft aria-hidden="true" />
                  {t("products.pagination.previous")}
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={loading || !pagination?.hasMore}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {t("products.pagination.next")}
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </footer>
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
