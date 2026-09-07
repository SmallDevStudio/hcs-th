"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

function normalizePath(pathname) {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.replace(/\/+$/, "");

  return normalized || "/";
}

function isExternalHref(href) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

function getLocalizedLabel(item, locale, t) {
  return (
    item.label?.[locale] ||
    item.label?.en ||
    item.label?.th ||
    t(`navigation.${item.key}`)
  );
}

export function resolveNavigationHref(item, locale) {
  const href = String(item?.href || "").trim();

  if (!href) {
    return `/${locale}`;
  }

  if (isExternalHref(href) || href.startsWith("#")) {
    return href;
  }

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  if (
    normalizedHref === `/${locale}` ||
    normalizedHref.startsWith(`/${locale}/`) ||
    normalizedHref.startsWith("/en/") ||
    normalizedHref.startsWith("/th/")
  ) {
    return normalizedHref;
  }

  return `/${locale}${normalizedHref}`;
}

export function isNavigationItemActive({ pathname, item, locale }) {
  if (
    item.openInNewTab ||
    isExternalHref(item.href || "") ||
    String(item.href || "").startsWith("#")
  ) {
    return false;
  }

  const currentPath = normalizePath(pathname);

  const targetPath = normalizePath(resolveNavigationHref(item, locale));

  const itemHref = String(item.href || "").trim();

  if (!itemHref) {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function getVisibleNavigationItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.visible !== false && item.status !== "draft")
    .sort(
      (firstItem, secondItem) =>
        Number(firstItem.sortOrder || 0) - Number(secondItem.sortOrder || 0),
    );
}

export function PublicNavigation({ locale = "en", items = [] }) {
  const { t } = useTranslation("public");

  const pathname = usePathname();

  const currentLocale = locale === "th" ? "th" : "en";

  const visibleItems = getVisibleNavigationItems(items);

  return (
    <nav
      aria-label="Main navigation"
      className="hidden h-full items-center xl:flex"
    >
      <ul className="flex h-full items-center gap-1">
        {visibleItems.map((item) => {
          const href = resolveNavigationHref(item, currentLocale);

          const active = isNavigationItemActive({
            pathname,
            item,
            locale: currentLocale,
          });

          const label = getLocalizedLabel(item, currentLocale, t);

          const external = isExternalHref(href);

          return (
            <li key={item.id || item.key} className="h-full">
              {external ? (
                <a
                  href={href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  className="relative flex h-full items-center px-3 text-sm font-semibold text-foreground transition hover:!text-primary"
                >
                  {label}
                </a>
              ) : (
                <Link
                  href={href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative flex h-full items-center px-3 text-sm font-semibold transition",
                    active
                      ? "!text-primary"
                      : "text-foreground hover:!text-primary",
                  ].join(" ")}
                >
                  {label}

                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                    />
                  ) : null}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
