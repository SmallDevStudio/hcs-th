"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FiImage,
  FiLoader,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";

import { AdminCheckboxField } from "@/components/admin/form/AdminCheckboxField";
import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { LocalizedFieldGroup } from "@/components/admin/form/LocalizedFieldGroup";
import { MediaImagePicker } from "@/components/admin/media/MediaImagePicker";
import CategoryIcon from "@/components/common/CategoryIcon";
import {
  CATEGORY_DEFAULTS,
  CATEGORY_ICON_VALUES,
  CATEGORY_STATUSES,
  CATEGORY_STATUS_VALUES,
  normalizeCategorySlug,
} from "@/constants/categories";
import { createCategorySchema } from "@/modules/categories/category.schema";
import { createCategory, updateCategory } from "@/services/http/categories.api";
import { getMediaAssets } from "@/services/http/media.api";

function createDefaultValues(category) {
  return {
    name: {
      en: category?.name?.en || "",
      th: category?.name?.th || "",
    },

    description: {
      en: category?.description?.en || "",
      th: category?.description?.th || "",
    },

    slug: category?.slug || "",

    icon: category?.icon || CATEGORY_DEFAULTS.icon,

    imageMediaId: category?.imageMediaId || null,

    status: category?.status || CATEGORY_STATUSES.ACTIVE,

    featured: Boolean(category?.featured),

    showOnHome: category?.showOnHome !== false,

    sortOrder: Number(category?.sortOrder || 0),

    seo: {
      title: {
        en: category?.seo?.title?.en || "",
        th: category?.seo?.title?.th || "",
      },

      description: {
        en: category?.seo?.description?.en || "",

        th: category?.seo?.description?.th || "",
      },

      keywords: {
        en: Array.isArray(category?.seo?.keywords?.en)
          ? category.seo.keywords.en
          : [],

        th: Array.isArray(category?.seo?.keywords?.th)
          ? category.seo.keywords.th
          : [],
      },
    },
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

function createInitialSelectedImage(category) {
  if (!category?.imageMediaId || !category?.image) {
    return null;
  }

  return {
    id: category.imageMediaId,
    ...category.image,
  };
}

function SelectField({ control, name, label, children, disabled = false }) {
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

function IconSelector({ control, disabled }) {
  const { t } = useTranslation("admin");

  const controller = useController({
    control,
    name: "icon",
  });

  const selectedIcon = controller.field.value;

  const handleChange = controller.field.onChange;

  const errorMessage = controller.fieldState.error?.message;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {t("categories.fields.icon")}
      </p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {CATEGORY_ICON_VALUES.map((icon) => {
          const selected = icon === selectedIcon;

          return (
            <button
              key={icon}
              type="button"
              disabled={disabled}
              onClick={() => handleChange(icon)}
              title={t(`categories.icons.${icon}`)}
              className={[
                "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-[#0979c4] bg-[#0979c4]/10 text-[#0979c4] ring-2 ring-[#0979c4]/10 dark:border-sky-500 dark:text-sky-300"
                  : "border-slate-200 text-slate-500 hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-400",
              ].join(" ")}
            >
              <CategoryIcon icon={icon} className="size-6" />

              <span className="line-clamp-2 text-[10px] font-bold leading-4">
                {t(`categories.icons.${icon}`)}
              </span>
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function CategoryFormModal({ category = null, onClose, onSaved }) {
  const { t } = useTranslation("admin");

  const editing = Boolean(category?.id);

  const { control, handleSubmit, getValues, setValue } = useForm({
    resolver: zodResolver(createCategorySchema),

    defaultValues: createDefaultValues(category),

    mode: "onBlur",
  });

  const imageMediaId = useWatch({
    control,
    name: "imageMediaId",
  });

  const [selectedImage, setSelectedImage] = useState(() =>
    createInitialSelectedImage(category),
  );

  const [keywordValues, setKeywordValues] = useState({
    en: Array.isArray(category?.seo?.keywords?.en)
      ? category.seo.keywords.en.join(", ")
      : "",

    th: Array.isArray(category?.seo?.keywords?.th)
      ? category.seo.keywords.th.join(", ")
      : "",
  });

  const [saving, setSaving] = useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [mediaImages, setMediaImages] = useState([]);

  const [mediaPagination, setMediaPagination] = useState({
    limit: 24,
    count: 0,
    hasMore: false,
    nextCursor: null,
  });

  const [mediaLoading, setMediaLoading] = useState(false);

  const [mediaAppliedSearch, setMediaAppliedSearch] = useState("");

  async function requestMediaImages({
    search = "",
    cursor,
    append = false,
  } = {}) {
    setMediaLoading(true);

    try {
      const result = await getMediaAssets({
        limit: 24,
        cursor,
        type: "image",
        search: search || undefined,
        usage: "all",
      });

      setMediaImages((currentImages) =>
        append ? [...currentImages, ...result.items] : result.items,
      );

      setMediaPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("categories.messages.imageLoadFailed"));
    } finally {
      setMediaLoading(false);
    }
  }

  async function handleOpenMediaPicker() {
    setMediaPickerOpen(true);

    await requestMediaImages({
      search: "",
    });
  }

  async function handleMediaSearch(search) {
    setMediaAppliedSearch(search);

    await requestMediaImages({
      search,
    });
  }

  async function handleMediaLoadMore() {
    if (mediaLoading || !mediaPagination.nextCursor) {
      return;
    }

    await requestMediaImages({
      search: mediaAppliedSearch,
      cursor: mediaPagination.nextCursor,
      append: true,
    });
  }

  function handleSelectImage(image) {
    setValue("imageMediaId", image.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSelectedImage(image);
    setMediaPickerOpen(false);
  }

  function handleRemoveImage() {
    setValue("imageMediaId", null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSelectedImage(null);
  }

  function handleGenerateSlug() {
    const englishName = getValues("name.en");

    const slug = normalizeCategorySlug(englishName);

    setValue("slug", slug, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitCategory(values) {
    setSaving(true);

    const payload = {
      ...values,

      imageMediaId: values.imageMediaId || null,

      seo: {
        ...values.seo,

        keywords: {
          en: normalizeKeywords(keywordValues.en),

          th: normalizeKeywords(keywordValues.th),
        },
      },
    };

    try {
      const savedCategory = editing
        ? await updateCategory({
            categoryId: category.id,
            values: payload,
          })
        : await createCategory({
            values: payload,
          });

      toast.success(
        editing
          ? t("categories.messages.updateSuccess")
          : t("categories.messages.createSuccess"),
      );

      onSaved(savedCategory);
    } catch (error) {
      const message =
        error?.code === "CONFLICT"
          ? t("categories.messages.slugExists")
          : error?.message ||
            t(
              editing
                ? "categories.messages.updateFailed"
                : "categories.messages.createFailed",
            );

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
      >
        <button
          type="button"
          onClick={saving ? undefined : onClose}
          className="absolute inset-0 cursor-default"
          aria-label={t("categories.actions.close")}
          tabIndex={-1}
        />

        <form
          onSubmit={handleSubmit(submitCategory)}
          noValidate
          className="relative z-10 flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl"
        >
          <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
                {t(
                  editing
                    ? "categories.form.editEyebrow"
                    : "categories.form.createEyebrow",
                )}
              </p>

              <h2
                id="category-form-title"
                className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
              >
                {t(
                  editing
                    ? "categories.form.editTitle"
                    : "categories.form.createTitle",
                )}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t(
                  editing
                    ? "categories.form.editDescription"
                    : "categories.form.createDescription",
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label={t("categories.actions.close")}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <FiX className="text-xl" aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                {t("categories.form.contentSection")}
              </h3>

              <div className="mt-5 space-y-5">
                <LocalizedFieldGroup
                  control={control}
                  name="name"
                  label={t("categories.fields.name")}
                  required
                  maxLength={120}
                />

                <LocalizedFieldGroup
                  control={control}
                  name="description"
                  label={t("categories.fields.description")}
                  multiline
                  rows={4}
                  maxLength={500}
                />

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <AdminFormField
                    control={control}
                    name="slug"
                    label={t("categories.fields.slug")}
                    hint={t("categories.fields.slugHint")}
                    placeholder="door-closers"
                    required
                    maxLength={120}
                  />

                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 dark:border-sky-700 dark:text-sky-300"
                  >
                    <FiRefreshCw aria-hidden="true" />

                    {t("categories.actions.generateSlug")}
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                {t("categories.form.displaySection")}
              </h3>

              <div className="mt-5 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("categories.fields.image")}
                  </p>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                    <div className="relative flex aspect-[4/3] items-center justify-center">
                      {selectedImage?.publicUrl ? (
                        <Image
                          src={selectedImage.publicUrl}
                          alt={
                            selectedImage.altText?.en ||
                            selectedImage.originalName ||
                            ""
                          }
                          fill
                          unoptimized
                          sizes="280px"
                          className="object-cover"
                        />
                      ) : (
                        <FiImage
                          className="text-4xl text-slate-300 dark:text-slate-600"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleOpenMediaPicker}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa]"
                      >
                        <FiImage aria-hidden="true" />

                        {imageMediaId
                          ? t("categories.actions.changeImage")
                          : t("categories.actions.selectImage")}
                      </button>

                      {imageMediaId ? (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <FiTrash2 aria-hidden="true" />

                          {t("categories.actions.removeImage")}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {t("categories.fields.imageHint")}
                  </p>
                </div>

                <div className="space-y-5">
                  <IconSelector control={control} disabled={saving} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      control={control}
                      name="status"
                      label={t("categories.fields.status")}
                      disabled={saving}
                    >
                      {CATEGORY_STATUS_VALUES.map((status) => (
                        <option key={status} value={status}>
                          {t(`categories.statuses.${status}`)}
                        </option>
                      ))}
                    </SelectField>

                    <AdminFormField
                      control={control}
                      name="sortOrder"
                      type="number"
                      min={0}
                      max={9999}
                      label={t("categories.fields.sortOrder")}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminCheckboxField
                      control={control}
                      name="featured"
                      label={t("categories.fields.featured")}
                      description={t("categories.fields.featuredDescription")}
                    />

                    <AdminCheckboxField
                      control={control}
                      name="showOnHome"
                      label={t("categories.fields.showOnHome")}
                      description={t("categories.fields.showOnHomeDescription")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                {t("categories.seo.title")}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("categories.seo.description")}
              </p>

              <div className="mt-5 space-y-5">
                <LocalizedFieldGroup
                  control={control}
                  name="seo.title"
                  label={t("categories.seo.metaTitle")}
                  maxLength={70}
                />

                <LocalizedFieldGroup
                  control={control}
                  name="seo.description"
                  label={t("categories.seo.metaDescription")}
                  multiline
                  rows={3}
                  maxLength={180}
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  {["en", "th"].map((locale) => (
                    <label key={locale} className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {t("categories.seo.keywords")}
                        {" — "}
                        {t(
                          `categories.language.${
                            locale === "en" ? "english" : "thai"
                          }`,
                        )}
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
                            ? "door closer, hardware"
                            : "โช้คประตู, อุปกรณ์ประตู"
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />

                      <span className="mt-1.5 block text-xs text-slate-400">
                        {t("categories.seo.keywordsHint")}
                      </span>
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
              {t("categories.actions.cancel")}
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
                ? t("categories.actions.saving")
                : t("categories.actions.save")}
            </button>
          </footer>
        </form>
      </div>

      {mediaPickerOpen ? (
        <MediaImagePicker
          key={`${category?.id || "new"}-${imageMediaId || "empty"}`}
          images={mediaImages}
          pagination={mediaPagination}
          initialSelectedId={imageMediaId}
          loading={mediaLoading}
          onSearch={handleMediaSearch}
          onLoadMore={handleMediaLoadMore}
          onConfirm={handleSelectImage}
          onClose={() => setMediaPickerOpen(false)}
        />
      ) : null}
    </>
  );
}
