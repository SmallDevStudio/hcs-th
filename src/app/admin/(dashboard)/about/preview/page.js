import Link from "next/link";
import { FiArrowLeft, FiEye } from "react-icons/fi";

import { AboutBuilderRenderer } from "@/components/public/about/AboutBuilderRenderer";
import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getAboutPage } from "@/services/about/about-query.service";

export const metadata = {
  title: "About Draft Preview",
};

export const dynamic = "force-dynamic";

export default async function AboutDraftPreviewPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

  const page = await getAboutPage();

  const locale = admin.preferredLocale === "th" ? "th" : "en";

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <div className="sticky top-0 z-50 flex flex-col justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:px-6 dark:border-amber-800 dark:bg-amber-950">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white">
            <FiEye aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-extrabold text-amber-950 dark:text-amber-100">
              About Draft Preview
            </p>

            <p className="text-xs text-amber-700 dark:text-amber-300">
              Draft version {Number(page.draftVersion || 0)} — not visible to
              public visitors
            </p>
          </div>
        </div>

        <Link
          href="/admin/about"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-bold text-white transition hover:bg-amber-700"
        >
          <FiArrowLeft aria-hidden="true" />
          Back to About Builder
        </Link>
      </div>

      <div className="bg-white dark:bg-background">
        <AboutBuilderRenderer content={page.draft} locale={locale} />
      </div>
    </div>
  );
}
