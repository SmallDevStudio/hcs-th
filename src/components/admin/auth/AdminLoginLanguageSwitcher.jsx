"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiGlobe } from "react-icons/fi";

const LANGUAGES = [
  {
    code: "en",
    label: "EN",
  },
  {
    code: "th",
    label: "TH",
  },
];

export function AdminLoginLanguageSwitcher({ locale }) {
  const router = useRouter();
  const { t } = useTranslation("admin");

  function changeLocale(nextLocale) {
    if (nextLocale === locale) {
      return;
    }

    router.replace(`/admin/login?lang=${nextLocale}`);
  }

  return (
    <div
      className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
      aria-label={t("common.changeLanguage")}
    >
      <span className="flex size-7 items-center justify-center text-slate-400">
        <FiGlobe aria-hidden="true" />
      </span>

      {LANGUAGES.map((language) => {
        const active = language.code === locale;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => changeLocale(language.code)}
            className={[
              "flex h-7 min-w-9 items-center justify-center rounded-lg px-2",
              "text-xs font-bold transition",
              active
                ? "bg-[#0979c4] !text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
            ].join(" ")}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
