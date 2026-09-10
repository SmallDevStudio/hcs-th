"use client";

import { useId, useState } from "react";
import { FiGlobe } from "react-icons/fi";

import { AdminRichTextEditor } from "@/components/admin/form/AdminRichTextEditor";
import { ABOUT_EMPTY_RICH_TEXT } from "@/constants/about";

const LOCALES = [
  {
    key: "en",
    label: "English",
    shortLabel: "EN",
  },
  {
    key: "th",
    label: "ภาษาไทย",
    shortLabel: "TH",
  },
];

function createEmptyDocument() {
  return structuredClone(ABOUT_EMPTY_RICH_TEXT);
}

function normalizeValue(value) {
  return {
    en: value?.en || createEmptyDocument(),
    th: value?.th || createEmptyDocument(),
  };
}

function documentHasContent(document) {
  if (!document || !Array.isArray(document.content)) {
    return false;
  }

  function nodeHasContent(node) {
    if (typeof node?.text === "string" && node.text.trim()) {
      return true;
    }

    if (!Array.isArray(node?.content)) {
      return false;
    }

    return node.content.some(nodeHasContent);
  }

  return document.content.some(nodeHasContent);
}

export function LocalizedRichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  label,
  hints = {},
  errors = {},
  disabled = false,
  required = false,
  requiredLocales = ["en", "th"],
  minHeight = 220,
}) {
  const generatedId = useId();

  const fieldId = id || generatedId;

  const [activeLocale, setActiveLocale] = useState("en");

  const normalizedValue = normalizeValue(value);

  const activeLocaleDefinition =
    LOCALES.find((locale) => locale.key === activeLocale) || LOCALES[0];

  function handleDocumentChange(nextDocument) {
    onChange?.({
      ...normalizedValue,

      [activeLocale]: nextDocument,
    });
  }

  return (
    <div className="space-y-3">
      {label ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiGlobe
              aria-hidden="true"
              className="text-[#0979c4] dark:text-sky-400"
            />

            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {label}
            </span>

            {required ? (
              <span aria-hidden="true" className="text-red-500">
                *
              </span>
            ) : null}
          </div>

          <div
            role="tablist"
            aria-label={`${label} language`}
            className={[
              "inline-flex rounded-xl border border-slate-200",
              "bg-slate-50 p-1",
              "dark:border-slate-700 dark:bg-slate-900",
            ].join(" ")}
          >
            {LOCALES.map((locale) => {
              const active = locale.key === activeLocale;

              const hasContent = documentHasContent(
                normalizedValue[locale.key],
              );

              const hasError = Boolean(errors?.[locale.key]);

              return (
                <button
                  key={locale.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${fieldId}-${locale.key}`}
                  onClick={() => setActiveLocale(locale.key)}
                  className={[
                    "relative inline-flex h-8 min-w-14 items-center",
                    "justify-center gap-1.5 rounded-lg px-3",
                    "text-xs font-bold transition",
                    active
                      ? [
                          "bg-white text-[#0979c4] shadow-sm",
                          "dark:bg-slate-800 dark:text-sky-300",
                        ].join(" ")
                      : [
                          "text-slate-500 hover:text-slate-900",
                          "dark:text-slate-400 dark:hover:text-white",
                        ].join(" "),
                  ].join(" ")}
                >
                  {locale.shortLabel}

                  {hasContent ? (
                    <span
                      aria-label={`${locale.label} has content`}
                      className={[
                        "size-1.5 rounded-full",
                        hasError ? "bg-red-500" : "bg-emerald-500",
                      ].join(" ")}
                    />
                  ) : null}

                  {!hasContent && hasError ? (
                    <span
                      aria-label={`${locale.label} has an error`}
                      className="size-1.5 rounded-full bg-red-500"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        id={`${fieldId}-${activeLocale}`}
        role="tabpanel"
        aria-label={activeLocaleDefinition.label}
      >
        <AdminRichTextEditor
          id={`${fieldId}-editor-${activeLocale}`}
          value={normalizedValue[activeLocale]}
          onChange={handleDocumentChange}
          onBlur={() => onBlur?.(activeLocale)}
          label={activeLocaleDefinition.label}
          hint={hints?.[activeLocale]}
          error={errors?.[activeLocale]}
          disabled={disabled}
          required={required || requiredLocales.includes(activeLocale)}
          minHeight={minHeight}
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {LOCALES.map((locale) => {
          const hasContent = documentHasContent(normalizedValue[locale.key]);

          const hasError = Boolean(errors?.[locale.key]);

          return (
            <span
              key={locale.key}
              className={
                hasError
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-slate-400"
              }
            >
              {locale.shortLabel}: {hasContent ? "Content added" : "Empty"}
            </span>
          );
        })}
      </div>
    </div>
  );
}
