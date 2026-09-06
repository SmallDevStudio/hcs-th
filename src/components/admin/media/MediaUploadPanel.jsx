"use client";

import { useMemo, useRef, useState } from "react";
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
  MEDIA_TYPES,
  getMediaTypeFromMimeType,
  isFolderAllowedForMediaType,
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
  return mediaType === MEDIA_TYPES.DOCUMENT
    ? MEDIA_FOLDERS.DOWNLOADS
    : MEDIA_FOLDERS.PRODUCTS;
}

function getAcceptedMimeTypes(mediaType) {
  if (mediaType === MEDIA_TYPES.IMAGE) {
    return MEDIA_IMAGE_MIME_TYPES;
  }

  if (mediaType === MEDIA_TYPES.DOCUMENT) {
    return MEDIA_DOCUMENT_MIME_TYPES;
  }

  return [...MEDIA_IMAGE_MIME_TYPES, ...MEDIA_DOCUMENT_MIME_TYPES];
}

function validateFile(file, expectedType, translate) {
  const mediaType = getMediaTypeFromMimeType(file.type);

  if (!mediaType || (expectedType && mediaType !== expectedType)) {
    return translate("media.messages.invalidFile", {
      name: file.name,
    });
  }

  if (
    mediaType === MEDIA_TYPES.IMAGE &&
    file.size > MEDIA_LIMITS.IMAGE_MAX_BYTES
  ) {
    return translate("media.messages.imageTooLarge", {
      name: file.name,
    });
  }

  if (
    mediaType === MEDIA_TYPES.DOCUMENT &&
    file.size > MEDIA_LIMITS.DOCUMENT_MAX_BYTES
  ) {
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

export function MediaUploadPanel({
  mediaType = null,
  multiple = true,
  maximumFiles = 20,
  defaultFolder,
  lockFolder = false,
  onUploaded,
}) {
  const { t } = useTranslation("admin");

  const fileInputRef = useRef(null);

  const resolvedDefaultFolder =
    defaultFolder &&
    (!mediaType || isFolderAllowedForMediaType(defaultFolder, mediaType))
      ? defaultFolder
      : getDefaultFolder(mediaType);

  const [files, setFiles] = useState([]);

  const [folder, setFolder] = useState(resolvedDefaultFolder);

  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);

  const acceptedMimeTypes = useMemo(
    () => getAcceptedMimeTypes(mediaType),
    [mediaType],
  );

  const availableFolders = useMemo(() => {
    if (mediaType === MEDIA_TYPES.IMAGE) {
      return MEDIA_IMAGE_FOLDERS;
    }

    if (mediaType === MEDIA_TYPES.DOCUMENT) {
      return MEDIA_DOCUMENT_FOLDERS;
    }

    return [...new Set([...MEDIA_IMAGE_FOLDERS, ...MEDIA_DOCUMENT_FOLDERS])];
  }, [mediaType]);

  const completedCount = files.filter(
    (item) => item.status === "completed",
  ).length;

  const failedCount = files.filter((item) => item.status === "failed").length;

  const activeUploadCount = files.filter((item) =>
    ["preparing", "uploading", "processing"].includes(item.status),
  ).length;

  const overallProgress = useMemo(() => {
    const progressItems = files.filter((item) => !item.validationError);

    if (!progressItems.length) {
      return 0;
    }

    const progressTotal = progressItems.reduce(
      (total, item) => total + Number(item.progress || 0),
      0,
    );

    return Math.round(progressTotal / progressItems.length);
  }, [files]);

  function addFiles(selectedFiles) {
    const incomingFiles = Array.from(selectedFiles || []);

    if (!incomingFiles.length) {
      return;
    }

    setFiles((currentFiles) => {
      const existingIds = new Set(currentFiles.map((item) => item.id));

      const remainingSlots = Math.max(0, maximumFiles - currentFiles.length);

      const filesToAdd = multiple
        ? incomingFiles.slice(0, remainingSlots)
        : incomingFiles.slice(0, 1);

      const acceptedItems = filesToAdd.map((file, index) => {
        const baseId = createFileId(file);

        const duplicated = existingIds.has(baseId);

        const id = duplicated
          ? `${baseId}-duplicate-${Date.now()}-${index}`
          : baseId;

        const validationError = duplicated
          ? t("media.messages.duplicateFile", {
              name: file.name,
            })
          : validateFile(file, mediaType, t);

        existingIds.add(baseId);

        return {
          id,
          file,
          status: validationError ? "failed" : "waiting",
          progress: 0,
          error: validationError,
          validationError: Boolean(validationError),
        };
      });

      if (!multiple) {
        return acceptedItems;
      }

      return [...currentFiles, ...acceptedItems];
    });
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
      (item) => item.status !== "completed" && !item.validationError,
    );

    if (!uploadableFiles.length) {
      return;
    }

    setUploading(true);

    const uploadedAssets = [];

    let attemptFailedCount = 0;

    for (const item of uploadableFiles) {
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
          validationError: false,
        });
      } catch (error) {
        attemptFailedCount += 1;

        updateFileState(item.id, {
          status: "failed",
          error: error?.message || t("media.messages.uploadFailed"),
          validationError: false,
        });
      }
    }

    setUploading(false);

    const finalCompletedCount = completedCount + uploadedAssets.length;

    const finalFailedCount = failedCount + attemptFailedCount;

    if (uploadedAssets.length) {
      onUploaded?.(uploadedAssets, {
        total: files.length,
        completedCount: finalCompletedCount,
        failedCount: finalFailedCount,
        allCompleted:
          finalCompletedCount === files.length && finalFailedCount === 0,
      });
    }
  }

  const validFileCount = files.filter((item) => !item.validationError).length;

  const uploadFinished =
    validFileCount > 0 && completedCount === validFileCount;

  const selectionFull = files.length >= maximumFiles;

  return (
    <div className="space-y-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition",
          dragActive
            ? "border-[#0979c4] bg-[#0979c4]/10 dark:bg-sky-950/40"
            : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60",
          uploading || selectionFull ? "pointer-events-none opacity-60" : "",
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
          disabled={uploading || selectionFull}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiUploadCloud aria-hidden="true" />

          {t("media.upload.selectFiles")}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedMimeTypes.join(",")}
          onChange={handleFileInput}
          className="sr-only"
        />

        <div className="mt-4 space-y-1 text-xs text-slate-400 dark:text-slate-500">
          {!mediaType || mediaType === MEDIA_TYPES.IMAGE ? (
            <p>{t("media.upload.acceptedImages")}</p>
          ) : null}

          {!mediaType || mediaType === MEDIA_TYPES.DOCUMENT ? (
            <p>{t("media.upload.acceptedDocuments")}</p>
          ) : null}
        </div>
      </div>

      {files.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
            <div>
              <div className="flex items-center justify-between gap-3">
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

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={[
                    "h-full rounded-full transition-[width]",
                    uploadFinished
                      ? "bg-emerald-500"
                      : failedCount
                        ? "bg-amber-500"
                        : "bg-[#0979c4]",
                  ].join(" ")}
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  {activeUploadCount
                    ? t("media.actions.uploading")
                    : t("media.upload.progress", {
                        percentage: overallProgress,
                      })}
                </span>

                <span>{overallProgress}%</span>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("media.upload.destinationFolder")}
              </span>

              <select
                value={folder}
                disabled={uploading || lockFolder}
                onChange={(event) => setFolder(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0979c4] disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
              >
                {availableFolders.map((folderValue) => (
                  <option key={folderValue} value={folderValue}>
                    {t(`media.folders.${folderValue}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            {files.map((item) => {
              const type = getMediaTypeFromMimeType(item.file.type);

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                      {type === MEDIA_TYPES.IMAGE ? (
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

                        <span>{t(`media.upload.stages.${item.status}`)}</span>

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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !validFileCount || uploadFinished}
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
          </div>
        </>
      ) : null}
    </div>
  );
}
