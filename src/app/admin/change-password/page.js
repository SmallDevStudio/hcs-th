import Image from "next/image";
import { redirect } from "next/navigation";

import { HtmlLangSync } from "@/components/common/HtmlLangSync";
import { ForcedPasswordChangeForm } from "@/components/admin/auth/ForcedPasswordChangeForm";
import { AdminI18nProvider } from "@/i18n/AdminI18nProvider";
import { requireAdminPage } from "@/lib/auth/admin-page-auth";

const SUPPORTED_ADMIN_LOCALES = ["en", "th"];

function normalizeAdminLocale(locale) {
  return SUPPORTED_ADMIN_LOCALES.includes(locale) ? locale : "en";
}

export const metadata = {
  title: "Change Password",
};

export default async function AdminChangePasswordPage() {
  const admin = await requireAdminPage();

  if (!admin.mustChangePassword) {
    redirect("/admin/dashboard");
  }

  const locale = normalizeAdminLocale(admin.preferredLocale);

  return (
    <AdminI18nProvider locale={locale}>
      <HtmlLangSync locale={locale} />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061522] px-4 py-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(9,121,196,0.28),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_38%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:42px_42px]"
        />

        <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-[#071522]">
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <Image
              src="/images/brand/hcs-logo-primary.png"
              alt="HCS Thailand"
              width={128}
              height={62}
              priority
              className="mx-auto h-auto w-[118px] dark:hidden"
            />

            <Image
              src="/images/brand/hcs-logo-white.png"
              alt="HCS Thailand"
              width={128}
              height={62}
              priority
              className="mx-auto hidden h-auto w-[118px] dark:block"
            />

            <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              HCS Administration
            </p>
          </header>

          <ForcedPasswordChangeForm email={admin.email} />
        </section>
      </main>
    </AdminI18nProvider>
  );
}
