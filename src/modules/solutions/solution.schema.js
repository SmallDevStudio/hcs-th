import { z } from "zod";

import {
  SOLUTION_DEFAULTS,
  SOLUTION_ICON_VALUES,
  SOLUTION_LIMITS,
  SOLUTION_STATUS_VALUES,
  isValidSolutionSlug,
  normalizeSolutionSlug,
} from "@/constants/solutions";

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
  const valuesSchema = z
    .array(z.string().trim().min(1).max(maximumLength))
    .max(maximumItems)
    .optional()
    .default([])
    .transform((values) => [...new Set(values)]);

  return z
    .object({
      en: valuesSchema,

      th: valuesSchema,
    })
    .strict();
}

const mediaIdSchema = z.string().trim().min(1).max(128);

const solutionFieldsSchema = z
  .object({
    name: localizedRequiredTextSchema({
      maximumLength: SOLUTION_LIMITS.NAME_MAX_LENGTH,

      fieldName: "Solution name",
    }),

    slug: z
      .string()
      .trim()
      .min(SOLUTION_LIMITS.SLUG_MIN_LENGTH)
      .max(SOLUTION_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeSolutionSlug)
      .refine(isValidSolutionSlug, {
        message: "Slug may contain lowercase letters, numbers and hyphens only",
      }),

    eyebrow: localizedOptionalTextSchema({
      maximumLength: SOLUTION_LIMITS.EYEBROW_MAX_LENGTH,
    }),

    shortDescription: localizedOptionalTextSchema({
      maximumLength: SOLUTION_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH,
    }),

    description: localizedOptionalTextSchema({
      maximumLength: SOLUTION_LIMITS.DESCRIPTION_MAX_LENGTH,
    }),

    icon: z.enum(SOLUTION_ICON_VALUES).default(SOLUTION_DEFAULTS.icon),

    imageMediaId: mediaIdSchema
      .nullable()
      .optional()
      .default(SOLUTION_DEFAULTS.imageMediaId),

    features: localizedStringArraySchema({
      maximumItems: SOLUTION_LIMITS.FEATURES_MAX_ITEMS,

      maximumLength: SOLUTION_LIMITS.FEATURE_MAX_LENGTH,
    }),

    status: z.enum(SOLUTION_STATUS_VALUES).default(SOLUTION_DEFAULTS.status),

    featured: z.boolean().default(SOLUTION_DEFAULTS.featured),

    showOnHome: z.boolean().default(SOLUTION_DEFAULTS.showOnHome),

    sortOrder: z.coerce
      .number()
      .int()
      .min(SOLUTION_LIMITS.SORT_ORDER_MIN)
      .max(SOLUTION_LIMITS.SORT_ORDER_MAX)
      .default(SOLUTION_DEFAULTS.sortOrder),

    seo: z
      .object({
        title: localizedOptionalTextSchema({
          maximumLength: SOLUTION_LIMITS.SEO_TITLE_MAX_LENGTH,
        }),

        description: localizedOptionalTextSchema({
          maximumLength: SOLUTION_LIMITS.SEO_DESCRIPTION_MAX_LENGTH,
        }),

        keywords: localizedStringArraySchema({
          maximumItems: SOLUTION_LIMITS.KEYWORDS_MAX_ITEMS,

          maximumLength: SOLUTION_LIMITS.KEYWORD_MAX_LENGTH,
        }),
      })
      .strict()
      .optional()
      .default(SOLUTION_DEFAULTS.seo),
  })
  .strict();

export const createSolutionSchema = solutionFieldsSchema;

export const updateSolutionSchema = solutionFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one solution field is required",
  });

export const solutionIdSchema = z
  .object({
    solutionId: z.string().trim().min(1).max(128),
  })
  .strict();

export const solutionQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(SOLUTION_LIMITS.LIST_MAX_LIMIT)
      .default(SOLUTION_LIMITS.LIST_DEFAULT_LIMIT),

    cursor: z.string().trim().optional(),

    status: z.enum(SOLUTION_STATUS_VALUES).optional(),

    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    showOnHome: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    search: z.string().trim().max(SOLUTION_LIMITS.NAME_MAX_LENGTH).optional(),
  })
  .strict();

export const reorderSolutionsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            solutionId: z.string().trim().min(1).max(128),

            sortOrder: z.coerce
              .number()
              .int()
              .min(SOLUTION_LIMITS.SORT_ORDER_MIN)
              .max(SOLUTION_LIMITS.SORT_ORDER_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(SOLUTION_LIMITS.LIST_MAX_LIMIT),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.solutionId)).size ===
      value.items.length,
    {
      path: ["items"],

      message: "Solution IDs must be unique",
    },
  );
