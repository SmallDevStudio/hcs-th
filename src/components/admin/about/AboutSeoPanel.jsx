"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiImage, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";

import { SolutionMediaPickerController } from "@/components/admin/solutions/SolutionMediaPickerController";
import { ABOUT_LIMITS } from "@/constants/about";

const LOCALES = [
  {
    key: "en",
    labelKey: "about.languages.english",
  },
  {
    key: "th",
    labelKey: "about.languages.thai",
  },
];

function LocalizedSeoField({
  label,
  value,
  onChange,
  disabled,
  maximumLength,
  multiline = false,
  counterKey,
}) {
  const { t } = useTranslation("admin");

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {LOCALES.map((locale) => {
        const currentValue = value?.[locale.key] || "";

        const inputId = ["about-seo", label, locale.key]
          .join("-")
          .replace(/\s+/g, "-")
          .toLowerCase();

        return (
          <label key={locale.key} htmlFor={inputId} className="block">
            <span className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {label} — {t(locale.labelKey)}
              </span>

              <span className="text-[11px] text-slate-400">
                {t(counterKey, {
                  count: currentValue.length,
                  maximum: maximumLength,
                })}
              </span>
            </span>

            {multiline ? (
              <textarea
                id={inputId}
                value={currentValue}
                onChange={(event) => onChange(locale.key, event.target.value)}
                disabled={disabled}
                rows={4}
                maxLength={maximumLength}
                className={[
                  "w-full resize-y rounded-xl border border-slate-200",
                  "bg-white px-4 py-3 text-sm text-slate-950",
                  "outline-none transition",
                  "focus:border-[#0979c4]",
                  "focus:ring-4 focus:ring-[#0979c4]/10",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  "dark:border-slate-700 dark:bg-slate-900",
                  "dark:text-white",
                ].join(" ")}
              />
            ) : (
              <input
                id={inputId}
                type="text"
                value={currentValue}
                onChange={(event) => onChange(locale.key, event.target.value)}
                disabled={disabled}
                maxLength={maximumLength}
                className={[
                  "h-11 w-full rounded-xl border border-slate-200",
                  "bg-white px-4 text-sm text-slate-950",
                  "outline-none transition",
                  "focus:border-[#0979c4]",
                  "focus:ring-4 focus:ring-[#0979c4]/10",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  "dark:border-slate-700 dark:bg-slate-900",
                  "dark:text-white",
                ].join(" ")}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

function getLocalizedAssetTitle(asset, language) {
  return (
    asset?.title?.[language] ||
    asset?.title?.en ||
    asset?.title?.th ||
    asset?.originalName ||
    asset?.id ||
    ""
  );
}

export function AboutSeoPanel({
  seo,
  onChange,
  onSelectImage,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const [pickerOpen, setPickerOpen] = useState(false);

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const selectedAsset = seo?.image || null;

  const assetTitle = getLocalizedAssetTitle(selectedAsset, language);

  function updateLocalizedField(field, locale, nextValue) {
    onChange({
      ...seo,

      [field]: {
        ...seo?.[field],

        [locale]: nextValue,
      },
    });
  }

  function handleSelected(asset) {
    if (!asset?.id) {
      return;
    }

    onSelectImage(asset);

    setPickerOpen(false);
  }

  function handleRemoveImage() {
    onSelectImage(null);
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <header className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0979c4] dark:bg-sky-950/40 dark:text-sky-300">
              <FiSearch aria-hidden="true" className="text-lg" />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
                {t("about.seo.eyebrow")}
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                {t("about.seo.title")}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("about.seo.description")}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <LocalizedSeoField
            label={t("about.seo.fields.title")}
            value={seo?.title}
            onChange={(locale, nextValue) =>
              updateLocalizedField("title", locale, nextValue)
            }
            disabled={disabled}
            maximumLength={ABOUT_LIMITS.SEO_TITLE_MAX_LENGTH}
            counterKey="about.seo.counters.title"
          />

          <LocalizedSeoField
            label={t("about.seo.fields.description")}
            value={seo?.description}
            onChange={(locale, nextValue) =>
              updateLocalizedField("description", locale, nextValue)
            }
            disabled={disabled}
            maximumLength={ABOUT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH}
            multiline
            counterKey="about.seo.counters.description"
          />

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("about.seo.fields.image")}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {t("about.seo.hints.image")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={disabled}
                className={[
                  "inline-flex h-10 shrink-0 items-center justify-center",
                  "gap-2 rounded-xl border border-[#0979c4]/30 px-4",
                  "text-sm font-bold text-[#0979c4] transition",
                  "hover:bg-[#0979c4]/5",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:border-sky-700 dark:text-sky-300",
                ].join(" ")}
              >
                <FiPlus aria-hidden="true" />

                {selectedAsset
                  ? t("about.actions.changeImage")
                  : t("about.actions.selectImage")}
              </button>
            </div>

            {selectedAsset?.publicUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative aspect-[1200/630] bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={selectedAsset.publicUrl}
                    alt={
                      seo?.imageAlt?.[language] ||
                      selectedAsset.altText?.[language] ||
                      assetTitle
                    }
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 720px"
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
                    onClick={handleRemoveImage}
                    disabled={disabled}
                    aria-label={t("about.actions.removeImage")}
                    className={[
                      "inline-flex size-9 shrink-0 items-center",
                      "justify-center rounded-xl border border-red-200",
                      "text-red-600 transition hover:bg-red-50",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      "dark:border-red-900 dark:text-red-400",
                      "dark:hover:bg-red-950/30",
                    ].join(" ")}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex aspect-[1200/630] max-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <FiImage
                  aria-hidden="true"
                  className="text-3xl text-slate-300 dark:text-slate-600"
                />

                <p className="mt-3 text-xs text-slate-400">
                  {t("about.content.noImage")}
                </p>
              </div>
            )}
          </div>

          <LocalizedSeoField
            label={t("about.seo.fields.imageAlt")}
            value={seo?.imageAlt}
            onChange={(locale, nextValue) =>
              updateLocalizedField("imageAlt", locale, nextValue)
            }
            disabled={disabled}
            maximumLength={ABOUT_LIMITS.TITLE_MAX_LENGTH}
            counterKey="about.seo.counters.title"
          />
        </div>
      </section>

      {pickerOpen ? (
        <SolutionMediaPickerController
          key={`about-seo-${seo?.imageMediaId || "empty"}`}
          selectedId={seo?.imageMediaId || null}
          selectedAsset={selectedAsset}
          onConfirm={handleSelected}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}
