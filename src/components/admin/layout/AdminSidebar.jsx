"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiExternalLink, FiX } from "react-icons/fi";
import { AdminMessageBadge } from "@/components/admin/messages/AdminMessageBadge";

import {
  ADMIN_NAVIGATION,
  canViewAdminNavigationItem,
} from "@/constants/admin-navigation";

function isNavigationActive(pathname, href) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationItem({ item, pathname, onNavigate, translate }) {
  const Icon = item.icon;
  const active = isNavigationActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5",
        "text-sm font-semibold transition",
        active
          ? "bg-[#0979c4] !text-white shadow-md shadow-[#0979c4]/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "shrink-0 text-lg",
          active
            ? "text-white"
            : "text-slate-400 transition group-hover:text-[#0979c4] dark:text-slate-500 dark:group-hover:text-sky-400",
        ].join(" ")}
        aria-hidden="true"
      />

      <span className="min-w-0 flex-1 truncate">
        {translate(item.labelKey)}
      </span>

      {item.key === "messages" ? <AdminMessageBadge /> : null}
    </Link>
  );
}

export function AdminSidebar({ admin, mobile = false, onClose, onNavigate }) {
  const pathname = usePathname();
  const { t } = useTranslation("admin");

  return (
    <aside
      className={[
        "flex h-full w-[280px] shrink-0 flex-col bg-white dark:bg-[#071522]",
        mobile
          ? "shadow-2xl"
          : "border-r border-slate-200 dark:border-slate-800",
      ].join(" ")}
    >
      <div className="flex min-h-20 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/brand/hcs-logo-primary.png"
            alt="HCS Thailand"
            width={128}
            height={62}
            priority
            className="h-auto w-[105px] dark:hidden"
          />

          <Image
            src="/images/brand/hcs-logo-white.png"
            alt="HCS Thailand"
            width={128}
            height={62}
            priority
            className="hidden h-auto w-[105px] dark:block"
          />

          <span className="border-l border-slate-200 pl-3 text-[10px] font-bold uppercase leading-4 tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Admin
            <span className="block">Panel</span>
          </span>
        </Link>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("header.closeNavigation")}
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav
        aria-label={t("common.adminPanel")}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
      >
        <div className="space-y-6">
          {ADMIN_NAVIGATION.map((group) => {
            if (!group.items) {
              if (!canViewAdminNavigationItem(group, admin)) {
                return null;
              }

              return (
                <NavigationItem
                  key={group.key}
                  item={group}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  translate={t}
                />
              );
            }

            const visibleItems = group.items.filter((item) =>
              canViewAdminNavigationItem(item, admin),
            );

            if (!visibleItems.length) {
              return null;
            }

            return (
              <section key={group.key}>
                <p className="mb-2 px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {t(group.labelKey)}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavigationItem
                      key={item.key}
                      item={item}
                      pathname={pathname}
                      onNavigate={onNavigate}
                      translate={t}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <Link
          href={`/${i18nLanguage(pathname)}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-[#0979c4]/40 hover:bg-[#0979c4]/5 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
        >
          <span>{t("common.viewWebsite")}</span>
          <FiExternalLink aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

function i18nLanguage(pathname) {
  if (pathname.startsWith("/th")) {
    return "th";
  }

  return "en";
}
