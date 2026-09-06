export const SUPPORTED_LOCALES = ["en", "th"];
export const DEFAULT_LOCALE = "en";

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function getLocaleFromPathname(pathname = "") {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (isSupportedLocale(firstSegment)) {
    return firstSegment;
  }

  return DEFAULT_LOCALE;
}
