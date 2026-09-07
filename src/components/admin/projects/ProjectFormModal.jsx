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
import { ProjectMediaFields } from "@/components/admin/projects/ProjectMediaFields";
import { ProjectRelationshipFields } from "@/components/admin/projects/ProjectRelationshipFields";
import { LocalizedStringListField } from "@/components/admin/products/ProductRepeatableFields";
import {
  PROJECT_BUILDING_TYPE_VALUES,
  PROJECT_DEFAULTS,
  PROJECT_LIMITS,
  PROJECT_STATUSES,
  PROJECT_STATUS_VALUES,
  normalizeProjectSlug,
} from "@/constants/projects";
import { createProjectSchema } from "@/modules/projects/project.schema";
import { createProject, updateProject } from "@/services/http/projects.api";

function createDefaultValues(project) {
  return {
    name: {
      en: project?.name?.en || "",
      th: project?.name?.th || "",
    },

    slug: project?.slug || "",

    buildingType: project?.buildingType || PROJECT_DEFAULTS.buildingType,

    location: {
      en: project?.location?.en || "",
      th: project?.location?.th || "",
    },

    client: {
      en: project?.client?.en || "",
      th: project?.client?.th || "",
    },

    year: project?.year ?? "",

    shortDescription: {
      en: project?.shortDescription?.en || "",
      th: project?.shortDescription?.th || "",
    },

    description: {
      en: project?.description?.en || "",
      th: project?.description?.th || "",
    },

    challenge: {
      en: project?.challenge?.en || "",
      th: project?.challenge?.th || "",
    },

    solution: {
      en: project?.solution?.en || "",
      th: project?.solution?.th || "",
    },

    results: {
      en: Array.isArray(project?.results?.en) ? project.results.en : [],

      th: Array.isArray(project?.results?.th) ? project.results.th : [],
    },

    coverImageMediaId:
      project?.coverImageMediaId || PROJECT_DEFAULTS.coverImageMediaId,

    galleryMediaIds: Array.isArray(project?.galleryMediaIds)
      ? project.galleryMediaIds
      : [],

    relatedProductIds: Array.isArray(project?.relatedProductIds)
      ? project.relatedProductIds
      : [],

    relatedSolutionIds: Array.isArray(project?.relatedSolutionIds)
      ? project.relatedSolutionIds
      : [],

    status: project?.status || PROJECT_STATUSES.DRAFT,

    featured: Boolean(project?.featured),

    showOnHome: Boolean(project?.showOnHome),

    sortOrder: Number(project?.sortOrder || PROJECT_DEFAULTS.sortOrder),

    seo: {
      title: {
        en: project?.seo?.title?.en || "",
        th: project?.seo?.title?.th || "",
      },

      description: {
        en: project?.seo?.description?.en || "",

        th: project?.seo?.description?.th || "",
      },

      keywords: {
        en: Array.isArray(project?.seo?.keywords?.en)
          ? project.seo.keywords.en
          : [],

        th: Array.isArray(project?.seo?.keywords?.th)
          ? project.seo.keywords.th
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

export function ProjectFormModal({
  project = null,
  products = [],
  solutions = [],
  onClose,
  onSaved,
}) {
  const { t } = useTranslation("admin");

  const editing = Boolean(project?.id);

  const { control, getValues, handleSubmit, setValue } = useForm({
    resolver: zodResolver(createProjectSchema),

    defaultValues: createDefaultValues(project),

    mode: "onBlur",
  });

  const [keywordValues, setKeywordValues] = useState({
    en: Array.isArray(project?.seo?.keywords?.en)
      ? project.seo.keywords.en.join(", ")
      : "",

    th: Array.isArray(project?.seo?.keywords?.th)
      ? project.seo.keywords.th.join(", ")
      : "",
  });

  const [saving, setSaving] = useState(false);

  function handleGenerateSlug() {
    const englishName = getValues("name.en");

    const location = getValues("location.en");

    const slug = normalizeProjectSlug(
      [englishName, location].filter(Boolean).join(" "),
    );

    setValue("slug", slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitProject(values) {
    setSaving(true);

    const payload = {
      ...values,

      year:
        values.year === "" || values.year === null ? null : Number(values.year),

      coverImageMediaId: values.coverImageMediaId || null,

      galleryMediaIds: Array.isArray(values.galleryMediaIds)
        ? values.galleryMediaIds
        : [],

      relatedProductIds: Array.isArray(values.relatedProductIds)
        ? values.relatedProductIds
        : [],

      relatedSolutionIds: Array.isArray(values.relatedSolutionIds)
        ? values.relatedSolutionIds
        : [],

      seo: {
        ...values.seo,

        keywords: {
          en: normalizeKeywords(keywordValues.en),

          th: normalizeKeywords(keywordValues.th),
        },
      },
    };

    try {
      const savedProject = editing
        ? await updateProject({
            projectId: project.id,
            values: payload,
          })
        : await createProject({
            values: payload,
          });

      toast.success(
        t(
          editing
            ? "projects.messages.updateSuccess"
            : "projects.messages.createSuccess",
        ),
      );

      onSaved(savedProject);
    } catch (error) {
      let message =
        error?.message ||
        t(
          editing
            ? "projects.messages.updateFailed"
            : "projects.messages.createFailed",
        );

      if (error?.code === "CONFLICT" && error?.details?.field === "slug") {
        message = t("projects.messages.slugExists");
      }

      if (error?.details?.missingFields?.length) {
        message = t("projects.messages.publishIncomplete");
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center overflow-hidden bg-slate-950/60 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
    >
      <button
        type="button"
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("projects.actions.close")}
        tabIndex={-1}
      />

      <form
        onSubmit={handleSubmit(submitProject)}
        noValidate
        className="relative z-10 isolate flex h-[100dvh] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:h-[calc(100dvh-2.5rem)] sm:max-h-[960px] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t(
                editing
                  ? "projects.form.editEyebrow"
                  : "projects.form.createEyebrow",
              )}
            </p>

            <h2
              id="project-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t(
                editing
                  ? "projects.form.editTitle"
                  : "projects.form.createTitle",
              )}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t(
                editing
                  ? "projects.form.editDescription"
                  : "projects.form.createDescription",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("projects.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("projects.form.basicSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="name"
                label={t("projects.fields.name")}
                required
                maxLength={PROJECT_LIMITS.NAME_MAX_LENGTH}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <SelectField
                  control={control}
                  name="buildingType"
                  label={t("projects.fields.buildingType")}
                  disabled={saving}
                  required
                >
                  {PROJECT_BUILDING_TYPE_VALUES.map((buildingType) => (
                    <option key={buildingType} value={buildingType}>
                      {t(`projects.buildingTypes.${buildingType}`)}
                    </option>
                  ))}
                </SelectField>

                <AdminFormField
                  control={control}
                  name="year"
                  type="number"
                  min={PROJECT_LIMITS.YEAR_MIN}
                  max={PROJECT_LIMITS.YEAR_MAX}
                  label={t("projects.fields.year")}
                  placeholder={t("projects.placeholders.year")}
                />

                <AdminFormField
                  control={control}
                  name="sortOrder"
                  type="number"
                  min={PROJECT_LIMITS.SORT_ORDER_MIN}
                  max={PROJECT_LIMITS.SORT_ORDER_MAX}
                  label={t("projects.fields.sortOrder")}
                />
              </div>

              <LocalizedFieldGroup
                control={control}
                name="location"
                label={t("projects.fields.location")}
                required
                maxLength={PROJECT_LIMITS.LOCATION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="client"
                label={t("projects.fields.client")}
                maxLength={PROJECT_LIMITS.CLIENT_MAX_LENGTH}
              />

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <AdminFormField
                  control={control}
                  name="slug"
                  label={t("projects.fields.slug")}
                  hint={t("projects.fields.slugHint")}
                  placeholder={t("projects.placeholders.slug")}
                  required
                  maxLength={PROJECT_LIMITS.SLUG_MAX_LENGTH}
                />

                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
                >
                  <FiRefreshCw aria-hidden="true" />

                  {t("projects.actions.generateSlug")}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("projects.form.contentSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="shortDescription"
                label={t("projects.fields.shortDescription")}
                multiline
                rows={3}
                maxLength={PROJECT_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="description"
                label={t("projects.fields.description")}
                multiline
                rows={8}
                maxLength={PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="challenge"
                label={t("projects.fields.challenge")}
                multiline
                rows={5}
                maxLength={PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="solution"
                label={t("projects.fields.solution")}
                multiline
                rows={5}
                maxLength={PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </section>

          <ProjectMediaFields
            control={control}
            project={project}
            disabled={saving}
          />

          <ProjectRelationshipFields
            control={control}
            products={products}
            solutions={solutions}
            disabled={saving}
          />

          <LocalizedStringListField
            control={control}
            name="results"
            label={t("projects.form.resultsSection")}
            itemLabel={t("projects.fields.result")}
            emptyText={t("projects.form.emptyResults")}
            addText={t("projects.actions.addResult")}
            removeText={t("projects.actions.remove")}
            maximumItems={PROJECT_LIMITS.RESULTS_MAX_ITEMS}
            maximumLength={PROJECT_LIMITS.RESULT_MAX_LENGTH}
            disabled={saving}
          />

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("projects.form.displaySection")}
            </h3>

            <div className="mt-5 space-y-5">
              <SelectField
                control={control}
                name="status"
                label={t("projects.fields.status")}
                disabled={saving}
              >
                {PROJECT_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {t(`projects.statuses.${status}`)}
                  </option>
                ))}
              </SelectField>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminCheckboxField
                  control={control}
                  name="featured"
                  label={t("projects.fields.featured")}
                  disabled={saving}
                />

                <AdminCheckboxField
                  control={control}
                  name="showOnHome"
                  label={t("projects.fields.showOnHome")}
                  disabled={saving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("projects.form.seoSection")}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("projects.form.seoHint")}
            </p>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="seo.title"
                label={t("projects.fields.seoTitle")}
                maxLength={PROJECT_LIMITS.SEO_TITLE_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="seo.description"
                label={t("projects.fields.seoDescription")}
                multiline
                rows={3}
                maxLength={PROJECT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {["en", "th"].map((locale) => (
                  <label key={locale} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t("projects.fields.seoKeywords")}
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
                        PROJECT_LIMITS.KEYWORD_MAX_LENGTH *
                        PROJECT_LIMITS.KEYWORDS_MAX_ITEMS
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("projects.fields.seoKeywordsHint")}
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
            {t("projects.actions.cancel")}
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

            {saving ? t("projects.actions.saving") : t("projects.actions.save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
