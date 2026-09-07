"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiLoader, FiRefreshCw, FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { AdminCheckboxField } from "@/components/admin/form/AdminCheckboxField";
import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { LocalizedFieldGroup } from "@/components/admin/form/LocalizedFieldGroup";
import { LocalizedStringListField } from "@/components/admin/products/ProductRepeatableFields";
import { SolutionImageField } from "@/components/admin/solutions/SolutionImageField";
import {
  SOLUTION_DEFAULTS,
  SOLUTION_ICON_VALUES,
  SOLUTION_LIMITS,
  SOLUTION_STATUSES,
  SOLUTION_STATUS_VALUES,
  normalizeSolutionSlug,
} from "@/constants/solutions";
import { createSolutionSchema } from "@/modules/solutions/solution.schema";
import { createSolution, updateSolution } from "@/services/http/solutions.api";

function createDefaultValues(solution) {
  return {
    name: {
      en: solution?.name?.en || "",
      th: solution?.name?.th || "",
    },

    slug: solution?.slug || "",

    eyebrow: {
      en: solution?.eyebrow?.en || SOLUTION_DEFAULTS.eyebrow.en,

      th: solution?.eyebrow?.th || SOLUTION_DEFAULTS.eyebrow.th,
    },

    shortDescription: {
      en:
        solution?.shortDescription?.en || SOLUTION_DEFAULTS.shortDescription.en,

      th:
        solution?.shortDescription?.th || SOLUTION_DEFAULTS.shortDescription.th,
    },

    description: {
      en: solution?.description?.en || SOLUTION_DEFAULTS.description.en,

      th: solution?.description?.th || SOLUTION_DEFAULTS.description.th,
    },

    icon: solution?.icon || SOLUTION_DEFAULTS.icon,

    imageMediaId: solution?.imageMediaId || SOLUTION_DEFAULTS.imageMediaId,

    features: {
      en: Array.isArray(solution?.features?.en) ? solution.features.en : [],

      th: Array.isArray(solution?.features?.th) ? solution.features.th : [],
    },

    status: solution?.status || SOLUTION_STATUSES.DRAFT,

    featured: Boolean(solution?.featured),

    showOnHome: Boolean(solution?.showOnHome),

    sortOrder: Number(solution?.sortOrder ?? SOLUTION_DEFAULTS.sortOrder),

    seo: {
      title: {
        en: solution?.seo?.title?.en || "",
        th: solution?.seo?.title?.th || "",
      },

      description: {
        en: solution?.seo?.description?.en || "",

        th: solution?.seo?.description?.th || "",
      },

      keywords: {
        en: Array.isArray(solution?.seo?.keywords?.en)
          ? solution.seo.keywords.en
          : [],

        th: Array.isArray(solution?.seo?.keywords?.th)
          ? solution.seo.keywords.th
          : [],
      },
    },
  };
}

function normalizeKeywords(value) {
  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map((keyword) => keyword.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
}

function getIconTranslationKey(icon) {
  if (icon === "fire-rated") {
    return "fireRated";
  }

  if (icon === "access-control") {
    return "accessControl";
  }

  return icon;
}

function SelectField({
  control,
  name,
  label,
  children,
  disabled = false,
  required = false,
}) {
  const controller = useController({
    control,
    name,
  });

  const fieldName = controller.field.name;

  const fieldValue = controller.field.value;

  const handleBlur = controller.field.onBlur;

  const handleChange = controller.field.onChange;

  const errorMessage = controller.fieldState.error?.message;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <select
        name={fieldName}
        value={fieldValue ?? ""}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={Boolean(errorMessage)}
        className={[
          "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-950 outline-none transition",
          "focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10",
          "disabled:cursor-not-allowed disabled:bg-slate-100",
          "dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800",
          errorMessage
            ? "border-red-400 dark:border-red-700"
            : "border-slate-200 dark:border-slate-700",
        ].join(" ")}
      >
        {children}
      </select>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}
    </label>
  );
}

export function SolutionFormModal({ solution = null, onClose, onSaved }) {
  const { t } = useTranslation("admin");

  const editing = Boolean(solution?.id);

  const { control, getValues, handleSubmit, setValue } = useForm({
    resolver: zodResolver(createSolutionSchema),

    defaultValues: createDefaultValues(solution),

    mode: "onBlur",
  });

  const [keywordValues, setKeywordValues] = useState({
    en: Array.isArray(solution?.seo?.keywords?.en)
      ? solution.seo.keywords.en.join(", ")
      : "",

    th: Array.isArray(solution?.seo?.keywords?.th)
      ? solution.seo.keywords.th.join(", ")
      : "",
  });

  const [saving, setSaving] = useState(false);

  function handleGenerateSlug() {
    const englishName = getValues("name.en");

    const slug = normalizeSolutionSlug(englishName);

    setValue("slug", slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitSolution(values) {
    setSaving(true);

    const payload = {
      ...values,

      imageMediaId: values.imageMediaId || null,

      features: {
        en: Array.isArray(values.features?.en) ? values.features.en : [],

        th: Array.isArray(values.features?.th) ? values.features.th : [],
      },

      seo: {
        ...values.seo,

        keywords: {
          en: normalizeKeywords(keywordValues.en),

          th: normalizeKeywords(keywordValues.th),
        },
      },
    };

    try {
      const savedSolution = editing
        ? await updateSolution({
            solutionId: solution.id,
            values: payload,
          })
        : await createSolution({
            values: payload,
          });

      toast.success(
        t(
          editing
            ? "solutions.messages.updateSuccess"
            : "solutions.messages.createSuccess",
        ),
      );

      onSaved(savedSolution);
    } catch (error) {
      let message =
        error?.message ||
        t(
          editing
            ? "solutions.messages.updateFailed"
            : "solutions.messages.createFailed",
        );

      if (error?.code === "CONFLICT" && error?.details?.field === "slug") {
        message = t("solutions.messages.slugExists");
      }

      if (error?.details?.missingFields?.length) {
        message = t("solutions.messages.publishIncomplete");
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solution-form-title"
    >
      <button
        type="button"
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("solutions.actions.close")}
        tabIndex={-1}
      />

      <form
        onSubmit={handleSubmit(submitSolution)}
        noValidate
        className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t(
                editing
                  ? "solutions.form.editEyebrow"
                  : "solutions.form.createEyebrow",
              )}
            </p>

            <h2
              id="solution-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t(
                editing
                  ? "solutions.form.editTitle"
                  : "solutions.form.createTitle",
              )}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t(
                editing
                  ? "solutions.form.editDescription"
                  : "solutions.form.createDescription",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("solutions.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.form.basicSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="name"
                label={t("solutions.fields.name")}
                required
                maxLength={SOLUTION_LIMITS.NAME_MAX_LENGTH}
              />

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <AdminFormField
                  control={control}
                  name="slug"
                  label={t("solutions.fields.slug")}
                  hint={t("solutions.fields.slugHint")}
                  placeholder={t("solutions.placeholders.slug")}
                  required
                  maxLength={SOLUTION_LIMITS.SLUG_MAX_LENGTH}
                />

                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
                >
                  <FiRefreshCw aria-hidden="true" />

                  {t("solutions.actions.generateSlug")}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  control={control}
                  name="icon"
                  label={t("solutions.fields.icon")}
                  disabled={saving}
                  required
                >
                  {SOLUTION_ICON_VALUES.map((icon) => (
                    <option key={icon} value={icon}>
                      {t(`solutions.icons.${getIconTranslationKey(icon)}`)}
                    </option>
                  ))}
                </SelectField>

                <LocalizedFieldGroup
                  control={control}
                  name="eyebrow"
                  label={t("solutions.fields.eyebrow")}
                  maxLength={SOLUTION_LIMITS.EYEBROW_MAX_LENGTH}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.form.contentSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="shortDescription"
                label={t("solutions.fields.shortDescription")}
                multiline
                rows={3}
                maxLength={SOLUTION_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="description"
                label={t("solutions.fields.description")}
                multiline
                rows={8}
                maxLength={SOLUTION_LIMITS.DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </section>

          <SolutionImageField
            control={control}
            solution={solution}
            disabled={saving}
          />

          <LocalizedStringListField
            control={control}
            name="features"
            label={t("solutions.form.featuresSection")}
            itemLabel={t("solutions.fields.feature")}
            emptyText={t("solutions.form.emptyFeatures")}
            addText={t("solutions.actions.addFeature")}
            removeText={t("solutions.actions.removeFeature")}
            maximumItems={SOLUTION_LIMITS.FEATURES_MAX_ITEMS}
            maximumLength={SOLUTION_LIMITS.FEATURE_MAX_LENGTH}
            disabled={saving}
          />

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.form.displaySection")}
            </h3>

            <div className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  control={control}
                  name="status"
                  label={t("solutions.fields.status")}
                  disabled={saving}
                >
                  {SOLUTION_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {t(`solutions.statuses.${status}`)}
                    </option>
                  ))}
                </SelectField>

                <AdminFormField
                  control={control}
                  name="sortOrder"
                  type="number"
                  min={SOLUTION_LIMITS.SORT_ORDER_MIN}
                  max={SOLUTION_LIMITS.SORT_ORDER_MAX}
                  label={t("solutions.fields.sortOrder")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminCheckboxField
                  control={control}
                  name="featured"
                  label={t("solutions.fields.featured")}
                />

                <AdminCheckboxField
                  control={control}
                  name="showOnHome"
                  label={t("solutions.fields.showOnHome")}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("solutions.form.seoSection")}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              SEO title, description and keywords are automatically filled by
              the server when left empty.
            </p>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="seo.title"
                label={t("solutions.fields.seoTitle")}
                maxLength={SOLUTION_LIMITS.SEO_TITLE_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="seo.description"
                label={t("solutions.fields.seoDescription")}
                multiline
                rows={3}
                maxLength={SOLUTION_LIMITS.SEO_DESCRIPTION_MAX_LENGTH}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {["en", "th"].map((locale) => (
                  <label key={locale} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t("solutions.fields.seoKeywords")}
                      {" — "}
                      {locale.toUpperCase()}
                    </span>

                    <input
                      type="text"
                      value={keywordValues[locale]}
                      onChange={(event) =>
                        setKeywordValues((currentValues) => ({
                          ...currentValues,

                          [locale]: event.target.value,
                        }))
                      }
                      disabled={saving}
                      maxLength={
                        SOLUTION_LIMITS.KEYWORD_MAX_LENGTH *
                        SOLUTION_LIMITS.KEYWORDS_MAX_ITEMS
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("solutions.fields.seoKeywordsHint")}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("solutions.actions.cancel")}
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

            {saving
              ? t("solutions.actions.saving")
              : t("solutions.actions.save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
