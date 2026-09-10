"use client";

import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiLoader,
  FiRefreshCw,
  FiSave,
  FiSend,
  FiSlash,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

function formatDateTime(value, language) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ published, publishing, unpublishing }) {
  const { t } = useTranslation("admin");

  if (publishing) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
        <FiLoader aria-hidden="true" className="animate-spin" />

        {t("about.status.publishing")}
      </span>
    );
  }

  if (unpublishing) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <FiLoader aria-hidden="true" className="animate-spin" />

        {t("about.status.unpublishing")}
      </span>
    );
  }

  if (published) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <FiCheckCircle aria-hidden="true" />

        {t("about.status.published")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      <FiClock aria-hidden="true" />

      {t("about.status.unpublished")}
    </span>
  );
}

export function AboutBuilderToolbar({
  page,
  dirty,
  saving,
  publishing,
  unpublishing,
  lastSavedAt,
  canUpdate,
  canPublish,
  onSave,
  onPublish,
  onUnpublish,
  onReload,
  onPreview,
}) {
  const { t, i18n } = useTranslation("admin");

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const published =
    Boolean(page?.published) && Number(page?.publishedVersion || 0) > 0;

  const busy = saving || publishing || unpublishing;

  const formattedLastSavedAt = formatDateTime(
    lastSavedAt || page?.draft?.updatedAt,
    language,
  );

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              published={published}
              publishing={publishing}
              unpublishing={unpublishing}
            />

            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                "text-xs font-bold",
                dirty
                  ? [
                      "bg-orange-50 text-orange-700",
                      "dark:bg-orange-950/40 dark:text-orange-300",
                    ].join(" ")
                  : [
                      "bg-slate-100 text-slate-600",
                      "dark:bg-slate-900 dark:text-slate-300",
                    ].join(" "),
              ].join(" ")}
            >
              {dirty ? (
                <FiClock aria-hidden="true" />
              ) : (
                <FiCheckCircle aria-hidden="true" />
              )}

              {saving
                ? t("about.status.saving")
                : dirty
                  ? t("about.status.unsaved")
                  : t("about.status.saved")}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span>
              {t("about.status.draftVersion", {
                version: Number(page?.draftVersion || 0),
              })}
            </span>

            {published ? (
              <span>
                {t("about.status.publishedVersion", {
                  version: Number(page?.publishedVersion || 0),
                })}
              </span>
            ) : null}

            {formattedLastSavedAt ? (
              <span>
                {t("about.status.lastSaved", {
                  date: formattedLastSavedAt,
                })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            disabled={busy}
            className={[
              "inline-flex h-10 items-center justify-center gap-2",
              "rounded-xl border border-slate-200 bg-white px-4",
              "text-sm font-semibold text-slate-600 transition",
              "hover:bg-slate-50 disabled:cursor-not-allowed",
              "disabled:opacity-40",
              "dark:border-slate-700 dark:bg-slate-900",
              "dark:text-slate-300 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            <FiRefreshCw aria-hidden="true" />

            {t("about.actions.reload")}
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={busy}
            className={[
              "inline-flex h-10 items-center justify-center gap-2",
              "rounded-xl border border-slate-200 bg-white px-4",
              "text-sm font-semibold text-slate-600 transition",
              "hover:bg-slate-50 disabled:cursor-not-allowed",
              "disabled:opacity-40",
              "dark:border-slate-700 dark:bg-slate-900",
              "dark:text-slate-300 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            <FiEye aria-hidden="true" />

            {t("about.actions.preview")}
          </button>

          {canUpdate ? (
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || busy}
              className={[
                "inline-flex h-10 items-center justify-center gap-2",
                "rounded-xl border border-[#0979c4]/30 px-4",
                "text-sm font-bold text-[#0979c4] transition",
                "hover:bg-[#0979c4]/5",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "dark:border-sky-700 dark:text-sky-300",
              ].join(" ")}
            >
              {saving ? (
                <FiLoader aria-hidden="true" className="animate-spin" />
              ) : (
                <FiSave aria-hidden="true" />
              )}

              {saving ? t("about.status.saving") : t("about.actions.save")}
            </button>
          ) : null}

          {canPublish && published ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={busy}
              className={[
                "inline-flex h-10 items-center justify-center gap-2",
                "rounded-xl border border-red-200 px-4",
                "text-sm font-bold text-red-600 transition",
                "hover:bg-red-50",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "dark:border-red-900 dark:text-red-400",
                "dark:hover:bg-red-950/30",
              ].join(" ")}
            >
              {unpublishing ? (
                <FiLoader aria-hidden="true" className="animate-spin" />
              ) : (
                <FiSlash aria-hidden="true" />
              )}

              {t("about.actions.unpublish")}
            </button>
          ) : null}

          {canPublish ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={busy}
              className={[
                "inline-flex h-10 items-center justify-center gap-2",
                "rounded-xl bg-[#0979c4] px-5",
                "text-sm font-bold text-white shadow-sm transition",
                "hover:bg-[#076aa9]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {publishing ? (
                <FiLoader aria-hidden="true" className="animate-spin" />
              ) : (
                <FiSend aria-hidden="true" />
              )}

              {publishing
                ? t("about.status.publishing")
                : t("about.actions.publish")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
