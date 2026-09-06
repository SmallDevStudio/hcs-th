import Image from "next/image";
import Link from "next/link";
import { TbDownload, TbFlame, TbRosetteDiscountCheck } from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "Standards & Certifications",
    title: "Compliance You Can Trust",
    download: "Download Certificates",
    backgroundAlt: "Technical blueprint of an architectural door closer",
    standards: {
      ce: "European Conformity",
      fire: "Fire Resistance",
      bs: "British Standard",
      en: "European Norm",
      iso: "Quality Management",
    },
  },
  th: {
    eyebrow: "มาตรฐานและการรับรอง",
    title: "มาตรฐานที่คุณไว้วางใจ",
    download: "ดาวน์โหลดใบรับรอง",
    backgroundAlt: "แบบทางเทคนิคของโช้คอัพประตูสถาปัตยกรรม",
    standards: {
      ce: "มาตรฐานความสอดคล้องยุโรป",
      fire: "มาตรฐานการทนไฟ",
      bs: "มาตรฐานอังกฤษ",
      en: "มาตรฐานยุโรป",
      iso: "ระบบบริหารคุณภาพ",
    },
  },
};

function CertificationItem({ children, code, label }) {
  return (
    <div className="flex min-w-[108px] items-center gap-3 border-white/20 pr-5 sm:border-r">
      <div className="flex h-12 min-w-12 items-center justify-center text-white">
        {children}
      </div>

      <div>
        <p className="text-xs font-bold uppercase leading-4 text-white">
          {code}
        </p>
        <p className="mt-0.5 max-w-[112px] text-[10px] leading-3.5 text-white/65">
          {label}
        </p>
      </div>
    </div>
  );
}

export function StandardsSection({ locale = "en" }) {
  const currentLocale = locale === "th" ? "th" : "en";
  const content = contentByLocale[currentLocale];

  return (
    <section className="relative isolate overflow-hidden bg-[#07528d] text-white">
      <Image
        src="/images/home/standards/door-closer-blueprint.jpg"
        alt={content.backgroundAlt}
        fill
        quality={86}
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07528d]/98 via-[#0766aa]/90 to-[#0979c4]/45"
      />

      <div className="container-hcs py-10 sm:py-12 lg:py-14">
        <div className="max-w-[1080px]">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8ed3ff]">
            {content.eyebrow}
          </p>

          <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-white sm:text-[30px]">
            {content.title}
          </h2>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-6">
            <CertificationItem code="EN 1154" label={content.standards.ce}>
              <span className="text-[34px] font-semibold leading-none tracking-[-0.12em]">
                CE
              </span>
            </CertificationItem>

            <CertificationItem code="EN 1634" label={content.standards.fire}>
              <TbFlame
                aria-hidden="true"
                strokeWidth={1.6}
                className="size-10"
              />
            </CertificationItem>

            <CertificationItem code="BS" label={content.standards.bs}>
              <span className="font-serif text-[36px] leading-none">BS</span>
            </CertificationItem>

            <CertificationItem code="EN" label={content.standards.en}>
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-white text-base font-extrabold italic">
                EN
              </span>
            </CertificationItem>

            <div className="flex items-center gap-3">
              <TbRosetteDiscountCheck
                aria-hidden="true"
                strokeWidth={1.45}
                className="size-12 text-white"
              />

              <div>
                <p className="text-xs font-extrabold uppercase leading-4 text-white">
                  Certified
                </p>
                <p className="text-[10px] leading-3.5 text-white/65">
                  ISO 9001
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/${currentLocale}/downloads`}
            className="mt-7 inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-white/80 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#07528d]"
          >
            <span>{content.download}</span>
            <TbDownload
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[18px]"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
