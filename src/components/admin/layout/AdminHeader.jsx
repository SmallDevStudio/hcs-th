"use client";

import { useTranslation } from "react-i18next";
import { FiMenu, FiUser } from "react-icons/fi";

import { AdminLanguageSwitcher } from "@/components/admin/layout/AdminLanguageSwitcher";
import { AdminLogoutButton } from "@/components/admin/auth/AdminLogoutButton";
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
            <FiMenu className="text-xl" aria-hidden="true" />
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

          <div className="hidden items-center gap-3 md:flex">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0979c4]/10 font-bold text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
              {getAdminInitial(admin)}
            </span>

            <div className="max-w-44">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {admin?.displayName || admin?.email}
              </p>

              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {t(`roles.${admin?.role}`, {
                  defaultValue: admin?.role,
                })}
              </p>
            </div>
          </div>

          <div className="md:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0979c4]/10 text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
              <FiUser className="text-lg" aria-hidden="true" />
            </span>
          </div>

          <div className="hidden xl:block">
            <AdminLogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
