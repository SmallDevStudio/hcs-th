import { z } from "zod";

const optionalUrlSchema = z.union([
  z.literal(""),
  z.string().trim().url("Invalid URL"),
]);

const optionalEmailSchema = z.union([
  z.literal(""),
  z.string().trim().email("Invalid email address"),
]);

const localizedShortTextSchema = z.object({
  en: z.string().trim().max(200),
  th: z.string().trim().max(200),
});

const localizedLongTextSchema = z.object({
  en: z.string().trim().max(2000),
  th: z.string().trim().max(2000),
});

const localizedAddressSchema = z.object({
  en: z.string().trim().max(500),
  th: z.string().trim().max(500),
});

const keywordSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    }

    return [];
  },
  z.array(z.string().trim().min(1).max(80)).max(30),
);

const localizedSeoSchema = z.object({
  title: z.string().trim().max(70),
  description: z.string().trim().max(180),
  keywords: keywordSchema,
});

export const siteSettingsSchema = z.object({
  company: z.object({
    displayName: localizedShortTextSchema,
    legalName: localizedShortTextSchema,
    tagline: localizedShortTextSchema,
    description: localizedLongTextSchema,

    registrationNumber: z.string().trim().max(100),
    foundedYear: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d{4}$/.test(value),
        "Year must contain 4 digits",
      ),
  }),

  contact: z.object({
    phone: z.string().trim().max(50),
    secondaryPhone: z.string().trim().max(50),
    email: optionalEmailSchema,
    salesEmail: optionalEmailSchema,

    address: localizedAddressSchema,

    googleMapsUrl: optionalUrlSchema,
    googleMapsEmbedUrl: optionalUrlSchema,
    lineId: z.string().trim().max(100),

    businessHours: localizedShortTextSchema,
  }),

  social: z.object({
    facebook: optionalUrlSchema,
    instagram: optionalUrlSchema,
    youtube: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    line: optionalUrlSchema,
  }),

  branding: z.object({
    primaryColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hexadecimal color"),

    secondaryColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hexadecimal color"),

    logoPrimary: z.string().trim().min(1).max(500),
    logoWhite: z.string().trim().min(1).max(500),
    defaultOgImage: z.string().trim().max(500),
  }),

  seo: z.object({
    indexable: z.boolean(),
    en: localizedSeoSchema,
    th: localizedSeoSchema,
  }),

  integrations: z.object({
    googleSiteVerification: z.string().trim().max(300),
    bingSiteVerification: z.string().trim().max(300),
    googleAnalyticsMeasurementId: z.string().trim().max(100),
  }),
});

export const updateSiteSettingsSchema = siteSettingsSchema;
