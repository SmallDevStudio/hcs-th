"use client";

import { useTranslation } from "react-i18next";

import { FiPlus } from "react-icons/fi";

import Swal from "sweetalert2";

import {
  ABOUT_SECTION_TYPE_VALUES,
  ABOUT_SECTION_TYPES,
} from "@/constants/about";

import { AboutSectionCard } from "@/components/admin/about/AboutSectionCard";

export function AboutSectionList({ sections, controller, disabled = false }) {
  const { t } = useTranslation("admin");

  const items = Array.isArray(sections) ? sections : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("about.sections.eyebrow")}
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            {t("about.sections.title")}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("about.sections.description")}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {t("about.sections.count", {
            count: items.length,
          })}
        </span>
      </header>

      <div className="p-5 sm:p-6">
        {!items.length ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0979c4] shadow-sm dark:bg-slate-800 dark:text-sky-300">
              <FiPlus aria-hidden="true" className="text-xl" />
            </span>

            <h3 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("about.sections.empty.title")}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("about.sections.empty.description")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((section, index) => (
              <AboutSectionCard
                key={section.id}
                section={section}
                index={index}
                total={items.length}
                controller={controller}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {!disabled ? (
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {t("about.sections.addMenuTitle")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {ABOUT_SECTION_TYPE_VALUES.map((type) => {
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => controller.addSection(type)}
                    className={[
                      "flex items-start gap-3 rounded-xl border",
                      "border-slate-200 p-3 text-left transition",
                      "hover:border-[#0979c4]",
                      "hover:bg-[#0979c4]/5",
                      "dark:border-slate-700",
                      "dark:hover:border-sky-600",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                        {t(`about.sections.types.${type}.title`)}
                      </span>

                      <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                        {t(`about.sections.types.${type}.description`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
