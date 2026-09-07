"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "sonner";

import { StandardFormModal } from "@/components/admin/standards/StandardFormModal";
import {
  STANDARD_DOCUMENT_TYPE_VALUES,
  STANDARD_LANGUAGE_VALUES,
  STANDARD_STATUS_VALUES,
} from "@/constants/standards";
import {
  deleteStandard,
  getStandards,
  reorderStandards,
} from "@/services/http/standards.api";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  documentType: "",
  documentLanguage: "",
};

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function StatusBadge({ status, label }) {
  const classNames = {
    published:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",

    draft:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",

    inactive:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
        classNames[status] || classNames.inactive
      }`}
    >
      {label}
    </span>
  );
}

export function StandardsClient({
  initialStandards = [],
  initialPagination = null,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const locale = i18n.resolvedLanguage === "th" ? "th" : "en";

  const [standards, setStandards] = useState(
    Array.isArray(initialStandards) ? initialStandards : [],
  );

  const [pagination, setPagination] = useState(
    initialPagination || {
      limit: 25,
      count: initialStandards.length,
      hasMore: false,
      nextCursor: null,
    },
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);

  const [editingStandard, setEditingStandard] = useState(null);

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  const orderedStandards = useMemo(
    () =>
      [...standards].sort(
        (firstStandard, secondStandard) =>
          Number(firstStandard.sortOrder || 0) -
          Number(secondStandard.sortOrder || 0),
      ),
    [standards],
  );

  async function loadStandards({
    nextFilters = appliedFilters,
    cursor,
    append = false,
  } = {}) {
    setLoading(true);

    try {
      const result = await getStandards({
        limit: 25,

        cursor,

        status: nextFilters.status || undefined,

        documentType: nextFilters.documentType || undefined,

        documentLanguage: nextFilters.documentLanguage || undefined,

        search: nextFilters.search || undefined,
      });

      setStandards((currentItems) =>
        append
          ? [
              ...currentItems,
              ...result.items.filter(
                (incomingItem) =>
                  !currentItems.some(
                    (currentItem) => currentItem.id === incomingItem.id,
                  ),
              ),
            ]
          : result.items,
      );

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("standards.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    const nextFilters = {
      ...filters,

      search: filters.search.trim(),
    };

    setAppliedFilters(nextFilters);

    await loadStandards({
      nextFilters,
    });
  }

  async function handleReset() {
    setFilters(DEFAULT_FILTERS);

    setAppliedFilters(DEFAULT_FILTERS);

    await loadStandards({
      nextFilters: DEFAULT_FILTERS,
    });
  }

  async function handleRefresh() {
    await loadStandards();
  }

  function openCreateForm() {
    setEditingStandard(null);
    setFormOpen(true);
  }

  function openEditForm(standard) {
    setEditingStandard(standard);

    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingStandard(null);
  }

  async function handleSaved() {
    await loadStandards();
  }

  async function handleDelete(standard) {
    const standardName = getLocalizedValue(
      standard.name,
      locale,
      standard.code,
    );

    const confirmed = window.confirm(
      `${t(
        "standards.confirmDelete.title",
      )}\n\n${standard.code} — ${standardName}`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      await deleteStandard(standard.id);

      toast.success(t("standards.messages.deleteSuccess"));

      await loadStandards();
    } catch (error) {
      toast.error(error?.message || t("standards.messages.deleteFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function moveStandard(standardId, direction) {
    const currentIndex = orderedStandards.findIndex(
      (standard) => standard.id === standardId,
    );

    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= orderedStandards.length
    ) {
      return;
    }

    const reorderedItems = [...orderedStandards];

    [reorderedItems[currentIndex], reorderedItems[nextIndex]] = [
      reorderedItems[nextIndex],
      reorderedItems[currentIndex],
    ];

    const normalizedItems = reorderedItems.map((standard, index) => ({
      ...standard,
      sortOrder: (index + 1) * 10,
    }));

    setStandards(normalizedItems);

    try {
      await reorderStandards({
        items: normalizedItems.map((standard) => ({
          standardId: standard.id,

          sortOrder: standard.sortOrder,
        })),
      });

      toast.success(t("standards.messages.reorderSuccess"));
    } catch (error) {
      setStandards(orderedStandards);

      toast.error(error?.message || t("standards.messages.reorderFailed"));
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
              {t("standards.page.eyebrow")}
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 dark:text-white">
              {t("standards.page.title")}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("standards.page.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={loading ? "animate-spin" : ""}
              />

              {t("standards.actions.refresh")}
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
              >
                <FiPlus aria-hidden="true" />

                {t("standards.actions.add")}
              </button>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_220px_190px_auto]">
            <label className="relative block">
              <span className="sr-only">
                {t("standards.filters.searchLabel")}
              </span>

              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={filters.search}
                onChange={(event) =>
                  setFilters((currentFilters) => ({
                    ...currentFilters,

                    search: event.currentTarget.value,
                  }))
                }
                placeholder={t("standards.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,

                  status: event.currentTarget.value,
                }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">{t("standards.filters.allStatuses")}</option>

              {STANDARD_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`standards.status.${value}`)}
                </option>
              ))}
            </select>

            <select
              value={filters.documentType}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,

                  documentType: event.currentTarget.value,
                }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">
                {t("standards.filters.allDocumentTypes")}
              </option>

              {STANDARD_DOCUMENT_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`standards.documentTypes.${value}`)}
                </option>
              ))}
            </select>

            <select
              value={filters.documentLanguage}
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,

                  documentLanguage: event.currentTarget.value,
                }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">{t("standards.filters.allLanguages")}</option>

              {STANDARD_LANGUAGE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`standards.languages.${value}`)}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                <FiFilter aria-hidden="true" />

                {t("standards.actions.search")}
              </button>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  aria-label={t("standards.actions.reset")}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700"
                >
                  <FiRefreshCw aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {orderedStandards.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950/50">
                    {[
                      "standard",
                      "documentType",
                      "language",
                      "categories",
                      "products",
                      "status",
                      "home",
                      "order",
                      "actions",
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500"
                      >
                        {t(`standards.table.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orderedStandards.map((standard, index) => {
                    const standardName = getLocalizedValue(
                      standard.name,
                      locale,
                      standard.code,
                    );

                    return (
                      <tr
                        key={standard.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                              <FiFileText />
                            </div>

                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-950 dark:text-white">
                                {standard.code}
                              </p>

                              <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                                {standardName}
                              </p>

                              {standard.featured ? (
                                <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                  {t("standards.table.featured")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {t(
                            `standards.documentTypes.${standard.documentType}`,
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {t(
                            `standards.languages.${standard.documentLanguage}`,
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {t("standards.table.categoryCount", {
                            count: standard.relatedCategoryIds?.length || 0,
                          })}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {t("standards.table.productCount", {
                            count: standard.relatedProductIds?.length || 0,
                          })}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            status={standard.status}
                            label={t(`standards.status.${standard.status}`)}
                          />
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold">
                          {standard.showOnHome ? (
                            <span className="text-primary">
                              {t("standards.table.showOnHome")}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {t("standards.table.notShown")}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-7 text-center text-xs font-bold">
                              {standard.sortOrder}
                            </span>

                            {canUpdate ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => moveStandard(standard.id, -1)}
                                  disabled={loading || index === 0}
                                  className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowUp />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => moveStandard(standard.id, 1)}
                                  disabled={
                                    loading ||
                                    index === orderedStandards.length - 1
                                  }
                                  className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowDown />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() => openEditForm(standard)}
                                className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-700"
                              >
                                <FiEdit2 />
                              </button>
                            ) : null}

                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(standard)}
                                className="flex size-9 items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                              >
                                <FiTrash2 />
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
          ) : (
            <div className="px-6 py-16 text-center">
              <FiFileText className="mx-auto size-10 text-slate-300" />

              <h2 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
                {t(
                  hasActiveFilters
                    ? "standards.empty.filteredTitle"
                    : "standards.empty.title",
                )}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {t(
                  hasActiveFilters
                    ? "standards.empty.filteredDescription"
                    : "standards.empty.description",
                )}
              </p>
            </div>
          )}

          {pagination.hasMore ? (
            <div className="border-t border-slate-200 p-4 text-center dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  loadStandards({
                    cursor: pagination.nextCursor,
                    append: true,
                  })
                }
                disabled={loading}
                className="rounded-xl border border-primary px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
              >
                {t(
                  loading
                    ? "standards.pagination.loading"
                    : "standards.pagination.loadMore",
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {formOpen ? (
        <StandardFormModal
          standard={editingStandard}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
