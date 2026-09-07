"use client";

import { useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiDownload, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";

import { ProductMediaPickerController } from "@/components/admin/products/ProductMediaPickerController";
import { MEDIA_FOLDERS } from "@/constants/media";

function createDocumentAsset(standard) {
  if (!standard?.documentMediaId || !standard?.document) {
    return null;
  }

  return {
    id: standard.documentMediaId,
    ...standard.document,
  };
}

function formatFileSize(value) {
  const size = Number(value || 0);

  if (!size) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function StandardDocumentField({
  control,
  standard = null,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    control,
    name: "documentMediaId",
  });

  const [selectedAsset, setSelectedAsset] = useState(() =>
    createDocumentAsset(standard),
  );

  const [pickerOpen, setPickerOpen] = useState(false);

  const currentLocale = i18n.resolvedLanguage === "th" ? "th" : "en";

  const documentTitle =
    selectedAsset?.title?.[currentLocale] ||
    selectedAsset?.title?.en ||
    selectedAsset?.title?.th ||
    selectedAsset?.originalName ||
    "";

  const fileMetadata = [
    selectedAsset?.extension
      ? String(selectedAsset.extension).toLocaleUpperCase()
      : "",

    formatFileSize(selectedAsset?.size),
  ]
    .filter(Boolean)
    .join(" · ");

  function handleConfirm(selection) {
    const asset = Array.isArray(selection) ? selection[0] : selection;

    if (!asset?.id) {
      return;
    }

    setSelectedAsset({
      ...asset,
      id: asset.id,
    });

    onChange(asset.id);
    onBlur();

    setPickerOpen(false);
  }

  function handleRemove() {
    setSelectedAsset(null);

    onChange(null);
    onBlur();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <input
        ref={ref}
        type="hidden"
        name="documentMediaId"
        value={value || ""}
        readOnly
      />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {t("standards.form.sections.document")}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {t("standards.form.hints.document")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlus aria-hidden="true" />

          {selectedAsset
            ? t("standards.actions.changeDocument")
            : t("standards.actions.selectDocument")}
        </button>
      </div>

      {selectedAsset && value ? (
        <div className="mt-5 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <FiFileText aria-hidden="true" className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
              {documentTitle}
            </p>

            {fileMetadata ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {fileMetadata}
              </p>
            ) : null}
          </div>

          {selectedAsset.publicUrl ? (
            <a
              href={selectedAsset.publicUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("standards.actions.previewDocument")}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              <FiDownload aria-hidden="true" />
            </a>
          ) : null}

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            aria-label={t("standards.actions.removeDocument")}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 px-5 py-7 text-center transition hover:border-primary/60 hover:bg-primary/[0.025] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
        >
          <FiFileText aria-hidden="true" className="size-8 text-slate-400" />

          <span className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            {t("standards.form.empty.document")}
          </span>

          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("standards.form.hints.documentUpload")}
          </span>
        </button>
      )}

      {error?.message ? (
        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          {error.message}
        </p>
      ) : null}

      {pickerOpen ? (
        <ProductMediaPickerController
          type="document"
          folder={MEDIA_FOLDERS.CERTIFICATES}
          selectedIds={value ? [value] : []}
          selectedAssets={selectedAsset ? [selectedAsset] : []}
          multiple={false}
          maximumSelection={1}
          onConfirm={handleConfirm}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </section>
  );
}
