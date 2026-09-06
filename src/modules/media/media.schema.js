import { z } from "zod";

import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_FOLDER_VALUES,
  MEDIA_LIMITS,
  MEDIA_STATUS_VALUES,
  MEDIA_TYPE_VALUES,
  getMediaMaxBytes,
  getMediaTypeFromMimeType,
  isFolderAllowedForMediaType,
} from "@/constants/media";

const optionalTrimmedString = (maximumLength) =>
  z.string().trim().max(maximumLength).optional().default("");

const localizedTitleSchema = z.object({
  en: optionalTrimmedString(MEDIA_LIMITS.TITLE_MAX_LENGTH),
  th: optionalTrimmedString(MEDIA_LIMITS.TITLE_MAX_LENGTH),
});

const localizedAltTextSchema = z.object({
  en: optionalTrimmedString(MEDIA_LIMITS.ALT_TEXT_MAX_LENGTH),
  th: optionalTrimmedString(MEDIA_LIMITS.ALT_TEXT_MAX_LENGTH),
});

const localizedCaptionSchema = z.object({
  en: optionalTrimmedString(MEDIA_LIMITS.CAPTION_MAX_LENGTH),
  th: optionalTrimmedString(MEDIA_LIMITS.CAPTION_MAX_LENGTH),
});

const mediaKeywordsSchema = z
  .array(z.string().trim().min(1).max(MEDIA_LIMITS.KEYWORD_MAX_LENGTH))
  .max(MEDIA_LIMITS.KEYWORDS_MAX_ITEMS)
  .default([])
  .transform((keywords) => {
    const normalizedKeywords = keywords.map((keyword) =>
      keyword.toLocaleLowerCase(),
    );

    return [...new Set(normalizedKeywords)];
  });

function validateMediaFileConfiguration(data, context) {
  const mediaType = getMediaTypeFromMimeType(data.mimeType);

  if (!mediaType) {
    context.addIssue({
      code: "custom",
      path: ["mimeType"],
      message: "Unsupported media MIME type",
    });

    return;
  }

  if (!isFolderAllowedForMediaType(data.folder, mediaType)) {
    context.addIssue({
      code: "custom",
      path: ["folder"],
      message: `Folder "${data.folder}" cannot be used for ${mediaType} files`,
    });
  }

  const maximumBytes = getMediaMaxBytes(mediaType);

  if (data.size > maximumBytes) {
    context.addIssue({
      code: "custom",
      path: ["size"],
      message: `${mediaType} file exceeds the maximum allowed size`,
    });
  }
}

export const createMediaUploadSchema = z
  .object({
    originalName: z
      .string()
      .trim()
      .min(1)
      .max(MEDIA_LIMITS.ORIGINAL_NAME_MAX_LENGTH),

    mimeType: z.enum(MEDIA_ALLOWED_MIME_TYPES),

    size: z.coerce.number().int().positive(),

    folder: z.enum(MEDIA_FOLDER_VALUES),

    title: localizedTitleSchema.optional().default({
      en: "",
      th: "",
    }),

    altText: localizedAltTextSchema.optional().default({
      en: "",
      th: "",
    }),

    caption: localizedCaptionSchema.optional().default({
      en: "",
      th: "",
    }),

    keywords: mediaKeywordsSchema.optional().default([]),
  })
  .superRefine(validateMediaFileConfiguration);

export const completeMediaUploadSchema = z.object({
  mediaId: z.string().trim().min(1).max(128),

  storagePath: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine((value) => value.startsWith("media/"), {
      message: "Invalid media storage path",
    }),
});

export const updateMediaSchema = z
  .object({
    title: localizedTitleSchema.optional(),

    altText: localizedAltTextSchema.optional(),

    caption: localizedCaptionSchema.optional(),

    keywords: mediaKeywordsSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one media field must be provided",
  });

export const mediaQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MEDIA_LIMITS.LIST_MAX_LIMIT)
    .default(MEDIA_LIMITS.LIST_DEFAULT_LIMIT),

  cursor: z.string().trim().optional(),

  type: z.enum(MEDIA_TYPE_VALUES).optional(),

  folder: z.enum(MEDIA_FOLDER_VALUES).optional(),

  status: z.enum(MEDIA_STATUS_VALUES).optional(),

  search: z.string().trim().max(MEDIA_LIMITS.SEARCH_MAX_LENGTH).optional(),

  usage: z.enum(["all", "used", "unused"]).default("all"),
});

export const mediaIdSchema = z.object({
  mediaId: z.string().trim().min(1).max(128),
});
