"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  FiActivity,
  FiBox,
  FiFolder,
  FiGrid,
  FiImage,
  FiSettings,
  FiShield,
} from "react-icons/fi";

const STATISTIC_ITEMS = [
  {
    key: "products",
    icon: FiBox,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    key: "categories",
    icon: FiFolder,
    color:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    key: "projects",
    icon: FiGrid,
    color:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    key: "media",
    icon: FiImage,
    color:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
  },
];

const QUICK_ACTIONS = [
  {
    key: "siteSettings",
    href: "/admin/site-settings",
    icon: FiSettings,
  },
  {
    key: "products",
    href: "/admin/products",
    icon: FiBox,
  },
  {
    key: "categories",
    href: "/admin/categories",
    icon: FiFolder,
  },
  {
    key: "media",
    href: "/admin/media",
    icon: FiImage,
  },
];

function formatDate(value, locale) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatActionFallback(action = "") {
  return action
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminDashboardContent({ admin, statistics, recentActivity }) {
  const { t, i18n } = useTranslation("admin");

  const adminName = admin.displayName || admin.email;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#075d99] to-[#0979c4] p-6 text-white shadow-lg shadow-[#0979c4]/15 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full border-[60px] border-white/5"
          aria-hidden="true"
        />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
              {t("dashboard.eyebrow")}
            </p>

            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {t("dashboard.welcome", {
                name: adminName,
              })}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">
              {t("dashboard.description")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="flex size-10 items-center justify-center rounded-lg bg-white/10">
              <FiShield className="text-xl" aria-hidden="true" />
            </span>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                {t("dashboard.permission")}
              </p>

              <p className="mt-0.5 text-sm font-bold">
                {t(`roles.${admin.role}`, {
                  defaultValue: admin.role,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4] dark:text-sky-400">
          {t("dashboard.overview")}
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
          {t("dashboard.overviewTitle")}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATISTIC_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.key}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-[#071522]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon className="text-xl" aria-hidden="true" />
                  </span>

                  <strong className="text-3xl font-extrabold text-slate-950 dark:text-white">
                    {Number(statistics[item.key] || 0).toLocaleString(
                      i18n.resolvedLanguage === "th" ? "th-TH" : "en-US",
                    )}
                  </strong>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t(`dashboard.statistics.${item.key}`)}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4] dark:text-sky-400">
            {t("dashboard.quickActions.eyebrow")}
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
            {t("dashboard.quickActions.title")}
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-[#0979c4]/40 hover:bg-[#0979c4]/5 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-sky-950/30 dark:hover:text-sky-300"
                >
                  <Icon
                    className="text-lg text-slate-400 transition group-hover:text-[#0979c4] dark:group-hover:text-sky-300"
                    aria-hidden="true"
                  />

                  {t(`dashboard.quickActions.${action.key}`)}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
          <header className="flex items-end justify-between gap-5 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4] dark:text-sky-400">
                {t("dashboard.recentActivity.eyebrow")}
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
                {t("dashboard.recentActivity.title")}
              </h2>
            </div>

            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-[#0979c4] transition hover:underline dark:text-sky-400"
            >
              {t("dashboard.recentActivity.viewAll")}
            </Link>
          </header>

          {recentActivity.length ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentActivity.map((activity) => (
                <article
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60 sm:px-6"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0979c4]/10 text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
                    <FiActivity aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t(`auditLogs.actions.${activity.action}`, {
                        defaultValue: formatActionFallback(activity.action),
                      })}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {activity.actor?.displayName ||
                        activity.actor?.email ||
                        t("dashboard.recentActivity.unknownUser")}
                    </p>
                  </div>

                  <time className="shrink-0 text-right text-[11px] leading-5 text-slate-400">
                    {formatDate(activity.createdAt, i18n.resolvedLanguage)}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.recentActivity.empty")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
