"use client";

import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";

import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";

export function MediaUploadModal({ open, onClose, onUploaded }) {
  const { t } = useTranslation("admin");

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-upload-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("media.actions.close")}
        tabIndex={-1}
      />

      <section className="relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t("media.upload.eyebrow")}
            </p>

            <h2
              id="media-upload-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t("media.upload.title")}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("media.upload.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("media.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <MediaUploadPanel
            multiple
            maximumFiles={20}
            onUploaded={onUploaded}
          />
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("media.actions.close")}
          </button>
        </footer>
      </section>
    </div>
  );
}
