"use client";

import { useState } from "react";
import { I18nextProvider } from "react-i18next";

import { createHcsI18nInstance } from "@/i18n/I18nProvider";

const SUPPORTED_ADMIN_LOCALES = ["en", "th"];

function normalizeAdminLocale(locale) {
  return SUPPORTED_ADMIN_LOCALES.includes(locale) ? locale : "en";
}

function AdminI18nInstance({ locale, children }) {
  const [i18nInstance] = useState(() => createHcsI18nInstance(locale));

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

export function AdminI18nProvider({ locale: requestedLocale, children }) {
  const locale = normalizeAdminLocale(requestedLocale);

  return (
    <AdminI18nInstance key={locale} locale={locale}>
      {children}
    </AdminI18nInstance>
  );
}
