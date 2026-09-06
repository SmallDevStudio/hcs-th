"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiCornerUpLeft, FiFileMinus } from "react-icons/fi";

export function AdminNotFoundState() {
  const router = useRouter();
  const { t } = useTranslation("admin");

  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <FiFileMinus className="text-3xl" aria-hidden="true" />
        </span>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
          {t("core.notFound.eyebrow")}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
          {t("core.notFound.title")}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
          {t("core.notFound.description")}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa]"
          >
            <FiArrowLeft aria-hidden="true" />
            {t("core.notFound.backToDashboard")}
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/50 hover:text-[#0979c4] dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300"
          >
            <FiCornerUpLeft aria-hidden="true" />
            {t("core.notFound.previousPage")}
          </button>
        </div>
      </div>
    </section>
  );
}
