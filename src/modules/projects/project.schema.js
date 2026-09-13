import { z } from "zod";

import {
  PROJECT_BUILDING_TYPE_VALUES,
  PROJECT_DEFAULTS,
  PROJECT_LIMITS,
  PROJECT_STATUS_VALUES,
  isValidProjectSlug,
  normalizeProjectSlug,
} from "@/constants/projects";

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

function uniqueMediaIdsSchema(maximumItems) {
  return z
    .array(z.string().trim().min(1).max(128))
    .max(maximumItems)
    .optional()
    .default([])
    .transform((values) => [...new Set(values)]);
}

function uniqueRelationshipIdsSchema(maximumItems) {
  return z
    .array(z.string().trim().min(1).max(128))
    .max(maximumItems)
    .optional()
    .default([])
    .transform((values) => [...new Set(values)]);
}

const mediaIdSchema = z.string().trim().min(1).max(128);

const projectFieldsSchema = z
  .object({
    name: localizedRequiredTextSchema({
      maximumLength: PROJECT_LIMITS.NAME_MAX_LENGTH,
      fieldName: "Project name",
    }),

    slug: z
      .string()
      .trim()
      .min(PROJECT_LIMITS.SLUG_MIN_LENGTH)
      .max(PROJECT_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeProjectSlug)
      .refine(isValidProjectSlug, {
        message: "Slug may contain lowercase letters, numbers and hyphens only",
      }),

    buildingType: z
      .enum(PROJECT_BUILDING_TYPE_VALUES)
      .default(PROJECT_DEFAULTS.buildingType),

    location: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.LOCATION_MAX_LENGTH,
    }),

    client: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.CLIENT_MAX_LENGTH,
    }),

    year: z
      .preprocess(
        (value) =>
          value === "" || value === null || value === undefined ? null : value,

        z.coerce
          .number()
          .int()
          .min(PROJECT_LIMITS.YEAR_MIN)
          .max(PROJECT_LIMITS.YEAR_MAX)
          .nullable(),
      )
      .optional()
      .default(PROJECT_DEFAULTS.year),

    shortDescription: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.SHORT_DESCRIPTION_MAX_LENGTH,
    }),

    description: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH,
    }),

    challenge: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH,
    }),

    solution: localizedOptionalTextSchema({
      maximumLength: PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH,
    }),

    results: localizedStringArraySchema({
      maximumItems: PROJECT_LIMITS.RESULTS_MAX_ITEMS,
      maximumLength: PROJECT_LIMITS.RESULT_MAX_LENGTH,
    }),

    coverImageMediaId: mediaIdSchema
      .nullable()
      .optional()
      .default(PROJECT_DEFAULTS.coverImageMediaId),

    galleryMediaIds: uniqueMediaIdsSchema(PROJECT_LIMITS.GALLERY_MAX_ITEMS),

    relatedProductIds: uniqueRelationshipIdsSchema(
      PROJECT_LIMITS.RELATED_PRODUCTS_MAX_ITEMS,
    ),

    relatedSolutionIds: uniqueRelationshipIdsSchema(
      PROJECT_LIMITS.RELATED_SOLUTIONS_MAX_ITEMS,
    ),

    status: z.enum(PROJECT_STATUS_VALUES).default(PROJECT_DEFAULTS.status),

    featured: z.boolean().default(PROJECT_DEFAULTS.featured),

    showOnHome: z.boolean().default(PROJECT_DEFAULTS.showOnHome),

    sortOrder: z.coerce
      .number()
      .int()
      .min(PROJECT_LIMITS.SORT_ORDER_MIN)
      .max(PROJECT_LIMITS.SORT_ORDER_MAX)
      .default(PROJECT_DEFAULTS.sortOrder),

    seo: z
      .object({
        title: localizedOptionalTextSchema({
          maximumLength: PROJECT_LIMITS.SEO_TITLE_MAX_LENGTH,
        }),

        description: localizedOptionalTextSchema({
          maximumLength: PROJECT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH,
        }),

        keywords: localizedStringArraySchema({
          maximumItems: PROJECT_LIMITS.KEYWORDS_MAX_ITEMS,
          maximumLength: PROJECT_LIMITS.KEYWORD_MAX_LENGTH,
        }),
      })
      .strict()
      .optional()
      .default(PROJECT_DEFAULTS.seo),
  })
  .strict();

function coverImageIsNotInGallery(project) {
  if (!project.coverImageMediaId) {
    return true;
  }

  if (!Array.isArray(project.galleryMediaIds)) {
    return true;
  }

  return !project.galleryMediaIds.includes(project.coverImageMediaId);
}

export const createProjectSchema = projectFieldsSchema.refine(
  coverImageIsNotInGallery,
  {
    path: ["galleryMediaIds"],
    message: "Cover image must not be duplicated in the gallery",
  },
);

export const updateProjectSchema = projectFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one project field is required",
  })
  .refine(coverImageIsNotInGallery, {
    path: ["galleryMediaIds"],
    message: "Cover image must not be duplicated in the gallery",
  });

export const projectIdSchema = z
  .object({
    projectId: z.string().trim().min(1).max(128),
  })
  .strict();

export const projectSlugSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(PROJECT_LIMITS.SLUG_MIN_LENGTH)
      .max(PROJECT_LIMITS.SLUG_MAX_LENGTH)
      .transform(normalizeProjectSlug)
      .refine(isValidProjectSlug, {
        message: "Invalid project slug",
      }),
  })
  .strict();

export const projectQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PROJECT_LIMITS.LIST_MAX_LIMIT)
      .default(PROJECT_LIMITS.LIST_DEFAULT_LIMIT),

    cursor: z.string().trim().optional(),

    status: z.enum(PROJECT_STATUS_VALUES).optional(),

    buildingType: z.enum(PROJECT_BUILDING_TYPE_VALUES).optional(),

    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    showOnHome: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    search: z.string().trim().max(PROJECT_LIMITS.NAME_MAX_LENGTH).optional(),
  })
  .strict();

export const reorderProjectsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            projectId: z.string().trim().min(1).max(128),

            sortOrder: z.coerce
              .number()
              .int()
              .min(PROJECT_LIMITS.SORT_ORDER_MIN)
              .max(PROJECT_LIMITS.SORT_ORDER_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(PROJECT_LIMITS.LIST_MAX_LIMIT),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.projectId)).size ===
      value.items.length,
    {
      path: ["items"],
      message: "Project IDs must be unique",
    },
  );
