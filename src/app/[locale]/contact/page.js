import { ContactPage } from "@/components/public/contact/ContactPage";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getPublicSiteSettings } from "@/services/site-settings/public-site-settings.service";

const metadataByLocale = {
  en: {
    title: "Contact HCS",

    description:
      "Contact HCS Thailand for architectural hardware, product selection, specifications, technical support and project enquiries.",

    imageAlt:
      "Modern commercial entrance representing HCS Thailand opening solutions",
  },

  th: {
    title: "ติดต่อ HCS",

    description:
      "ติดต่อ HCS Thailand เพื่อรับคำแนะนำด้านอุปกรณ์ประตู การเลือกผลิตภัณฑ์ ข้อกำหนดทางเทคนิค และการสนับสนุนโครงการ",

    imageAlt:
      "ทางเข้าอาคารพาณิชย์สมัยใหม่ที่สะท้อนโซลูชันระบบประตูจาก HCS Thailand",
  },
};

function createPublicContactSettings(settings = {}) {
  return {
    company: {
      displayName: {
        en: settings.company?.displayName?.en || "",

        th: settings.company?.displayName?.th || "",
      },
    },

    contact: {
      phone: settings.contact?.phone || "",

      secondaryPhone: settings.contact?.secondaryPhone || "",

      email: settings.contact?.email || "",

      salesEmail: settings.contact?.salesEmail || "",

      address: {
        en: settings.contact?.address?.en || "",

        th: settings.contact?.address?.th || "",
      },

      googleMapsUrl: settings.contact?.googleMapsUrl || "",

      googleMapsEmbedUrl: settings.contact?.googleMapsEmbedUrl || "",

      lineId: settings.contact?.lineId || "",

      businessHours: {
        en: settings.contact?.businessHours?.en || "",

        th: settings.contact?.businessHours?.th || "",
      },
    },

    social: {
      facebook: settings.social?.facebook || "",

      instagram: settings.social?.instagram || "",

      youtube: settings.social?.youtube || "",

      linkedin: settings.social?.linkedin || "",

      line: settings.social?.line || "",
    },
  };
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const metadata = metadataByLocale[locale] || metadataByLocale[DEFAULT_LOCALE];

  return {
    title: metadata.title,

    description: metadata.description,

    alternates: {
      canonical: `/${locale}/contact`,

      languages: {
        en: "/en/contact",
        th: "/th/contact",
        "x-default": "/en/contact",
      },
    },

    openGraph: {
      type: "website",

      title: metadata.title,

      description: metadata.description,

      url: `/${locale}/contact`,

      locale: locale === "th" ? "th_TH" : "en_US",

      alternateLocale: locale === "th" ? "en_US" : "th_TH",

      images: [
        {
          url: "/images/contact/contact-hero.jpg",
          alt: metadata.imageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: metadata.title,

      description: metadata.description,

      images: ["/images/contact/contact-hero.jpg"],
    },
  };
}

export default async function PublicContactPage({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const settings = await getPublicSiteSettings();

  const publicSettings = createPublicContactSettings(settings);

  return <ContactPage locale={locale} settings={publicSettings} />;
}
