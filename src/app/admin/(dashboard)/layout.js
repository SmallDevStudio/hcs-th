import { HtmlLangSync } from "@/components/common/HtmlLangSync";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AdminI18nProvider } from "@/i18n/AdminI18nProvider";
import { requireAdminPage } from "@/lib/auth/admin-page-auth";

const SUPPORTED_ADMIN_LOCALES = ["en", "th"];

function normalizeAdminLocale(locale) {
  return SUPPORTED_ADMIN_LOCALES.includes(locale) ? locale : "en";
}

export default async function AdminDashboardLayout({ children }) {
  const admin = await requireAdminPage();

  const locale = normalizeAdminLocale(admin.preferredLocale);

  return (
    <AdminI18nProvider locale={locale}>
      <HtmlLangSync locale={locale} />

      <AdminShell admin={admin}>{children}</AdminShell>
    </AdminI18nProvider>
  );
}
