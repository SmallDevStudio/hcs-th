import { z } from "zod";

import {
  HOME_HERO_DEFAULTS,
  HOME_HERO_LIMITS,
  HOME_SECTION_STATUSES,
  HOME_SECTION_STATUS_VALUES,
  HOME_SECTION_TYPES,
} from "@/constants/home";

function localizedTextSchema(maximumLength) {
  return z
    .object({
      en: z.string().trim().max(maximumLength).optional().default(""),

      th: z.string().trim().max(maximumLength).optional().default(""),
    })
    .strict();
}

const optionalMediaIdSchema = z
  .union([z.null(), z.string().trim().min(1).max(128)])
  .optional()
  .default(null);

const optionalDateTimeSchema = z
  .union([
    z.null(),
    z.literal(""),
    z.string().datetime({
      offset: true,
    }),
  ])
  .optional()
  .default(null)
  .transform((value) => value || null);

const actionHrefSchema = z
  .string()
  .trim()
  .max(HOME_HERO_LIMITS.ACTION_HREF_MAX_LENGTH)
  .optional()
  .default("")
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith("/") && !value.startsWith("//")) {
        return true;
      }

      try {
        const url = new URL(value);

        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    {
      message: "Action URL must be an internal path or valid HTTP URL",
    },
  );

const heroActionSchema = z
  .object({
    label: localizedTextSchema(HOME_HERO_LIMITS.ACTION_LABEL_MAX_LENGTH),

    href: actionHrefSchema,
  })
  .strict();

const displayScheduleSchema = z
  .object({
    startsAt: optionalDateTimeSchema,

    endsAt: optionalDateTimeSchema,
  })
  .strict();

const homeHeroFieldsSchema = z
  .object({
    sectionType: z
      .literal(HOME_SECTION_TYPES.HERO_SLIDE)
      .default(HOME_HERO_DEFAULTS.sectionType),

    eyebrow: localizedTextSchema(HOME_HERO_LIMITS.EYEBROW_MAX_LENGTH),

    titleLineOne: localizedTextSchema(HOME_HERO_LIMITS.TITLE_LINE_MAX_LENGTH),

    titleLineTwo: localizedTextSchema(HOME_HERO_LIMITS.TITLE_LINE_MAX_LENGTH),

    description: localizedTextSchema(HOME_HERO_LIMITS.DESCRIPTION_MAX_LENGTH),

    primaryAction: heroActionSchema.default(HOME_HERO_DEFAULTS.primaryAction),

    secondaryAction: heroActionSchema.default(
      HOME_HERO_DEFAULTS.secondaryAction,
    ),

    desktopImageMediaId: optionalMediaIdSchema,

    mobileImageMediaId: optionalMediaIdSchema,

    status: z
      .enum(HOME_SECTION_STATUS_VALUES)
      .default(HOME_HERO_DEFAULTS.status),

    sortOrder: z.coerce
      .number()
      .int()
      .min(HOME_HERO_LIMITS.SORT_ORDER_MIN)
      .max(HOME_HERO_LIMITS.SORT_ORDER_MAX)
      .default(HOME_HERO_DEFAULTS.sortOrder),

    displaySchedule: displayScheduleSchema.default(
      HOME_HERO_DEFAULTS.displaySchedule,
    ),
  })
  .strict();

function validateSchedule(value, context) {
  const startsAt = value.displaySchedule?.startsAt;

  const endsAt = value.displaySchedule?.endsAt;

  if (
    startsAt &&
    endsAt &&
    new Date(startsAt).getTime() >= new Date(endsAt).getTime()
  ) {
    context.addIssue({
      code: "custom",

      path: ["displaySchedule", "endsAt"],

      message: "End date must be later than start date",
    });
  }
}

function validatePublishedSlide(value, context) {
  if (value.status !== HOME_SECTION_STATUSES.PUBLISHED) {
    return;
  }

  for (const locale of ["en", "th"]) {
    if (!value.titleLineOne?.[locale]?.trim()) {
      context.addIssue({
        code: "custom",

        path: ["titleLineOne", locale],

        message: `Hero title in ${locale.toUpperCase()} is required before publishing`,
      });
    }
  }
}

function validateHeroSlide(value, context) {
  validateSchedule(value, context);
  validatePublishedSlide(value, context);
}

export const createHomeHeroSchema =
  homeHeroFieldsSchema.superRefine(validateHeroSlide);

export const updateHomeHeroSchema = homeHeroFieldsSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one hero field is required",
  });

export const homeHeroIdSchema = z
  .object({
    heroId: z.string().trim().min(1).max(128),
  })
  .strict();

export const homeHeroQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(HOME_HERO_LIMITS.LIST_MAX_LIMIT)
      .default(HOME_HERO_LIMITS.LIST_DEFAULT_LIMIT),

    status: z.enum(HOME_SECTION_STATUS_VALUES).optional(),
  })
  .strict();

export const reorderHomeHeroesSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            heroId: z.string().trim().min(1).max(128),

            sortOrder: z.coerce
              .number()
              .int()
              .min(HOME_HERO_LIMITS.SORT_ORDER_MIN)
              .max(HOME_HERO_LIMITS.SORT_ORDER_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(HOME_HERO_LIMITS.LIST_MAX_LIMIT),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.heroId)).size ===
      value.items.length,
    {
      path: ["items"],

      message: "Hero slide IDs must be unique",
    },
  );
