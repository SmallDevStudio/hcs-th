"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiGlobe } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient } from "@/services/http/axios";

const languages = [
  {
    code: "en",
    label: "EN",
  },
  {
    code: "th",
    label: "TH",
  },
];

export function AdminLanguageSwitcher() {
  const router = useRouter();
  const { t, i18n } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();

  const currentLocale = i18n.resolvedLanguage || i18n.language || "en";

  function handleLanguageChange(locale) {
    if (locale === currentLocale || isPending) {
      return;
    }

    const previousLocale = currentLocale;

    startTransition(async () => {
      try {
        await i18n.changeLanguage(locale);

        await apiClient.patch("/auth/preferences", {
          preferredLocale: locale,
        });

        router.refresh();

        toast.success(
          t("common.languageUpdated", {
            lng: locale,
          }),
        );
      } catch {
        await i18n.changeLanguage(previousLocale);

        toast.error(
          t("common.languageUpdateFailed", {
            lng: previousLocale,
          }),
        );
      }
    });
  }

  return (
    <div
      className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
      aria-label={t("common.changeLanguage")}
    >
      <span className="flex size-7 items-center justify-center text-slate-400">
        <FiGlobe aria-hidden="true" />
      </span>

      {languages.map((language) => {
        const active = currentLocale === language.code;

        return (
          <button
            key={language.code}
            type="button"
            disabled={isPending}
            onClick={() => handleLanguageChange(language.code)}
            className={[
              "flex h-7 min-w-9 items-center justify-center rounded-lg px-2",
              "text-xs font-bold transition",
              active
                ? "bg-[#0979c4] !text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
              isPending ? "cursor-wait opacity-60" : "",
            ].join(" ")}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
