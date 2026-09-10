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

const emailRecipientSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(/[\n,;]/)
        .map((email) => email.trim())
        .filter(Boolean);
    }

    return [];
  },

  z
    .array(z.string().trim().email("Invalid notification email address"))
    .max(20),
);

const recipientUserIdsSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    return [];
  },

  z
    .array(
      z
        .string()
        .trim()
        .min(1, "Notification recipient user ID is required")
        .max(128, "Notification recipient user ID is invalid"),
    )
    .max(100)
    .transform((userIds) => [...new Set(userIds)]),
);

const localizedSeoSchema = z.object({
  title: z.string().trim().max(70),

  description: z.string().trim().max(180),

  keywords: keywordSchema,
});

const notificationSettingsSchema = z
  .object({
    channels: z
      .object({
        inApp: z.boolean(),

        email: z.boolean(),

        line: z.boolean(),
      })
      .strict(),

    email: z
      .object({
        smtpHost: z.string().trim().max(300),

        smtpPort: z.coerce.number().int().min(1).max(65535),

        smtpSecure: z.boolean(),

        smtpUsername: z.string().trim().max(300),

        smtpPassword: z.string().max(2000),

        passwordConfigured: z.boolean(),

        fromName: z.string().trim().max(200),

        fromEmail: optionalEmailSchema,

        recipients: emailRecipientSchema,
      })
      .strict(),

    line: z
      .object({
        channelAccessToken: z.string().trim().max(5000),

        tokenConfigured: z.boolean(),

        loginChannelId: z.string().trim().max(100),

        loginChannelSecret: z.string().trim().max(2000),

        loginSecretConfigured: z.boolean(),

        recipientUserIds: recipientUserIdsSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.channels.email) {
      if (!value.email.smtpHost) {
        context.addIssue({
          code: "custom",

          path: ["email", "smtpHost"],

          message: "SMTP host is required",
        });
      }

      if (!value.email.smtpUsername) {
        context.addIssue({
          code: "custom",

          path: ["email", "smtpUsername"],

          message: "SMTP username is required",
        });
      }

      if (!value.email.smtpPassword && !value.email.passwordConfigured) {
        context.addIssue({
          code: "custom",

          path: ["email", "smtpPassword"],

          message: "SMTP password is required",
        });
      }

      if (!value.email.fromEmail) {
        context.addIssue({
          code: "custom",

          path: ["email", "fromEmail"],

          message: "Sender email is required",
        });
      }

      if (!value.email.recipients.length) {
        context.addIssue({
          code: "custom",

          path: ["email", "recipients"],

          message: "At least one notification recipient is required",
        });
      }
    }

    if (value.channels.line) {
      if (!value.line.channelAccessToken && !value.line.tokenConfigured) {
        context.addIssue({
          code: "custom",

          path: ["line", "channelAccessToken"],

          message: "LINE Messaging API channel access token is required",
        });
      }

      if (!value.line.recipientUserIds.length) {
        context.addIssue({
          code: "custom",

          path: ["line", "recipientUserIds"],

          message: "At least one connected LINE user is required",
        });
      }
    }

    const hasLoginChannelId = Boolean(value.line.loginChannelId);

    const hasLoginChannelSecret =
      Boolean(value.line.loginChannelSecret) ||
      value.line.loginSecretConfigured;

    if (hasLoginChannelId && !hasLoginChannelSecret) {
      context.addIssue({
        code: "custom",

        path: ["line", "loginChannelSecret"],

        message: "LINE Login channel secret is required",
      });
    }

    if (!hasLoginChannelId && hasLoginChannelSecret) {
      context.addIssue({
        code: "custom",

        path: ["line", "loginChannelId"],

        message: "LINE Login channel ID is required",
      });
    }
  });

export const siteSettingsSchema = z
  .object({
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

    notifications: notificationSettingsSchema,
  })
  .strict();

export const updateSiteSettingsSchema = siteSettingsSchema;
