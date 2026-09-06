"use client";

import Image from "next/image";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiFileText, FiImage, FiPlus, FiTrash2 } from "react-icons/fi";

import { ProductMediaPickerController } from "@/components/admin/products/ProductMediaPickerController";
import { PRODUCT_LIMITS } from "@/constants/products";

function uniqueAssets(assets = []) {
  const assetsById = new Map();

  for (const asset of assets) {
    if (asset?.id) {
      assetsById.set(asset.id, asset);
    }
  }

  return [...assetsById.values()];
}

function createPrimaryAsset(product) {
  if (!product?.primaryImageMediaId || !product?.primaryImage) {
    return null;
  }

  return {
    id: product.primaryImageMediaId,
    ...product.primaryImage,
  };
}

function createGalleryAssets(product) {
  if (!Array.isArray(product?.gallery)) {
    return [];
  }

  return uniqueAssets(
    product.gallery.map((asset, index) => ({
      id: asset.id || product.galleryMediaIds?.[index],
      ...asset,
    })),
  );
}

function createDocumentAssets(product) {
  if (!Array.isArray(product?.documents)) {
    return [];
  }

  return uniqueAssets(
    product.documents.map((asset, index) => ({
      id: asset.id || product.documentMediaIds?.[index],
      ...asset,
    })),
  );
}

function MediaSectionHeader({ title, hint, action, onAction, disabled }) {
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

function EmptyMediaState({ icon: Icon, children }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
        <Icon className="text-xl" aria-hidden="true" />
      </span>

      <p className="mt-3 text-xs leading-5 text-slate-400">{children}</p>
    </div>
  );
}

export function ProductMediaFields({
  control,
  product = null,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const primaryController = useController({
    control,
    name: "primaryImageMediaId",
  });

  const galleryController = useController({
    control,
    name: "galleryMediaIds",
  });

  const documentController = useController({
    control,
    name: "documentMediaIds",
  });

  const primaryImageMediaId = primaryController.field.value || null;

  const galleryMediaIds = Array.isArray(galleryController.field.value)
    ? galleryController.field.value
    : [];

  const documentMediaIds = Array.isArray(documentController.field.value)
    ? documentController.field.value
    : [];

  const updatePrimary = primaryController.field.onChange;

  const updateGallery = galleryController.field.onChange;

  const updateDocuments = documentController.field.onChange;

  const primaryError = primaryController.fieldState.error?.message;

  const galleryError = galleryController.fieldState.error?.message;

  const documentError = documentController.fieldState.error?.message;

  const [selectedPrimaryImage, setSelectedPrimaryImage] = useState(() =>
    createPrimaryAsset(product),
  );

  const [selectedGalleryImages, setSelectedGalleryImages] = useState(() =>
    createGalleryAssets(product),
  );

  const [selectedDocuments, setSelectedDocuments] = useState(() =>
    createDocumentAssets(product),
  );

  const [pickerType, setPickerType] = useState(null);

  const locale = i18n.resolvedLanguage || "en";

  function getAssetTitle(asset) {
    return (
      asset.title?.[locale] || asset.title?.en || asset.originalName || asset.id
    );
  }

  function openPrimaryPicker() {
    setPickerType("primary");
  }

  function openGalleryPicker() {
    setPickerType("gallery");
  }

  function openDocumentPicker() {
    setPickerType("documents");
  }

  function handlePrimarySelected(asset) {
    if (!asset?.id) {
      return;
    }

    updatePrimary(asset.id);

    setSelectedPrimaryImage(asset);

    if (galleryMediaIds.includes(asset.id)) {
      updateGallery(galleryMediaIds.filter((mediaId) => mediaId !== asset.id));

      setSelectedGalleryImages((currentAssets) =>
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id),
      );
    }

    setPickerType(null);
  }

  function handleGallerySelected(assets) {
    const nextAssets = uniqueAssets(Array.isArray(assets) ? assets : [])
      .filter((asset) => asset.id !== primaryImageMediaId)
      .slice(0, PRODUCT_LIMITS.GALLERY_MAX_ITEMS);

    updateGallery(nextAssets.map((asset) => asset.id));

    setSelectedGalleryImages(nextAssets);

    setPickerType(null);
  }

  function handleDocumentsSelected(assets) {
    const nextAssets = uniqueAssets(Array.isArray(assets) ? assets : []).slice(
      0,
      PRODUCT_LIMITS.DOCUMENTS_MAX_ITEMS,
    );

    updateDocuments(nextAssets.map((asset) => asset.id));

    setSelectedDocuments(nextAssets);

    setPickerType(null);
  }

  function removePrimaryImage() {
    updatePrimary(null);

    setSelectedPrimaryImage(null);
  }

  function removeGalleryImage(mediaId) {
    updateGallery(
      galleryMediaIds.filter((currentMediaId) => currentMediaId !== mediaId),
    );

    setSelectedGalleryImages((currentAssets) =>
      currentAssets.filter((asset) => asset.id !== mediaId),
    );
  }

  function removeDocument(mediaId) {
    updateDocuments(
      documentMediaIds.filter((currentMediaId) => currentMediaId !== mediaId),
    );

    setSelectedDocuments((currentAssets) =>
      currentAssets.filter((asset) => asset.id !== mediaId),
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
          {t("products.form.mediaSection")}
        </h3>

        <div className="mt-5 space-y-7">
          <div>
            <MediaSectionHeader
              title={t("products.fields.primaryImage")}
              hint={t("products.fields.primaryImageHint")}
              action={
                primaryImageMediaId
                  ? t("products.actions.changeImage")
                  : t("products.actions.selectImage")
              }
              onAction={openPrimaryPicker}
              disabled={disabled}
            />

            <div className="mt-4">
              {selectedPrimaryImage?.publicUrl ? (
                <article className="max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950">
                    <Image
                      src={selectedPrimaryImage.publicUrl}
                      alt={
                        selectedPrimaryImage.altText?.[locale] ||
                        selectedPrimaryImage.altText?.en ||
                        getAssetTitle(selectedPrimaryImage)
                      }
                      fill
                      unoptimized
                      sizes="384px"
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {getAssetTitle(selectedPrimaryImage)}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-slate-400">
                        {selectedPrimaryImage.originalName}
                      </p>
                    </div>

                    <RemoveButton
                      onClick={removePrimaryImage}
                      disabled={disabled}
                      label={t("products.actions.removeImage")}
                    />
                  </div>
                </article>
              ) : (
                <EmptyMediaState icon={FiImage}>
                  {t("products.fields.primaryImageHint")}
                </EmptyMediaState>
              )}

              {primaryError ? (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {primaryError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-7 dark:border-slate-800">
            <MediaSectionHeader
              title={t("products.fields.gallery")}
              hint={t("products.fields.galleryHint")}
              action={t("products.actions.addGalleryImage")}
              onAction={openGalleryPicker}
              disabled={
                disabled ||
                galleryMediaIds.length >= PRODUCT_LIMITS.GALLERY_MAX_ITEMS
              }
            />

            <p className="mt-2 text-xs font-semibold text-slate-400">
              {galleryMediaIds.length} / {PRODUCT_LIMITS.GALLERY_MAX_ITEMS}
            </p>

            <div className="mt-4">
              {selectedGalleryImages.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedGalleryImages.map((asset, index) => (
                    <article
                      key={asset.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-950">
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
                            className="object-contain p-3"
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
                          label={t("products.actions.removeImage")}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyMediaState icon={FiImage}>
                  {t("products.fields.galleryHint")}
                </EmptyMediaState>
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

          <div className="border-t border-slate-200 pt-7 dark:border-slate-800">
            <MediaSectionHeader
              title={t("products.fields.documents")}
              hint={t("products.fields.documentsHint")}
              action={t("products.actions.addDocument")}
              onAction={openDocumentPicker}
              disabled={
                disabled ||
                documentMediaIds.length >= PRODUCT_LIMITS.DOCUMENTS_MAX_ITEMS
              }
            />

            <p className="mt-2 text-xs font-semibold text-slate-400">
              {documentMediaIds.length} / {PRODUCT_LIMITS.DOCUMENTS_MAX_ITEMS}
            </p>

            <div className="mt-4">
              {selectedDocuments.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedDocuments.map((asset) => (
                    <article
                      key={asset.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0979c4]/10 text-[#0979c4] dark:text-sky-400">
                        <FiFileText className="text-xl" aria-hidden="true" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {getAssetTitle(asset)}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-400">
                          {asset.originalName}
                        </p>
                      </div>

                      <RemoveButton
                        onClick={() => removeDocument(asset.id)}
                        disabled={disabled}
                        label={t("products.actions.remove")}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyMediaState icon={FiFileText}>
                  {t("products.fields.documentsHint")}
                </EmptyMediaState>
              )}

              {documentError ? (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {documentError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {pickerType === "primary" ? (
        <ProductMediaPickerController
          key={`primary-${primaryImageMediaId || "empty"}`}
          type="image"
          selectedIds={primaryImageMediaId ? [primaryImageMediaId] : []}
          selectedAssets={selectedPrimaryImage ? [selectedPrimaryImage] : []}
          excludedIds={galleryMediaIds}
          multiple={false}
          maximumSelection={1}
          onConfirm={handlePrimarySelected}
          onClose={() => setPickerType(null)}
        />
      ) : null}

      {pickerType === "gallery" ? (
        <ProductMediaPickerController
          key={`gallery-${galleryMediaIds.join("-")}`}
          type="image"
          selectedIds={galleryMediaIds}
          selectedAssets={selectedGalleryImages}
          excludedIds={primaryImageMediaId ? [primaryImageMediaId] : []}
          multiple
          maximumSelection={PRODUCT_LIMITS.GALLERY_MAX_ITEMS}
          onConfirm={handleGallerySelected}
          onClose={() => setPickerType(null)}
        />
      ) : null}

      {pickerType === "documents" ? (
        <ProductMediaPickerController
          key={`documents-${documentMediaIds.join("-")}`}
          type="document"
          selectedIds={documentMediaIds}
          selectedAssets={selectedDocuments}
          multiple
          maximumSelection={PRODUCT_LIMITS.DOCUMENTS_MAX_ITEMS}
          onConfirm={handleDocumentsSelected}
          onClose={() => setPickerType(null)}
        />
      ) : null}
    </>
  );
}
