import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { TbArrowRight, TbArrowUpRight } from "react-icons/tb";

const contentByLocale = {
  en: {
    titleLineOne: "Let’s Build",

    titleLineTwo: "a Safer Opening",

    description:
      "Talk to our specialists for product advice, specifications and project support.",

    action: "Talk to Our Specialist",

    brandDescription:
      "Total opening solutions for architecture and security. Quality products. Expert support. Trusted worldwide.",

    company: "Company",

    products: "Products",

    solutions: "Solutions",

    support: "Support",

    copyright: "All rights reserved.",

    privacy: "Privacy Policy",

    terms: "Terms of Use",

    companyLinks: [
      {
        id: "about",

        label: "About HCS",

        href: "/about",
      },
      {
        id: "history",

        label: "Our History",

        href: "/about",
      },
      {
        id: "quality",

        label: "Quality Policy",

        href: "/standards",
      },
      {
        id: "partners",

        label: "Partners & Projects",

        href: "/projects",
      },
      {
        id: "contact",

        label: "Contact",

        href: "/contact",
      },
    ],

    productLinks: [
      {
        id: "door-closers",

        label: "Door Closers",

        href: "/products/category/door-closers",
      },
      {
        id: "lever-handles",

        label: "Lever Handles",

        href: "/products/category/lever-handles",
      },
      {
        id: "locks-cylinders",

        label: "Locks & Cylinders",

        href: "/products/category/locks-cylinders",
      },
      {
        id: "hinges",

        label: "Hinges",

        href: "/products/category/hinges",
      },
      {
        id: "all-products",

        label: "All Products",

        href: "/products",
      },
    ],

    solutionLinks: [
      {
        id: "building-type",

        label: "By Building Type",

        href: "/solutions",
      },
      {
        id: "door-design",

        label: "By Door Design",

        href: "/solutions",
      },
      {
        id: "fire-rated",

        label: "Fire-Rated Doors",

        href: "/solutions",
      },
      {
        id: "security",

        label: "Security Systems",

        href: "/solutions",
      },
    ],

    supportLinks: [
      {
        id: "standards",

        label: "Standards & Compliance",

        href: "/standards",
      },
      {
        id: "projects",

        label: "Project References",

        href: "/projects",
      },
      {
        id: "product-support",

        label: "Product Support",

        href: "/contact",
      },
      {
        id: "contact-support",

        label: "Contact Support",

        href: "/contact",
      },
    ],
  },

  th: {
    titleLineOne: "ร่วมสร้างระบบประตู",

    titleLineTwo: "ที่ปลอดภัยยิ่งขึ้น",

    description:
      "พูดคุยกับผู้เชี่ยวชาญของเราเพื่อรับคำแนะนำด้านผลิตภัณฑ์ ข้อกำหนด และการสนับสนุนโครงการ",

    action: "ปรึกษาผู้เชี่ยวชาญ",

    brandDescription:
      "โซลูชันระบบเปิดประตูสำหรับงานสถาปัตยกรรมและระบบรักษาความปลอดภัย พร้อมผลิตภัณฑ์คุณภาพและบริการจากผู้เชี่ยวชาญ",

    company: "บริษัท",

    products: "ผลิตภัณฑ์",

    solutions: "โซลูชัน",

    support: "บริการสนับสนุน",

    copyright: "สงวนลิขสิทธิ์",

    privacy: "นโยบายความเป็นส่วนตัว",

    terms: "ข้อกำหนดการใช้งาน",

    companyLinks: [
      {
        id: "about",

        label: "เกี่ยวกับ HCS",

        href: "/about",
      },
      {
        id: "history",

        label: "ประวัติของเรา",

        href: "/about",
      },
      {
        id: "quality",

        label: "นโยบายคุณภาพ",

        href: "/standards",
      },
      {
        id: "partners",

        label: "พันธมิตรและโครงการ",

        href: "/projects",
      },
      {
        id: "contact",

        label: "ติดต่อเรา",

        href: "/contact",
      },
    ],

    productLinks: [
      {
        id: "door-closers",

        label: "โช้คอัพประตู",

        href: "/products/category/door-closers",
      },
      {
        id: "lever-handles",

        label: "มือจับก้านโยก",

        href: "/products/category/lever-handles",
      },
      {
        id: "locks-cylinders",

        label: "ล็อกและไส้กุญแจ",

        href: "/products/category/locks-cylinders",
      },
      {
        id: "hinges",

        label: "บานพับ",

        href: "/products/category/hinges",
      },
      {
        id: "all-products",

        label: "ผลิตภัณฑ์ทั้งหมด",

        href: "/products",
      },
    ],

    solutionLinks: [
      {
        id: "building-type",

        label: "ตามประเภทอาคาร",

        href: "/solutions",
      },
      {
        id: "door-design",

        label: "ตามรูปแบบประตู",

        href: "/solutions",
      },
      {
        id: "fire-rated",

        label: "ระบบประตูกันไฟ",

        href: "/solutions",
      },
      {
        id: "security",

        label: "ระบบรักษาความปลอดภัย",

        href: "/solutions",
      },
    ],

    supportLinks: [
      {
        id: "standards",

        label: "มาตรฐานและการรับรอง",

        href: "/standards",
      },
      {
        id: "projects",

        label: "ผลงานโครงการ",

        href: "/projects",
      },
      {
        id: "product-support",

        label: "สอบถามข้อมูลผลิตภัณฑ์",

        href: "/contact",
      },
      {
        id: "contact-support",

        label: "ติดต่อฝ่ายสนับสนุน",

        href: "/contact",
      },
    ],
  },
};

const socialItems = [
  {
    id: "linkedin",

    label: "LinkedIn",

    icon: FaLinkedinIn,

    hoverClass: "hover:border-[#0A66C2] hover:bg-[#0A66C2]",
  },
  {
    id: "facebook",

    label: "Facebook",

    icon: FaFacebookF,

    hoverClass: "hover:border-[#1877F2] hover:bg-[#1877F2]",
  },
  {
    id: "youtube",

    label: "YouTube",

    icon: FaYoutube,

    hoverClass: "hover:border-[#FF0000] hover:bg-[#FF0000]",
  },
  {
    id: "instagram",

    label: "Instagram",

    icon: FaInstagram,

    hoverClass: "hover:border-[#E1306C] hover:bg-[#E1306C]",
  },
];

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

function FooterLinkGroup({ title, links, locale, withBorder = false }) {
  return (
    <div className={withBorder ? "sm:border-l sm:border-white/25 sm:pl-6" : ""}>
      <h2 className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
        {title}
      </h2>

      <ul className="mt-2.5 space-y-1">
        {links.map((item) => (
          <li key={item.id}>
            <Link
              href={`/${locale}${item.href}`}
              className="group inline-flex items-center gap-1 text-[10px] leading-[15px] text-white/70 transition hover:text-white"
            >
              <span>{item.label}</span>

              <TbArrowUpRight
                aria-hidden="true"
                className="size-3 opacity-0 transition group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialItem({ item, href }) {
  const Icon = item.icon;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={item.label}
      title={item.label}
      className={[
        "inline-flex size-9 items-center justify-center rounded-full",
        "border border-white/50 bg-white/5 text-white",
        "transition duration-200 hover:text-white",
        item.hoverClass,
      ].join(" ")}
    >
      <Icon aria-hidden="true" className="size-3.5" />
    </a>
  );
}

function FooterContactItem({ icon: Icon, href, children }) {
  const content = (
    <>
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-3.5 shrink-0 text-[#36a9eb]"
      />

      <span>{children}</span>
    </>
  );

  if (!href) {
    return (
      <div className="flex items-start justify-center gap-2 text-[10px] leading-[15px] text-white/65">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className="flex items-start justify-center gap-2 text-[10px] leading-[15px] text-white/65 transition hover:text-white"
    >
      {content}
    </a>
  );
}

export function PublicFooter({ locale = "en", settings }) {
  const currentLocale = locale === "th" ? "th" : "en";

  const content = contentByLocale[currentLocale];

  const companyName = getLocalizedValue(
    settings?.company?.displayName,
    currentLocale,
    "HCS (Thailand) Co., Ltd.",
  );

  const phone = settings?.contact?.phone || "";

  const email = settings?.contact?.email || "";

  const address = getLocalizedValue(
    settings?.contact?.address,
    currentLocale,
    "",
  );

  const phoneHref = createPhoneHref(phone);

  const emailHref = createEmailHref(email);

  const availableSocialItems = socialItems
    .map((item) => ({
      ...item,

      href: String(settings?.social?.[item.id] || "").trim(),
    }))
    .filter((item) => Boolean(item.href));

  return (
    <footer className="w-full overflow-hidden bg-[#041322] text-white">
      <div className="grid w-full lg:grid-cols-[minmax(280px,23%)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center bg-[#041322] px-6 py-8 text-center lg:min-h-[270px] lg:px-8">
          <div className="flex w-full max-w-[260px] flex-col items-center">
            <Link
              href={`/${currentLocale}`}
              aria-label={companyName}
              className="inline-flex w-fit justify-center"
            >
              <Image
                src="/images/brand/hcs-logo-primary.png"
                alt={companyName}
                width={154}
                height={58}
                className="h-auto w-[128px] object-contain"
              />
            </Link>

            <p className="mt-4 text-center text-[10px] leading-[15px] text-white/70">
              {content.brandDescription}
            </p>

            <div className="mt-4 w-full space-y-1.5">
              {phone ? (
                <FooterContactItem icon={FiPhone} href={phoneHref}>
                  {phone}
                </FooterContactItem>
              ) : null}

              {email ? (
                <FooterContactItem icon={FiMail} href={emailHref}>
                  {email}
                </FooterContactItem>
              ) : null}

              {address ? (
                <FooterContactItem icon={FiMapPin}>{address}</FooterContactItem>
              ) : null}
            </div>

            {availableSocialItems.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {availableSocialItems.map((item) => (
                  <SocialItem key={item.id} item={item} href={item.href} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative isolate overflow-hidden bg-[#0879c6]">
          <Image
            src="/images/home/standards/door-closer-blueprint.jpg"
            alt=""
            fill
            aria-hidden="true"
            quality={82}
            sizes="(max-width: 1023px) 100vw, 77vw"
            className="absolute inset-0 z-0 object-cover object-center opacity-65"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0768aa]/90 via-[#0878c2]/75 to-[#0988d8]/45"
          />

          <div className="relative z-10 px-5 py-5 sm:px-8 lg:min-h-[270px] lg:pl-10 lg:pr-[max(2rem,calc((100vw-90rem)/2))]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[480px]">
                <h2 className="text-[26px] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-white">
                  <span className="block">{content.titleLineOne}</span>

                  <span className="block">{content.titleLineTwo}</span>
                </h2>

                <p className="mt-2.5 max-w-[450px] text-[10px] leading-[15px] text-white/85">
                  {content.description}
                </p>
              </div>

              <Link
                href={`/${currentLocale}/contact`}
                aria-label={content.action}
                className="relative inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-3 rounded-sm border border-white bg-white px-6 py-3 shadow-sm transition hover:bg-[#edf8ff]"
              >
                <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wide !text-[#0768a8]">
                  {content.action}
                </span>

                <TbArrowRight
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-[18px] shrink-0 !text-[#0768a8]"
                />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/35 pt-4 sm:grid-cols-4">
              <FooterLinkGroup
                title={content.company}
                links={content.companyLinks}
                locale={currentLocale}
              />

              <FooterLinkGroup
                title={content.products}
                links={content.productLinks}
                locale={currentLocale}
                withBorder
              />

              <FooterLinkGroup
                title={content.solutions}
                links={content.solutionLinks}
                locale={currentLocale}
                withBorder
              />

              <FooterLinkGroup
                title={content.support}
                links={content.supportLinks}
                locale={currentLocale}
                withBorder
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#020b13]">
        <div className="container-hcs flex min-h-8 flex-col justify-center gap-2 py-2 text-[9px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {companyName}. {content.copyright}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href={`/${currentLocale}/privacy`}
              className="transition hover:text-white"
            >
              {content.privacy}
            </Link>

            <span aria-hidden="true" className="text-white/30">
              |
            </span>

            <Link
              href={`/${currentLocale}/terms`}
              className="transition hover:text-white"
            >
              {content.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
