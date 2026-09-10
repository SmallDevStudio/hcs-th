"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";
import { FiMenu, FiUser } from "react-icons/fi";

import { AdminLogoutButton } from "@/components/admin/auth/AdminLogoutButton";
import { AdminLanguageSwitcher } from "@/components/admin/layout/AdminLanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";

function getAdminInitial(admin) {
  const value = admin?.displayName || admin?.email || "A";

  return value.trim().charAt(0).toUpperCase();
}

export function AdminHeader({ admin, onOpenNavigation }) {
  const { t } = useTranslation("admin");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#071522]/95">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenNavigation}
            aria-label={t("header.openNavigation")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300 lg:hidden"
          >
            <FiMenu aria-hidden="true" className="text-xl" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-950 dark:text-white">
              {t("header.title")}
            </p>

            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <AdminLanguageSwitcher />

          <ThemeToggle />

          <div className="hidden h-9 w-px bg-slate-200 dark:bg-slate-700 md:block" />

          <Link
            href="/admin/account"
            aria-label={t("account.title")}
            className="group hidden items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:flex"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0979c4]/10 font-bold text-[#0979c4] transition group-hover:bg-[#0979c4] group-hover:!text-white dark:bg-[#0979c4]/20 dark:text-sky-300">
              {getAdminInitial(admin)}
            </span>

            <span className="max-w-44">
              <span className="block truncate text-sm font-bold text-slate-900 transition group-hover:text-[#0979c4] dark:text-white dark:group-hover:text-sky-300">
                {admin?.displayName || admin?.email}
              </span>

              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {t(`roles.${admin?.role}`, {
                  defaultValue: admin?.role,
                })}
              </span>
            </span>
          </Link>

          <Link
            href="/admin/account"
            aria-label={t("account.title")}
            className="flex size-10 items-center justify-center rounded-xl bg-[#0979c4]/10 text-[#0979c4] transition hover:bg-[#0979c4] hover:!text-white dark:bg-[#0979c4]/20 dark:text-sky-300 md:hidden"
          >
            <FiUser aria-hidden="true" className="text-lg" />
          </Link>

          <div className="hidden xl:block">
            <AdminLogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
