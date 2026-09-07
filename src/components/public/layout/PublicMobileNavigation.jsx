"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiMail, FiMapPin, FiPhone, FiX } from "react-icons/fi";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/public/layout/LanguageSwitcher";
import {
  isNavigationItemActive,
  resolveNavigationHref,
} from "@/components/public/layout/PublicNavigation";

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

function getVisibleNavigationItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.visible !== false && item.status !== "draft")
    .sort(
      (firstItem, secondItem) =>
        Number(firstItem.sortOrder || 0) - Number(secondItem.sortOrder || 0),
    );
}

export function PublicMobileNavigation({
  locale = "en",
  items = [],
  contact,
  open,
  onClose,
}) {
  const { t } = useTranslation("public");

  const pathname = usePathname();

  const currentLocale = locale === "th" ? "th" : "en";

  const visibleItems = getVisibleNavigationItems(items);

  return (
    <>
      <button
        type="button"
        aria-label={t("common.closeMenu")}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={[
          "fixed inset-0 z-[60] bg-[#07111b]/65 backdrop-blur-sm transition-opacity xl:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        id="public-mobile-navigation"
        aria-hidden={!open}
        className={[
          "fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,390px)] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 xl:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[74px] items-center justify-between border-b border-border px-5">
          <Link
            href={`/${currentLocale}`}
            onClick={onClose}
            aria-label="HCS Thailand"
          >
            <Image
              src="/images/brand/hcs-logo-primary.png"
              alt="HCS Thailand"
              width={120}
              height={45}
              className="h-auto w-[108px] object-contain dark:hidden"
            />

            <Image
              src="/images/brand/hcs-logo-white.png"
              alt="HCS Thailand"
              width={120}
              height={45}
              className="hidden h-auto w-[108px] object-contain dark:block"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-primary hover:text-primary"
            aria-label={t("common.closeMenu")}
          >
            <FiX aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-5 py-6"
        >
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const href = resolveNavigationHref(item, currentLocale);

              const active = isNavigationItemActive({
                pathname,

                item,

                locale: currentLocale,
              });

              const label = getLocalizedLabel(item, currentLocale, t);

              const external = isExternalHref(href);

              const linkClassName = [
                "flex min-h-12 items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition",
                active
                  ? "bg-primary/10 !text-primary"
                  : "text-foreground hover:bg-muted hover:!text-primary",
              ].join(" ");

              const content = (
                <>
                  <span>{label}</span>

                  <FiArrowRight
                    aria-hidden="true"
                    className={active ? "text-primary" : ""}
                  />
                </>
              );

              return (
                <li key={item.id || item.key}>
                  {external ? (
                    <a
                      href={href}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noreferrer" : undefined}
                      onClick={onClose}
                      className={linkClassName}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noreferrer" : undefined}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={linkClassName}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-5">
          <div className="mb-4 flex items-center gap-2">
            <LanguageSwitcher locale={currentLocale} />

            <ThemeToggle />
          </div>

          <Link
            href={`/${currentLocale}/contact`}
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-bold !text-white transition hover:bg-primary-hover"
          >
            <span className="!text-white">{t("common.contactUs")}</span>

            <FiArrowRight aria-hidden="true" className="text-white" />
          </Link>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            {contact.phone ? (
              <a
                href={contact.phoneHref}
                className="flex items-center gap-3 transition hover:text-primary"
              >
                <FiPhone aria-hidden="true" className="shrink-0" />

                <span>{contact.phone}</span>
              </a>
            ) : null}

            {contact.email ? (
              <a
                href={contact.emailHref}
                className="flex items-center gap-3 break-all transition hover:text-primary"
              >
                <FiMail aria-hidden="true" className="shrink-0" />

                <span>{contact.email}</span>
              </a>
            ) : null}

            {contact.location ? (
              <div className="flex items-start gap-3">
                <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0" />

                <span>{contact.location}</span>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
