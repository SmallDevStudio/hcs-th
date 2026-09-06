"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiAlertTriangle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

export function AdminErrorState({ error, reset }) {
  const { t } = useTranslation("admin");

  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <FiAlertTriangle className="text-3xl" aria-hidden="true" />
        </span>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
          {t("core.errors.eyebrow")}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
          {t("core.errors.title")}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
          {t("core.errors.description")}
        </p>

        {error?.digest ? (
          <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
            {t("core.errors.reference", {
              reference: error.digest,
            })}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa]"
          >
            <FiRefreshCw aria-hidden="true" />
            {t("core.errors.retry")}
          </button>

          <Link
            href="/admin/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/50 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300"
          >
            <FiArrowLeft aria-hidden="true" />
            {t("core.errors.backToDashboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}
