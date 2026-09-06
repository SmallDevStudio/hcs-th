"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, getLocaleFromPathname } from "@/i18n/config";
import { i18nResources } from "@/i18n/locales";

export function createHcsI18nInstance(locale) {
  const instance = createInstance();

  instance.use(initReactI18next).init({
    resources: i18nResources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ["en", "th"],

    ns: ["public", "admin"],
    defaultNS: "public",
    fallbackNS: "public",

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    initImmediate: false,
    returnNull: false,
    returnEmptyString: false,
  });

  return instance;
}

function I18nInstanceProvider({ locale, children }) {
  const [i18nInstance] = useState(() => createHcsI18nInstance(locale));

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

export function HcsI18nProvider({ children }) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  return (
    <I18nInstanceProvider key={locale} locale={locale}>
      {children}
    </I18nInstanceProvider>
  );
}
