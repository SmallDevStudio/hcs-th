"use client";

import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiInfo,
  FiPrinter,
  FiSearch,
} from "react-icons/fi";

import {
  ADMIN_MANUAL_CATEGORIES,
  ADMIN_MANUAL_LAST_UPDATED,
  ADMIN_MANUAL_SECTIONS,
} from "@/content/admin-manual";

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function sectionMatchesSearch(section, search) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    section.category,
    section.title,
    section.description,
    ...section.steps,
    ...section.notes,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

export function AdminManualClient() {
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("ทั้งหมด");

  const filteredSections = useMemo(
    () =>
      ADMIN_MANUAL_SECTIONS.filter(
        (section) =>
          (category === "ทั้งหมด" || section.category === category) &&
          sectionMatchesSearch(section, search),
      ),
    [category, search],
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0979c4]">
            HCS Thailand CMS
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            คู่มือผู้ดูแลระบบ
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            คู่มือภาษาไทยสำหรับจัดการเนื้อหา สินค้า ผู้ใช้งาน และการดูแลเว็บไซต์
            HCS Thailand
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            ปรับปรุงล่าสุด: {ADMIN_MANUAL_LAST_UPDATED}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/40 hover:text-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 print:hidden"
        >
          <FiPrinter aria-hidden="true" />
          พิมพ์คู่มือ
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3 print:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522]">
          <FiBookOpen aria-hidden="true" className="text-2xl text-[#0979c4]" />

          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            {ADMIN_MANUAL_SECTIONS.length}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            หัวข้อการใช้งาน
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522]">
          <FiCheckCircle
            aria-hidden="true"
            className="text-2xl text-emerald-500"
          />

          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            {
              ADMIN_MANUAL_CATEGORIES.filter((item) => item !== "ทั้งหมด")
                .length
            }
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            หมวดหมู่
          </p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-sky-900 dark:bg-sky-950/30">
          <FiInfo
            aria-hidden="true"
            className="text-2xl text-sky-600 dark:text-sky-400"
          />

          <p className="mt-4 text-sm font-extrabold text-sky-900 dark:text-sky-100">
            สิทธิ์ของแต่ละบัญชีอาจต่างกัน
          </p>

          <p className="mt-1 text-xs leading-5 text-sky-700 dark:text-sky-300">
            หากไม่พบเมนูหรือปุ่ม ให้ตรวจ Role และ Permission กับผู้ดูแลระบบ
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522] print:hidden">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <label className="relative block">
            <span className="sr-only">ค้นหาในคู่มือ</span>

            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหา เช่น เพิ่มสินค้า, Publish, ผู้ใช้งาน..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          <label>
            <span className="sr-only">เลือกหมวดหมู่</span>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {ADMIN_MANUAL_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {filteredSections.length ? (
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden xl:block print:hidden">
            <nav className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]">
              <p className="px-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                หัวข้อที่แสดง
              </p>

              <div className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">
                {filteredSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-lg px-2 py-2 text-xs font-semibold leading-5 text-slate-600 transition hover:bg-[#0979c4]/5 hover:text-[#0979c4] dark:text-slate-300"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <div className="space-y-5">
            {filteredSections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522] print:break-inside-avoid print:shadow-none"
              >
                <header className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0979c4]">
                    {section.category}
                  </p>

                  <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                    {section.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {section.description}
                  </p>
                </header>

                <div className="px-5 py-5 sm:px-6">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    ขั้นตอนการใช้งาน
                  </h3>

                  <ol className="mt-4 space-y-3">
                    {section.steps.map((step, index) => (
                      <li
                        key={`${section.id}-step-${index + 1}`}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0979c4]/10 text-[11px] font-black text-[#0979c4]">
                          {index + 1}
                        </span>

                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  {section.notes.length ? (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                      <h3 className="flex items-center gap-2 text-sm font-extrabold text-amber-900 dark:text-amber-200">
                        <FiInfo aria-hidden="true" />
                        ข้อควรทราบ
                      </h3>

                      <ul className="mt-3 space-y-2">
                        {section.notes.map((note, index) => (
                          <li
                            key={`${section.id}-note-${index + 1}`}
                            className="flex items-start gap-2 text-xs leading-5 text-amber-800 dark:text-amber-300"
                          >
                            <span aria-hidden="true">•</span>

                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-[#071522]">
          <FiSearch
            aria-hidden="true"
            className="mx-auto text-3xl text-slate-300 dark:text-slate-600"
          />

          <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
            ไม่พบหัวข้อที่ค้นหา
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
          </p>
        </div>
      )}
    </div>
  );
}
