import { z } from "zod";

import {
  CATEGORY_DEFAULTS,
  CATEGORY_ICON_VALUES,
  CATEGORY_LIMITS,
  CATEGORY_STATUS_VALUES,
  isValidCategorySlug,
  normalizeCategorySlug,
} from "@/constants/categories";

const localizedRequiredTextSchema = ({ maximumLength, fieldName }) =>
  z.object({
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
  });

const localizedOptionalTextSchema = ({ maximumLength }) =>
  z.object({
    en: z.string().trim().max(maximumLength).optional().default(""),

    th: z.string().trim().max(maximumLength).optional().default(""),
  });

const localizedKeywordsSchema = z.object({
  en: z
    .array(z.string().trim().min(1).max(CATEGORY_LIMITS.KEYWORD_MAX_LENGTH))
    .max(CATEGORY_LIMITS.KEYWORDS_MAX_ITEMS)
    .optional()
    .default([]),

  th: z
    .array(z.string().trim().min(1).max(CATEGORY_LIMITS.KEYWORD_MAX_LENGTH))
    .max(CATEGORY_LIMITS.KEYWORDS_MAX_ITEMS)
    .optional()
    .default([]),
});

const categoryFieldsSchema = z.object({
  name: localizedRequiredTextSchema({
    maximumLength: CATEGORY_LIMITS.NAME_MAX_LENGTH,
    fieldName: "Category name",
  }),

  description: localizedOptionalTextSchema({
    maximumLength: CATEGORY_LIMITS.DESCRIPTION_MAX_LENGTH,
  }),

  slug: z
    .string()
    .trim()
    .min(CATEGORY_LIMITS.SLUG_MIN_LENGTH)
    .max(CATEGORY_LIMITS.SLUG_MAX_LENGTH)
    .transform(normalizeCategorySlug)
    .refine(isValidCategorySlug, {
      message: "Slug may contain lowercase letters, numbers and hyphens only",
    }),

  icon: z.enum(CATEGORY_ICON_VALUES).default(CATEGORY_DEFAULTS.icon),

  imageMediaId: z
    .string()
    .trim()
    .min(1)
    .max(128)
    .nullable()
    .optional()
    .default(CATEGORY_DEFAULTS.imageMediaId),

  status: z.enum(CATEGORY_STATUS_VALUES).default(CATEGORY_DEFAULTS.status),

  featured: z.boolean().default(CATEGORY_DEFAULTS.featured),

  showOnHome: z.boolean().default(CATEGORY_DEFAULTS.showOnHome),

  sortOrder: z.coerce
    .number()
    .int()
    .min(CATEGORY_LIMITS.SORT_ORDER_MIN)
    .max(CATEGORY_LIMITS.SORT_ORDER_MAX)
    .default(CATEGORY_DEFAULTS.sortOrder),

  seo: z
    .object({
      title: localizedOptionalTextSchema({
        maximumLength: CATEGORY_LIMITS.SEO_TITLE_MAX_LENGTH,
      }),

      description: localizedOptionalTextSchema({
        maximumLength: CATEGORY_LIMITS.SEO_DESCRIPTION_MAX_LENGTH,
      }),

      keywords: localizedKeywordsSchema,
    })
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
});

export const createCategorySchema = categoryFieldsSchema.strict();

export const updateCategorySchema = categoryFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one category field must be provided",
  });

export const categoryIdSchema = z.object({
  categoryId: z.string().trim().min(1).max(128),
});

export const categoryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(CATEGORY_LIMITS.LIST_MAX_LIMIT)
    .default(CATEGORY_LIMITS.LIST_DEFAULT_LIMIT),

  cursor: z.string().trim().optional(),

  status: z.enum(CATEGORY_STATUS_VALUES).optional(),

  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  showOnHome: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  search: z.string().trim().max(CATEGORY_LIMITS.NAME_MAX_LENGTH).optional(),
});

export const reorderCategoriesSchema = z
  .object({
    items: z
      .array(
        z.object({
          categoryId: z.string().trim().min(1).max(128),

          sortOrder: z.coerce
            .number()
            .int()
            .min(CATEGORY_LIMITS.SORT_ORDER_MIN)
            .max(CATEGORY_LIMITS.SORT_ORDER_MAX),
        }),
      )
      .min(1)
      .max(100),
  })
  .superRefine((data, context) => {
    const categoryIds = data.items.map((item) => item.categoryId);

    if (new Set(categoryIds).size !== categoryIds.length) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Category reorder list contains duplicate IDs",
      });
    }
  });
