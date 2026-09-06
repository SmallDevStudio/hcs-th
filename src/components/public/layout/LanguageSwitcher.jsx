"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";

function createLocalePath(pathname, nextLocale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${nextLocale}`;
  }

  if (segments[0] === "en" || segments[0] === "th") {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }

  return `/${segments.join("/")}`;
}

export function LanguageSwitcher({ locale, compact = false }) {
  const { t } = useTranslation("public");
  const pathname = usePathname();

  const nextLocale = locale === "en" ? "th" : "en";
  const nextPath = createLocalePath(pathname, nextLocale);

  return (
    <Link
      href={nextPath}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
      aria-label={t("common.changeLanguage")}
      title={t("common.changeLanguage")}
    >
      <FiGlobe aria-hidden="true" className="size-[17px]" />

      {!compact && (
        <>
          <span className={locale === "en" ? "text-primary" : ""}>EN</span>

          <span aria-hidden="true" className="text-border">
            /
          </span>

          <span className={locale === "th" ? "text-primary" : ""}>TH</span>
        </>
      )}
    </Link>
  );
}


