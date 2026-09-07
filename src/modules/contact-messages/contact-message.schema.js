import { z } from "zod";

import {
  CONTACT_ENQUIRY_TYPE_VALUES,
  CONTACT_MESSAGE_STATUS_VALUES,
  CONTACT_PRODUCT_CATEGORY_VALUES,
} from "@/modules/contact-messages/contact-message.constants";

const optionalShortTextSchema = z
  .string()
  .trim()
  .max(200)
  .optional()
  .default("");

export const createContactMessageSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(150),

    company: optionalShortTextSchema,

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(200)
      .transform((value) => value.toLowerCase()),

    phone: z.string().trim().max(50).optional().default(""),

    enquiryType: z.enum(CONTACT_ENQUIRY_TYPE_VALUES),

    productCategory: z
      .union([z.literal(""), z.enum(CONTACT_PRODUCT_CATEGORY_VALUES)])
      .optional()
      .default(""),

    projectName: optionalShortTextSchema,
    projectLocation: optionalShortTextSchema,

    message: z
      .string()
      .trim()
      .min(10, "Message must contain at least 10 characters")
      .max(5000),

    attachmentUploadToken: z.string().trim().max(4000).optional().default(""),

    locale: z.enum(["en", "th"]).default("en"),

    privacyAccepted: z.literal(true, {
      error: "Privacy consent is required",
    }),

    website: z.string().trim().max(300).optional().default(""),

    formStartedAt: z.coerce.number().int().positive().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.website) {
      context.addIssue({
        code: "custom",
        path: ["website"],
        message: "Unable to submit this enquiry",
      });
    }

    if (value.formStartedAt && Date.now() - value.formStartedAt < 1500) {
      context.addIssue({
        code: "custom",
        path: ["formStartedAt"],
        message: "The form was submitted too quickly",
      });
    }
  });

export const updateContactMessageSchema = z
  .object({
    status: z.enum(CONTACT_MESSAGE_STATUS_VALUES).optional(),

    internalNote: z.string().trim().max(3000).optional(),

    assignedTo: z.string().trim().max(200).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one message field is required",
  });

export const contactMessageQuerySchema = z.object({
  status: z
    .union([z.literal(""), z.enum(CONTACT_MESSAGE_STATUS_VALUES)])
    .optional(),

  search: z.string().trim().max(200).optional(),

  limit: z.coerce.number().int().min(1).max(100).default(25),

  cursor: z.string().trim().max(1000).optional(),
});
