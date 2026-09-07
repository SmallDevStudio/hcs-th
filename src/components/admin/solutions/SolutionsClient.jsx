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
  FiLayers,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { SolutionFormModal } from "@/components/admin/solutions/SolutionFormModal";
import {
  SOLUTION_STATUSES,
  SOLUTION_STATUS_VALUES,
} from "@/constants/solutions";
import {
  deleteSolution,
  getSolutions,
  reorderSolutions,
} from "@/services/http/solutions.api";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  featured: "",
  showOnHome: "",
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

function parseBooleanFilter(value) {
  if (value === "") {
    return undefined;
  }

  return value === "true";
}

function getStatusClassName(status) {
  if (status === SOLUTION_STATUSES.PUBLISHED) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

function SolutionImage({ solution, language, eager = false }) {
  const solutionName = getLocalizedValue(
    solution.name,
    language,
    solution.slug,
  );

  if (solution.image?.publicUrl) {
    return (
      <Image
        src={solution.image.publicUrl}
        alt={
          getLocalizedValue(solution.image.altText, language, solutionName) ||
          solutionName
        }
        fill
        unoptimized
        loading={eager ? "eager" : "lazy"}
        sizes="96px"
        className="object-cover"
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

export function SolutionsClient({
  initialItems,
  initialPagination,
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
      const result = await getSolutions({
        limit: 25,
        cursor,
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        featured: parseBooleanFilter(filters.featured),
        showOnHome: parseBooleanFilter(filters.showOnHome),
      });

      setItems((currentItems) =>
        append ? [...currentItems, ...result.items] : result.items,
      );

      setPagination(result.pagination);

      if (!append) {
        setOrderDirty(false);
      }
    } catch (error) {
      toast.error(error?.message || t("solutions.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    const normalizedFilters = {
      ...draftFilters,
      search: draftFilters.search.trim(),
    };

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

  function handleSaved(savedSolution) {
    setItems((currentItems) => {
      const exists = currentItems.some(
        (solution) => solution.id === savedSolution.id,
      );

      const nextItems = exists
        ? currentItems.map((solution) =>
            solution.id === savedSolution.id ? savedSolution : solution,
          )
        : [savedSolution, ...currentItems];

      return [...nextItems].sort(
        (firstSolution, secondSolution) =>
          firstSolution.sortOrder - secondSolution.sortOrder,
      );
    });

    setFormState(null);
  }

  async function handleDelete(solution) {
    const confirmation = await Swal.fire(
      createDeleteConfirmation({
        darkMode: isDarkModeActive(),
        title: t("solutions.confirmDelete.title"),
        text: t("solutions.confirmDelete.text"),
        confirmText: t("solutions.confirmDelete.confirm"),
        cancelText: t("solutions.confirmDelete.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(solution.id);

    try {
      await deleteSolution(solution.id);

      setItems((currentItems) =>
        currentItems.filter(
          (currentSolution) => currentSolution.id !== solution.id,
        ),
      );

      toast.success(t("solutions.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("solutions.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function handleMove(solutionId, direction) {
    setItems((currentItems) => {
      const currentIndex = currentItems.findIndex(
        (solution) => solution.id === solutionId,
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

      return nextItems.map((solution, index) => ({
        ...solution,
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
      await reorderSolutions({
        items: items.map((solution) => ({
          solutionId: solution.id,
          sortOrder: solution.sortOrder,
        })),
      });

      setOrderDirty(false);

      toast.success(t("solutions.messages.orderSuccess"));
    } catch (error) {
      toast.error(error?.message || t("solutions.messages.orderFailed"));
    } finally {
      setSavingOrder(false);
    }
  }

  const hasFilters =
    Boolean(appliedFilters.search) ||
    Boolean(appliedFilters.status) ||
    appliedFilters.featured !== "" ||
    appliedFilters.showOnHome !== "";

  const canReorder = canUpdate && !hasFilters && !pagination?.hasMore;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("solutions.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("solutions.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("solutions.description")}
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

              {t("solutions.actions.saveOrder")}
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

            {t("solutions.actions.refresh")}
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  solution: null,
                })
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa]"
            >
              <FiPlus aria-hidden="true" />

              {t("solutions.actions.create")}
            </button>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_180px_190px_190px_auto] xl:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("solutions.filters.search")}
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
                placeholder={t("solutions.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("solutions.filters.status")}
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) =>
                updateDraftFilter("status", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("solutions.filters.allStatuses")}</option>

              {SOLUTION_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {t(`solutions.statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("solutions.filters.featured")}
            </span>

            <select
              value={draftFilters.featured}
              onChange={(event) =>
                updateDraftFilter("featured", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("solutions.filters.allFeatured")}</option>

              <option value="true">
                {t("solutions.filters.featuredOnly")}
              </option>

              <option value="false">
                {t("solutions.filters.nonFeaturedOnly")}
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("solutions.filters.home")}
            </span>

            <select
              value={draftFilters.showOnHome}
              onChange={(event) =>
                updateDraftFilter("showOnHome", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("solutions.filters.allHome")}</option>

              <option value="true">
                {t("solutions.filters.showOnHomeOnly")}
              </option>

              <option value="false">
                {t("solutions.filters.hiddenFromHomeOnly")}
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

              {t("solutions.actions.search")}
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              aria-label={t("solutions.actions.clear")}
              title={t("solutions.actions.clear")}
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
                      "solution",
                      "icon",
                      "status",
                      "featured",
                      "home",
                      "order",
                      "actions",
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {t(`solutions.table.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((solution, index) => {
                    const solutionName = getLocalizedValue(
                      solution.name,
                      language,
                      solution.slug,
                    );

                    return (
                      <tr
                        key={solution.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                              <SolutionImage
                                solution={solution}
                                language={language}
                                eager={index === 0}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-80 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                                {solutionName}
                              </p>

                              <p className="mt-1 max-w-80 truncate font-mono text-xs text-slate-400">
                                {solution.slug}
                              </p>

                              <p className="mt-2 max-w-96 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {getLocalizedValue(
                                  solution.shortDescription,
                                  language,
                                  "—",
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {solution.icon || "building"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-bold",
                              getStatusClassName(solution.status),
                            ].join(" ")}
                          >
                            {t(`solutions.statuses.${solution.status}`)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {solution.featured ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              {t("solutions.badges.featured")}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {solution.showOnHome ? (
                            <span className="rounded-full bg-[#0979c4]/10 px-2.5 py-1 text-xs font-bold text-[#0979c4] dark:text-sky-300">
                              {t("solutions.badges.showOnHome")}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                              {solution.sortOrder}
                            </span>

                            {canReorder ? (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMove(solution.id, "up")}
                                  aria-label="Move up"
                                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-[#0979c4] disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowUp aria-hidden="true" />
                                </button>

                                <button
                                  type="button"
                                  disabled={index === items.length - 1}
                                  onClick={() =>
                                    handleMove(solution.id, "down")
                                  }
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
                                    solution,
                                  })
                                }
                                aria-label={t("solutions.actions.edit")}
                                title={t("solutions.actions.edit")}
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400"
                              >
                                <FiEdit3 aria-hidden="true" />
                              </button>
                            ) : null}

                            {canDelete ? (
                              <button
                                type="button"
                                disabled={processingId === solution.id}
                                onClick={() => handleDelete(solution)}
                                aria-label={t("solutions.actions.delete")}
                                title={t("solutions.actions.delete")}
                                className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400"
                              >
                                {processingId === solution.id ? (
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

            {pagination?.hasMore && pagination?.nextCursor ? (
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
                    ? t("solutions.actions.loadingMore")
                    : t("solutions.actions.loadMore")}
                </button>
              </footer>
            ) : null}
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <FiLayers
              aria-hidden="true"
              className="mx-auto text-4xl text-slate-300 dark:text-slate-600"
            />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("solutions.empty.filteredDescription")
                : t("solutions.empty.description")}
            </p>
          </div>
        )}
      </section>

      {formState ? (
        <SolutionFormModal
          key={formState.solution?.id || "new-solution"}
          solution={formState.solution}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
