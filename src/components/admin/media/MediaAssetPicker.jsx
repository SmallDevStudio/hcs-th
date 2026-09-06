"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiFile,
  FiFileText,
  FiImage,
  FiLoader,
  FiSearch,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";

function formatFileSize(value) {
  const bytes = Number(value || 0);

  if (!bytes) {
    return "—";
  }

  const units = ["B", "KB", "MB", "GB"];

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const amount = bytes / 1024 ** unitIndex;

  return `${amount.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function AssetPreview({ asset, eager, imageSizes }) {
  if (asset.type === "image" && asset.publicUrl) {
    return (
      <Image
        src={asset.publicUrl}
        alt={asset.altText?.en || asset.title?.en || asset.originalName || ""}
        fill
        unoptimized
        loading={eager ? "eager" : "lazy"}
        sizes={imageSizes}
        className="object-cover transition duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <span className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0979c4] shadow-sm dark:bg-slate-800 dark:text-sky-400">
        {asset.mimeType === "application/pdf" ? (
          <FiFileText className="text-2xl" aria-hidden="true" />
        ) : (
          <FiFile className="text-2xl" aria-hidden="true" />
        )}
      </span>

      <span className="line-clamp-2 text-xs font-bold text-slate-600 dark:text-slate-300">
        {asset.extension ? asset.extension.toUpperCase() : "FILE"}
      </span>
    </span>
  );
}

export function MediaAssetPicker({
  assets,
  pagination,

  selectedIds = [],
  excludedIds = [],

  multiple = false,
  maximumSelection = 1,

  loading = false,

  locale = "en",

  labels,

  upload = null,

  onSearch,
  onLoadMore,
  onUploaded,
  onConfirm,
  onClose,
}) {
  const normalizedSelectedIds = useMemo(
    () => (Array.isArray(selectedIds) ? selectedIds.filter(Boolean) : []),
    [selectedIds],
  );

  const excludedIdSet = useMemo(
    () =>
      new Set(Array.isArray(excludedIds) ? excludedIds.filter(Boolean) : []),
    [excludedIds],
  );

  const [activeTab, setActiveTab] = useState("library");

  const [search, setSearch] = useState("");

  const [draftSelectedIds, setDraftSelectedIds] = useState(() =>
    multiple
      ? normalizedSelectedIds.slice(0, maximumSelection)
      : normalizedSelectedIds.slice(0, 1),
  );

  const draftSelectedIdSet = useMemo(
    () => new Set(draftSelectedIds),
    [draftSelectedIds],
  );

  const availableAssets = useMemo(
    () => assets.filter((asset) => !excludedIdSet.has(asset.id)),
    [assets, excludedIdSet],
  );

  const remainingSelection = Math.max(
    0,
    maximumSelection - draftSelectedIds.length,
  );

  function handleSubmitSearch(event) {
    event.preventDefault();

    onSearch(search.trim());
  }

  function handleToggleAsset(assetId) {
    setDraftSelectedIds((currentIds) => {
      const selected = currentIds.includes(assetId);

      if (!multiple) {
        return selected ? [] : [assetId];
      }

      if (selected) {
        return currentIds.filter((currentId) => currentId !== assetId);
      }

      if (currentIds.length >= maximumSelection) {
        return currentIds;
      }

      return [...currentIds, assetId];
    });
  }

  function handleUploadedAssets(uploadedAssets, summary) {
    const usableAssets = uploadedAssets.filter(
      (asset) => asset?.id && !excludedIdSet.has(asset.id),
    );

    if (!usableAssets.length) {
      return;
    }

    setDraftSelectedIds((currentIds) => {
      if (!multiple) {
        return [usableAssets[usableAssets.length - 1].id];
      }

      return [
        ...new Set([...currentIds, ...usableAssets.map((asset) => asset.id)]),
      ].slice(0, maximumSelection);
    });

    onUploaded?.(usableAssets, summary);

    if (summary?.allCompleted) {
      setActiveTab("library");
    }
  }

  function handleConfirm() {
    const selectedAssets = draftSelectedIds
      .map((assetId) => assets.find((asset) => asset.id === assetId))
      .filter(Boolean);

    if (!selectedAssets.length) {
      return;
    }

    onConfirm(multiple ? selectedAssets : selectedAssets[0]);
  }

  const selectionFull = multiple && draftSelectedIds.length >= maximumSelection;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-asset-picker-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label={labels.close}
        tabIndex={-1}
      />

      <section className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {labels.eyebrow}
            </p>

            <h2
              id="media-asset-picker-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {labels.title}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {labels.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        {upload ? (
          <nav className="flex gap-2 border-b border-slate-200 px-5 pt-3 dark:border-slate-800 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={[
                "inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-bold transition",
                activeTab === "library"
                  ? "border-[#0979c4] text-[#0979c4] dark:text-sky-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              <FiImage aria-hidden="true" />

              {labels.libraryTab}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              disabled={selectionFull}
              className={[
                "inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
                activeTab === "upload"
                  ? "border-[#0979c4] text-[#0979c4] dark:text-sky-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              <FiUploadCloud aria-hidden="true" />

              {labels.uploadTab}
            </button>

            {multiple ? (
              <span className="ml-auto self-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {labels.selected
                  .replace("{{count}}", draftSelectedIds.length)
                  .replace("{{maximum}}", maximumSelection)}
              </span>
            ) : null}
          </nav>
        ) : null}

        {activeTab === "library" ? (
          <>
            <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form
                  onSubmit={handleSubmitSearch}
                  className="flex min-w-0 flex-1 gap-3"
                >
                  <label className="relative block min-w-0 flex-1">
                    <span className="sr-only">{labels.search}</span>

                    <FiSearch
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={labels.searchPlaceholder}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin" aria-hidden="true" />
                    ) : (
                      <FiSearch aria-hidden="true" />
                    )}

                    <span className="hidden sm:inline">{labels.search}</span>
                  </button>
                </form>

                {!upload && multiple ? (
                  <span className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {labels.selected
                      .replace("{{count}}", draftSelectedIds.length)
                      .replace("{{maximum}}", maximumSelection)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {availableAssets.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {availableAssets.map((asset, index) => {
                    const selected = draftSelectedIdSet.has(asset.id);

                    const disabled = selectionFull && !selected;

                    const title =
                      asset.title?.[locale] ||
                      asset.title?.en ||
                      asset.originalName ||
                      asset.id;

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggleAsset(asset.id)}
                        className={[
                          "group overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                          "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0979c4]/20",
                          "disabled:cursor-not-allowed disabled:opacity-45",
                          "dark:bg-slate-900",
                          selected
                            ? "border-[#0979c4] shadow-md shadow-[#0979c4]/15"
                            : "border-transparent ring-1 ring-slate-200 hover:border-[#0979c4]/40 dark:ring-slate-700",
                        ].join(" ")}
                      >
                        <span className="relative block aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                          <AssetPreview
                            asset={asset}
                            eager={index === 0}
                            imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />

                          {selected ? (
                            <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-[#0979c4] !text-white shadow-lg">
                              <FiCheck aria-hidden="true" />
                            </span>
                          ) : null}

                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2 py-1 text-[9px] font-bold uppercase !text-white backdrop-blur-sm">
                            {asset.type === "image" ? (
                              <FiImage aria-hidden="true" />
                            ) : (
                              <FiFileText aria-hidden="true" />
                            )}

                            {asset.type}
                          </span>
                        </span>

                        <span className="block p-3">
                          <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                            {title}
                          </span>

                          <span className="mt-1 block truncate text-[10px] text-slate-400">
                            {asset.originalName}
                          </span>

                          <span className="mt-2 block text-[10px] font-semibold text-slate-400">
                            {formatFileSize(asset.size)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  {loading ? (
                    <FiLoader
                      className="animate-spin text-3xl text-[#0979c4]"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                      <FiImage className="text-2xl" aria-hidden="true" />
                    </span>
                  )}

                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {loading ? labels.loading : labels.empty}
                  </p>
                </div>
              )}

              {pagination?.hasMore ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/50 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin" aria-hidden="true" />
                    ) : (
                      <FiChevronDown aria-hidden="true" />
                    )}

                    {loading ? labels.loading : labels.loadMore}
                  </button>
                </div>
              ) : null}
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-400">
                {multiple ? labels.selectionHint : labels.singleSelectionHint}
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {labels.cancel}
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!draftSelectedIds.length}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiCheck aria-hidden="true" />

                  {labels.confirm}
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <MediaUploadPanel
              mediaType={upload.mediaType}
              multiple={multiple}
              maximumFiles={multiple ? Math.max(1, remainingSelection) : 1}
              defaultFolder={upload.defaultFolder}
              lockFolder={upload.lockFolder}
              onUploaded={handleUploadedAssets}
            />
          </div>
        )}
      </section>
    </div>
  );
}
