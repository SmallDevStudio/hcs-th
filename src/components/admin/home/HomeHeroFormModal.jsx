"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiClock, FiLoader, FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { LocalizedFieldGroup } from "@/components/admin/form/LocalizedFieldGroup";
import { HomeHeroMediaFields } from "@/components/admin/home/HomeHeroMediaFields";
import {
  HOME_HERO_DEFAULTS,
  HOME_HERO_LIMITS,
  HOME_SECTION_STATUSES,
  HOME_SECTION_STATUS_VALUES,
} from "@/constants/home";
import { createHomeHeroSchema } from "@/modules/home/home-hero.schema";
import {
  createHomeHero,
  updateHomeHero,
} from "@/services/http/home-heroes.api";

function createLocalizedValue(value, fallback) {
  return {
    en: value?.en ?? fallback?.en ?? "",

    th: value?.th ?? fallback?.th ?? "",
  };
}

function createActionValue(value, fallback) {
  return {
    label: createLocalizedValue(value?.label, fallback?.label),

    href: value?.href ?? fallback?.href ?? "",
  };
}

function createDefaultValues(hero) {
  return {
    sectionType: HOME_HERO_DEFAULTS.sectionType,

    eyebrow: createLocalizedValue(hero?.eyebrow, HOME_HERO_DEFAULTS.eyebrow),

    titleLineOne: createLocalizedValue(
      hero?.titleLineOne,
      HOME_HERO_DEFAULTS.titleLineOne,
    ),

    titleLineTwo: createLocalizedValue(
      hero?.titleLineTwo,
      HOME_HERO_DEFAULTS.titleLineTwo,
    ),

    description: createLocalizedValue(
      hero?.description,
      HOME_HERO_DEFAULTS.description,
    ),

    primaryAction: createActionValue(
      hero?.primaryAction,
      HOME_HERO_DEFAULTS.primaryAction,
    ),

    secondaryAction: createActionValue(
      hero?.secondaryAction,
      HOME_HERO_DEFAULTS.secondaryAction,
    ),

    desktopImageMediaId: hero?.desktopImageMediaId || null,

    mobileImageMediaId: hero?.mobileImageMediaId || null,

    status: hero?.status || HOME_HERO_DEFAULTS.status,

    sortOrder: Number(hero?.sortOrder ?? HOME_HERO_DEFAULTS.sortOrder),

    displaySchedule: {
      startsAt: hero?.displaySchedule?.startsAt || null,

      endsAt: hero?.displaySchedule?.endsAt || null,
    },
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
        value={fieldValue || ""}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={disabled}
        className={[
          "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-950 outline-none transition",
          "focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
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

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toIsoDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function DateTimeField({ control, name, label, hint, disabled = false }) {
  const generatedId = useId();

  const inputId = `home-date-${generatedId.replaceAll(":", "")}`;

  const controller = useController({
    control,
    name,
  });

  const errorMessage = controller.fieldState.error?.message;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>

      <div className="relative">
        <FiClock
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={inputId}
          name={controller.field.name}
          type="datetime-local"
          value={toDateTimeLocalValue(controller.field.value)}
          onBlur={controller.field.onBlur}
          onChange={(event) => {
            controller.field.onChange(toIsoDateTime(event.currentTarget.value));
          }}
          disabled={disabled}
          className={[
            "h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition",
            "focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            "dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800",
            errorMessage
              ? "border-red-400 dark:border-red-700"
              : "border-slate-200 dark:border-slate-700",
          ].join(" ")}
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function HomeHeroFormModal({
  hero = null,
  canPublish = false,
  onClose,
  onSaved,
}) {
  const { t } = useTranslation("admin");

  const editing = Boolean(hero?.id);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createHomeHeroSchema),

    defaultValues: createDefaultValues(hero),

    mode: "onBlur",
  });

  const [saving, setSaving] = useState(false);

  async function submitHero(values) {
    setSaving(true);

    const payload = {
      ...values,

      sectionType: HOME_HERO_DEFAULTS.sectionType,

      desktopImageMediaId: values.desktopImageMediaId || null,

      mobileImageMediaId: values.mobileImageMediaId || null,

      sortOrder: Number(values.sortOrder || HOME_HERO_DEFAULTS.sortOrder),

      displaySchedule: {
        startsAt: values.displaySchedule?.startsAt || null,

        endsAt: values.displaySchedule?.endsAt || null,
      },
    };

    try {
      const savedHero = editing
        ? await updateHomeHero({
            heroId: hero.id,

            values: payload,
          })
        : await createHomeHero({
            values: payload,
          });

      toast.success(
        t(
          editing
            ? "home.heroes.messages.updateSuccess"
            : "home.heroes.messages.createSuccess",
        ),
      );

      onSaved(savedHero);
    } catch (error) {
      let message =
        error?.message ||
        t(
          editing
            ? "home.heroes.messages.updateFailed"
            : "home.heroes.messages.createFailed",
        );

      if (error?.details?.missingFields?.length) {
        message = t("home.heroes.messages.publishIncomplete");
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
      aria-labelledby="home-hero-form-title"
    >
      <button
        type="button"
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label={t("home.heroes.actions.close")}
        tabIndex={-1}
      />

      <form
        onSubmit={handleSubmit(submitHero)}
        noValidate
        className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#071522] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
              {t(
                editing
                  ? "home.heroes.form.editEyebrow"
                  : "home.heroes.form.createEyebrow",
              )}
            </p>

            <h2
              id="home-hero-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {t(
                editing
                  ? "home.heroes.form.editTitle"
                  : "home.heroes.form.createTitle",
              )}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t(
                editing
                  ? "home.heroes.form.editDescription"
                  : "home.heroes.form.createDescription",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("home.heroes.actions.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX aria-hidden="true" className="text-xl" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("home.heroes.form.contentSection")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {t("home.heroes.form.contentDescription")}
            </p>

            <div className="mt-5 space-y-5">
              <LocalizedFieldGroup
                control={control}
                name="eyebrow"
                label={t("home.heroes.fields.eyebrow")}
                maxLength={HOME_HERO_LIMITS.EYEBROW_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="titleLineOne"
                label={t("home.heroes.fields.titleLineOne")}
                required
                maxLength={HOME_HERO_LIMITS.TITLE_LINE_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="titleLineTwo"
                label={t("home.heroes.fields.titleLineTwo")}
                maxLength={HOME_HERO_LIMITS.TITLE_LINE_MAX_LENGTH}
              />

              <LocalizedFieldGroup
                control={control}
                name="description"
                label={t("home.heroes.fields.description")}
                multiline
                rows={4}
                maxLength={HOME_HERO_LIMITS.DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("home.heroes.form.actionsSection")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {t("home.heroes.form.actionsDescription")}
            </p>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("home.heroes.form.primaryAction")}
                </h4>

                <LocalizedFieldGroup
                  control={control}
                  name="primaryAction.label"
                  label={t("home.heroes.fields.actionLabel")}
                  maxLength={HOME_HERO_LIMITS.ACTION_LABEL_MAX_LENGTH}
                />

                <AdminFormField
                  control={control}
                  name="primaryAction.href"
                  label={t("home.heroes.fields.actionUrl")}
                  hint={t("home.heroes.fields.actionUrlHint")}
                  placeholder="/products"
                  maxLength={HOME_HERO_LIMITS.ACTION_HREF_MAX_LENGTH}
                />
              </div>

              <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {t("home.heroes.form.secondaryAction")}
                </h4>

                <LocalizedFieldGroup
                  control={control}
                  name="secondaryAction.label"
                  label={t("home.heroes.fields.actionLabel")}
                  maxLength={HOME_HERO_LIMITS.ACTION_LABEL_MAX_LENGTH}
                />

                <AdminFormField
                  control={control}
                  name="secondaryAction.href"
                  label={t("home.heroes.fields.actionUrl")}
                  hint={t("home.heroes.fields.actionUrlHint")}
                  placeholder="/contact"
                  maxLength={HOME_HERO_LIMITS.ACTION_HREF_MAX_LENGTH}
                />
              </div>
            </div>
          </section>

          <HomeHeroMediaFields
            control={control}
            hero={hero}
            disabled={saving}
          />

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("home.heroes.form.displaySection")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {t("home.heroes.form.displayDescription")}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SelectField
                control={control}
                name="status"
                label={t("home.heroes.fields.status")}
                disabled={saving}
              >
                {HOME_SECTION_STATUS_VALUES.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={
                      status === HOME_SECTION_STATUSES.PUBLISHED && !canPublish
                    }
                  >
                    {t(`home.heroes.statuses.${status}`)}
                  </option>
                ))}
              </SelectField>

              <AdminFormField
                control={control}
                name="sortOrder"
                type="number"
                min={HOME_HERO_LIMITS.SORT_ORDER_MIN}
                max={HOME_HERO_LIMITS.SORT_ORDER_MAX}
                label={t("home.heroes.fields.sortOrder")}
                hint={t("home.heroes.fields.sortOrderHint")}
                disabled={saving}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t("home.heroes.form.scheduleSection")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {t("home.heroes.form.scheduleDescription")}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <DateTimeField
                control={control}
                name="displaySchedule.startsAt"
                label={t("home.heroes.fields.startsAt")}
                hint={t("home.heroes.fields.startsAtHint")}
                disabled={saving}
              />

              <DateTimeField
                control={control}
                name="displaySchedule.endsAt"
                label={t("home.heroes.fields.endsAt")}
                hint={t("home.heroes.fields.endsAtHint")}
                disabled={saving}
              />
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-[#071522] sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("home.heroes.actions.cancel")}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#076aa9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <FiLoader aria-hidden="true" className="animate-spin" />
            ) : (
              <FiSave aria-hidden="true" />
            )}

            {saving
              ? t("home.heroes.actions.saving")
              : t("home.heroes.actions.save")}
          </button>
        </footer>
      </form>
    </div>
  );
}
