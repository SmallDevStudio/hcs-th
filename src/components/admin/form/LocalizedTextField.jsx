"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe } from "react-icons/fi";

const LOCALES = [
  {
    key: "en",
    labelKey: "about.languages.english",
  },
  {
    key: "th",
    labelKey: "about.languages.thai",
  },
];

export function LocalizedTextField({
  id,
  label,
  value,
  onChange,
  errors = {},
  hints = {},
  placeholders = {},
  disabled = false,
  required = false,
  requiredLocales = ["en", "th"],
  multiline = false,
  rows = 4,
  maxLength,
}) {
  const { t } = useTranslation("admin");

  const generatedId = useId();

  const fieldId = id || generatedId;

  function handleChange(locale, nextValue) {
    onChange?.({
      en: value?.en || "",
      th: value?.th || "",

      [locale]: nextValue,
    });
  }

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <legend className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <FiGlobe
          aria-hidden="true"
          className="text-[#0979c4] dark:text-sky-400"
        />

        {label}

        {required ? (
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        ) : null}
      </legend>

      <div className="grid gap-4 xl:grid-cols-2">
        {LOCALES.map((locale) => {
          const inputId = `${fieldId}-${locale.key}`;

          const currentValue = value?.[locale.key] || "";

          const error = errors?.[locale.key] || "";

          const localeRequired =
            required || requiredLocales.includes(locale.key);

          const commonProps = {
            id: inputId,

            value: currentValue,

            onChange: (event) => handleChange(locale.key, event.target.value),

            placeholder: placeholders?.[locale.key] || "",

            maxLength,

            required: localeRequired,

            "aria-invalid": Boolean(error),

            "aria-describedby":
              error || hints?.[locale.key] ? `${inputId}-message` : undefined,

            className: [
              "w-full rounded-xl border bg-white px-4",
              "text-sm text-slate-950 outline-none transition",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "dark:bg-slate-900 dark:text-white",
              error
                ? [
                    "border-red-400",
                    "focus:border-red-500",
                    "focus:ring-4 focus:ring-red-500/10",
                    "dark:border-red-500",
                  ].join(" ")
                : [
                    "border-slate-200",
                    "focus:border-[#0979c4]",
                    "focus:ring-4 focus:ring-[#0979c4]/10",
                    "dark:border-slate-700",
                  ].join(" "),
            ].join(" "),
          };

          return (
            <label key={locale.key} htmlFor={inputId} className="block min-w-0">
              <span className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {t(locale.labelKey)}

                  {localeRequired ? (
                    <span aria-hidden="true" className="ml-1 text-red-500">
                      *
                    </span>
                  ) : null}
                </span>

                {Number.isFinite(maxLength) ? (
                  <span className="text-[10px] text-slate-400">
                    {currentValue.length}/{maxLength}
                  </span>
                ) : null}
              </span>

              {multiline ? (
                <textarea
                  {...commonProps}
                  rows={rows}
                  className={[
                    commonProps.className,
                    "resize-y py-3 leading-6",
                  ].join(" ")}
                />
              ) : (
                <input
                  {...commonProps}
                  type="text"
                  className={[commonProps.className, "h-11"].join(" ")}
                />
              )}

              {error || hints?.[locale.key] ? (
                <span
                  id={`${inputId}-message`}
                  className={[
                    "mt-1.5 block text-[11px] leading-5",
                    error
                      ? ["font-medium text-red-600", "dark:text-red-400"].join(
                          " ",
                        )
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {error || hints[locale.key]}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
