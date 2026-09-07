"use client";

import Image from "next/image";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiImage, FiPlus, FiTrash2 } from "react-icons/fi";

import { ProductMediaPickerController } from "@/components/admin/products/ProductMediaPickerController";
import { MEDIA_FOLDERS } from "@/constants/media";
import { PROJECT_LIMITS } from "@/constants/projects";

function uniqueAssets(assets = []) {
  const assetsById = new Map();

  for (const asset of assets) {
    if (asset?.id) {
      assetsById.set(asset.id, asset);
    }
  }

  return [...assetsById.values()];
}

function createCoverAsset(project) {
  if (!project?.coverImageMediaId || !project?.coverImage) {
    return null;
  }

  return {
    id: project.coverImageMediaId,
    ...project.coverImage,
  };
}

function createGalleryAssets(project) {
  if (!Array.isArray(project?.gallery)) {
    return [];
  }

  return uniqueAssets(
    project.gallery.map((asset, index) => ({
      id: asset.id || project.galleryMediaIds?.[index],

      ...asset,
    })),
  );
}

function SectionHeader({ title, hint, action, onAction, disabled }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
      >
        <FiPlus aria-hidden="true" />

        {action}
      </button>
    </div>
  );
}

function RemoveButton({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      <FiTrash2 aria-hidden="true" />
    </button>
  );
}

function EmptyState({ children }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
        <FiImage className="text-xl" aria-hidden="true" />
      </span>

      <p className="mt-3 text-xs leading-5 text-slate-400">{children}</p>
    </div>
  );
}

export function ProjectMediaFields({
  control,
  project = null,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const coverController = useController({
    control,
    name: "coverImageMediaId",
  });

  const galleryController = useController({
    control,
    name: "galleryMediaIds",
  });

  const coverImageMediaId = coverController.field.value || null;

  const galleryMediaIds = Array.isArray(galleryController.field.value)
    ? galleryController.field.value
    : [];

  const updateCover = coverController.field.onChange;

  const updateGallery = galleryController.field.onChange;

  const coverError = coverController.fieldState.error?.message;

  const galleryError = galleryController.fieldState.error?.message;

  const [selectedCover, setSelectedCover] = useState(() =>
    createCoverAsset(project),
  );

  const [selectedGallery, setSelectedGallery] = useState(() =>
    createGalleryAssets(project),
  );

  const [pickerType, setPickerType] = useState(null);

  const locale = i18n.resolvedLanguage || "en";

  function getAssetTitle(asset) {
    return (
      asset.title?.[locale] || asset.title?.en || asset.originalName || asset.id
    );
  }

  function handleCoverSelected(asset) {
    if (!asset?.id) {
      return;
    }

    updateCover(asset.id);
    setSelectedCover(asset);

    if (galleryMediaIds.includes(asset.id)) {
      updateGallery(galleryMediaIds.filter((mediaId) => mediaId !== asset.id));

      setSelectedGallery((currentAssets) =>
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id),
      );
    }

    setPickerType(null);
  }

  function handleGallerySelected(assets) {
    const nextAssets = uniqueAssets(Array.isArray(assets) ? assets : [])
      .filter((asset) => asset.id !== coverImageMediaId)
      .slice(0, PROJECT_LIMITS.GALLERY_MAX_ITEMS);

    updateGallery(nextAssets.map((asset) => asset.id));

    setSelectedGallery(nextAssets);
    setPickerType(null);
  }

  function removeCover() {
    updateCover(null);
    setSelectedCover(null);
  }

  function removeGalleryImage(mediaId) {
    updateGallery(
      galleryMediaIds.filter((currentMediaId) => currentMediaId !== mediaId),
    );

    setSelectedGallery((currentAssets) =>
      currentAssets.filter((asset) => asset.id !== mediaId),
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
          {t("projects.form.mediaSection")}
        </h3>

        <div className="mt-5 space-y-7">
          <div>
            <SectionHeader
              title={t("projects.fields.coverImage")}
              hint={t("projects.fields.coverImageHint")}
              action={
                coverImageMediaId
                  ? t("projects.actions.changeCover")
                  : t("projects.actions.selectCover")
              }
              onAction={() => setPickerType("cover")}
              disabled={disabled}
            />

            <div className="mt-4">
              {selectedCover?.publicUrl ? (
                <article className="max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-950">
                    <Image
                      src={selectedCover.publicUrl}
                      alt={
                        selectedCover.altText?.[locale] ||
                        selectedCover.altText?.en ||
                        getAssetTitle(selectedCover)
                      }
                      fill
                      unoptimized
                      sizes="576px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">
                    <p className="min-w-0 truncate text-xs font-bold text-slate-900 dark:text-white">
                      {getAssetTitle(selectedCover)}
                    </p>

                    <RemoveButton
                      onClick={removeCover}
                      disabled={disabled}
                      label={t("projects.actions.removeImage")}
                    />
                  </div>
                </article>
              ) : (
                <EmptyState>{t("projects.fields.coverImageHint")}</EmptyState>
              )}

              {coverError ? (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {coverError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-7 dark:border-slate-800">
            <SectionHeader
              title={t("projects.fields.gallery")}
              hint={t("projects.fields.galleryHint")}
              action={t("projects.actions.addGalleryImage")}
              onAction={() => setPickerType("gallery")}
              disabled={
                disabled ||
                galleryMediaIds.length >= PROJECT_LIMITS.GALLERY_MAX_ITEMS
              }
            />

            <p className="mt-2 text-xs font-semibold text-slate-400">
              {galleryMediaIds.length} / {PROJECT_LIMITS.GALLERY_MAX_ITEMS}
            </p>

            <div className="mt-4">
              {selectedGallery.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedGallery.map((asset, index) => (
                    <article
                      key={asset.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950">
                        {asset.publicUrl ? (
                          <Image
                            src={asset.publicUrl}
                            alt={
                              asset.altText?.[locale] ||
                              asset.altText?.en ||
                              getAssetTitle(asset)
                            }
                            fill
                            unoptimized
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center">
                            <FiImage
                              className="text-3xl text-slate-300"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-2.5 dark:border-slate-700">
                        <p className="min-w-0 truncate text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          {getAssetTitle(asset)}
                        </p>

                        <RemoveButton
                          onClick={() => removeGalleryImage(asset.id)}
                          disabled={disabled}
                          label={t("projects.actions.removeImage")}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState>{t("projects.form.emptyGallery")}</EmptyState>
              )}

              {galleryError ? (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {galleryError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {pickerType === "cover" ? (
        <ProductMediaPickerController
          key={`project-cover-${coverImageMediaId || "empty"}`}
          type="image"
          folder={MEDIA_FOLDERS.PROJECTS}
          selectedIds={coverImageMediaId ? [coverImageMediaId] : []}
          selectedAssets={selectedCover ? [selectedCover] : []}
          excludedIds={galleryMediaIds}
          multiple={false}
          maximumSelection={1}
          onConfirm={handleCoverSelected}
          onClose={() => setPickerType(null)}
        />
      ) : null}

      {pickerType === "gallery" ? (
        <ProductMediaPickerController
          key={`project-gallery-${galleryMediaIds.join("-")}`}
          type="image"
          folder={MEDIA_FOLDERS.PROJECTS}
          selectedIds={galleryMediaIds}
          selectedAssets={selectedGallery}
          excludedIds={coverImageMediaId ? [coverImageMediaId] : []}
          multiple
          maximumSelection={PROJECT_LIMITS.GALLERY_MAX_ITEMS}
          onConfirm={handleGallerySelected}
          onClose={() => setPickerType(null)}
        />
      ) : null}
    </>
  );
}
