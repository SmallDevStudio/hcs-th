import { redirect } from "next/navigation";

import { HtmlLangSync } from "@/components/common/HtmlLangSync";
import { AdminLoginScreen } from "@/components/admin/auth/AdminLoginScreen";
import { AdminI18nProvider } from "@/i18n/AdminI18nProvider";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export const metadata = {
  title: "Admin Sign In",
};

function normalizeLoginLocale(locale) {
  return ["en", "th"].includes(locale) ? locale : "en";
}

export default async function AdminLoginPage({ searchParams }) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin/dashboard");
  }

  const resolvedSearchParams = await searchParams;

  const locale = normalizeLoginLocale(resolvedSearchParams?.lang);

  return (
    <AdminI18nProvider locale={locale}>
      <HtmlLangSync locale={locale} />

      <AdminLoginScreen locale={locale} />
    </AdminI18nProvider>
  );
}
