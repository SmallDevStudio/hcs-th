"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiGrid,
  FiTrash2,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import Swal from "sweetalert2";

import { AboutSectionMediaField } from "@/components/admin/about/AboutSectionMediaField";
import { LocalizedRichTextEditor } from "@/components/admin/form/LocalizedRichTextEditor";
import { LocalizedTextField } from "@/components/admin/form/LocalizedTextField";
import {
  ABOUT_BACKGROUND_STYLE_VALUES,
  ABOUT_CONTENT_ALIGNMENT_VALUES,
  ABOUT_IMAGE_POSITION_VALUES,
  ABOUT_IMAGE_RATIO_VALUES,
  ABOUT_LIMITS,
  ABOUT_SECTION_LAYOUT_VALUES,
  ABOUT_SECTION_TYPE_VALUES,
  ABOUT_SECTION_TYPES,
} from "@/constants/about";
import { AboutSectionActionsEditor } from "@/components/admin/about/AboutSectionActionsEditor";
import { AboutSectionItemsEditor } from "@/components/admin/about/AboutSectionItemsEditor";

const SECTION_ICONS = {
  [ABOUT_SECTION_TYPES.HERO]: FiZap,
  [ABOUT_SECTION_TYPES.RICH_CONTENT]: FiFileText,
  [ABOUT_SECTION_TYPES.FEATURE_GRID]: FiGrid,
  [ABOUT_SECTION_TYPES.STATISTICS]: FiTrendingUp,
  [ABOUT_SECTION_TYPES.CTA]: FiZap,
};

function isDarkModeActive() {
  return document.documentElement.classList.contains("dark");
}

function getLocalizedValue(value, language, fallback = "") {
  return value?.[language] || value?.en || value?.th || fallback;
}

function SelectField({ label, value, onChange, disabled, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={[
          "h-11 w-full rounded-xl border border-slate-200",
          "bg-white px-3 text-sm text-slate-950 outline-none",
          "transition focus:border-[#0979c4]",
          "focus:ring-4 focus:ring-[#0979c4]/10",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "dark:border-slate-700 dark:bg-slate-900",
          "dark:text-white",
        ].join(" ")}
      >
        {children}
      </select>
    </label>
  );
}

export function AboutSectionCard({
  section,
  index,
  total,
  controller,
  disabled = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const [expanded, setExpanded] = useState(index === 0);

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const SectionIcon = SECTION_ICONS[section.type] || FiFileText;

  const typeTitle = t(`about.sections.types.${section.type}.title`);

  const displayTitle = getLocalizedValue(
    section.internalLabel,
    language,
    getLocalizedValue(section.title, language, typeTitle),
  );

  function updateSection(update) {
    controller.updateSection(section.id, update);
  }

  function updateLayout(field, value) {
    updateSection((currentSection) => {
      const nextLayout = {
        ...currentSection.layout,

        [field]: value,
      };

      if (
        field === "imagePosition" &&
        value === "background" &&
        !["full-width", "banner"].includes(nextLayout.variant)
      ) {
        nextLayout.variant = "full-width";
      }

      if (
        field === "variant" &&
        currentSection.layout.imagePosition === "background" &&
        !["full-width", "banner"].includes(value)
      ) {
        nextLayout.imagePosition = "none";
      }

      return {
        ...currentSection,

        layout: nextLayout,
      };
    });
  }

  async function handleDelete() {
    const darkMode = isDarkModeActive();

    const confirmation = await Swal.fire({
      title: t("about.confirmations.deleteSection.title"),

      text: t("about.confirmations.deleteSection.text"),

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: t("about.confirmations.deleteSection.confirm"),

      cancelButtonText: t("common.cancel"),

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      reverseButtons: true,

      background: darkMode ? "#071522" : "#ffffff",

      color: darkMode ? "#f8fafc" : "#0f172a",
    });

    if (confirmation.isConfirmed) {
      controller.removeSection(section.id);
    }
  }

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border transition",
        section.enabled === false
          ? [
              "border-slate-200 bg-slate-50/70 opacity-75",
              "dark:border-slate-800 dark:bg-slate-900/40",
            ].join(" ")
          : [
              "border-slate-200 bg-white",
              "dark:border-slate-700 dark:bg-slate-950",
            ].join(" "),
      ].join(" ")}
    >
      <header className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0979c4] dark:bg-sky-950/40 dark:text-sky-300">
            <SectionIcon aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-extrabold text-slate-950 dark:text-white">
                {displayTitle}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {typeTitle}
              </span>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-bold",
                  section.enabled === false
                    ? [
                        "bg-amber-50 text-amber-700",
                        "dark:bg-amber-950/40 dark:text-amber-300",
                      ].join(" ")
                    : [
                        "bg-emerald-50 text-emerald-700",
                        "dark:bg-emerald-950/40 dark:text-emerald-300",
                      ].join(" "),
                ].join(" ")}
              >
                {section.enabled === false
                  ? t("about.sections.sectionDisabled")
                  : t("about.sections.sectionEnabled")}
              </span>
            </span>

            <span className="mt-1 block truncate text-[11px] text-slate-400">
              {section.id}
            </span>
          </span>

          {expanded ? (
            <FiChevronUp
              aria-hidden="true"
              className="shrink-0 text-slate-400"
            />
          ) : (
            <FiChevronDown
              aria-hidden="true"
              className="shrink-0 text-slate-400"
            />
          )}
        </button>

        {!disabled ? (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => controller.moveSection(section.id, -1)}
              disabled={index === 0}
              aria-label={t("about.actions.moveUp")}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700"
            >
              <FiArrowUp aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => controller.moveSection(section.id, 1)}
              disabled={index === total - 1}
              aria-label={t("about.actions.moveDown")}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700"
            >
              <FiArrowDown aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => controller.toggleSection(section.id)}
              aria-label={
                section.enabled === false
                  ? t("about.actions.enable")
                  : t("about.actions.disable")
              }
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] dark:border-slate-700"
            >
              {section.enabled === false ? (
                <FiEye aria-hidden="true" />
              ) : (
                <FiEyeOff aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => controller.copySection(section.id)}
              aria-label={t("about.actions.duplicate")}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] dark:border-slate-700"
            >
              <FiCopy aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              aria-label={t("about.actions.delete")}
              className="flex size-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <FiTrash2 aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </header>

      {expanded ? (
        <div className="space-y-6 border-t border-slate-200 p-4 dark:border-slate-800 sm:p-5">
          <section className="space-y-5">
            <div>
              <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                {t("about.content.body")}
              </h4>

              <p className="mt-1 text-xs text-slate-400">
                {t(`about.sections.types.${section.type}.description`)}
              </p>
            </div>

            <SelectField
              label={t("about.sections.addMenuTitle")}
              value={section.type}
              onChange={(value) =>
                controller.changeSectionType(section.id, value)
              }
              disabled={disabled}
            >
              {ABOUT_SECTION_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {t(`about.sections.types.${type}.title`)}
                </option>
              ))}
            </SelectField>

            <LocalizedTextField
              label={t("about.sections.internalLabel")}
              value={section.internalLabel}
              onChange={(internalLabel) =>
                updateSection({
                  internalLabel,
                })
              }
              disabled={disabled}
              required={false}
              requiredLocales={[]}
              maxLength={ABOUT_LIMITS.SECTION_LABEL_MAX_LENGTH}
              hints={{
                en: t("about.sections.internalLabelHint"),
                th: t("about.sections.internalLabelHint"),
              }}
            />

            <LocalizedTextField
              label={t("about.content.eyebrow")}
              value={section.eyebrow}
              onChange={(eyebrow) =>
                updateSection({
                  eyebrow,
                })
              }
              disabled={disabled}
              required={false}
              requiredLocales={[]}
              maxLength={ABOUT_LIMITS.EYEBROW_MAX_LENGTH}
            />

            <LocalizedTextField
              label={t("about.content.title")}
              value={section.title}
              onChange={(title) =>
                updateSection({
                  title,
                })
              }
              disabled={disabled}
              required
              maxLength={ABOUT_LIMITS.TITLE_MAX_LENGTH}
            />

            <LocalizedRichTextEditor
              id={`about-section-${section.id}-content`}
              value={section.content}
              onChange={(content) =>
                updateSection({
                  content,
                })
              }
              label={t("about.content.body")}
              disabled={disabled}
              required={false}
              requiredLocales={[]}
              minHeight={240}
            />
          </section>

          <section className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
              {t("about.layout.title")}
            </h4>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SelectField
                label={t("about.layout.variant")}
                value={section.layout.variant}
                onChange={(value) => updateLayout("variant", value)}
                disabled={disabled}
              >
                {ABOUT_SECTION_LAYOUT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`about.layout.variants.${value}`)}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t("about.layout.imagePosition")}
                value={section.layout.imagePosition}
                onChange={(value) => updateLayout("imagePosition", value)}
                disabled={disabled}
              >
                {ABOUT_IMAGE_POSITION_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`about.layout.imagePositions.${value}`)}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t("about.layout.imageRatio")}
                value={section.layout.imageRatio}
                onChange={(value) => updateLayout("imageRatio", value)}
                disabled={disabled}
              >
                {ABOUT_IMAGE_RATIO_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`about.layout.imageRatios.${value}`)}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t("about.layout.contentAlignment")}
                value={section.layout.contentAlignment}
                onChange={(value) => updateLayout("contentAlignment", value)}
                disabled={disabled}
              >
                {ABOUT_CONTENT_ALIGNMENT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`about.layout.alignments.${value}`)}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label={t("about.layout.background")}
                value={section.layout.background}
                onChange={(value) => updateLayout("background", value)}
                disabled={disabled}
              >
                {ABOUT_BACKGROUND_STYLE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t(`about.layout.backgrounds.${value}`)}
                  </option>
                ))}
              </SelectField>
            </div>
          </section>

          <AboutSectionMediaField
            mediaId={section.imageMediaId}
            media={section.image}
            imageAlt={section.imageAlt}
            imageRatio={section.layout.imageRatio}
            onSelect={(asset) => controller.setSectionImage(section.id, asset)}
            onImageAltChange={(imageAlt) =>
              updateSection({
                imageAlt,
              })
            }
            disabled={disabled}
          />

          <AboutSectionActionsEditor
            section={section}
            controller={controller}
            disabled={disabled}
          />

          {[
            ABOUT_SECTION_TYPES.RICH_CONTENT,
            ABOUT_SECTION_TYPES.FEATURE_GRID,
            ABOUT_SECTION_TYPES.STATISTICS,
          ].includes(section.type) ? (
            <AboutSectionItemsEditor
              section={section}
              controller={controller}
              disabled={disabled}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
