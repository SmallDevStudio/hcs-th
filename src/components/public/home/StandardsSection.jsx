import Image from "next/image";
import Link from "next/link";
import {
  TbCertificate,
  TbDoor,
  TbDownload,
  TbFlame,
  TbGripHorizontal,
  TbRosetteDiscountCheck,
  TbShieldCheck,
} from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "Standards & Certifications",

    title: "Compliance You Can Trust",

    download: "Download Certificates",

    backgroundAlt: "Technical blueprint of an architectural door closer",
  },

  th: {
    eyebrow: "มาตรฐานและการรับรอง",

    title: "มาตรฐานที่คุณไว้วางใจ",

    download: "ดาวน์โหลดใบรับรอง",

    backgroundAlt: "แบบทางเทคนิคของโช้คอัพประตูสถาปัตยกรรม",
  },
};

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function getStandardVisual(code) {
  const normalizedCode = String(code || "")
    .trim()
    .toLocaleUpperCase();

  if (normalizedCode === "CE") {
    return {
      type: "ce",
      Icon: TbRosetteDiscountCheck,
    };
  }

  if (normalizedCode.startsWith("EN 1634")) {
    return {
      type: "icon",
      Icon: TbFlame,
    };
  }

  if (normalizedCode.startsWith("BS")) {
    return {
      type: "bs",
      Icon: TbCertificate,
    };
  }

  if (normalizedCode.startsWith("EN 1906")) {
    return {
      type: "en",
      Icon: TbGripHorizontal,
    };
  }

  if (normalizedCode.startsWith("EN 1154")) {
    return {
      type: "icon",
      Icon: TbDoor,
    };
  }

  if (normalizedCode.startsWith("ANSI")) {
    return {
      type: "certified",
      Icon: TbShieldCheck,
    };
  }

  return {
    type: "icon",
    Icon: TbCertificate,
  };
}

function StandardMark({ code }) {
  const visual = getStandardVisual(code);

  if (visual.type === "ce") {
    return (
      <span
        aria-hidden="true"
        className="text-[42px] font-semibold leading-none tracking-[-0.13em] text-white"
      >
        CE
      </span>
    );
  }

  if (visual.type === "bs") {
    return (
      <span
        aria-hidden="true"
        className="font-serif text-[42px] leading-none text-white"
      >
        BS
      </span>
    );
  }

  if (visual.type === "en") {
    return (
      <span
        aria-hidden="true"
        className="flex size-[46px] items-center justify-center rounded-full border-[3px] border-white text-lg font-extrabold italic leading-none text-white"
      >
        EN
      </span>
    );
  }

  if (visual.type === "certified") {
    return (
      <span
        aria-hidden="true"
        className="relative inline-flex h-9 min-w-[92px] items-center justify-center rounded-sm border-2 border-white px-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white"
      >
        <span className="absolute -left-2 top-1/2 h-4 w-2 -translate-y-1/2 border-y-2 border-l-2 border-white" />
        Certified
        <span className="absolute -right-2 top-1/2 h-4 w-2 -translate-y-1/2 border-y-2 border-r-2 border-white" />
      </span>
    );
  }

  const Icon = visual.Icon;

  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.55}
      className="size-[44px] text-white"
    />
  );
}

function StandardItem({ standard, locale, showDivider }) {
  const standardName = getLocalizedValue(standard.name, locale, standard.code);

  return (
    <article
      className={[
        "relative flex min-h-[88px] min-w-[112px] flex-col items-center justify-start px-4 text-center sm:min-w-[126px] sm:px-5",
        showDivider
          ? "after:absolute after:-right-px after:top-1/2 after:h-16 after:w-px after:-translate-y-1/2 after:bg-white/35"
          : "",
      ].join(" ")}
    >
      <div className="flex h-[48px] w-full items-center justify-center">
        <StandardMark code={standard.code} />
      </div>

      <p className="mt-2 text-[11px] font-extrabold uppercase leading-[14px] text-white">
        {standard.code}
      </p>

      <p className="mt-0.5 line-clamp-1 max-w-[125px] text-[8px] font-medium uppercase leading-3 text-white/70">
        {standardName}
      </p>
    </article>
  );
}

export function StandardsSection({ locale = "en", standards = [] }) {
  const currentLocale = locale === "th" ? "th" : "en";

  const content = contentByLocale[currentLocale];

  const visibleStandards = (Array.isArray(standards) ? standards : [])
    .filter(
      (standard) =>
        standard && standard.status === "published" && standard.showOnHome,
    )
    .sort(
      (firstStandard, secondStandard) =>
        Number(firstStandard.sortOrder || 0) -
        Number(secondStandard.sortOrder || 0),
    )
    .slice(0, 5);

  if (!visibleStandards.length) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#064f88] text-white">
      <Image
        src="/images/home/standards/door-closer-blueprint.jpg"
        alt={content.backgroundAlt}
        fill
        quality={88}
        sizes="100vw"
        className="absolute inset-0 -z-30 object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-r from-[#054976]/[0.99] via-[#075f9d]/95 via-[58%] to-[#087bc1]/55"
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -z-10 w-[68%] bg-gradient-to-r from-[#064d80]/50 to-transparent"
      />

      <div className="container-hcs py-7 sm:py-8 lg:py-9">
        <div className="max-w-[820px]">
          <header>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8ed3ff]">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold uppercase leading-none tracking-[-0.025em] text-white sm:text-[29px]">
              {content.title}
            </h2>
          </header>

          <div className="-mx-3 mt-5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
            <div className="flex w-max items-start">
              {visibleStandards.map((standard, index) => (
                <StandardItem
                  key={standard.id || standard.slug || standard.code}
                  standard={standard}
                  locale={currentLocale}
                  showDivider={index < visibleStandards.length - 1}
                />
              ))}
            </div>
          </div>

          <Link
            href={`/${currentLocale}/standards`}
            className="group mt-4 inline-flex min-h-11 items-center justify-center gap-3 rounded-sm border border-white/85 px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:!text-[#07528d]"
          >
            <span>{content.download}</span>

            <TbDownload
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[17px] transition-transform group-hover:translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
