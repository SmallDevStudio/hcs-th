import { z } from "zod";

import {
  PRODUCT_DEFAULTS,
  PRODUCT_LIMITS,
  PRODUCT_STATUS_VALUES,
  isValidProductSlug,
  isValidProductTypeSlug,
  normalizeProductSlug,
  normalizeProductTypeSlug,
} from "@/constants/products";

function localizedRequiredTextSchema({ maximumLength, fieldName }) {
  return z
    .object({
      en: z
        .string()
        .trim()
        .min(1, `${fieldName} in English is required`)
        .max(maximumLength),

      th: z
        .string()
        .trim()
        .min(1, `${fieldName} in Thai is required`)
        .max(maximumLength),
    })
    .strict();
}

function localizedOptionalTextSchema({ maximumLength }) {
  return z
    .object({
      en: z.string().trim().max(maximumLength).optional().default(""),

      th: z.string().trim().max(maximumLength).optional().default(""),
    })
    .strict();
}

function localizedStringArraySchema({ maximumItems, maximumLength }) {
  const valueSchema = z
    .array(z.string().trim().min(1).max(maximumLength))
    .max(maximumItems)
    .optional()
    .default([])
    .transform((values) => [...new Set(values)]);

  return z
    .object({
      en: valueSchema,
      th: valueSchema,
    })
    .strict();
}

const mediaIdSchema = z.string().trim().min(1).max(128);

const productSpecificationSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    label: localizedRequiredTextSchema({
      maximumLength: PRODUCT_LIMITS.SPECIFICATION_LABEL_MAX_LENGTH,

      fieldName: "Specification label",
    }),

    value: localizedRequiredTextSchema({
      maximumLength: PRODUCT_LIMITS.SPECIFICATION_VALUE_MAX_LENGTH,

      fieldName: "Specification value",
    }),

    sortOrder: z.coerce
      .number()
      .int()
      .min(PRODUCT_LIMITS.SORT_ORDER_MIN)
      .max(PRODUCT_LIMITS.SORT_ORDER_MAX)
      .default(0),
  })
  .strict();

const productFinishSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    code: z
      .string()
      .trim()
      .min(1)
      .max(PRODUCT_LIMITS.FINISH_CODE_MAX_LENGTH)
      .transform((value) => value.toLocaleUpperCase()),

    name: localizedRequiredTextSchema({
      maximumLength: PRODUCT_LIMITS.FINISH_NAME_MAX_LENGTH,

      fieldName: "Finish name",
    }),

    sortOrder: z.coerce
      .number()
      .int()
      .min(PRODUCT_LIMITS.SORT_ORDER_MIN)
      .max(PRODUCT_LIMITS.SORT_ORDER_MAX)
      .default(0),
  })
  .strict();

const productStandardSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    name: z.string().trim().min(1).max(PRODUCT_LIMITS.STANDARD_NAME_MAX_LENGTH),

    classification: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.STANDARD_CLASSIFICATION_MAX_LENGTH)
      .optional()
      .default(""),

    conformityReference: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.CONFORMITY_REFERENCE_MAX_LENGTH)
      .optional()
      .default(""),

    sortOrder: z.coerce
      .number()
      .int()
      .min(PRODUCT_LIMITS.SORT_ORDER_MIN)
      .max(PRODUCT_LIMITS.SORT_ORDER_MAX)
      .default(0),
  })
  .strict();

const productFieldsSchema = z
  .object({
    name: localizedRequiredTextSchema({
      maximumLength: PRODUCT_LIMITS.NAME_MAX_LENGTH,

      fieldName: "Product name",
    }),

    slug: z
      .string()
      .trim()
      .min(PRODUCT_LIMITS.SLUG_MIN_LENGTH)
      .max(PRODUCT_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeProductSlug)
      .refine(isValidProductSlug, {
        message: "Slug may contain lowercase letters, numbers and hyphens only",
      }),

    model: z
      .string()
      .trim()
      .min(1, "Product model or reference is required")
      .max(PRODUCT_LIMITS.MODEL_MAX_LENGTH),

    sku: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.SKU_MAX_LENGTH)
      .optional()
      .default(PRODUCT_DEFAULTS.sku),

    categoryId: z
      .string()
      .trim()
      .min(1, "Product category is required")
      .max(128),

    productType: localizedRequiredTextSchema({
      maximumLength: PRODUCT_LIMITS.PRODUCT_TYPE_MAX_LENGTH,

      fieldName: "Product type",
    }),

    productTypeSlug: z
      .string()
      .trim()
      .min(PRODUCT_LIMITS.PRODUCT_TYPE_SLUG_MIN_LENGTH)
      .max(PRODUCT_LIMITS.PRODUCT_TYPE_SLUG_MAX_LENGTH)
      .transform(normalizeProductTypeSlug)
      .refine(isValidProductTypeSlug, {
        message:
          "Product type slug may contain lowercase letters, numbers and hyphens only",
      }),

    series: localizedOptionalTextSchema({
      maximumLength: PRODUCT_LIMITS.SERIES_MAX_LENGTH,
    }),

    shortDescription: localizedOptionalTextSchema({
      maximumLength: PRODUCT_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH,
    }),

    description: localizedOptionalTextSchema({
      maximumLength: PRODUCT_LIMITS.DESCRIPTION_MAX_LENGTH,
    }),

    primaryImageMediaId: mediaIdSchema
      .nullable()
      .optional()
      .default(PRODUCT_DEFAULTS.primaryImageMediaId),

    galleryMediaIds: z
      .array(mediaIdSchema)
      .max(PRODUCT_LIMITS.GALLERY_MAX_ITEMS)
      .optional()
      .default(PRODUCT_DEFAULTS.galleryMediaIds)
      .transform((mediaIds) => [...new Set(mediaIds)]),

    documentMediaIds: z
      .array(mediaIdSchema)
      .max(PRODUCT_LIMITS.DOCUMENTS_MAX_ITEMS)
      .optional()
      .default(PRODUCT_DEFAULTS.documentMediaIds)
      .transform((mediaIds) => [...new Set(mediaIds)]),

    features: localizedStringArraySchema({
      maximumItems: PRODUCT_LIMITS.FEATURES_MAX_ITEMS,

      maximumLength: PRODUCT_LIMITS.FEATURE_MAX_LENGTH,
    }),

    variations: localizedStringArraySchema({
      maximumItems: PRODUCT_LIMITS.VARIATIONS_MAX_ITEMS,

      maximumLength: PRODUCT_LIMITS.VARIATION_MAX_LENGTH,
    }),

    specifications: z
      .array(productSpecificationSchema)
      .max(PRODUCT_LIMITS.SPECIFICATIONS_MAX_ITEMS)
      .optional()
      .default(PRODUCT_DEFAULTS.specifications)
      .transform((items) =>
        [...items].sort((first, second) => first.sortOrder - second.sortOrder),
      ),

    finishes: z
      .array(productFinishSchema)
      .max(PRODUCT_LIMITS.FINISHES_MAX_ITEMS)
      .optional()
      .default(PRODUCT_DEFAULTS.finishes)
      .transform((items) =>
        [...items].sort((first, second) => first.sortOrder - second.sortOrder),
      ),

    standards: z
      .array(productStandardSchema)
      .max(PRODUCT_LIMITS.STANDARDS_MAX_ITEMS)
      .optional()
      .default(PRODUCT_DEFAULTS.standards)
      .transform((items) =>
        [...items].sort((first, second) => first.sortOrder - second.sortOrder),
      ),

    fireRated: z.boolean().default(PRODUCT_DEFAULTS.fireRated),

    status: z.enum(PRODUCT_STATUS_VALUES).default(PRODUCT_DEFAULTS.status),

    featured: z.boolean().default(PRODUCT_DEFAULTS.featured),

    showOnHome: z.boolean().default(PRODUCT_DEFAULTS.showOnHome),

    sortOrder: z.coerce
      .number()
      .int()
      .min(PRODUCT_LIMITS.SORT_ORDER_MIN)
      .max(PRODUCT_LIMITS.SORT_ORDER_MAX)
      .default(PRODUCT_DEFAULTS.sortOrder),

    seo: z
      .object({
        title: localizedOptionalTextSchema({
          maximumLength: PRODUCT_LIMITS.SEO_TITLE_MAX_LENGTH,
        }),

        description: localizedOptionalTextSchema({
          maximumLength: PRODUCT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH,
        }),

        keywords: localizedStringArraySchema({
          maximumItems: PRODUCT_LIMITS.KEYWORDS_MAX_ITEMS,

          maximumLength: PRODUCT_LIMITS.KEYWORD_MAX_LENGTH,
        }),
      })
      .strict()
      .optional()
      .default({
        title: {
          en: "",
          th: "",
        },

        description: {
          en: "",
          th: "",
        },

        keywords: {
          en: [],
          th: [],
        },
      }),
  })
  .strict();

function validateProductCollections(product, context) {
  const galleryMediaIds = Array.isArray(product.galleryMediaIds)
    ? product.galleryMediaIds
    : [];

  if (
    product.primaryImageMediaId &&
    galleryMediaIds.includes(product.primaryImageMediaId)
  ) {
    context.addIssue({
      code: "custom",

      path: ["galleryMediaIds"],

      message: "Primary image must not be repeated in the product gallery",
    });
  }

  const finishes = Array.isArray(product.finishes) ? product.finishes : [];

  const finishCodes = finishes.map((finish) =>
    finish.code.trim().toLocaleUpperCase(),
  );

  if (new Set(finishCodes).size !== finishCodes.length) {
    context.addIssue({
      code: "custom",

      path: ["finishes"],

      message: "Finish codes must be unique",
    });
  }

  const standards = Array.isArray(product.standards) ? product.standards : [];

  const standardNames = standards.map((standard) =>
    standard.name.trim().toLocaleUpperCase(),
  );

  if (new Set(standardNames).size !== standardNames.length) {
    context.addIssue({
      code: "custom",

      path: ["standards"],

      message: "Product standards must be unique",
    });
  }
}

export const createProductSchema = productFieldsSchema.superRefine(
  validateProductCollections,
);

export const updateProductSchema = productFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one product field is required",
  })
  .superRefine(validateProductCollections);

export const productIdSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
  })
  .strict();

export const productQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PRODUCT_LIMITS.LIST_MAX_LIMIT)
      .default(PRODUCT_LIMITS.LIST_DEFAULT_LIMIT),

    cursor: z.string().trim().optional(),

    status: z.enum(PRODUCT_STATUS_VALUES).optional(),

    categoryId: z.string().trim().min(1).max(128).optional(),

    productTypeSlug: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.PRODUCT_TYPE_SLUG_MAX_LENGTH)
      .transform(normalizeProductTypeSlug)
      .refine(isValidProductTypeSlug, {
        message: "Invalid product type slug",
      })
      .optional(),

    standard: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.STANDARD_NAME_MAX_LENGTH)
      .optional(),

    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    showOnHome: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    fireRated: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    search: z.string().trim().max(PRODUCT_LIMITS.NAME_MAX_LENGTH).optional(),
  })
  .strict();

export const reorderProductsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().trim().min(1).max(128),

            sortOrder: z.coerce
              .number()
              .int()
              .min(PRODUCT_LIMITS.SORT_ORDER_MIN)
              .max(PRODUCT_LIMITS.SORT_ORDER_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(PRODUCT_LIMITS.LIST_MAX_LIMIT),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.productId)).size ===
      value.items.length,
    {
      path: ["items"],

      message: "Product IDs must be unique",
    },
  );

