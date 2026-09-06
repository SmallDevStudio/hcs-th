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
  FiFolder,
  FiImage,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import CategoryIcon from "@/components/common/CategoryIcon";
import { CATEGORY_STATUS_VALUES } from "@/constants/categories";
import {
  deleteCategory,
  getCategories,
  reorderCategories,
} from "@/services/http/categories.api";

const INITIAL_FILTERS = {
  search: "",
  status: "",
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

function CategoryImage({ category, eager = false }) {
  const { i18n } = useTranslation("admin");

  const name =
    category.name?.[i18n.resolvedLanguage] ||
    category.name?.en ||
    category.slug;

  if (category.image?.publicUrl) {
    return (
      <Image
        src={category.image.publicUrl}
        alt={
          category.image.altText?.[i18n.resolvedLanguage] ||
          category.image.altText?.en ||
          name
        }
        fill
        unoptimized
        loading={eager ? "eager" : "lazy"}
        sizes="64px"
        className="object-cover"
      />
    );
  }

  return (
    <FiImage
      className="text-2xl text-slate-300 dark:text-slate-600"
      aria-hidden="true"
    />
  );
}

export function CategoriesClient({
  initialItems,
  initialPagination,
  canCreate,
  canUpdate,
  canDelete,
}) {
  const { t, i18n } = useTranslation("admin");

  const [items, setItems] = useState(initialItems);

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
      const result = await getCategories({
        limit: 25,
        cursor,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });

      setItems((currentItems) =>
        append ? [...currentItems, ...result.items] : result.items,
      );

      setPagination(result.pagination);

      if (!append) {
        setOrderDirty(false);
      }
    } catch (error) {
      toast.error(error?.message || t("categories.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    const normalizedFilters = {
      search: draftFilters.search.trim(),

      status: draftFilters.status,
    };

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

  function handleSaved(savedCategory) {
    setItems((currentItems) => {
      const exists = currentItems.some(
        (category) => category.id === savedCategory.id,
      );

      const nextItems = exists
        ? currentItems.map((category) =>
            category.id === savedCategory.id ? savedCategory : category,
          )
        : [savedCategory, ...currentItems];

      return [...nextItems].sort(
        (first, second) => first.sortOrder - second.sortOrder,
      );
    });

    setFormState(null);
  }

  async function handleDelete(category) {
    const confirmation = await Swal.fire(
      createDeleteConfirmation({
        darkMode: isDarkModeActive(),

        title: t("categories.confirmDelete.title"),

        text: t("categories.confirmDelete.text"),

        confirmText: t("categories.confirmDelete.confirm"),

        cancelText: t("categories.confirmDelete.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(category.id);

    try {
      await deleteCategory(category.id);

      setItems((currentItems) =>
        currentItems.filter(
          (currentCategory) => currentCategory.id !== category.id,
        ),
      );

      toast.success(t("categories.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("categories.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function handleMove(categoryId, direction) {
    setItems((currentItems) => {
      const currentIndex = currentItems.findIndex(
        (category) => category.id === categoryId,
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

      return nextItems.map((category, index) => ({
        ...category,
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
      await reorderCategories({
        items: items.map((category) => ({
          categoryId: category.id,

          sortOrder: category.sortOrder,
        })),
      });

      setOrderDirty(false);

      toast.success(t("categories.messages.orderSuccess"));
    } catch (error) {
      toast.error(error?.message || t("categories.messages.orderFailed"));
    } finally {
      setSavingOrder(false);
    }
  }

  const hasFilters =
    Boolean(appliedFilters.search) || Boolean(appliedFilters.status);

  const canReorder = canUpdate && !hasFilters && !pagination?.hasMore;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("categories.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("categories.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("categories.description")}
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

              {t("categories.actions.saveOrder")}
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

            {t("categories.actions.refresh")}
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  category: null,
                })
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa]"
            >
              <FiPlus aria-hidden="true" />

              {t("categories.actions.create")}
            </button>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(240px,1fr)_220px_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("categories.filters.search")}
            </span>

            <span className="relative block">
              <FiSearch
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={draftFilters.search}
                onChange={(event) =>
                  updateDraftFilter("search", event.target.value)
                }
                placeholder={t("categories.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("categories.filters.status")}
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) =>
                updateDraftFilter("status", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("categories.filters.allStatuses")}</option>

              {CATEGORY_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {t(`categories.statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50 sm:flex-none"
            >
              <FiFilter aria-hidden="true" />

              {t("categories.actions.search")}
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              aria-label={t("categories.actions.clear")}
              title={t("categories.actions.clear")}
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
              <table className="w-full min-w-[950px]">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {[
                      "category",
                      "slug",
                      "status",
                      "products",
                      "order",
                      "home",
                      "actions",
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {t(`categories.table.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((category, index) => {
                    const name =
                      category.name?.[i18n.resolvedLanguage] ||
                      category.name?.en ||
                      category.slug;

                    return (
                      <tr
                        key={category.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                              <CategoryImage
                                category={category}
                                eager={index === 0}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-64 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                                {name}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0979c4]/10 px-2 py-1 text-[10px] font-bold text-[#0979c4] dark:text-sky-300">
                                  <CategoryIcon
                                    icon={category.icon}
                                    className="size-3.5"
                                  />

                                  {t(`categories.icons.${category.icon}`)}
                                </span>

                                {category.featured ? (
                                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                    {t("categories.badges.featured")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {category.slug}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-bold",
                              category.status === "active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                            ].join(" ")}
                          >
                            {t(`categories.statuses.${category.status}`)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                          {category.productCount}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                              {category.sortOrder}
                            </span>

                            {canReorder ? (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMove(category.id, "up")}
                                  aria-label="Move up"
                                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-[#0979c4] disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowUp />
                                </button>

                                <button
                                  type="button"
                                  disabled={index === items.length - 1}
                                  onClick={() =>
                                    handleMove(category.id, "down")
                                  }
                                  aria-label="Move down"
                                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-[#0979c4] disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowDown />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {category.showOnHome
                              ? t("categories.badges.shownOnHome")
                              : t("categories.badges.hiddenFromHome")}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormState({
                                    mode: "edit",
                                    category,
                                  })
                                }
                                aria-label={t("categories.actions.edit")}
                                title={t("categories.actions.edit")}
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400"
                              >
                                <FiEdit3 />
                              </button>
                            ) : null}

                            {canDelete ? (
                              <button
                                type="button"
                                disabled={processingId === category.id}
                                onClick={() => handleDelete(category)}
                                aria-label={t("categories.actions.delete")}
                                title={t("categories.actions.delete")}
                                className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400"
                              >
                                {processingId === category.id ? (
                                  <FiLoader className="animate-spin" />
                                ) : (
                                  <FiTrash2 />
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

            <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("categories.pagination.showing", {
                  count: items.length,
                })}
              </p>

              {pagination?.hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <FiChevronDown />

                  {loading
                    ? t("categories.actions.loading")
                    : t("categories.actions.loadMore")}
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  {t("categories.pagination.end")}
                </p>
              )}
            </footer>
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <FiFolder className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {hasFilters
                ? t("categories.empty.filteredTitle")
                : t("categories.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("categories.empty.filteredDescription")
                : t("categories.empty.description")}
            </p>
          </div>
        )}
      </section>

      {formState ? (
        <CategoryFormModal
          key={formState.category?.id || "new-category"}
          category={formState.category}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
