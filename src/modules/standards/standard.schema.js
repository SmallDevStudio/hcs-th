import { z } from "zod";

import {
  STANDARD_DEFAULTS,
  STANDARD_DOCUMENT_TYPE_VALUES,
  STANDARD_LANGUAGE_VALUES,
  STANDARD_LIMITS,
  STANDARD_STATUS_VALUES,
  isValidStandardSlug,
  normalizeStandardCode,
  normalizeStandardSlug,
} from "@/constants/standards";

const requiredLocalizedValueSchema = z
  .object({
    en: z.string().trim().min(1).max(STANDARD_LIMITS.NAME_MAX_LENGTH),

    th: z.string().trim().min(1).max(STANDARD_LIMITS.NAME_MAX_LENGTH),
  })
  .strict();

function createOptionalLocalizedValueSchema(maxLength) {
  return z
    .object({
      en: z.string().trim().max(maxLength).optional().default(""),

      th: z.string().trim().max(maxLength).optional().default(""),
    })
    .strict();
}

const localizedShortDescriptionSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH,
);

const localizedDescriptionSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.DESCRIPTION_MAX_LENGTH,
);

const localizedClassificationSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.CLASSIFICATION_MAX_LENGTH,
);

const localizedIssuerSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.ISSUER_MAX_LENGTH,
);

const localizedSeoTitleSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.SEO_TITLE_MAX_LENGTH,
);

const localizedSeoDescriptionSchema = createOptionalLocalizedValueSchema(
  STANDARD_LIMITS.SEO_DESCRIPTION_MAX_LENGTH,
);

const localizedKeywordsSchema = z
  .object({
    en: z
      .array(z.string().trim().min(1).max(STANDARD_LIMITS.KEYWORD_MAX_LENGTH))
      .max(STANDARD_LIMITS.KEYWORDS_MAX_ITEMS)
      .optional()
      .default([]),

    th: z
      .array(z.string().trim().min(1).max(STANDARD_LIMITS.KEYWORD_MAX_LENGTH))
      .max(STANDARD_LIMITS.KEYWORDS_MAX_ITEMS)
      .optional()
      .default([]),
  })
  .strict();

const seoSchema = z
  .object({
    title: localizedSeoTitleSchema
      .optional()
      .default(STANDARD_DEFAULTS.seo.title),

    description: localizedSeoDescriptionSchema
      .optional()
      .default(STANDARD_DEFAULTS.seo.description),

    keywords: localizedKeywordsSchema
      .optional()
      .default(STANDARD_DEFAULTS.seo.keywords),
  })
  .strict();

const optionalDateSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    return value;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
    .nullable(),
);

const identifierSchema = z.string().trim().min(1).max(128);

const uniqueIdentifierArraySchema = (maximumItems) =>
  z
    .array(identifierSchema)
    .max(maximumItems)
    .transform((items) => [...new Set(items)]);

const standardFieldsSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1)
      .max(STANDARD_LIMITS.CODE_MAX_LENGTH)
      .transform(normalizeStandardCode),

    slug: z
      .string()
      .trim()
      .min(1)
      .max(STANDARD_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeStandardSlug)
      .refine(isValidStandardSlug, {
        message: "Invalid standard slug",
      }),

    name: requiredLocalizedValueSchema,

    shortDescription: localizedShortDescriptionSchema
      .optional()
      .default(STANDARD_DEFAULTS.shortDescription),

    description: localizedDescriptionSchema
      .optional()
      .default(STANDARD_DEFAULTS.description),

    classification: localizedClassificationSchema
      .optional()
      .default(STANDARD_DEFAULTS.classification),

    conformityReference: z
      .string()
      .trim()
      .max(STANDARD_LIMITS.CONFORMITY_REFERENCE_MAX_LENGTH)
      .optional()
      .default(STANDARD_DEFAULTS.conformityReference),

    issuer: localizedIssuerSchema.optional().default(STANDARD_DEFAULTS.issuer),

    documentType: z
      .enum(STANDARD_DOCUMENT_TYPE_VALUES)
      .default(STANDARD_DEFAULTS.documentType),

    documentLanguage: z
      .enum(STANDARD_LANGUAGE_VALUES)
      .default(STANDARD_DEFAULTS.documentLanguage),

    documentMediaId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .nullable()
      .optional()
      .default(STANDARD_DEFAULTS.documentMediaId),

    relatedCategoryIds: uniqueIdentifierArraySchema(
      STANDARD_LIMITS.CATEGORY_IDS_MAX_ITEMS,
    )
      .optional()
      .default(STANDARD_DEFAULTS.relatedCategoryIds),

    relatedProductIds: uniqueIdentifierArraySchema(
      STANDARD_LIMITS.PRODUCT_IDS_MAX_ITEMS,
    )
      .optional()
      .default(STANDARD_DEFAULTS.relatedProductIds),

    issueDate: optionalDateSchema
      .optional()
      .default(STANDARD_DEFAULTS.issueDate),

    expiryDate: optionalDateSchema
      .optional()
      .default(STANDARD_DEFAULTS.expiryDate),

    status: z.enum(STANDARD_STATUS_VALUES).default(STANDARD_DEFAULTS.status),

    featured: z.boolean().default(STANDARD_DEFAULTS.featured),

    showOnHome: z.boolean().default(STANDARD_DEFAULTS.showOnHome),

    sortOrder: z.coerce
      .number()
      .int()
      .min(STANDARD_LIMITS.SORT_ORDER_MIN)
      .max(STANDARD_LIMITS.SORT_ORDER_MAX)
      .default(STANDARD_DEFAULTS.sortOrder),

    seo: seoSchema.optional().default(STANDARD_DEFAULTS.seo),
  })
  .strict();

function validateStandardDates(standard, context) {
  if (!standard.issueDate || !standard.expiryDate) {
    return;
  }

  if (standard.expiryDate < standard.issueDate) {
    context.addIssue({
      code: "custom",

      path: ["expiryDate"],

      message: "Expiry date must be later than or equal to issue date",
    });
  }
}

function validatePublishedStandard(standard, context) {
  if (standard.status !== "published") {
    return;
  }

  if (!standard.name?.en) {
    context.addIssue({
      code: "custom",
      path: ["name", "en"],
      message: "English name is required before publishing",
    });
  }

  if (!standard.name?.th) {
    context.addIssue({
      code: "custom",
      path: ["name", "th"],
      message: "Thai name is required before publishing",
    });
  }

  if (!standard.shortDescription?.en) {
    context.addIssue({
      code: "custom",
      path: ["shortDescription", "en"],
      message: "English short description is required before publishing",
    });
  }

  if (!standard.shortDescription?.th) {
    context.addIssue({
      code: "custom",
      path: ["shortDescription", "th"],
      message: "Thai short description is required before publishing",
    });
  }
}

function validateStandard(standard, context) {
  validateStandardDates(standard, context);

  validatePublishedStandard(standard, context);
}

export const createStandardSchema =
  standardFieldsSchema.superRefine(validateStandard);

export const updateStandardSchema = standardFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one standard field is required",
  });

export const standardIdSchema = z
  .object({
    standardId: identifierSchema,
  })
  .strict();

export const standardSlugSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(STANDARD_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeStandardSlug)
      .refine(isValidStandardSlug, {
        message: "Invalid standard slug",
      }),
  })
  .strict();

export const standardQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(STANDARD_LIMITS.QUERY_LIMIT_MAX)
      .default(STANDARD_LIMITS.QUERY_LIMIT_DEFAULT),

    cursor: z.string().trim().min(1).optional(),

    status: z.enum(STANDARD_STATUS_VALUES).optional(),

    documentType: z.enum(STANDARD_DOCUMENT_TYPE_VALUES).optional(),

    documentLanguage: z.enum(STANDARD_LANGUAGE_VALUES).optional(),

    categoryId: identifierSchema.optional(),

    productId: identifierSchema.optional(),

    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    showOnHome: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    search: z.string().trim().max(STANDARD_LIMITS.SEARCH_MAX_LENGTH).optional(),
  })
  .strict();

export const reorderStandardsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            standardId: identifierSchema,

            sortOrder: z.coerce
              .number()
              .int()
              .min(STANDARD_LIMITS.SORT_ORDER_MIN)
              .max(STANDARD_LIMITS.SORT_ORDER_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(STANDARD_LIMITS.QUERY_LIMIT_MAX),
  })
  .strict();
