"use client";

import Image from "next/image";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FiImage,
  FiMonitor,
  FiPlus,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";

import { SolutionMediaPickerController } from "@/components/admin/solutions/SolutionMediaPickerController";

function createSelectedAsset({ mediaId, media }) {
  if (!mediaId || !media) {
    return null;
  }

  return {
    id: mediaId,
    ...media,
  };
}

function getLocalizedAssetTitle(asset, locale) {
  return (
    asset?.title?.[locale] ||
    asset?.title?.en ||
    asset?.title?.th ||
    asset?.originalName ||
    asset?.id ||
    ""
  );
}

function HeroImageField({
  control,
  name,
  initialAsset,
  label,
  description,
  emptyDescription,
  recommendedSize,
  icon: Icon,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const controller = useController({
    control,
    name,
  });

  const mediaId = controller.field.value || null;

  const updateMedia = controller.field.onChange;

  const errorMessage = controller.fieldState.error?.message;

  const [selectedAsset, setSelectedAsset] = useState(() => initialAsset);

  const [pickerOpen, setPickerOpen] = useState(false);

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const assetTitle = getLocalizedAssetTitle(selectedAsset, locale);

  function handleSelected(asset) {
    if (!asset?.id) {
      return;
    }

    updateMedia(asset.id);

    setSelectedAsset(asset);

    setPickerOpen(false);
  }

  function handleRemove() {
    updateMedia(null);

    setSelectedAsset(null);
  }

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start dark:border-slate-800">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0979c4] dark:bg-sky-950/40 dark:text-sky-300">
              <Icon aria-hidden="true" className="text-lg" />
            </span>

            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                {label}
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>

              <p className="mt-1 text-[11px] font-semibold text-[#0979c4] dark:text-sky-300">
                {recommendedSize}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
          >
            <FiPlus aria-hidden="true" />

            {mediaId
              ? t("home.heroes.actions.changeImage")
              : t("home.heroes.actions.selectImage")}
          </button>
        </div>

        <div className="p-4">
          {selectedAsset?.publicUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-950">
                <Image
                  src={selectedAsset.publicUrl}
                  alt={
                    selectedAsset.altText?.[locale] ||
                    selectedAsset.altText?.en ||
                    selectedAsset.altText?.th ||
                    assetTitle
                  }
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {assetTitle}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {selectedAsset.originalName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  aria-label={t("home.heroes.actions.removeImage")}
                  title={t("home.heroes.actions.removeImage")}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[16/9] min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                <FiImage aria-hidden="true" className="text-xl" />
              </span>

              <p className="mt-3 max-w-sm text-xs leading-5 text-slate-400">
                {emptyDescription}
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
      </article>

      {pickerOpen ? (
        <SolutionMediaPickerController
          key={`${name}-${mediaId || "empty"}`}
          selectedId={mediaId}
          selectedAsset={selectedAsset}
          onConfirm={handleSelected}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

export function HomeHeroMediaFields({
  control,
  hero = null,
  disabled = false,
}) {
  const { t } = useTranslation("admin");

  const desktopInitialAsset = createSelectedAsset({
    mediaId: hero?.desktopImageMediaId,

    media: hero?.desktopImage,
  });

  const mobileInitialAsset = createSelectedAsset({
    mediaId: hero?.mobileImageMediaId,

    media: hero?.mobileImage,
  });

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div>
        <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
          {t("home.heroes.form.mediaSection")}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          {t("home.heroes.form.mediaDescription")}
        </p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <HeroImageField
          control={control}
          name="desktopImageMediaId"
          initialAsset={desktopInitialAsset}
          label={t("home.heroes.fields.desktopImage")}
          description={t("home.heroes.fields.desktopImageHint")}
          emptyDescription={t("home.heroes.fields.desktopImageEmpty")}
          recommendedSize={t("home.heroes.fields.desktopImageSize")}
          icon={FiMonitor}
          disabled={disabled}
        />

        <HeroImageField
          control={control}
          name="mobileImageMediaId"
          initialAsset={mobileInitialAsset}
          label={t("home.heroes.fields.mobileImage")}
          description={t("home.heroes.fields.mobileImageHint")}
          emptyDescription={t("home.heroes.fields.mobileImageEmpty")}
          recommendedSize={t("home.heroes.fields.mobileImageSize")}
          icon={FiSmartphone}
          disabled={disabled}
        />
      </div>

      <p className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
        {t("home.heroes.form.mobileFallbackHint")}
      </p>
    </section>
  );
}
