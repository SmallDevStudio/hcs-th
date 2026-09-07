"use client";

import Image from "next/image";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiImage, FiPlus, FiTrash2 } from "react-icons/fi";

import { SolutionMediaPickerController } from "@/components/admin/solutions/SolutionMediaPickerController";

function createSelectedAsset(solution) {
  if (!solution?.imageMediaId || !solution?.image) {
    return null;
  }

  return {
    id: solution.imageMediaId,
    ...solution.image,
  };
}

export function SolutionImageField({
  control,
  solution = null,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const controller = useController({
    control,
    name: "imageMediaId",
  });

  const imageMediaId = controller.field.value || null;

  const updateImage = controller.field.onChange;

  const errorMessage = controller.fieldState.error?.message;

  const [selectedAsset, setSelectedAsset] = useState(() =>
    createSelectedAsset(solution),
  );

  const [pickerOpen, setPickerOpen] = useState(false);

  const locale = i18n.resolvedLanguage || "en";

  function getAssetTitle(asset) {
    return (
      asset?.title?.[locale] ||
      asset?.title?.en ||
      asset?.originalName ||
      asset?.id ||
      ""
    );
  }

  function handleSelected(asset) {
    if (!asset?.id) {
      return;
    }

    updateImage(asset.id);

    setSelectedAsset(asset);

    setPickerOpen(false);
  }

  function handleRemove() {
    updateImage(null);

    setSelectedAsset(null);
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.form.mediaSection")}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {t("solutions.fields.imageHint")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
          >
            <FiPlus aria-hidden="true" />

            {imageMediaId
              ? t("solutions.actions.changeImage")
              : t("solutions.actions.selectImage")}
          </button>
        </div>

        <div className="mt-5">
          {selectedAsset?.publicUrl ? (
            <article className="max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-950">
                <Image
                  src={selectedAsset.publicUrl}
                  alt={
                    selectedAsset.altText?.[locale] ||
                    selectedAsset.altText?.en ||
                    getAssetTitle(selectedAsset)
                  }
                  fill
                  unoptimized
                  sizes="576px"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {getAssetTitle(selectedAsset)}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {selectedAsset.originalName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  aria-label={t("solutions.actions.removeImage")}
                  title={t("solutions.actions.removeImage")}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </article>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                <FiImage className="text-xl" aria-hidden="true" />
              </span>

              <p className="mt-3 max-w-md text-xs leading-5 text-slate-400">
                {t("solutions.fields.imageHint")}
              </p>
            </div>
          )}

          {errorMessage ? (
            <p
              role="alert"
              className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>

      {pickerOpen ? (
        <SolutionMediaPickerController
          key={imageMediaId || "empty"}
          selectedId={imageMediaId}
          selectedAsset={selectedAsset}
          onConfirm={handleSelected}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}
