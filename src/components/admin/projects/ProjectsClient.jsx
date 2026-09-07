"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit3,
  FiImage,
  FiLoader,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { ProjectFormModal } from "@/components/admin/projects/ProjectFormModal";
import {
  PROJECT_BUILDING_TYPE_VALUES,
  PROJECT_STATUS_VALUES,
} from "@/constants/projects";
import {
  deleteProject,
  getProjects,
  reorderProjects,
} from "@/services/http/projects.api";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  buildingType: "",
  featured: "",
};

function localizedValue(value, locale) {
  return value?.[locale] || value?.en || value?.th || "";
}

function statusClassName(status) {
  return status === "published"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

export function ProjectsClient({
  initialItems = [],
  initialPagination,
  products = [],
  solutions = [],
  canCreate,
  canUpdate,
  canDelete,
}) {
  const { t, i18n } = useTranslation("admin");

  const locale = i18n.resolvedLanguage || i18n.language || "en";

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
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function requestItems({ filters, cursor, append = false }) {
    setLoading(true);

    try {
      const result = await getProjects({
        limit: 25,
        cursor,
        search: filters.search || undefined,
        status: filters.status || undefined,
        buildingType: filters.buildingType || undefined,
        featured:
          filters.featured === "" ? undefined : filters.featured === "true",
      });

      setItems((current) =>
        append ? [...current, ...result.items] : result.items,
      );

      setPagination(result.pagination);
      setOrderDirty(false);
    } catch (error) {
      toast.error(error?.message || t("projects.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilters(event) {
    event.preventDefault();

    const nextFilters = {
      ...draftFilters,
      search: draftFilters.search.trim(),
    };

    setAppliedFilters(nextFilters);

    void requestItems({
      filters: nextFilters,
    });
  }

  function handleResetFilters() {
    setDraftFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);

    void requestItems({
      filters: INITIAL_FILTERS,
    });
  }

  function handleRefresh() {
    void requestItems({
      filters: appliedFilters,
    });
  }

  function handleLoadMore() {
    if (!pagination?.hasMore || !pagination?.nextCursor) {
      return;
    }

    void requestItems({
      filters: appliedFilters,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  function handleSaved(savedProject) {
    setItems((current) => {
      const exists = current.some((project) => project.id === savedProject.id);

      const nextItems = exists
        ? current.map((project) =>
            project.id === savedProject.id ? savedProject : project,
          )
        : [savedProject, ...current];

      return [...nextItems].sort(
        (first, second) =>
          Number(first.sortOrder || 0) - Number(second.sortOrder || 0),
      );
    });

    setFormState(null);
  }

  async function handleDelete(project) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: t("projects.confirmDelete.title"),
      text: t("projects.confirmDelete.text"),
      showCancelButton: true,
      confirmButtonText: t("projects.confirmDelete.confirm"),
      cancelButtonText: t("projects.confirmDelete.cancel"),
      confirmButtonColor: "#dc2626",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(project.id);

    try {
      await deleteProject(project.id);

      setItems((current) =>
        current.filter((currentProject) => currentProject.id !== project.id),
      );

      toast.success(t("projects.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("projects.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function handleMove(projectId, direction) {
    setItems((current) => {
      const currentIndex = current.findIndex(
        (project) => project.id === projectId,
      );

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const nextItems = [...current];

      [nextItems[currentIndex], nextItems[targetIndex]] = [
        nextItems[targetIndex],
        nextItems[currentIndex],
      ];

      return nextItems.map((project, index) => ({
        ...project,
        sortOrder: (index + 1) * 10,
      }));
    });

    setOrderDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);

    try {
      await reorderProjects({
        items: items.map((project) => ({
          projectId: project.id,
          sortOrder: project.sortOrder,
        })),
      });

      setOrderDirty(false);

      toast.success(t("projects.messages.reorderSuccess"));
    } catch (error) {
      toast.error(error?.message || t("projects.messages.reorderFailed"));
    } finally {
      setSavingOrder(false);
    }
  }

  const hasFilters = Object.values(appliedFilters).some(Boolean);

  return (
    <div>
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0979c4] dark:text-sky-400">
            {t("projects.page.eyebrow")}
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {t("projects.page.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("projects.page.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canUpdate && orderDirty ? (
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

              {t("projects.actions.saveOrder")}
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

            {t("projects.actions.refresh")}
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  project: null,
                })
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa]"
            >
              <FiPlus aria-hidden="true" />

              {t("projects.actions.create")}
            </button>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={handleApplyFilters}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_180px_220px_180px_auto] xl:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("projects.filters.search")}
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
                placeholder={t("projects.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("projects.filters.status")}
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) =>
                updateDraftFilter("status", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("projects.filters.allStatuses")}</option>

              {PROJECT_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {t(`projects.statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("projects.filters.buildingType")}
            </span>

            <select
              value={draftFilters.buildingType}
              onChange={(event) =>
                updateDraftFilter("buildingType", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("projects.filters.allBuildingTypes")}</option>

              {PROJECT_BUILDING_TYPE_VALUES.map((buildingType) => (
                <option key={buildingType} value={buildingType}>
                  {t(`projects.buildingTypes.${buildingType}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("projects.filters.featured")}
            </span>

            <select
              value={draftFilters.featured}
              onChange={(event) =>
                updateDraftFilter("featured", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("projects.filters.allFeatured")}</option>

              <option value="true">{t("projects.filters.featuredOnly")}</option>
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white disabled:opacity-50"
            >
              <FiSearch aria-hidden="true" />

              {t("projects.actions.search")}
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading}
              aria-label={t("projects.actions.reset")}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40">
                  {[
                    "project",
                    "location",
                    "buildingType",
                    "year",
                    "status",
                    "home",
                    "featured",
                    "order",
                    "actions",
                  ].map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"
                    >
                      {t(`projects.table.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items.map((project, index) => {
                  const projectName = localizedValue(project.name, locale);

                  const location = localizedValue(project.location, locale);

                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                    >
                      <td className="px-4 py-4">
                        <div className="flex min-w-[280px] items-center gap-3">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                            {project.coverImage?.publicUrl ? (
                              <Image
                                src={project.coverImage.publicUrl}
                                alt={projectName}
                                fill
                                unoptimized
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-slate-300">
                                <FiImage aria-hidden="true" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                              {projectName || project.slug}
                            </p>

                            <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                              {project.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex max-w-[220px] items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <FiMapPin
                            className="shrink-0 text-[#0979c4]"
                            aria-hidden="true"
                          />

                          <span className="truncate">{location || "—"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {t(`projects.buildingTypes.${project.buildingType}`)}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {project.year || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            statusClassName(project.status),
                          ].join(" ")}
                        >
                          {t(`projects.statuses.${project.status}`)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                        {project.showOnHome
                          ? t("projects.table.showOnHome")
                          : t("projects.table.notShown")}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                        {project.featured
                          ? t("projects.table.featured")
                          : t("projects.table.notShown")}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-sm font-bold text-slate-700 dark:text-slate-200">
                            {project.sortOrder}
                          </span>

                          {canUpdate ? (
                            <>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMove(project.id, "up")}
                                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
                              >
                                <FiArrowUp aria-hidden="true" />
                              </button>

                              <button
                                type="button"
                                disabled={index === items.length - 1}
                                onClick={() => handleMove(project.id, "down")}
                                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
                              >
                                <FiArrowDown aria-hidden="true" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {canUpdate ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFormState({
                                  mode: "edit",
                                  project,
                                })
                              }
                              aria-label={t("projects.actions.edit")}
                              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-[#0979c4] dark:border-slate-700"
                            >
                              <FiEdit3 aria-hidden="true" />
                            </button>
                          ) : null}

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(project)}
                              disabled={processingId === project.id}
                              aria-label={t("projects.actions.delete")}
                              className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 disabled:opacity-40 dark:border-red-900"
                            >
                              {processingId === project.id ? (
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
        ) : (
          <div className="px-5 py-16 text-center">
            <FiImage
              className="mx-auto text-4xl text-slate-300"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("projects.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("projects.empty.filteredDescription")
                : t("projects.empty.description")}
            </p>
          </div>
        )}
      </section>

      {pagination?.hasMore ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300"
          >
            {loading ? (
              <FiLoader className="animate-spin" aria-hidden="true" />
            ) : null}

            {t("projects.actions.loadMore")}
          </button>
        </div>
      ) : null}

      {formState ? (
        <ProjectFormModal
          key={formState.project?.id || "new-project"}
          project={formState.project}
          products={products}
          solutions={solutions}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
