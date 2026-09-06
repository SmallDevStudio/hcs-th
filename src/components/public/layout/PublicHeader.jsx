"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiArrowRight,
  FiMail,
  FiMapPin,
  FiMenu,
  FiPhone,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/public/layout/LanguageSwitcher";
import { siteConfig } from "@/config/site";

function normalizePath(pathname) {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.replace(/\/+$/, "");

  return normalized || "/";
}

function isNavigationActive(pathname, href, locale) {
  const localizedHref = href ? `/${locale}${href}` : `/${locale}`;
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(localizedHref);

  if (!href) {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function PublicHeader({ locale }) {
  const { t } = useTranslation("public");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      return undefined;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  function openMobileMenu() {
    setMobileOpen(true);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="hidden bg-[#07111b] text-white lg:block">
          <div className="container-hcs flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <a
                href={siteConfig.contact.phoneHref}
                className="inline-flex items-center gap-2 text-white/80 transition hover:text-white"
              >
                <FiPhone aria-hidden="true" />

                <span>{siteConfig.contact.phoneDisplay}</span>
              </a>

              <a
                href={siteConfig.contact.emailHref}
                className="inline-flex items-center gap-2 text-white/80 transition hover:text-white"
              >
                <FiMail aria-hidden="true" />

                <span>{siteConfig.contact.email}</span>
              </a>

              <span className="inline-flex items-center gap-2 text-white/70">
                <FiMapPin aria-hidden="true" />

                <span>{siteConfig.contact.location}</span>
              </span>
            </div>

            <span className="font-medium tracking-wide text-white/70">
              HARDWARE &amp; SECURITY SOLUTIONS
            </span>
          </div>
        </div>

        <div className="border-b border-border bg-[var(--header-background)] backdrop-blur-xl">
          <div className="container-hcs flex h-[74px] items-center justify-between gap-6">
            <Link
              href={`/${locale}`}
              onClick={closeMobileMenu}
              className="relative z-10 inline-flex shrink-0 items-center"
              aria-label="HCS Thailand"
            >
              <Image
                src="/images/brand/hcs-logo-primary.png"
                alt="HCS Thailand"
                width={140}
                height={52}
                priority
                className="h-auto w-[112px] object-contain dark:hidden lg:w-[128px]"
              />

              <Image
                src="/images/brand/hcs-logo-white.png"
                alt="HCS Thailand"
                width={140}
                height={52}
                priority
                className="hidden h-auto w-[112px] object-contain dark:block lg:w-[128px]"
              />
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden h-full items-center xl:flex"
            >
              <ul className="flex h-full items-center gap-1">
                {siteConfig.navigation.map((item) => {
                  const href = item.href
                    ? `/${locale}${item.href}`
                    : `/${locale}`;

                  const active = isNavigationActive(
                    pathname,
                    item.href,
                    locale,
                  );

                  return (
                    <li key={item.key} className="h-full">
                      <Link
                        href={href}
                        className={`relative flex h-full items-center px-3 text-sm font-semibold transition ${
                          active
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {t(`navigation.${item.key}`)}

                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <LanguageSwitcher locale={locale} />

                <ThemeToggle />
              </div>

              <Link
                href={`/${locale}/contact`}
                className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold !text-white shadow-sm transition hover:bg-primary-hover lg:inline-flex"
              >
                <span className="!text-white">{t("common.contactUs")}</span>

                <FiArrowRight aria-hidden="true" className="text-white" />
              </Link>

              <button
                type="button"
                onClick={openMobileMenu}
                className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:border-primary hover:text-primary xl:hidden"
                aria-label={t("common.openMenu")}
                aria-expanded={mobileOpen}
                aria-controls="public-mobile-navigation"
              >
                <FiMenu aria-hidden="true" className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <button
        type="button"
        aria-label={t("common.closeMenu")}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[60] bg-[#07111b]/65 backdrop-blur-sm transition-opacity xl:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="public-mobile-navigation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,390px)] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 xl:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[74px] items-center justify-between border-b border-border px-5">
          <Link
            href={`/${locale}`}
            onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
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
            {siteConfig.navigation.map((item) => {
              const href = item.href ? `/${locale}${item.href}` : `/${locale}`;

              const active = isNavigationActive(pathname, item.href, locale);

              return (
                <li key={item.key}>
                  <Link
                    href={href}
                    onClick={closeMobileMenu}
                    className={`flex min-h-12 items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    }`}
                  >
                    <span>{t(`navigation.${item.key}`)}</span>

                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-5">
          <div className="mb-4 flex items-center gap-2">
            <LanguageSwitcher locale={locale} />

            <ThemeToggle />
          </div>

          <Link
            href={`/${locale}/contact`}
            onClick={closeMobileMenu}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-bold !text-white transition hover:bg-primary-hover"
          >
            <span className="!text-white">{t("common.contactUs")}</span>

            <FiArrowRight aria-hidden="true" className="text-white" />
          </Link>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <a
              href={siteConfig.contact.phoneHref}
              className="flex items-center gap-3 transition hover:text-primary"
            >
              <FiPhone aria-hidden="true" />

              <span>{siteConfig.contact.phoneDisplay}</span>
            </a>

            <a
              href={siteConfig.contact.emailHref}
              className="flex items-center gap-3 break-all transition hover:text-primary"
            >
              <FiMail aria-hidden="true" />

              <span>{siteConfig.contact.email}</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}


