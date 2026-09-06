"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiCopy,
  FiDownload,
  FiEdit3,
  FiFile,
  FiFileText,
  FiImage,
  FiTrash2,
} from "react-icons/fi";

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value, locale) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
  }).format(date);
}

function DocumentIcon({ extension }) {
  const iconClassName = "text-4xl";

  if (extension === "pdf") {
    return (
      <FiFileText
        className={`${iconClassName} text-red-500`}
        aria-hidden="true"
      />
    );
  }

  return (
    <FiFile
      className={`${iconClassName} text-[#0979c4] dark:text-sky-400`}
      aria-hidden="true"
    />
  );
}

function ActionButton({
  label,
  onClick,
  children,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
        "border transition disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          : "border-slate-200 text-slate-500 hover:border-[#0979c4]/40 hover:bg-[#0979c4]/5 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function MediaAssetCard({
  asset,
  view = "grid",
  canUpdate,
  canDelete,
  processing = false,
  copied = false,
  onEdit,
  onDelete,
  onCopy,
}) {
  const { t, i18n } = useTranslation("admin");

  const title =
    asset.title?.[i18n.resolvedLanguage] ||
    asset.title?.en ||
    asset.originalName ||
    t("media.card.unnamed");

  const isImage = asset.type === "image";
  const isList = view === "list";

  if (isList) {
    return (
      <article className="grid gap-4 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50 sm:grid-cols-[minmax(260px,1fr)_130px_150px_100px_120px_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
            {isImage && asset.publicUrl ? (
              <Image
                src={asset.publicUrl}
                alt={
                  asset.altText?.[i18n.resolvedLanguage] ||
                  asset.altText?.en ||
                  title
                }
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <DocumentIcon extension={asset.extension} />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {asset.originalName}
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {t(`media.types.${asset.type}`)}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          {t(`media.folders.${asset.folder}`)}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatFileSize(asset.size)}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(
            asset.updatedAt || asset.createdAt,
            i18n.resolvedLanguage,
          )}
        </p>

        <div className="flex items-center gap-2 sm:justify-end">
          <ActionButton
            label={t("media.actions.copyUrl")}
            onClick={() => onCopy(asset)}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </ActionButton>

          {asset.publicUrl ? (
            <a
              href={asset.publicUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("media.actions.download")}
              title={t("media.actions.download")}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700 dark:hover:text-sky-300"
            >
              <FiDownload aria-hidden="true" />
            </a>
          ) : null}

          {canUpdate ? (
            <ActionButton
              label={t("media.actions.edit")}
              onClick={() => onEdit(asset)}
            >
              <FiEdit3 />
            </ActionButton>
          ) : null}

          {canDelete ? (
            <ActionButton
              label={t("media.actions.delete")}
              onClick={() => onDelete(asset)}
              danger
              disabled={processing}
            >
              <FiTrash2 />
            </ActionButton>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#0979c4]/30 hover:shadow-lg dark:border-slate-800 dark:bg-[#071522]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {isImage && asset.publicUrl ? (
          <Image
            src={asset.publicUrl}
            alt={
              asset.altText?.[i18n.resolvedLanguage] ||
              asset.altText?.en ||
              title
            }
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <DocumentIcon extension={asset.extension} />

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              {asset.extension}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider !text-white backdrop-blur">
            {isImage ? <FiImage /> : <FiFileText />}
            {t(`media.types.${asset.type}`)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h2
          className="truncate text-sm font-extrabold text-slate-950 dark:text-white"
          title={title}
        >
          {title}
        </h2>

        <p
          className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400"
          title={asset.originalName}
        >
          {asset.originalName}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#0979c4]/10 px-2.5 py-1 text-[10px] font-bold text-[#0979c4] dark:bg-sky-950/60 dark:text-sky-300">
            {t(`media.folders.${asset.folder}`)}
          </span>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {formatFileSize(asset.size)}
          </span>

          <span
            className={[
              "rounded-full px-2.5 py-1 text-[10px] font-bold",
              asset.isUsed
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
            ].join(" ")}
          >
            {asset.isUsed
              ? t("media.card.used", {
                  count: asset.usageCount,
                })
              : t("media.card.unused")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {formatDate(
              asset.updatedAt || asset.createdAt,
              i18n.resolvedLanguage,
            )}
          </p>

          <div className="flex items-center gap-2">
            <ActionButton
              label={t("media.actions.copyUrl")}
              onClick={() => onCopy(asset)}
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </ActionButton>

            {canUpdate ? (
              <ActionButton
                label={t("media.actions.edit")}
                onClick={() => onEdit(asset)}
              >
                <FiEdit3 />
              </ActionButton>
            ) : null}

            {canDelete ? (
              <ActionButton
                label={t("media.actions.delete")}
                onClick={() => onDelete(asset)}
                danger
                disabled={processing}
              >
                <FiTrash2 />
              </ActionButton>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
