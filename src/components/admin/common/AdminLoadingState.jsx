"use client";

import { useTranslation } from "react-i18next";

export function AdminLoadingState() {
  const { t } = useTranslation("admin");

  return (
    <div
      className="space-y-6"
      role="status"
      aria-live="polite"
      aria-label={t("core.loading.title")}
    >
      <div className="flex items-center gap-4">
        <span className="size-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#071522]"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#071522]">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">{t("core.loading.description")}</span>
    </div>
  );
}
