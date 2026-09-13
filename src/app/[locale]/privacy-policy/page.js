import { redirect } from "next/navigation";

import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";

export default async function PrivacyPolicyRedirectPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  redirect(`/${locale}/privacy`);
}
