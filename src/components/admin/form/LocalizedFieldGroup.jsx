"use client";

import { useTranslation } from "react-i18next";

import { AdminFormField } from "@/components/admin/form/AdminFormField";

export function LocalizedFieldGroup({
  control,
  name,
  label,
  hint = "",
  placeholderEn = "",
  placeholderTh = "",
  multiline = false,
  rows = 4,
  required = false,
  maxLength,
  className = "",
}) {
  const { t } = useTranslation("admin");

  return (
    <div className={className}>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormField
          control={control}
          name={`${name}.en`}
          label={`${label} — ${t("siteSettings.language.english")}`}
          hint={hint}
          placeholder={placeholderEn}
          multiline={multiline}
          rows={rows}
          required={required}
          maxLength={maxLength}
        />

        <AdminFormField
          control={control}
          name={`${name}.th`}
          label={`${label} — ${t("siteSettings.language.thai")}`}
          hint={hint}
          placeholder={placeholderTh}
          multiline={multiline}
          rows={rows}
          required={required}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
}
