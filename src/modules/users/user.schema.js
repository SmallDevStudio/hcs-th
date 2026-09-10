import { z } from "zod";

import {
  ADMIN_PERMISSION_VALUES,
  ADMIN_ROLE_VALUES,
  USER_STATUSES,
  USER_STATUS_VALUES,
} from "@/constants/admin";

const ASSIGNABLE_PERMISSION_VALUES = ADMIN_PERMISSION_VALUES.filter(
  (permission) => permission !== "*",
);

const userIdValueSchema = z
  .string()
  .trim()
  .min(1, "User ID is required")
  .max(128, "User ID is invalid");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("A valid email address is required")
  .max(254, "Email address is too long");

const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(120, "Display name must not exceed 120 characters");

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

const passwordConfirmationSchema = z
  .string()
  .min(1, "Password confirmation is required")
  .max(128, "Password confirmation is invalid");

const photoUrlValueSchema = z.union([
  z.null(),

  z
    .string()
    .trim()
    .url("Photo URL must be valid")
    .max(2000, "Photo URL is too long"),
]);

const roleSchema = z.enum(ADMIN_ROLE_VALUES);

const statusSchema = z.enum(USER_STATUS_VALUES);

const permissionSchema = z.enum(ASSIGNABLE_PERMISSION_VALUES);

const permissionArraySchema = z
  .array(permissionSchema)
  .max(
    ASSIGNABLE_PERMISSION_VALUES.length,
    "Too many permissions were selected",
  )
  .transform((permissions) => [...new Set(permissions)]);

const groupIdValueSchema = z
  .string()
  .trim()
  .min(1, "Permission group ID is required")
  .max(128, "Permission group ID is invalid");

const groupIdArraySchema = z
  .array(groupIdValueSchema)
  .max(100, "A user cannot belong to more than 100 groups")
  .transform((groupIds) => [...new Set(groupIds)]);

const preferredLocaleSchema = z.enum(["en", "th"]);

export const createUserSchema = z
  .object({
    email: emailSchema,

    displayName: displayNameSchema,

    password: passwordSchema,

    confirmPassword: passwordConfirmationSchema,

    mustChangePassword: z.boolean().optional().default(true),

    photoURL: photoUrlValueSchema.optional().default(null),

    role: roleSchema,

    permissions: permissionArraySchema.optional().default([]),

    groupIds: groupIdArraySchema.optional().default([]),

    status: statusSchema.optional().default(USER_STATUSES.ACTIVE),

    preferredLocale: preferredLocaleSchema.optional().default("th"),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",

        path: ["confirmPassword"],

        message: "Password confirmation does not match",
      });
    }
  });

export const updateUserSchema = z
  .object({
    email: emailSchema.optional(),

    displayName: displayNameSchema.optional(),

    photoURL: photoUrlValueSchema.optional(),

    role: roleSchema.optional(),

    permissions: permissionArraySchema.optional(),

    groupIds: groupIdArraySchema.optional(),

    status: statusSchema.optional(),

    preferredLocale: preferredLocaleSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one user field is required",
  });

export const adminSetUserPasswordSchema = z
  .object({
    password: passwordSchema,

    confirmPassword: passwordConfirmationSchema,

    mustChangePassword: z.boolean().optional().default(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",

        path: ["confirmPassword"],

        message: "Password confirmation does not match",
      });
    }
  });

export const userIdSchema = z
  .object({
    userId: userIdValueSchema,
  })
  .strict();

export const userQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(25),

    cursor: z.string().trim().max(4000).optional(),

    role: roleSchema.optional(),

    status: statusSchema.optional(),

    groupId: groupIdValueSchema.optional(),

    search: z.string().trim().max(120).optional(),
  })
  .strict();

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(200, "Current password is invalid"),

    newPassword: passwordSchema,

    confirmPassword: passwordConfirmationSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",

        path: ["confirmPassword"],

        message: "Password confirmation does not match",
      });
    }

    if (value.currentPassword === value.newPassword) {
      context.addIssue({
        code: "custom",

        path: ["newPassword"],

        message: "New password must be different from the current password",
      });
    }
  });

export const sendPasswordResetSchema = z
  .object({
    userId: userIdValueSchema,
  })
  .strict();
