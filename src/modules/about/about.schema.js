import { z } from "zod";

import {
  ABOUT_BACKGROUND_STYLE_VALUES,
  ABOUT_BUTTON_STYLE_VALUES,
  ABOUT_CONTENT_ALIGNMENT_VALUES,
  ABOUT_IMAGE_POSITION_VALUES,
  ABOUT_IMAGE_RATIO_VALUES,
  ABOUT_LIMITS,
  ABOUT_PAGE_ID,
  ABOUT_SECTION_LAYOUT_VALUES,
  ABOUT_SECTION_TYPE_VALUES,
  ABOUT_SECTION_TYPES,
} from "@/constants/about";

function localizedTextSchema(maximumLength) {
  return z
    .object({
      en: z.string().trim().max(maximumLength).default(""),
      th: z.string().trim().max(maximumLength).default(""),
    })
    .strict();
}

const nullableMediaIdSchema = z
  .union([
    z.null(),
    z.string().trim().min(1).max(ABOUT_LIMITS.MEDIA_ID_MAX_LENGTH),
  ])
  .default(null);

const actionHrefSchema = z
  .string()
  .trim()
  .max(ABOUT_LIMITS.ACTION_HREF_MAX_LENGTH)
  .default("")
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith("/") && !value.startsWith("//")) {
        return true;
      }

      if (value.startsWith("#") && value.length > 1) {
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

const tipTapDocumentSchema = z
  .json()
  .refine(
    (value) =>
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.type === "doc",
    {
      message: "Rich text must be a valid TipTap document",
    },
  );

const localizedRichTextSchema = z
  .object({
    en: tipTapDocumentSchema,
    th: tipTapDocumentSchema,
  })
  .strict();

const aboutActionSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    label: localizedTextSchema(ABOUT_LIMITS.ACTION_LABEL_MAX_LENGTH),

    href: actionHrefSchema,

    style: z.enum(ABOUT_BUTTON_STYLE_VALUES).default("primary"),

    openInNewTab: z.boolean().default(false),
  })
  .strict();

const aboutItemSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    title: localizedTextSchema(ABOUT_LIMITS.ITEM_TITLE_MAX_LENGTH),

    content: localizedRichTextSchema,

    value: localizedTextSchema(ABOUT_LIMITS.ITEM_VALUE_MAX_LENGTH),

    icon: z.string().trim().max(ABOUT_LIMITS.ITEM_ICON_MAX_LENGTH).default(""),

    imageMediaId: nullableMediaIdSchema,

    imageAlt: localizedTextSchema(ABOUT_LIMITS.ITEM_TITLE_MAX_LENGTH),

    sortOrder: z.coerce
      .number()
      .int()
      .min(ABOUT_LIMITS.SORT_ORDER_MIN)
      .max(ABOUT_LIMITS.SORT_ORDER_MAX),
  })
  .strict();

const aboutSectionLayoutSchema = z
  .object({
    variant: z.enum(ABOUT_SECTION_LAYOUT_VALUES),

    imagePosition: z.enum(ABOUT_IMAGE_POSITION_VALUES),

    imageRatio: z.enum(ABOUT_IMAGE_RATIO_VALUES),

    contentAlignment: z.enum(ABOUT_CONTENT_ALIGNMENT_VALUES),

    background: z.enum(ABOUT_BACKGROUND_STYLE_VALUES),
  })
  .strict();

const aboutSectionSchema = z
  .object({
    id: z.string().trim().min(1).max(128),

    type: z.enum(ABOUT_SECTION_TYPE_VALUES),

    enabled: z.boolean().default(true),

    internalLabel: localizedTextSchema(ABOUT_LIMITS.SECTION_LABEL_MAX_LENGTH),

    eyebrow: localizedTextSchema(ABOUT_LIMITS.EYEBROW_MAX_LENGTH),

    title: localizedTextSchema(ABOUT_LIMITS.TITLE_MAX_LENGTH),

    content: localizedRichTextSchema,

    imageMediaId: nullableMediaIdSchema,

    imageAlt: localizedTextSchema(ABOUT_LIMITS.TITLE_MAX_LENGTH),

    layout: aboutSectionLayoutSchema,

    actions: z
      .array(aboutActionSchema)
      .max(ABOUT_LIMITS.ACTIONS_MAX_COUNT)
      .default([]),

    items: z
      .array(aboutItemSchema)
      .max(ABOUT_LIMITS.ITEMS_MAX_COUNT)
      .default([]),

    sortOrder: z.coerce
      .number()
      .int()
      .min(ABOUT_LIMITS.SORT_ORDER_MIN)
      .max(ABOUT_LIMITS.SORT_ORDER_MAX),
  })
  .strict();

const aboutSeoSchema = z
  .object({
    title: localizedTextSchema(ABOUT_LIMITS.SEO_TITLE_MAX_LENGTH),

    description: localizedTextSchema(ABOUT_LIMITS.SEO_DESCRIPTION_MAX_LENGTH),

    imageMediaId: nullableMediaIdSchema,

    imageAlt: localizedTextSchema(ABOUT_LIMITS.TITLE_MAX_LENGTH),
  })
  .strict();

function validateUniqueIds(values, context) {
  const sectionIds = new Set();

  values.sections.forEach((section, sectionIndex) => {
    if (sectionIds.has(section.id)) {
      context.addIssue({
        code: "custom",
        path: ["sections", sectionIndex, "id"],
        message: "Section IDs must be unique",
      });
    }

    sectionIds.add(section.id);

    const actionIds = new Set();

    section.actions.forEach((action, actionIndex) => {
      if (actionIds.has(action.id)) {
        context.addIssue({
          code: "custom",
          path: ["sections", sectionIndex, "actions", actionIndex, "id"],
          message: "Action IDs must be unique within a section",
        });
      }

      actionIds.add(action.id);
    });

    const itemIds = new Set();

    section.items.forEach((item, itemIndex) => {
      if (itemIds.has(item.id)) {
        context.addIssue({
          code: "custom",
          path: ["sections", sectionIndex, "items", itemIndex, "id"],
          message: "Item IDs must be unique within a section",
        });
      }

      itemIds.add(item.id);
    });
  });
}

function validateSectionConfiguration(values, context) {
  values.sections.forEach((section, sectionIndex) => {
    const path = ["sections", sectionIndex];

    if (
      section.layout.imagePosition === "background" &&
      section.layout.variant !== "full-width" &&
      section.layout.variant !== "banner"
    ) {
      context.addIssue({
        code: "custom",
        path: [...path, "layout", "variant"],
        message: "Background images require a full-width or banner layout",
      });
    }
  });
}

const aboutDraftFieldsSchema = z
  .object({
    seo: aboutSeoSchema,

    sections: z
      .array(aboutSectionSchema)
      .max(ABOUT_LIMITS.SECTION_MAX_COUNT)
      .default([]),
  })
  .strict();

export const saveAboutDraftSchema = aboutDraftFieldsSchema.superRefine(
  (values, context) => {
    validateUniqueIds(values, context);
    validateSectionConfiguration(values, context);
  },
);

export const publishAboutPageSchema = z
  .object({
    expectedDraftVersion: z.coerce.number().int().min(0),
  })
  .strict();

export const aboutPageIdSchema = z
  .object({
    pageId: z.literal(ABOUT_PAGE_ID),
  })
  .strict();

export {
  aboutActionSchema,
  aboutItemSchema,
  aboutSectionLayoutSchema,
  aboutSectionSchema,
  aboutSeoSchema,
  localizedRichTextSchema,
  localizedTextSchema,
  tipTapDocumentSchema,
};
