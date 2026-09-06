"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiFileText, FiLoader, FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { MEDIA_LIMITS } from "@/constants/media";
import { updateMediaAsset } from "@/services/http/media.api";

function createInitialValues(asset) {
  return {
    titleEn: asset.title?.en || "",
    titleTh: asset.title?.th || "",

    altTextEn: asset.altText?.en || "",
    altTextTh: asset.altText?.th || "",

    captionEn: asset.caption?.en || "",
    captionTh: asset.caption?.th || "",

    keywords: Array.isArray(asset.keywords) ? asset.keywords.join(", ") : "",
  };
}

function normalizeKeywords(value) {
  return [
    ...new Set(
      value
        .split(",")
        .map((keyword) => keyword.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
}

function LocalizedInput({
  label,
  language,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
}) {
  const inputClasses = [
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5",
    "text-sm text-slate-900 outline-none transition",
    "placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-2 focus:ring-[#0979c4]/10",
    "dark:border-slate-700 dark:bg-slate-900 dark:text-white",
    "dark:placeholder:text-slate-500 dark:focus:border-sky-500",
  ].join(" ");

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {language}
        </span>
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}

      <span className="mt-1 block text-right text-[10px] text-slate-400">
        {value.length}/{maxLength}
      </span>
    </label>
  );
}

export function MediaEditModal({ asset, onClose, onSaved }) {
  const { t } = useTranslation("admin");

  const [values, setValues] = useState(() => createInitialValues(asset));

  const [saving, setSaving] = useState(false);

  function updateValue(field, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const updatedAsset = await updateMediaAsset({
        mediaId: asset.id,

        title: {
          en: values.titleEn,
          th: values.titleTh,
        },

        altText: {
          en: values.altTextEn,
          th: values.altTextTh,
        },

        caption: {
          en: values.captionEn,
          th: values.captionTh,
        },

        keywords: normalizeKeywords(values.keywords),
      });

      toast.success(t("media.messages.updateSuccess"));

      onSaved(updatedAsset);
    } catch (error) {
      toast.error(error?.message || t("media.messages.updateFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-edit-title"
    >
      <button
        type="button"
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("media.actions.close")}
        tabIndex={-1}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t("media.edit.eyebrow")}
            </p>

            <h2
              id="media-edit-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t("media.edit.title")}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("media.edit.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("media.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <div className="relative flex aspect-square items-center justify-center">
                  {asset.type === "image" && asset.publicUrl ? (
                    <Image
                      src={asset.publicUrl}
                      alt={asset.altText?.en || asset.originalName}
                      fill
                      unoptimized
                      sizes="260px"
                      className="object-contain p-3"
                    />
                  ) : (
                    <FiFileText
                      className="text-6xl text-[#0979c4] dark:text-sky-400"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("media.edit.originalName")}
                  </p>

                  <p className="mt-1 break-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {asset.originalName}
                  </p>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("media.edit.storagePath")}
                  </p>

                  <p className="mt-1 break-all font-mono text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                    {asset.storagePath}
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <section>
                <h3 className="mb-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("media.edit.titleField")}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <LocalizedInput
                    label={t("media.edit.titleField")}
                    language={t("media.edit.english")}
                    value={values.titleEn}
                    onChange={(event) =>
                      updateValue("titleEn", event.target.value)
                    }
                    placeholder={t("media.edit.titlePlaceholder")}
                    maxLength={MEDIA_LIMITS.TITLE_MAX_LENGTH}
                  />

                  <LocalizedInput
                    label={t("media.edit.titleField")}
                    language={t("media.edit.thai")}
                    value={values.titleTh}
                    onChange={(event) =>
                      updateValue("titleTh", event.target.value)
                    }
                    placeholder={t("media.edit.titlePlaceholder")}
                    maxLength={MEDIA_LIMITS.TITLE_MAX_LENGTH}
                  />
                </div>
              </section>

              {asset.type === "image" ? (
                <section>
                  <h3 className="mb-4 text-sm font-extrabold text-slate-950 dark:text-white">
                    {t("media.edit.altText")}
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <LocalizedInput
                      label={t("media.edit.altText")}
                      language={t("media.edit.english")}
                      value={values.altTextEn}
                      onChange={(event) =>
                        updateValue("altTextEn", event.target.value)
                      }
                      placeholder={t("media.edit.altPlaceholder")}
                      maxLength={MEDIA_LIMITS.ALT_TEXT_MAX_LENGTH}
                      multiline
                    />

                    <LocalizedInput
                      label={t("media.edit.altText")}
                      language={t("media.edit.thai")}
                      value={values.altTextTh}
                      onChange={(event) =>
                        updateValue("altTextTh", event.target.value)
                      }
                      placeholder={t("media.edit.altPlaceholder")}
                      maxLength={MEDIA_LIMITS.ALT_TEXT_MAX_LENGTH}
                      multiline
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {t("media.edit.imageAltHelp")}
                  </p>
                </section>
              ) : null}

              <section>
                <h3 className="mb-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("media.edit.caption")}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <LocalizedInput
                    label={t("media.edit.caption")}
                    language={t("media.edit.english")}
                    value={values.captionEn}
                    onChange={(event) =>
                      updateValue("captionEn", event.target.value)
                    }
                    placeholder={t("media.edit.captionPlaceholder")}
                    maxLength={MEDIA_LIMITS.CAPTION_MAX_LENGTH}
                    multiline
                  />

                  <LocalizedInput
                    label={t("media.edit.caption")}
                    language={t("media.edit.thai")}
                    value={values.captionTh}
                    onChange={(event) =>
                      updateValue("captionTh", event.target.value)
                    }
                    placeholder={t("media.edit.captionPlaceholder")}
                    maxLength={MEDIA_LIMITS.CAPTION_MAX_LENGTH}
                    multiline
                  />
                </div>
              </section>

              <section>
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-950 dark:text-white">
                    {t("media.edit.keywords")}
                  </span>

                  <input
                    type="text"
                    value={values.keywords}
                    onChange={(event) =>
                      updateValue("keywords", event.target.value)
                    }
                    placeholder={t("media.edit.keywordsPlaceholder")}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-2 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>

                <p className="mt-2 text-xs text-slate-400">
                  {t("media.edit.keywordsHelp")}
                </p>
              </section>
            </div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("media.actions.close")}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50"
          >
            {saving ? (
              <FiLoader className="animate-spin" aria-hidden="true" />
            ) : (
              <FiSave aria-hidden="true" />
            )}

            {saving ? t("media.actions.saving") : t("media.actions.save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
