"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const AUTOPLAY_INTERVAL = 6500;
const SWIPE_THRESHOLD = 50;

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function resolveActionHref(href, locale, fallback) {
  const value = String(href || "").trim() || fallback;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  if (
    normalizedPath === `/${locale}` ||
    normalizedPath.startsWith(`/${locale}/`) ||
    normalizedPath.startsWith("/en/") ||
    normalizedPath.startsWith("/th/")
  ) {
    return normalizedPath;
  }

  return `/${locale}${normalizedPath}`;
}

function createFallbackSlide({ t, locale }) {
  return {
    id: "fallback-home-hero",

    eyebrow: {
      [locale]: t("home.hero.eyebrow"),
    },

    titleLineOne: {
      [locale]: t("home.hero.titleLineOne"),
    },

    titleLineTwo: {
      [locale]: t("home.hero.titleLineTwo"),
    },

    description: {
      [locale]: t("home.hero.description"),
    },

    primaryAction: {
      label: {
        [locale]: t("home.hero.primaryAction"),
      },

      href: "/products",
    },

    secondaryAction: {
      label: {
        [locale]: t("home.hero.secondaryAction"),
      },

      href: "/contact",
    },

    desktopImage: {
      publicUrl: "/images/home/hcs-hero-main.jpg",

      altText: {
        [locale]: t("home.hero.imageAlt"),
      },
    },

    mobileImage: null,

    sortOrder: 0,
  };
}

function HeroBackground({ slide, locale, active, eager }) {
  const desktopUrl = slide.desktopImage?.publicUrl || null;

  const mobileUrl = slide.mobileImage?.publicUrl || null;

  const title = getLocalizedValue(slide.titleLineOne, locale, "HCS Thailand");

  const desktopAlt =
    getLocalizedValue(slide.desktopImage?.altText, locale, title) || title;

  const mobileAlt =
    getLocalizedValue(slide.mobileImage?.altText, locale, desktopAlt) ||
    desktopAlt;

  if (!desktopUrl && !mobileUrl) {
    return (
      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 transition duration-700",
          active ? "scale-100 opacity-100" : "scale-[1.015] opacity-0",
          "bg-[radial-gradient(circle_at_78%_42%,rgba(21,133,205,0.42),transparent_31%),linear-gradient(112deg,#03182a_0%,#07375d_58%,#086da9_100%)]",
        ].join(" ")}
      >
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="absolute -right-28 top-1/2 size-[520px] -translate-y-1/2 rounded-full border border-white/10 sm:size-[680px]" />

        <div className="absolute -right-6 top-1/2 size-[360px] -translate-y-1/2 rotate-12 rounded-[80px] border border-white/10 sm:size-[480px]" />
      </div>
    );
  }

  const fallbackUrl = desktopUrl || mobileUrl;

  return (
    <div
      className={[
        "absolute inset-0 transition duration-1000 ease-out",
        active ? "scale-100 opacity-100" : "scale-[1.025] opacity-0",
      ].join(" ")}
    >
      {mobileUrl ? (
        <>
          <Image
            src={mobileUrl}
            alt={mobileAlt}
            fill
            priority={eager}
            loading={eager ? "eager" : "lazy"}
            unoptimized
            sizes="100vw"
            className="object-cover object-center sm:hidden"
          />

          <Image
            src={fallbackUrl}
            alt={desktopAlt}
            fill
            priority={eager}
            loading={eager ? "eager" : "lazy"}
            unoptimized
            sizes="100vw"
            className="hidden object-cover object-center sm:block"
          />
        </>
      ) : (
        <Image
          src={fallbackUrl}
          alt={desktopAlt}
          fill
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
    </div>
  );
}

function HeroAction({
  action,
  locale,
  fallbackHref,
  fallbackLabel,
  secondary = false,
  active,
}) {
  const label = getLocalizedValue(action?.label, locale, fallbackLabel);

  if (!label) {
    return null;
  }

  const href = resolveActionHref(action?.href, locale, fallbackHref);

  const className = secondary
    ? "inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-white/75 bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#071b2d]"
    : "inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover";

  const external = href.startsWith("http://") || href.startsWith("https://");

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
        className={className}
      >
        <span>{label}</span>

        {!secondary ? (
          <FiArrowRight aria-hidden="true" className="size-[18px]" />
        ) : null}
      </a>
    );
  }

  return (
    <Link href={href} tabIndex={active ? 0 : -1} className={className}>
      <span>{label}</span>

      {!secondary ? (
        <FiArrowRight aria-hidden="true" className="size-[18px]" />
      ) : null}
    </Link>
  );
}

export function HeroSection({ locale = "en", slides = [] }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const heroSlides = useMemo(() => {
    const validSlides = Array.isArray(slides) ? slides.filter(Boolean) : [];

    if (validSlides.length) {
      return [...validSlides].sort(
        (firstSlide, secondSlide) =>
          Number(firstSlide.sortOrder || 0) -
          Number(secondSlide.sortOrder || 0),
      );
    }

    return [
      createFallbackSlide({
        t,
        locale: currentLocale,
      }),
    ];
  }, [slides, t, currentLocale]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [paused, setPaused] = useState(false);

  const pointerStartX = useRef(null);

  const hasMultipleSlides = heroSlides.length > 1;

  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(0, heroSlides.length - 1),
  );

  useEffect(() => {
    if (!hasMultipleSlides || paused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, AUTOPLAY_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasMultipleSlides, heroSlides.length, paused]);

  function showPrevious() {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + heroSlides.length) % heroSlides.length,
    );
  }

  function showNext() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
  }

  function handlePointerDown(event) {
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event) {
    if (pointerStartX.current === null) {
      return;
    }

    const distance = event.clientX - pointerStartX.current;

    pointerStartX.current = null;

    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      return;
    }

    if (distance > 0) {
      showPrevious();
    } else {
      showNext();
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home.hero.carouselLabel", {
        defaultValue: "Featured content",
      })}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
      className="relative isolate min-h-[500px] touch-pan-y overflow-hidden bg-[#071b2d] text-white sm:min-h-[540px] lg:min-h-[600px]"
    >
      {heroSlides.map((slide, index) => (
        <HeroBackground
          key={slide.id}
          slide={slide}
          locale={currentLocale}
          active={index === safeActiveIndex}
          eager={index === 0}
        />
      ))}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#03182a]/95 via-[#052743]/72 to-[#052743]/5"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#061522]/45 via-transparent to-[#061522]/15"
      />

      <div className="container-hcs relative z-10 min-h-[500px] sm:min-h-[540px] lg:min-h-[600px]">
        {heroSlides.map((slide, index) => {
          const active = index === safeActiveIndex;

          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${heroSlides.length}`}
              className={[
                "absolute inset-x-0 top-0 flex min-h-[500px] items-center py-14 transition-all duration-700 sm:min-h-[540px] lg:min-h-[600px] lg:py-16",
                active
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0",
              ].join(" ")}
            >
              <div className="max-w-[620px]">
                {getLocalizedValue(slide.eyebrow, currentLocale) ? (
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#55b8f7] sm:text-sm">
                    {getLocalizedValue(slide.eyebrow, currentLocale)}
                  </p>
                ) : null}

                <h1 className="text-balance text-[42px] font-extrabold uppercase leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px]">
                  <span className="block">
                    {getLocalizedValue(slide.titleLineOne, currentLocale)}
                  </span>

                  {getLocalizedValue(slide.titleLineTwo, currentLocale) ? (
                    <span className="mt-1 block">
                      {getLocalizedValue(slide.titleLineTwo, currentLocale)}
                    </span>
                  ) : null}
                </h1>

                {getLocalizedValue(slide.description, currentLocale) ? (
                  <p className="mt-5 max-w-[520px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                    {getLocalizedValue(slide.description, currentLocale)}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <HeroAction
                    action={slide.primaryAction}
                    locale={currentLocale}
                    fallbackHref="/products"
                    fallbackLabel={t("home.hero.primaryAction")}
                    active={active}
                  />

                  <HeroAction
                    action={slide.secondaryAction}
                    locale={currentLocale}
                    fallbackHref="/contact"
                    fallbackLabel={t("home.hero.secondaryAction")}
                    secondary
                    active={active}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={t("home.hero.previousSlide", {
              defaultValue: "Previous slide",
            })}
            className="absolute left-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#03182a]/35 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-[#071b2d] lg:flex xl:left-7"
          >
            <FiArrowLeft aria-hidden="true" className="size-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label={t("home.hero.nextSlide", {
              defaultValue: "Next slide",
            })}
            className="absolute right-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#03182a]/35 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-[#071b2d] lg:flex xl:right-7"
          >
            <FiArrowRight aria-hidden="true" className="size-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {heroSlides.map((slide, index) => {
              const active = index === safeActiveIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t("home.hero.selectSlide", {
                    number: index + 1,

                    defaultValue: `Show slide ${index + 1}`,
                  })}
                  aria-current={active ? "true" : undefined}
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    active
                      ? "w-7 bg-primary"
                      : "w-2 bg-white/80 hover:bg-white",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
