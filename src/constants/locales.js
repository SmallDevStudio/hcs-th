export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "th"];

export const LOCALE_LABELS = {
  en: "English",
  th: "ไทย",
};

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}
