import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbBuildingSkyscraper,
  TbCertificate,
  TbUsersGroup,
} from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "About HCS",
    titleLineOne: "Engineered for",
    titleLineTwo: "Every Opening",
    description:
      "HCS (Thailand) is a leading provider of architectural hardware, security and door solutions for commercial, institutional and industrial projects.",
    secondaryDescription:
      "We partner with architects, consultants and contractors to deliver performance, safety and design excellence.",
    imageAlt: "Modern commercial building designed with architectural openings",
    action: "Discover HCS",
    statistics: [
      {
        id: "experience",
        value: "25+",
        label: "Years of Experience",
        icon: "building",
      },
      {
        id: "projects",
        value: "1,000+",
        label: "Projects Completed",
        icon: "certificate",
      },
      {
        id: "partners",
        value: "100+",
        label: "Partners Worldwide",
        icon: "partners",
      },
    ],
  },
  th: {
    eyebrow: "เกี่ยวกับ HCS",
    titleLineOne: "ออกแบบเพื่อ",
    titleLineTwo: "ทุกการเปิดประตู",
    description:
      "HCS (Thailand) เป็นผู้ให้บริการชั้นนำด้านอุปกรณ์ประตูสถาปัตยกรรม ระบบรักษาความปลอดภัย และโซลูชันประตูสำหรับโครงการเชิงพาณิชย์ สถาบัน และอุตสาหกรรม",
    secondaryDescription:
      "เราร่วมงานกับสถาปนิก ที่ปรึกษา และผู้รับเหมา เพื่อส่งมอบประสิทธิภาพ ความปลอดภัย และความเป็นเลิศด้านการออกแบบ",
    imageAlt: "อาคารพาณิชย์สมัยใหม่ที่ออกแบบระบบประตูสถาปัตยกรรม",
    action: "รู้จัก HCS",
    statistics: [
      {
        id: "experience",
        value: "25+",
        label: "ปีแห่งประสบการณ์",
        icon: "building",
      },
      {
        id: "projects",
        value: "1,000+",
        label: "โครงการที่แล้วเสร็จ",
        icon: "certificate",
      },
      {
        id: "partners",
        value: "100+",
        label: "พันธมิตรทั่วโลก",
        icon: "partners",
      },
    ],
  },
};

const statisticIcons = {
  building: TbBuildingSkyscraper,
  certificate: TbCertificate,
  partners: TbUsersGroup,
};

export function AboutHcsSection({ locale }) {
  const content = contentByLocale[locale] || contentByLocale.en;

  return (
    <section className="grid overflow-hidden bg-surface-secondary lg:grid-cols-2">
      <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[440px]">
        <Image
          src="/images/home/about-hcs-building.jpg"
          alt={content.imageAlt}
          fill
          quality={90}
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>

      <div className="flex items-center px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-12 lg:py-10 xl:pl-16 xl:pr-[max(2rem,calc((100vw-90rem)/2))]">
        <div className="w-full max-w-[680px]">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="text-balance text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.035em] text-foreground sm:text-4xl">
            <span className="block">{content.titleLineOne}</span>
            <span className="block">{content.titleLineTwo}</span>
          </h2>

          <p className="mt-5 max-w-[610px] text-sm leading-6 text-foreground/85 sm:text-base sm:leading-7">
            {content.description}
          </p>

          <p className="mt-3 max-w-[610px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {content.secondaryDescription}
          </p>

          <Link
            href={`/${locale}/about`}
            className="group mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"
          >
            <span>{content.action}</span>
            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>

          <div className="mt-7 grid grid-cols-1 border-t border-border pt-6 sm:grid-cols-3">
            {content.statistics.map((item, index) => {
              const Icon = statisticIcons[item.icon] || TbCertificate;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 py-3 sm:px-4 sm:py-0 ${
                    index === 0 ? "sm:pl-0" : "sm:border-l sm:border-border"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.6}
                    className="mt-0.5 size-7 shrink-0 text-foreground"
                  />

                  <div>
                    <p className="text-xl font-extrabold leading-none text-primary">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-4 text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
