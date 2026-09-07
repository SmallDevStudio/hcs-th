"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiMenu } from "react-icons/fi";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/public/layout/LanguageSwitcher";
import { PublicMobileNavigation } from "@/components/public/layout/PublicMobileNavigation";
import { PublicNavigation } from "@/components/public/layout/PublicNavigation";
import { PublicTopBar } from "@/components/public/layout/PublicTopBar";
import { siteConfig } from "@/config/site";

function getLocalizedValue(value, locale, fallback = "") {
  if (typeof value === "string") {
    return value || fallback;
  }

  return value?.[locale] || value?.en || value?.th || fallback;
}

function createPhoneHref(phone) {
  const normalizedPhone = String(phone || "").replace(/[^\d+]/g, "");

  return normalizedPhone ? `tel:${normalizedPhone}` : "";
}

function createEmailHref(email) {
  const normalizedEmail = String(email || "").trim();

  return normalizedEmail ? `mailto:${normalizedEmail}` : "";
}

function getHeaderContact(settings, locale) {
  const phone = settings?.contact?.phone || siteConfig.contact.phoneDisplay;

  const email = settings?.contact?.email || siteConfig.contact.email;

  const location = getLocalizedValue(
    settings?.contact?.address,
    locale,
    siteConfig.contact.location,
  );

  return {
    phone,

    phoneHref: createPhoneHref(phone) || siteConfig.contact.phoneHref,

    email,

    emailHref: createEmailHref(email) || siteConfig.contact.emailHref,

    location,
  };
}

function createNavigationItems() {
  return siteConfig.navigation.map((item, index) => ({
    id: item.key,

    key: item.key,

    label: item.label || null,

    href: item.href,

    visible: item.visible !== false,

    status: item.status || "published",

    sortOrder: Number(item.sortOrder ?? (index + 1) * 10),

    openInNewTab: Boolean(item.openInNewTab),
  }));
}

export function PublicHeader({ locale = "en", settings }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const contact = getHeaderContact(settings, currentLocale);

  /*
   * ปัจจุบันใช้ static config
   * อนาคตเปลี่ยนบรรทัดนี้เป็น navigationItems
   * ที่โหลดจาก Firestore ได้ทันที
   */
  const navigationItems = createNavigationItems();

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

  return (
    <>
      <header className="sticky top-0 z-50">
        <PublicTopBar contact={contact} />

        <div className="border-b border-border bg-[var(--header-background)] backdrop-blur-xl">
          <div className="container-hcs flex h-[74px] items-center justify-between gap-6">
            <Link
              href={`/${currentLocale}`}
              onClick={() => setMobileOpen(false)}
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

            <PublicNavigation locale={currentLocale} items={navigationItems} />

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <LanguageSwitcher locale={currentLocale} />

                <ThemeToggle />
              </div>

              <Link
                href={`/${currentLocale}/contact`}
                className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold !text-white shadow-sm transition hover:bg-primary-hover lg:inline-flex"
              >
                <span className="!text-white">{t("common.contactUs")}</span>

                <FiArrowRight aria-hidden="true" className="text-white" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
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

      <PublicMobileNavigation
        locale={currentLocale}
        items={navigationItems}
        contact={contact}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
