import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "Let’s Build",
    titleLineOne: "Let’s Build a",
    titleLineTwo: "Safer Opening",
    description:
      "Talk to our specialists for product advice, specifications and project support.",
    action: "Talk to Our Specialist",
    backgroundAlt: "Technical blueprint of an architectural door closer",
  },

  th: {
    eyebrow: "เริ่มต้นโครงการกับเรา",
    titleLineOne: "ร่วมสร้างระบบประตู",
    titleLineTwo: "ที่ปลอดภัยยิ่งขึ้น",
    description:
      "พูดคุยกับผู้เชี่ยวชาญของเราเพื่อรับคำแนะนำด้านผลิตภัณฑ์ ข้อกำหนด และการสนับสนุนโครงการ",
    action: "ปรึกษาผู้เชี่ยวชาญ",
    backgroundAlt: "แบบทางเทคนิคของโช้คอัพประตูสถาปัตยกรรม",
  },
};

export function HomeCtaSection({ locale = "en" }) {
  const currentLocale = locale === "th" ? "th" : "en";
  const content = contentByLocale[currentLocale];

  return (
    <section className="relative isolate overflow-hidden bg-[#0876bd] text-white">
      <Image
        src="/images/home/standards/door-closer-blueprint.jpg"
        alt={content.backgroundAlt}
        fill
        quality={82}
        sizes="100vw"
        className="-z-20 object-cover object-center opacity-30"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07558f]/98 via-[#0877be]/92 to-[#0985d3]/80"
      />

      <div className="container-hcs flex flex-col gap-7 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-[680px]">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#a7ddff]">
            {content.eyebrow}
          </p>

          <h2 className="text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.035em] text-white sm:text-4xl">
            <span className="block">{content.titleLineOne}</span>

            <span className="block">{content.titleLineTwo}</span>
          </h2>

          <p className="mt-4 max-w-[560px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            {content.description}
          </p>
        </div>

        <Link
          href={`/${currentLocale}/contact`}
          className="group inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-3 rounded-sm bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-[#0871b5] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaf7ff]"
        >
          <span>{content.action}</span>

          <TbArrowRight
            aria-hidden="true"
            strokeWidth={1.8}
            className="size-[18px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
