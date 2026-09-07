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
import { ProductMediaFields } from "@/components/admin/products/ProductMediaFields";
import {
  LocalizedStringListField,
  ProductFinishesField,
  ProductSpecificationsField,
  ProductStandardsField,
} from "@/components/admin/products/ProductRepeatableFields";
import {
  PRODUCT_DEFAULTS,
  PRODUCT_LIMITS,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_VALUES,
  normalizeProductSlug,
  normalizeProductTypeSlug,
} from "@/constants/products";
import { createProductSchema } from "@/modules/products/product.schema";
import { createProduct, updateProduct } from "@/services/http/products.api";

function ensureCollectionIds(items, prefix) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    ...item,

    id: item.id || `${prefix}-${index + 1}`,
  }));
}

function createDefaultValues(product) {
  return {
    name: {
      en: product?.name?.en || "",
      th: product?.name?.th || "",
    },

    slug: product?.slug || "",

    model: product?.model || PRODUCT_DEFAULTS.model,

    sku: product?.sku || PRODUCT_DEFAULTS.sku,

    categoryId: product?.categoryId || "",

    productType: {
      en: product?.productType?.en || "",

      th: product?.productType?.th || "",
    },

    productTypeSlug:
      product?.productTypeSlug || PRODUCT_DEFAULTS.productTypeSlug,

    series: {
      en: product?.series?.en || "",

      th: product?.series?.th || "",
    },

    shortDescription: {
      en: product?.shortDescription?.en || "",

      th: product?.shortDescription?.th || "",
    },

    description: {
      en: product?.description?.en || "",

      th: product?.description?.th || "",
    },

    primaryImageMediaId:
      product?.primaryImageMediaId || PRODUCT_DEFAULTS.primaryImageMediaId,

    galleryMediaIds: Array.isArray(product?.galleryMediaIds)
      ? product.galleryMediaIds
      : [],

    documentMediaIds: Array.isArray(product?.documentMediaIds)
      ? product.documentMediaIds
      : [],

    features: {
      en: Array.isArray(product?.features?.en) ? product.features.en : [],

      th: Array.isArray(product?.features?.th) ? product.features.th : [],
    },

    variations: {
      en: Array.isArray(product?.variations?.en) ? product.variations.en : [],

      th: Array.isArray(product?.variations?.th) ? product.variations.th : [],
    },

    specifications: ensureCollectionIds(
      product?.specifications,
      "specification",
    ),

    finishes: ensureCollectionIds(product?.finishes, "finish"),

    standards: ensureCollectionIds(product?.standards, "standard"),

    fireRated: Boolean(product?.fireRated),

    status: product?.status || PRODUCT_STATUSES.DRAFT,

    featured: Boolean(product?.featured),

    showOnHome: Boolean(product?.showOnHome),

    sortOrder: Number(product?.sortOrder || PRODUCT_DEFAULTS.sortOrder),

    seo: {
      title: {
        en: product?.seo?.title?.en || "",

        th: product?.seo?.title?.th || "",
      },

      description: {
        en: product?.seo?.description?.en || "",

        th: product?.seo?.description?.th || "",
      },

      keywords: {
        en: Array.isArray(product?.seo?.keywords?.en)
          ? product.seo.keywords.en
          : [],

        th: Array.isArray(product?.seo?.keywords?.th)
          ? product.seo.keywords.th
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

export function ProductFormModal({
  product = null,
  categories = [],
  onClose,
  onSaved,
}) {
  const { t } = useTranslation("admin");

  const editing = Boolean(product?.id);

  const { control, getValues, handleSubmit, setValue } = useForm({
    resolver: zodResolver(createProductSchema),

    defaultValues: createDefaultValues(product),

    mode: "onBlur",
  });

  const [keywordValues, setKeywordValues] = useState({
    en: Array.isArray(product?.seo?.keywords?.en)
      ? product.seo.keywords.en.join(", ")
      : "",

    th: Array.isArray(product?.seo?.keywords?.th)
      ? product.seo.keywords.th.join(", ")
      : "",
  });

  const [saving, setSaving] = useState(false);

  function handleGenerateSlug() {
    const model = getValues("model");

    const englishName = getValues("name.en");

    const slug = normalizeProductSlug(
      [model, englishName].filter(Boolean).join(" "),
    );

    setValue("slug", slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleGenerateTypeSlug() {
    const englishType = getValues("productType.en");

    const typeSlug = normalizeProductTypeSlug(englishType);

    setValue("productTypeSlug", typeSlug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitProduct(values) {
    setSaving(true);

    const payload = {
      ...values,

      primaryImageMediaId: values.primaryImageMediaId || null,

      galleryMediaIds: Array.isArray(values.galleryMediaIds)
        ? values.galleryMediaIds
        : [],

      documentMediaIds: Array.isArray(values.documentMediaIds)
        ? values.documentMediaIds
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
      const savedProduct = editing
        ? await updateProduct({
            productId: product.id,

            values: payload,
          })
        : await createProduct({
            values: payload,
          });

      toast.success(
        t(
          editing
            ? "products.messages.updateSuccess"
            : "products.messages.createSuccess",
        ),
      );

      onSaved(savedProduct);
    } catch (error) {
      let message =
        error?.message ||
        t(
          editing
            ? "products.messages.updateFailed"
            : "products.messages.createFailed",
        );

      if (error?.code === "CONFLICT") {
        if (error?.details?.field === "sku") {
          message = t("products.messages.skuExists");
        } else if (error?.details?.field === "slug") {
          message = t("products.messages.slugExists");
        }
      }

      if (error?.details?.missingFields?.length) {
        message = t("products.messages.publishIncomplete");
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
      aria-labelledby="product-form-title"
    >
      <button
        type="button"
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("products.actions.close")}
        tabIndex={-1}
      />

      <form
        onSubmit={handleSubmit(submitProduct)}
        noValidate
        className="relative z-10 isolate flex h-[100dvh] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:h-[calc(100dvh-2.5rem)] sm:max-h-[960px] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t(
                editing
                  ? "products.form.editEyebrow"
                  : "products.form.createEyebrow",
              )}
            </p>

            <h2
              id="product-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t(
                editing
                  ? "products.form.editTitle"
                  : "products.form.createTitle",
              )}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t(
                editing
                  ? "products.form.editDescription"
                  : "products.form.createDescription",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("products.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("products.form.basicSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="name"
                label={t("products.fields.name")}
                required
                maxLength={PRODUCT_LIMITS.NAME_MAX_LENGTH}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <AdminFormField
                  control={control}
                  name="model"
                  label={t("products.fields.model")}
                  placeholder={t("products.placeholders.model")}
                  required
                  maxLength={PRODUCT_LIMITS.MODEL_MAX_LENGTH}
                />

                <AdminFormField
                  control={control}
                  name="sku"
                  label={t("products.fields.sku")}
                  placeholder={t("products.placeholders.sku")}
                  maxLength={PRODUCT_LIMITS.SKU_MAX_LENGTH}
                />

                <SelectField
                  control={control}
                  name="categoryId"
                  label={t("products.fields.category")}
                  disabled={saving}
                  required
                >
                  <option value="">
                    {t("products.filters.allCategories")}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name?.en || category.slug}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <AdminFormField
                  control={control}
                  name="slug"
                  label={t("products.fields.slug")}
                  hint={t("products.fields.slugHint")}
                  placeholder={t("products.placeholders.slug")}
                  required
                  maxLength={PRODUCT_LIMITS.SLUG_MAX_LENGTH}
                />

                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
                >
                  <FiRefreshCw aria-hidden="true" />

                  {t("products.actions.generateSlug")}
                </button>
              </div>

              <LocalizedFieldGroup
                control={control}
                name="productType"
                label={t("products.fields.productType")}
                required
                maxLength={PRODUCT_LIMITS.PRODUCT_TYPE_MAX_LENGTH}
              />

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <AdminFormField
                  control={control}
                  name="productTypeSlug"
                  label={t("products.fields.productTypeSlug")}
                  placeholder={t("products.placeholders.productTypeSlug")}
                  required
                  maxLength={PRODUCT_LIMITS.PRODUCT_TYPE_SLUG_MAX_LENGTH}
                />

                <button
                  type="button"
                  onClick={handleGenerateTypeSlug}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
                >
                  <FiRefreshCw aria-hidden="true" />

                  {t("products.actions.generateTypeSlug")}
                </button>
              </div>

              <LocalizedFieldGroup
                control={control}
                name="series"
                label={t("products.fields.series")}
                maxLength={PRODUCT_LIMITS.SERIES_MAX_LENGTH}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("products.form.descriptionSection")}
            </h3>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="shortDescription"
                label={t("products.fields.shortDescription")}
                multiline
                rows={3}
                maxLength={PRODUCT_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="description"
                label={t("products.fields.description")}
                multiline
                rows={8}
                maxLength={PRODUCT_LIMITS.DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </section>

          <ProductMediaFields
            control={control}
            product={product}
            disabled={saving}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <LocalizedStringListField
              control={control}
              name="features"
              label={t("products.form.featuresSection")}
              itemLabel={t("products.fields.feature")}
              emptyText={t("products.form.emptyFeatures")}
              addText={t("products.actions.addFeature")}
              removeText={t("products.actions.remove")}
              maximumItems={PRODUCT_LIMITS.FEATURES_MAX_ITEMS}
              maximumLength={PRODUCT_LIMITS.FEATURE_MAX_LENGTH}
              disabled={saving}
            />

            <LocalizedStringListField
              control={control}
              name="variations"
              label={t("products.form.variationsSection")}
              itemLabel={t("products.fields.variation")}
              emptyText={t("products.form.emptyVariations")}
              addText={t("products.actions.addVariation")}
              removeText={t("products.actions.remove")}
              maximumItems={PRODUCT_LIMITS.VARIATIONS_MAX_ITEMS}
              maximumLength={PRODUCT_LIMITS.VARIATION_MAX_LENGTH}
              disabled={saving}
            />
          </div>

          <ProductSpecificationsField
            control={control}
            disabled={saving}
            maximumItems={PRODUCT_LIMITS.SPECIFICATIONS_MAX_ITEMS}
            labels={{
              title: t("products.form.specificationsSection"),

              item: t("products.fields.specificationLabel"),

              label: t("products.fields.specificationLabel"),

              value: t("products.fields.specificationValue"),

              sortOrder: t("products.fields.sortOrder"),

              add: t("products.actions.addSpecification"),

              remove: t("products.actions.remove"),

              empty: t("products.form.emptySpecifications"),
            }}
          />

          <ProductFinishesField
            control={control}
            disabled={saving}
            maximumItems={PRODUCT_LIMITS.FINISHES_MAX_ITEMS}
            labels={{
              title: t("products.form.finishesSection"),

              item: t("products.fields.finishName"),

              code: t("products.fields.finishCode"),

              name: t("products.fields.finishName"),

              sortOrder: t("products.fields.sortOrder"),

              add: t("products.actions.addFinish"),

              remove: t("products.actions.remove"),

              empty: t("products.form.emptyFinishes"),
            }}
          />

          <ProductStandardsField
            control={control}
            disabled={saving}
            maximumItems={PRODUCT_LIMITS.STANDARDS_MAX_ITEMS}
            labels={{
              title: t("products.form.standardsSection"),

              item: t("products.fields.standardName"),

              name: t("products.fields.standardName"),

              classification: t("products.fields.classification"),

              conformityReference: t("products.fields.conformityReference"),

              sortOrder: t("products.fields.sortOrder"),

              add: t("products.actions.addStandard"),

              remove: t("products.actions.remove"),

              empty: t("products.form.emptyStandards"),
            }}
          />

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("products.form.displaySection")}
            </h3>

            <div className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  control={control}
                  name="status"
                  label={t("products.fields.status")}
                  disabled={saving}
                >
                  {PRODUCT_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {t(`products.statuses.${status}`)}
                    </option>
                  ))}
                </SelectField>

                <AdminFormField
                  control={control}
                  name="sortOrder"
                  type="number"
                  min={PRODUCT_LIMITS.SORT_ORDER_MIN}
                  max={PRODUCT_LIMITS.SORT_ORDER_MAX}
                  label={t("products.fields.sortOrder")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <AdminCheckboxField
                  control={control}
                  name="fireRated"
                  label={t("products.fields.fireRated")}
                />

                <AdminCheckboxField
                  control={control}
                  name="featured"
                  label={t("products.fields.featured")}
                />

                <AdminCheckboxField
                  control={control}
                  name="showOnHome"
                  label={t("products.fields.showOnHome")}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("products.form.seoSection")}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              SEO title, description and keywords are automatically filled by
              the server when left empty.
            </p>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="seo.title"
                label={t("products.fields.seoTitle")}
                maxLength={PRODUCT_LIMITS.SEO_TITLE_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="seo.description"
                label={t("products.fields.seoDescription")}
                multiline
                rows={3}
                maxLength={PRODUCT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {["en", "th"].map((locale) => (
                  <label key={locale} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t("products.fields.seoKeywords")}
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
                      placeholder={
                        locale === "en"
                          ? "door closer, KD 915, EN 1154"
                          : "โช้คอัพประตู, KD 915, EN 1154"
                      }
                      disabled={saving}
                      maxLength={
                        PRODUCT_LIMITS.KEYWORD_MAX_LENGTH *
                        PRODUCT_LIMITS.KEYWORDS_MAX_ITEMS
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("products.fields.seoKeywordsHint")}
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
            {t("products.actions.cancel")}
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

            {saving ? t("products.actions.saving") : t("products.actions.save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
