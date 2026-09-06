"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiChevronDown,
  FiFilter,
  FiGrid,
  FiImage,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { MediaAssetCard } from "@/components/admin/media/MediaAssetCard";
import { MediaEditModal } from "@/components/admin/media/MediaEditModal";
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal";
import {
  MEDIA_FOLDERS,
  MEDIA_FOLDER_VALUES,
  MEDIA_TYPE_VALUES,
} from "@/constants/media";
import { deleteMediaAsset, getMediaAssets } from "@/services/http/media.api";

const INITIAL_FILTERS = {
  search: "",
  type: "",
  folder: "",
  usage: "all",
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

export function MediaLibraryClient({
  initialItems,
  initialPagination,
  canUpload,
  canUpdate,
  canDelete,
}) {
  const { t } = useTranslation("admin");

  const [items, setItems] = useState(initialItems);
  const [pagination, setPagination] = useState(initialPagination);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [processingId, setProcessingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  function updateDraftFilter(field, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  async function requestItems({ filters, cursor, append = false }) {
    setLoading(true);

    try {
      const result = await getMediaAssets({
        limit: 24,
        cursor,
        type: filters.type || undefined,
        folder: filters.folder || undefined,
        search: filters.search || undefined,
        usage: filters.usage,
      });

      setItems((currentItems) =>
        append ? [...currentItems, ...result.items] : result.items,
      );

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("media.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    const normalizedFilters = {
      search: draftFilters.search.trim(),
      type: draftFilters.type,
      folder: draftFilters.folder,
      usage: draftFilters.usage,
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

  function handleUploaded(uploadedAssets) {
    setItems((currentItems) => {
      const uploadedIds = new Set(uploadedAssets.map((asset) => asset.id));

      return [
        ...uploadedAssets,
        ...currentItems.filter((asset) => !uploadedIds.has(asset.id)),
      ];
    });

    setUploadOpen(false);

    toast.success(t("media.messages.uploadComplete"));
  }

  function handleSaved(updatedAsset) {
    setItems((currentItems) =>
      currentItems.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset,
      ),
    );

    setEditingAsset(null);
  }

  async function handleDelete(asset) {
    const confirmation = await Swal.fire(
      createDeleteConfirmation({
        darkMode: isDarkModeActive(),
        title: t("media.confirmDelete.title"),
        text: t("media.confirmDelete.text"),
        confirmText: t("media.confirmDelete.confirm"),
        cancelText: t("media.confirmDelete.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(asset.id);

    try {
      await deleteMediaAsset(asset.id);

      setItems((currentItems) =>
        currentItems.filter((currentAsset) => currentAsset.id !== asset.id),
      );

      toast.success(t("media.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("media.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCopy(asset) {
    if (!asset.publicUrl) {
      toast.error(t("media.messages.copyFailed"));
      return;
    }

    try {
      await navigator.clipboard.writeText(asset.publicUrl);

      setCopiedId(asset.id);

      toast.success(t("media.messages.copied"));

      window.setTimeout(() => {
        setCopiedId((currentId) => (currentId === asset.id ? null : currentId));
      }, 1500);
    } catch {
      toast.error(t("media.messages.copyFailed"));
    }
  }

  const hasAppliedFilters =
    Boolean(appliedFilters.search) ||
    Boolean(appliedFilters.type) ||
    Boolean(appliedFilters.folder) ||
    appliedFilters.usage !== "all";

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("media.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("media.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("media.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {t("media.actions.refresh")}
          </button>

          {canUpload ? (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa]"
            >
              <FiPlus aria-hidden="true" />
              {t("media.actions.upload")}
            </button>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_180px_200px_160px_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("media.filters.search")}
            </span>

            <span className="relative block">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={draftFilters.search}
                onChange={(event) =>
                  updateDraftFilter("search", event.target.value)
                }
                placeholder={t("media.filters.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("media.filters.type")}
            </span>

            <select
              value={draftFilters.type}
              onChange={(event) =>
                updateDraftFilter("type", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("media.filters.allTypes")}</option>

              {MEDIA_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {t(`media.types.${type}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("media.filters.folder")}
            </span>

            <select
              value={draftFilters.folder}
              onChange={(event) =>
                updateDraftFilter("folder", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("media.filters.allFolders")}</option>

              {MEDIA_FOLDER_VALUES.map((folder) => (
                <option key={folder} value={folder}>
                  {t(`media.folders.${folder}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("media.filters.usage")}
            </span>

            <select
              value={draftFilters.usage}
              onChange={(event) =>
                updateDraftFilter("usage", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {["all", "used", "unused"].map((usage) => (
                <option key={usage} value={usage}>
                  {t(`media.usage.${usage}`)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50 lg:flex-none"
            >
              <FiFilter aria-hidden="true" />
              {t("common.search")}
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              aria-label={t("media.actions.clear")}
              title={t("media.actions.clear")}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t("media.summary.showing", {
              count: items.length,
            })}
          </p>

          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#071522]">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label={t("media.views.grid")}
              title={t("media.views.grid")}
              className={[
                "flex size-9 items-center justify-center rounded-lg transition",
                view === "grid"
                  ? "bg-[#0979c4] !text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              <FiGrid aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setView("list")}
              aria-label={t("media.views.list")}
              title={t("media.views.list")}
              className={[
                "flex size-9 items-center justify-center rounded-lg transition",
                view === "list"
                  ? "bg-[#0979c4] !text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              <FiList aria-hidden="true" />
            </button>
          </div>
        </div>

        {items.length ? (
          view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((asset) => (
                <MediaAssetCard
                  key={asset.id}
                  asset={asset}
                  view="grid"
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  processing={processingId === asset.id}
                  copied={copiedId === asset.id}
                  onEdit={setEditingAsset}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
              {items.map((asset) => (
                <MediaAssetCard
                  key={asset.id}
                  asset={asset}
                  view="list"
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  processing={processingId === asset.id}
                  copied={copiedId === asset.id}
                  onEdit={setEditingAsset}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-700 dark:bg-[#071522]">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              <FiImage className="text-2xl" aria-hidden="true" />
            </span>

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {hasAppliedFilters
                ? t("media.empty.filteredTitle")
                : t("media.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasAppliedFilters
                ? t("media.empty.filteredDescription")
                : t("media.empty.description")}
            </p>
          </div>
        )}

        {items.length ? (
          <footer className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#071522] sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("media.pagination.showing", {
                count: items.length,
              })}
            </p>

            {pagination?.hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/50 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
              >
                {loading ? (
                  <FiRefreshCw className="animate-spin" aria-hidden="true" />
                ) : (
                  <FiChevronDown aria-hidden="true" />
                )}

                {loading
                  ? t("media.actions.loading")
                  : t("media.actions.loadMore")}
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                {t("media.pagination.end")}
              </p>
            )}
          </footer>
        ) : null}
      </section>

      {uploadOpen ? (
        <MediaUploadModal
          open
          onClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      ) : null}

      {editingAsset ? (
        <MediaEditModal
          key={editingAsset.id}
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
