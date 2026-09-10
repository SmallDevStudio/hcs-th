"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiImage, FiPlus, FiTrash2 } from "react-icons/fi";

import { SolutionMediaPickerController } from "@/components/admin/solutions/SolutionMediaPickerController";
import { LocalizedTextField } from "@/components/admin/form/LocalizedTextField";
import { ABOUT_LIMITS } from "@/constants/about";

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

function getAspectRatioClassName(ratio) {
  if (ratio === "1/1") {
    return "aspect-square";
  }

  if (ratio === "3/4") {
    return "aspect-[3/4]";
  }

  if (ratio === "16/9") {
    return "aspect-video";
  }

  return "aspect-[4/3]";
}

export function AboutSectionMediaField({
  mediaId,
  media,
  imageAlt,
  imageRatio = "4/3",
  onSelect,
  onImageAltChange,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const [pickerOpen, setPickerOpen] = useState(false);

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const assetTitle = getLocalizedAssetTitle(media, language);

  function handleSelected(asset) {
    if (!asset?.id) {
      return;
    }

    onSelect?.(asset);

    setPickerOpen(false);
  }

  function handleRemove() {
    onSelect?.(null);
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
              {t("about.content.image")}
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {t("about.content.imageHint")}
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

            {mediaId
              ? t("about.actions.changeImage")
              : t("about.actions.selectImage")}
          </button>
        </div>

        {media?.publicUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <div
              className={[
                "relative w-full overflow-hidden",
                getAspectRatioClassName(imageRatio),
              ].join(" ")}
            >
              <Image
                src={media.publicUrl}
                alt={
                  imageAlt?.[language] ||
                  media.altText?.[language] ||
                  assetTitle
                }
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-700">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {assetTitle}
                </p>

                <p className="mt-1 truncate text-[10px] text-slate-400">
                  {media.originalName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemove}
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
          <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <FiImage
              aria-hidden="true"
              className="text-2xl text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-xs text-slate-400">
              {t("about.content.noImage")}
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {["en", "th"].map((locale) => (
            <label key={locale} className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("about.content.imageAlt")} —{" "}
                {t(
                  locale === "en"
                    ? "about.languages.english"
                    : "about.languages.thai",
                )}
              </span>

              <input
                type="text"
                value={imageAlt?.[locale] || ""}
                onChange={(event) =>
                  onImageAltChange?.({
                    en: imageAlt?.en || "",
                    th: imageAlt?.th || "",

                    [locale]: event.target.value,
                  })
                }
                disabled={disabled}
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
            </label>
          ))}
        </div>
        {mediaId ? (
          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
            <LocalizedTextField
              label={t("about.content.imageAlt")}
              value={imageAlt}
              onChange={onImageAltChange}
              disabled={disabled}
              required={false}
              requiredLocales={[]}
              maxLength={ABOUT_LIMITS.TITLE_MAX_LENGTH}
            />
          </div>
        ) : null}
      </section>

      {pickerOpen ? (
        <SolutionMediaPickerController
          key={mediaId || "empty-about-image"}
          selectedId={mediaId}
          selectedAsset={media}
          onConfirm={handleSelected}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}
