"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheckCircle,
  FiFile,
  FiImage,
  FiLoader,
  FiUploadCloud,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import {
  MEDIA_DOCUMENT_FOLDERS,
  MEDIA_DOCUMENT_MIME_TYPES,
  MEDIA_FOLDERS,
  MEDIA_IMAGE_FOLDERS,
  MEDIA_IMAGE_MIME_TYPES,
  MEDIA_LIMITS,
  getMediaTypeFromMimeType,
} from "@/constants/media";
import { uploadMediaAsset } from "@/services/http/media.api";

function createFileId(file) {
  return [file.name, file.size, file.lastModified].join("-");
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getDefaultFolder(mediaType) {
  return mediaType === "document"
    ? MEDIA_FOLDERS.DOWNLOADS
    : MEDIA_FOLDERS.PRODUCTS;
}

function validateFile(file, translate) {
  const mediaType = getMediaTypeFromMimeType(file.type);

  if (!mediaType) {
    return translate("media.messages.invalidFile", {
      name: file.name,
    });
  }

  if (mediaType === "image" && file.size > MEDIA_LIMITS.IMAGE_MAX_BYTES) {
    return translate("media.messages.imageTooLarge", {
      name: file.name,
    });
  }

  if (mediaType === "document" && file.size > MEDIA_LIMITS.DOCUMENT_MAX_BYTES) {
    return translate("media.messages.documentTooLarge", {
      name: file.name,
    });
  }

  return null;
}

function UploadStatusIcon({ status }) {
  if (status === "completed") {
    return (
      <FiCheckCircle className="text-lg text-emerald-500" aria-hidden="true" />
    );
  }

  if (status === "failed") {
    return <FiXCircle className="text-lg text-red-500" aria-hidden="true" />;
  }

  if (
    status === "preparing" ||
    status === "uploading" ||
    status === "processing"
  ) {
    return (
      <FiLoader
        className="animate-spin text-lg text-[#0979c4]"
        aria-hidden="true"
      />
    );
  }

  return null;
}

export function MediaUploadModal({ open, onClose, onUploaded }) {
  const { t } = useTranslation("admin");
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState(MEDIA_FOLDERS.PRODUCTS);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!open) {
    return null;
  }

  const mediaType = files[0]
    ? getMediaTypeFromMimeType(files[0].file.type)
    : "image";

  const availableFolders =
    mediaType === "document" ? MEDIA_DOCUMENT_FOLDERS : MEDIA_IMAGE_FOLDERS;

  function addFiles(selectedFiles) {
    const incomingFiles = Array.from(selectedFiles || []);

    if (!incomingFiles.length) {
      return;
    }

    const existingIds = new Set(files.map((item) => item.id));

    let expectedType = files[0]
      ? getMediaTypeFromMimeType(files[0].file.type)
      : null;

    const acceptedItems = [];

    for (const file of incomingFiles) {
      const id = createFileId(file);
      const error = validateFile(file, t);
      const incomingType = getMediaTypeFromMimeType(file.type);

      if (existingIds.has(id)) {
        acceptedItems.push({
          id: `${id}-duplicate-${acceptedItems.length}`,
          file,
          status: "failed",
          progress: 0,
          error: t("media.messages.duplicateFile", {
            name: file.name,
          }),
        });

        continue;
      }

      if (expectedType && incomingType && incomingType !== expectedType) {
        acceptedItems.push({
          id,
          file,
          status: "failed",
          progress: 0,
          error: t("media.messages.invalidFile", {
            name: file.name,
          }),
        });

        continue;
      }

      if (!expectedType && incomingType) {
        expectedType = incomingType;
      }

      acceptedItems.push({
        id,
        file,
        status: error ? "failed" : "waiting",
        progress: 0,
        error,
      });

      existingIds.add(id);
    }

    const firstValidIncoming = acceptedItems.find((item) => !item.error);

    if (!files.length && firstValidIncoming) {
      const firstType = getMediaTypeFromMimeType(firstValidIncoming.file.type);

      setFolder(getDefaultFolder(firstType));
    }

    setFiles((currentFiles) => [...currentFiles, ...acceptedItems]);
  }

  function handleFileInput(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event) {
    event.preventDefault();

    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    if (!uploading) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeFile(fileId) {
    if (uploading) {
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.filter((item) => item.id !== fileId),
    );
  }

  function updateFileState(fileId, updates) {
    setFiles((currentFiles) =>
      currentFiles.map((item) =>
        item.id === fileId
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  async function handleUpload() {
    const uploadableFiles = files.filter(
      (item) => item.status === "waiting" || item.status === "failed",
    );

    if (!uploadableFiles.length) {
      return;
    }

    setUploading(true);

    const uploadedAssets = [];

    for (const item of uploadableFiles) {
      const validationError = validateFile(item.file, t);

      if (validationError) {
        updateFileState(item.id, {
          status: "failed",
          error: validationError,
        });

        continue;
      }

      try {
        const asset = await uploadMediaAsset({
          file: item.file,
          folder,

          onStageChange: (stage) => {
            updateFileState(item.id, {
              status: stage,
              error: null,
            });
          },

          onProgress: ({ percentage }) => {
            updateFileState(item.id, {
              progress: percentage,
            });
          },
        });

        uploadedAssets.push(asset);

        updateFileState(item.id, {
          status: "completed",
          progress: 100,
          error: null,
        });
      } catch (error) {
        updateFileState(item.id, {
          status: "failed",
          error: error?.message || t("media.messages.uploadFailed"),
        });
      }
    }

    setUploading(false);

    if (uploadedAssets.length) {
      onUploaded(uploadedAssets);
    }
  }

  function handleClose() {
    if (uploading) {
      return;
    }

    onClose();
  }

  const validFileCount = files.filter(
    (item) => !item.error || item.status === "completed",
  ).length;

  const completedCount = files.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-upload-title"
    >
      <button
        type="button"
        onClick={handleClose}
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
            onClick={handleClose}
            disabled={uploading}
            aria-label={t("media.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition",
              dragActive
                ? "border-[#0979c4] bg-[#0979c4]/10 dark:bg-sky-950/40"
                : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60",
              uploading ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#0979c4]/10 text-[#0979c4] dark:bg-sky-950/60 dark:text-sky-300">
              <FiUploadCloud className="text-3xl" aria-hidden="true" />
            </span>

            <h3 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {dragActive
                ? t("media.upload.dropActive")
                : t("media.upload.dropTitle")}
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("media.upload.dropDescription")}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa]"
            >
              <FiUploadCloud aria-hidden="true" />
              {t("media.upload.selectFiles")}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[
                ...MEDIA_IMAGE_MIME_TYPES,
                ...MEDIA_DOCUMENT_MIME_TYPES,
              ].join(",")}
              onChange={handleFileInput}
              className="sr-only"
            />

            <div className="mt-4 space-y-1 text-xs text-slate-400 dark:text-slate-500">
              <p>{t("media.upload.acceptedImages")}</p>
              <p>{t("media.upload.acceptedDocuments")}</p>
            </div>
          </div>

          {files.length ? (
            <div className="mt-6">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  {t("media.upload.destinationFolder")}
                </span>

                <select
                  value={folder}
                  disabled={uploading}
                  onChange={(event) => setFolder(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {availableFolders.map((folderValue) => (
                    <option key={folderValue} value={folderValue}>
                      {t(`media.folders.${folderValue}`)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("media.upload.selectedFiles")}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("media.upload.completedCount", {
                    completed: completedCount,
                    total: files.length,
                  })}
                </p>
              </div>

              <div className="mt-3 space-y-3">
                {files.map((item) => {
                  const type = getMediaTypeFromMimeType(item.file.type);

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                          {type === "image" ? (
                            <FiImage aria-hidden="true" />
                          ) : (
                            <FiFile aria-hidden="true" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {item.file.name}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>{formatFileSize(item.file.size)}</span>

                            <span>•</span>

                            <span>
                              {t(`media.upload.stages.${item.status}`)}
                            </span>

                            <UploadStatusIcon status={item.status} />
                          </div>

                          {item.error ? (
                            <p className="mt-2 text-xs leading-5 text-red-600 dark:text-red-400">
                              {item.error}
                            </p>
                          ) : null}

                          {[
                            "preparing",
                            "uploading",
                            "processing",
                            "completed",
                          ].includes(item.status) ? (
                            <div className="mt-3">
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className={[
                                    "h-full rounded-full transition-[width]",
                                    item.status === "completed"
                                      ? "bg-emerald-500"
                                      : "bg-[#0979c4]",
                                  ].join(" ")}
                                  style={{
                                    width: `${item.progress}%`,
                                  }}
                                />
                              </div>

                              <p className="mt-1 text-right text-[10px] text-slate-400">
                                {t("media.upload.progress", {
                                  percentage: item.progress,
                                })}
                              </p>
                            </div>
                          ) : null}
                        </div>

                        {!uploading && item.status !== "completed" ? (
                          <button
                            type="button"
                            onClick={() => removeFile(item.id)}
                            aria-label={t("media.upload.removeFile")}
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          >
                            <FiX aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("media.actions.close")}
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              uploading || !validFileCount || completedCount === validFileCount
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <FiLoader className="animate-spin" aria-hidden="true" />
            ) : (
              <FiUploadCloud aria-hidden="true" />
            )}

            {uploading
              ? t("media.actions.uploading")
              : t("media.actions.upload")}
          </button>
        </footer>
      </section>
    </div>
  );
}
