"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiLoader, FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { StandardDocumentField } from "@/components/admin/standards/StandardDocumentField";
import { StandardRelationshipFields } from "@/components/admin/standards/StandardRelationshipFields";
import {
  STANDARD_DEFAULTS,
  STANDARD_DOCUMENT_TYPE_VALUES,
  STANDARD_LANGUAGE_VALUES,
  STANDARD_STATUSES,
  STANDARD_STATUS_VALUES,
  normalizeStandardSlug,
} from "@/constants/standards";
import { createStandardSchema } from "@/modules/standards/standard.schema";
import { createStandard, updateStandard } from "@/services/http/standards.api";

function createDefaultValues(standard) {
  return {
    code: standard?.code || STANDARD_DEFAULTS.code,

    slug: standard?.slug || STANDARD_DEFAULTS.slug,

    name: {
      en: standard?.name?.en || STANDARD_DEFAULTS.name.en,

      th: standard?.name?.th || STANDARD_DEFAULTS.name.th,
    },

    shortDescription: {
      en:
        standard?.shortDescription?.en || STANDARD_DEFAULTS.shortDescription.en,

      th:
        standard?.shortDescription?.th || STANDARD_DEFAULTS.shortDescription.th,
    },

    description: {
      en: standard?.description?.en || STANDARD_DEFAULTS.description.en,

      th: standard?.description?.th || STANDARD_DEFAULTS.description.th,
    },

    classification: {
      en: standard?.classification?.en || STANDARD_DEFAULTS.classification.en,

      th: standard?.classification?.th || STANDARD_DEFAULTS.classification.th,
    },

    conformityReference:
      standard?.conformityReference || STANDARD_DEFAULTS.conformityReference,

    issuer: {
      en: standard?.issuer?.en || STANDARD_DEFAULTS.issuer.en,

      th: standard?.issuer?.th || STANDARD_DEFAULTS.issuer.th,
    },

    documentType: standard?.documentType || STANDARD_DEFAULTS.documentType,

    documentLanguage:
      standard?.documentLanguage || STANDARD_DEFAULTS.documentLanguage,

    documentMediaId:
      standard?.documentMediaId || STANDARD_DEFAULTS.documentMediaId,

    relatedCategoryIds: Array.isArray(standard?.relatedCategoryIds)
      ? standard.relatedCategoryIds
      : [],

    relatedProductIds: Array.isArray(standard?.relatedProductIds)
      ? standard.relatedProductIds
      : [],

    issueDate: standard?.issueDate || null,

    expiryDate: standard?.expiryDate || null,

    status: standard?.status || STANDARD_DEFAULTS.status,

    featured: Boolean(standard?.featured),

    showOnHome: Boolean(standard?.showOnHome),

    sortOrder: Number(standard?.sortOrder || 0),

    seo: {
      title: {
        en: standard?.seo?.title?.en || "",

        th: standard?.seo?.title?.th || "",
      },

      description: {
        en: standard?.seo?.description?.en || "",

        th: standard?.seo?.description?.th || "",
      },

      keywords: {
        en: Array.isArray(standard?.seo?.keywords?.en)
          ? standard.seo.keywords.en
          : [],

        th: Array.isArray(standard?.seo?.keywords?.th)
          ? standard.seo.keywords.th
          : [],
      },
    },
  };
}

function getNestedError(errors, path) {
  return path.split(".").reduce((value, key) => value?.[key], errors)?.message;
}

function FormField({ label, error, hint, required = false, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <span className="mt-2 block">{children}</span>

      {hint ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}

      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
          {title}
        </h3>

        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function CheckboxField({ control, name, label, disabled }) {
  const {
    field: { value, onChange, onBlur, name: fieldName },
  } = useController({
    control,
    name,
  });

  return (
    <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-primary/40 dark:border-slate-700">
      <input
        name={fieldName}
        type="checkbox"
        checked={Boolean(value)}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="size-4 accent-primary"
      />

      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {label}
      </span>
    </label>
  );
}

function KeywordField({ control, name, label, placeholder, hint, disabled }) {
  const {
    field: { value, onChange, onBlur, name: fieldName },
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const displayValue = Array.isArray(value) ? value.join(", ") : "";

  return (
    <FormField label={label} hint={hint} error={error?.message}>
      <input
        name={fieldName}
        type="text"
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => {
          const nextValues = event.currentTarget.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

          onChange(nextValues);
        }}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </FormField>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export function StandardFormModal({ standard = null, onClose, onSaved }) {
  const { t } = useTranslation("admin");

  const editing = Boolean(standard?.id);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStandardSchema),

    defaultValues: createDefaultValues(standard),
  });

  useEffect(() => {
    reset(createDefaultValues(standard));
  }, [reset, standard]);

  function handleCodeBlur(event) {
    const code = event.currentTarget.value;

    if (!editing) {
      setValue("slug", normalizeStandardSlug(code), {
        shouldValidate: true,
      });
    }
  }

  async function submitForm(values) {
    setSubmitting(true);

    try {
      const savedStandard = editing
        ? await updateStandard({
            standardId: standard.id,

            values,
          })
        : await createStandard({
            values,
          });

      toast.success(
        t(
          editing
            ? "standards.messages.updateSuccess"
            : "standards.messages.createSuccess",
        ),
      );

      onSaved?.(savedStandard);

      onClose();
    } catch (error) {
      toast.error(
        error?.message ||
          t(
            editing
              ? "standards.messages.updateFailed"
              : "standards.messages.createFailed",
          ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="standard-form-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-0 sm:p-5"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 shadow-2xl dark:bg-slate-950 sm:h-[calc(100dvh-40px)] sm:max-w-[1160px] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
              {t(
                editing
                  ? "standards.form.editEyebrow"
                  : "standards.form.createEyebrow",
              )}
            </p>

            <h2
              id="standard-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white"
            >
              {t(
                editing
                  ? "standards.form.editTitle"
                  : "standards.form.createTitle",
              )}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t(
                editing
                  ? "standards.form.editDescription"
                  : "standards.form.createDescription",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t("standards.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="space-y-5">
            <Section title={t("standards.form.sections.basic")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("standards.form.fields.code")}
                  hint={t("standards.form.hints.code")}
                  error={getNestedError(errors, "code")}
                  required
                >
                  <input
                    {...register("code")}
                    onBlur={(event) => {
                      register("code").onBlur(event);

                      handleCodeBlur(event);
                    }}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.code")}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.slug")}
                  hint={t("standards.form.hints.slug")}
                  error={getNestedError(errors, "slug")}
                  required
                >
                  <input
                    {...register("slug")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.slug")}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.nameEn")}
                  error={getNestedError(errors, "name.en")}
                  required
                >
                  <input
                    {...register("name.en")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.nameEn")}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.nameTh")}
                  error={getNestedError(errors, "name.th")}
                  required
                >
                  <input
                    {...register("name.th")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.nameTh")}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </Section>

            <Section title={t("standards.form.sections.content")}>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField
                  label={t("standards.form.fields.shortDescriptionEn")}
                  error={getNestedError(errors, "shortDescription.en")}
                >
                  <textarea
                    {...register("shortDescription.en")}
                    disabled={submitting}
                    placeholder={t(
                      "standards.form.placeholders.shortDescriptionEn",
                    )}
                    className={textareaClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.shortDescriptionTh")}
                  error={getNestedError(errors, "shortDescription.th")}
                >
                  <textarea
                    {...register("shortDescription.th")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholdersDescriptionTh")}
                    className={textareaClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.descriptionEn")}
                  error={getNestedError(errors, "description.en")}
                >
                  <textarea
                    {...register("description.en")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.descriptionEn")}
                    className={`${textareaClassName} min-h-40`}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.descriptionTh")}
                  error={getNestedError(errors, "description.th")}
                >
                  <textarea
                    {...register("description.th")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.descriptionTh")}
                    className={`${textareaClassName} min-h-40`}
                  />
                </FormField>
              </div>
            </Section>

            <Section title={t("standards.form.sections.classification")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("standards.form.fields.classificationEn")}
                  error={getNestedError(errors, "classification.en")}
                >
                  <input
                    {...register("classification.en")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.classEn")}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.classificationTh")}
                  error={getNestedError(errors, "classification.th")}
                >
                  <input
                    {...register("classification.th")}
                    disabled={submitting}
                    placeholder={t(
                      "standards.form.placeholders.classificationTh",
                    )}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.conformityReference")}
                  error={getNestedError(errors, "conformityReference")}
                >
                  <input
                    {...register("conformityReference")}
                    disabled={submitting}
                    placeholder={t(
                      "standards.form.placeholders.conformityReference",
                    )}
                    className={inputClassName}
                  />
                </FormField>

                <div />

                <FormField
                  label={t("standards.form.fields.issuerEn")}
                  error={getNestedError(errors, "issuer.en")}
                >
                  <input
                    {...register("issuer.en")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.issuerEn")}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.issuerTh")}
                  error={getNestedError(errors, "issuer.th")}
                >
                  <input
                    {...register("issuer.th")}
                    disabled={submitting}
                    placeholder={t("standards.form.placeholders.issuerTh")}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </Section>

            <StandardDocumentField
              control={control}
              standard={standard}
              disabled={submitting}
            />

            <StandardRelationshipFields
              control={control}
              standard={standard}
              disabled={submitting}
            />

            <Section
              title={t("standards.form.sections.dates")}
              description={t("standards.form.hints.dates")}
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  label={t("standards.form.fields.documentType")}
                  error={getNestedError(errors, "documentType")}
                >
                  <select
                    {...register("documentType")}
                    disabled={submitting}
                    className={inputClassName}
                  >
                    {STANDARD_DOCUMENT_TYPE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`standards.documentTypes.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label={t("standards.form.fields.documentLanguage")}
                  error={getNestedError(errors, "documentLanguage")}
                >
                  <select
                    {...register("documentLanguage")}
                    disabled={submitting}
                    className={inputClassName}
                  >
                    {STANDARD_LANGUAGE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`ExperimentalValue.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label={t("standards.form.fields.issueDate")}
                  error={getNestedError(errors, "issueDate")}
                >
                  <input
                    {...register("issueDate")}
                    type="date"
                    disabled={submitting}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label={t("standards.form.fields.expiryDate")}
                  error={getNestedError(errors, "expiryDate")}
                >
                  <input
                    {...register("expiryDate")}
                    type="date"
                    disabled={submitting}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </Section>

            <Section title={t("standards.form.sections.publishing")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label={t("standards.form.fields.status")}
                  error={getNestedError(errors, "status")}
                >
                  <select
                    {...register("status")}
                    disabled={submitting}
                    className={inputClassName}
                  >
                    {STANDARD_STATUS_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`standards.status.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label={t("standards.form.fields.sortOrder")}
                  error={getNestedError(errors, "sortOrder")}
                >
                  <input
                    {...register("sortOrder")}
                    type="number"
                    min="0"
                    max="999999"
                    disabled={submitting}
                    className={inputClassName}
                  />
                </FormField>

                <CheckboxField
                  control={control}
                  name="featured"
                  label={t("standards.form.fields.featured")}
                  disabled={submitting}
                />

                <CheckboxField
                  control={control}
                  name="showOnHome"
                  label={t("standards.form.fields.showOnHome")}
                  disabled={submitting}
                />
              </div>
            </Section>

            <Section
              title={t("standards.form.sections.seo")}
              description={t("standards.form.hints.seo")}
            >
              <div className="grid gap-5 lg:grid-cols-2">
                {["en", "th"].map((language) => (
                  <div key={language} className="space-y-5">
                    <FormField
                      label={t(
                        `standards.form.fields.seoTitle${
                          language === "en" ? "En" : "Th"
                        }`,
                      )}
                      error={getNestedError(errors, `seo.title.${language}`)}
                    >
                      <input
                        {...register(`seo.title.${language}`)}
                        disabled={submitting}
                        placeholder={t("standards.form.placeholders.seoTitle")}
                        className={inputClassName}
                      />
                    </FormField>

                    <FormField
                      label={t(
                        `standards.form.fields.seoDescription${
                          language === "en" ? "En" : "Th"
                        }`,
                      )}
                      error={getNestedError(
                        errors,
                        `seo.description.${language}`,
                      )}
                    >
                      <textarea
                        {...register(`seo.description.${language}`)}
                        disabled={submitting}
                        placeholder={t(
                          "standards.form.placeholders.seoDescription",
                        )}
                        className={textareaClassName}
                      />
                    </FormField>

                    <KeywordField
                      control={control}
                      name={`seo.keywords.${language}`}
                      label={t(
                        `standards.form.fields.seoKeywords${
                          language === "en" ? "En" : "Th"
                        }`,
                      )}
                      placeholder={t("standards.form.placeholders.seoKeywords")}
                      hint={t("standards.form.hints.keywords")}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
          >
            {t("standards.actions.cancel")}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <FiLoader aria-hidden="true" className="animate-spin" />
            ) : (
              <FiSave aria-hidden="true" />
            )}

            {t(
              submitting
                ? "standards.actions.saving"
                : "standards.actions.save",
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
