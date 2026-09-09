"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  FiBriefcase,
  FiCheck,
  FiGlobe,
  FiLink,
  FiMapPin,
  FiSave,
  FiSearch,
  FiShare2,
  FiBell,
} from "react-icons/fi";
import { toast } from "sonner";

import { AdminCheckboxField } from "@/components/admin/form/AdminCheckboxField";
import { AdminColorField } from "@/components/admin/form/AdminColorField";
import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { AdminSettingsSection } from "@/components/admin/form/AdminSettingsSection";
import { LocalizedFieldGroup } from "@/components/admin/form/LocalizedFieldGroup";
import { siteSettingsSchema } from "@/modules/site-settings/site-settings.schema";
import { apiClient } from "@/services/http/axios";

import { NotificationSettingsTab } from "@/components/admin/site-settings/NotificationSettingsTab";

const TABS = [
  {
    key: "company",
    labelKey: "siteSettings.tabs.company",
    icon: FiBriefcase,
  },
  {
    key: "contact",
    labelKey: "siteSettings.tabs.contact",
    icon: FiMapPin,
  },
  {
    key: "social",
    labelKey: "siteSettings.tabs.social",
    icon: FiShare2,
  },
  {
    key: "brandingSeo",
    labelKey: "siteSettings.tabs.brandingSeo",
    icon: FiSearch,
  },
  {
    key: "integrations",
    labelKey: "siteSettings.tabs.integrations",
    icon: FiLink,
  },
  {
    key: "notifications",
    labelKey: "siteSettings.tabs.notifications",
    icon: FiBell,
  },
];

function settingsToFormValues(settings) {
  return {
    company: {
      ...settings.company,
    },

    contact: {
      ...settings.contact,
    },

    social: {
      ...settings.social,
    },

    branding: {
      ...settings.branding,
    },

    seo: {
      ...settings.seo,

      en: {
        ...settings.seo.en,
        keywords: Array.isArray(settings.seo.en.keywords)
          ? settings.seo.en.keywords.join(", ")
          : settings.seo.en.keywords || "",
      },

      th: {
        ...settings.seo.th,
        keywords: Array.isArray(settings.seo.th.keywords)
          ? settings.seo.th.keywords.join(", ")
          : settings.seo.th.keywords || "",
      },
    },

    integrations: {
      ...settings.integrations,
    },
    notifications: {
      channels: {
        ...settings.notifications.channels,
      },

      email: {
        ...settings.notifications.email,

        smtpPassword: "",

        recipients: Array.isArray(settings.notifications.email.recipients)
          ? settings.notifications.email.recipients.join("\n")
          : settings.notifications.email.recipients || "",
      },

      line: {
        ...settings.notifications.line,

        channelAccessToken: "",

        targetIds: Array.isArray(settings.notifications.line.targetIds)
          ? settings.notifications.line.targetIds.join("\n")
          : settings.notifications.line.targetIds || "",
      },
    },
  };
}

function formatUpdatedAt(value, locale) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function SeoCharacterCounter({ control, name, type }) {
  const { t } = useTranslation("admin");

  const value =
    useWatch({
      control,
      name,
    }) || "";

  const count = String(value).length;

  const limit = type === "title" ? 70 : 180;
  const translationKey =
    type === "title"
      ? "siteSettings.counter.title"
      : "siteSettings.counter.description";

  return (
    <span
      className={[
        "text-xs font-medium",
        count > limit
          ? "text-red-600 dark:text-red-400"
          : "text-slate-400 dark:text-slate-500",
      ].join(" ")}
    >
      {t(translationKey, {
        count,
      })}
    </span>
  );
}

function FieldHeader({ label, counter = null }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </span>

      {counter}
    </div>
  );
}

function SeoLocaleFields({ control, locale }) {
  const { t } = useTranslation("admin");

  const languageLabel =
    locale === "en"
      ? t("siteSettings.language.english")
      : t("siteSettings.language.thai");

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#0979c4]/10 text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
          <FiGlobe aria-hidden="true" />
        </span>

        <h3 className="font-bold text-slate-950 dark:text-white">
          {languageLabel}
        </h3>
      </div>

      <div className="space-y-5">
        <div>
          <FieldHeader
            label={t("siteSettings.fields.seoTitle")}
            counter={
              <SeoCharacterCounter
                control={control}
                name={`seo.${locale}.title`}
                type="title"
              />
            }
          />

          <AdminFormField
            control={control}
            name={`seo.${locale}.title`}
            label=""
            placeholder={t("siteSettings.placeholders.seoTitle")}
            hint={t("siteSettings.hints.seoAutoFill")}
            maxLength={70}
          />
        </div>

        <div>
          <FieldHeader
            label={t("siteSettings.fields.seoDescription")}
            counter={
              <SeoCharacterCounter
                control={control}
                name={`seo.${locale}.description`}
                type="description"
              />
            }
          />

          <AdminFormField
            control={control}
            name={`seo.${locale}.description`}
            label=""
            placeholder={t("siteSettings.placeholders.seoDescription")}
            hint={t("siteSettings.hints.seoAutoFill")}
            multiline
            rows={4}
            maxLength={180}
          />
        </div>

        <AdminFormField
          control={control}
          name={`seo.${locale}.keywords`}
          label={t("siteSettings.fields.seoKeywords")}
          placeholder={t("siteSettings.placeholders.seoKeywords")}
          hint={t("siteSettings.hints.keywords")}
          multiline
          rows={3}
        />
      </div>
    </div>
  );
}

function CompanyTab({ control }) {
  const { t } = useTranslation("admin");

  return (
    <AdminSettingsSection
      title={t("siteSettings.sections.company.title")}
      description={t("siteSettings.sections.company.description")}
    >
      <div className="space-y-6">
        <LocalizedFieldGroup
          control={control}
          name="company.displayName"
          label={t("siteSettings.fields.displayName")}
          placeholderEn="HCS Thailand"
          placeholderTh="เอชซีเอส ประเทศไทย"
          required
        />

        <LocalizedFieldGroup
          control={control}
          name="company.legalName"
          label={t("siteSettings.fields.legalName")}
          placeholderEn="HCS (Thailand) Co., Ltd."
          placeholderTh="บริษัท เอชซีเอส (ประเทศไทย) จำกัด"
        />

        <LocalizedFieldGroup
          control={control}
          name="company.tagline"
          label={t("siteSettings.fields.tagline")}
          placeholderEn={t("siteSettings.placeholders.tagline", {
            lng: "en",
          })}
          placeholderTh={t("siteSettings.placeholders.tagline", {
            lng: "th",
          })}
        />

        <LocalizedFieldGroup
          control={control}
          name="company.description"
          label={t("siteSettings.fields.description")}
          placeholderEn={t("siteSettings.placeholders.description", {
            lng: "en",
          })}
          placeholderTh={t("siteSettings.placeholders.description", {
            lng: "th",
          })}
          multiline
          rows={5}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <AdminFormField
            control={control}
            name="company.registrationNumber"
            label={t("siteSettings.fields.registrationNumber")}
            placeholder={t("siteSettings.placeholders.registrationNumber")}
          />

          <AdminFormField
            control={control}
            name="company.foundedYear"
            label={t("siteSettings.fields.foundedYear")}
            placeholder={t("siteSettings.placeholders.foundedYear")}
            inputMode="numeric"
            maxLength={4}
          />
        </div>
      </div>
    </AdminSettingsSection>
  );
}

function ContactTab({ control }) {
  const { t } = useTranslation("admin");

  return (
    <AdminSettingsSection
      title={t("siteSettings.sections.contact.title")}
      description={t("siteSettings.sections.contact.description")}
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminFormField
            control={control}
            name="contact.phone"
            label={t("siteSettings.fields.phone")}
            placeholder={t("siteSettings.placeholders.phone")}
            type="tel"
          />

          <AdminFormField
            control={control}
            name="contact.secondaryPhone"
            label={t("siteSettings.fields.secondaryPhone")}
            placeholder={t("siteSettings.placeholders.secondaryPhone")}
            type="tel"
          />

          <AdminFormField
            control={control}
            name="contact.email"
            label={t("siteSettings.fields.email")}
            placeholder={t("siteSettings.placeholders.email")}
            type="email"
          />

          <AdminFormField
            control={control}
            name="contact.salesEmail"
            label={t("siteSettings.fields.salesEmail")}
            placeholder={t("siteSettings.placeholders.salesEmail")}
            type="email"
          />
        </div>

        <LocalizedFieldGroup
          control={control}
          name="contact.address"
          label={t("siteSettings.fields.address")}
          placeholderEn="Bangkok, Thailand"
          placeholderTh="กรุงเทพมหานคร ประเทศไทย"
          multiline
          rows={4}
        />

        <LocalizedFieldGroup
          control={control}
          name="contact.businessHours"
          label={t("siteSettings.fields.businessHours")}
          placeholderEn={t("siteSettings.placeholders.businessHours", {
            lng: "en",
          })}
          placeholderTh={t("siteSettings.placeholders.businessHours", {
            lng: "th",
          })}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <AdminFormField
            control={control}
            name="contact.googleMapsUrl"
            label={t("siteSettings.fields.googleMapsUrl")}
            placeholder={t("siteSettings.placeholders.googleMapsUrl")}
            type="url"
          />

          <AdminFormField
            control={control}
            name="contact.googleMapsEmbedUrl"
            label={t("siteSettings.fields.googleMapsEmbedUrl")}
            placeholder={t("siteSettings.placeholders.googleMapsEmbedUrl")}
            type="url"
          />
        </div>

        <AdminFormField
          control={control}
          name="contact.lineId"
          label={t("siteSettings.fields.lineId")}
          placeholder={t("siteSettings.placeholders.lineId")}
          className="max-w-xl"
        />
      </div>
    </AdminSettingsSection>
  );
}

function SocialTab({ control }) {
  const { t } = useTranslation("admin");

  const fields = [
    {
      name: "social.facebook",
      label: "facebook",
    },
    {
      name: "social.instagram",
      label: "instagram",
    },
    {
      name: "social.youtube",
      label: "youtube",
    },
    {
      name: "social.linkedin",
      label: "linkedin",
    },
    {
      name: "social.line",
      label: "line",
    },
  ];

  return (
    <AdminSettingsSection
      title={t("siteSettings.sections.social.title")}
      description={t("siteSettings.sections.social.description")}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map((field) => (
          <AdminFormField
            key={field.name}
            control={control}
            name={field.name}
            label={t(`siteSettings.fields.${field.label}`)}
            placeholder={t("siteSettings.placeholders.socialUrl")}
            type="url"
          />
        ))}
      </div>
    </AdminSettingsSection>
  );
}

function BrandingSeoTab({ control }) {
  const { t } = useTranslation("admin");

  return (
    <div className="space-y-6">
      <AdminSettingsSection
        title={t("siteSettings.sections.branding.title")}
        description={t("siteSettings.sections.branding.description")}
      >
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <AdminColorField
              control={control}
              name="branding.primaryColor"
              label={t("siteSettings.fields.primaryColor")}
            />

            <AdminColorField
              control={control}
              name="branding.secondaryColor"
              label={t("siteSettings.fields.secondaryColor")}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormField
              control={control}
              name="branding.logoPrimary"
              label={t("siteSettings.fields.logoPrimary")}
              placeholder={t("siteSettings.placeholders.logoPath")}
              hint={t("siteSettings.hints.imagePath")}
            />

            <AdminFormField
              control={control}
              name="branding.logoWhite"
              label={t("siteSettings.fields.logoWhite")}
              placeholder={t("siteSettings.placeholders.logoPath")}
              hint={t("siteSettings.hints.imagePath")}
            />
          </div>

          <AdminFormField
            control={control}
            name="branding.defaultOgImage"
            label={t("siteSettings.fields.defaultOgImage")}
            placeholder={t("siteSettings.placeholders.ogImagePath")}
            hint={t("siteSettings.hints.imagePath")}
          />
        </div>
      </AdminSettingsSection>

      <AdminSettingsSection
        title={t("siteSettings.sections.seo.title")}
        description={t("siteSettings.sections.seo.description")}
      >
        <div className="space-y-6">
          <AdminCheckboxField
            control={control}
            name="seo.indexable"
            label={t("siteSettings.fields.indexable")}
            description={t("siteSettings.fields.indexableDescription")}
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <SeoLocaleFields control={control} locale="en" />
            <SeoLocaleFields control={control} locale="th" />
          </div>
        </div>
      </AdminSettingsSection>
    </div>
  );
}

function IntegrationsTab({ control }) {
  const { t } = useTranslation("admin");

  return (
    <AdminSettingsSection
      title={t("siteSettings.sections.integrations.title")}
      description={t("siteSettings.sections.integrations.description")}
    >
      <div className="space-y-5">
        <AdminFormField
          control={control}
          name="integrations.googleSiteVerification"
          label={t("siteSettings.fields.googleSiteVerification")}
          placeholder={t("siteSettings.placeholders.googleSiteVerification")}
          hint={t("siteSettings.hints.verification")}
        />

        <AdminFormField
          control={control}
          name="integrations.bingSiteVerification"
          label={t("siteSettings.fields.bingSiteVerification")}
          placeholder={t("siteSettings.placeholders.bingSiteVerification")}
          hint={t("siteSettings.hints.verification")}
        />

        <AdminFormField
          control={control}
          name="integrations.googleAnalyticsMeasurementId"
          label={t("siteSettings.fields.googleAnalyticsMeasurementId")}
          placeholder={t(
            "siteSettings.placeholders.googleAnalyticsMeasurementId",
          )}
          hint={t("siteSettings.hints.analytics")}
          className="max-w-2xl"
        />
      </div>
    </AdminSettingsSection>
  );
}

export function SiteSettingsForm({ initialSettings }) {
  const { t, i18n } = useTranslation("admin");
  const [activeTab, setActiveTab] = useState("company");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: settingsToFormValues(initialSettings),
    mode: "onBlur",
  });

  const updatedAt = formatUpdatedAt(
    initialSettings.updatedAt,
    i18n.resolvedLanguage,
  );

  async function onSubmit(values) {
    try {
      const response = await apiClient.put("/site-settings", values);

      const savedSettings = response.data;

      reset(settingsToFormValues(savedSettings));

      toast.success(t("siteSettings.actions.saved"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("siteSettings.actions.saveFailed"),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("siteSettings.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("siteSettings.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("siteSettings.description")}
          </p>

          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {updatedAt
              ? t("siteSettings.status.lastUpdated", {
                  date: updatedAt,
                })
              : t("siteSettings.status.neverUpdated")}
          </p>
        </div>

        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
          ) : isDirty ? (
            <FiSave className="text-lg" aria-hidden="true" />
          ) : (
            <FiCheck className="text-lg" aria-hidden="true" />
          )}

          <span>
            {isSubmitting
              ? t("siteSettings.actions.saving")
              : t("siteSettings.actions.save")}
          </span>
        </button>
      </header>

      <div className="overflow-x-auto">
        <div
          role="tablist"
          className="inline-flex min-w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#071522] lg:min-w-0"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4",
                  "text-sm font-semibold transition",
                  active
                    ? "bg-[#0979c4] !text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")}
              >
                <Icon className="text-base" aria-hidden="true" />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel">
        {activeTab === "company" ? <CompanyTab control={control} /> : null}

        {activeTab === "contact" ? <ContactTab control={control} /> : null}

        {activeTab === "social" ? <SocialTab control={control} /> : null}

        {activeTab === "brandingSeo" ? (
          <BrandingSeoTab control={control} />
        ) : null}

        {activeTab === "integrations" ? (
          <IntegrationsTab control={control} />
        ) : null}
        {activeTab === "notifications" ? (
          <NotificationSettingsTab
            control={control}
            hasUnsavedChanges={isDirty}
          />
        ) : null}
      </div>
    </form>
  );
}
