"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiChevronDown,
  FiImage,
  FiLoader,
  FiSearch,
  FiX,
} from "react-icons/fi";

export function MediaImagePicker({
  images,
  pagination,
  initialSelectedId = null,
  loading = false,
  onSearch,
  onLoadMore,
  onConfirm,
  onClose,
}) {
  const { t, i18n } = useTranslation("admin");

  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState(initialSelectedId);

  function handleSubmitSearch(event) {
    event.preventDefault();
    onSearch(search.trim());
  }

  function handleConfirm() {
    const selectedImage =
      images.find((image) => image.id === selectedId) || null;

    if (!selectedImage) {
      return;
    }

    onConfirm(selectedImage);
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-image-picker-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("categories.actions.close")}
        tabIndex={-1}
      />

      <section className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t("categories.mediaPicker.eyebrow")}
            </p>

            <h2
              id="media-image-picker-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t("categories.mediaPicker.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("categories.mediaPicker.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("categories.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:px-6">
          <form onSubmit={handleSubmitSearch} className="flex gap-3">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">{t("categories.filters.search")}</span>

              <FiSearch
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("categories.mediaPicker.searchPlaceholder")}
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

              <span className="hidden sm:inline">
                {t("categories.actions.search")}
              </span>
            </button>
          </form>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => {
                const selected = selectedId === image.id;

                const title =
                  image.title?.[i18n.resolvedLanguage] ||
                  image.title?.en ||
                  image.originalName;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedId(image.id)}
                    className={[
                      "group overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0979c4]/20",
                      "dark:bg-slate-900",
                      selected
                        ? "border-[#0979c4] shadow-md shadow-[#0979c4]/15"
                        : "border-transparent ring-1 ring-slate-200 hover:border-[#0979c4]/40 dark:ring-slate-700",
                    ].join(" ")}
                  >
                    <span className="relative block aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                      {image.publicUrl ? (
                        <Image
                          src={image.publicUrl}
                          alt={
                            image.altText?.[i18n.resolvedLanguage] ||
                            image.altText?.en ||
                            title
                          }
                          fill
                          unoptimized
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <FiImage
                            className="text-3xl text-slate-300 dark:text-slate-600"
                            aria-hidden="true"
                          />
                        </span>
                      )}

                      {selected ? (
                        <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-[#0979c4] !text-white shadow-lg">
                          <FiCheck aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>

                    <span className="block p-3">
                      <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                        {title}
                      </span>

                      <span className="mt-1 block truncate text-[10px] text-slate-400">
                        {image.originalName}
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
                {loading
                  ? t("categories.actions.loading")
                  : t("categories.mediaPicker.empty")}
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

                {loading
                  ? t("categories.actions.loading")
                  : t("categories.actions.loadMore")}
              </button>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("categories.actions.cancel")}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck aria-hidden="true" />

            {t("categories.mediaPicker.useImage")}
          </button>
        </footer>
      </section>
    </div>
  );
}
