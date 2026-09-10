import { z } from "zod";

import { ADMIN_PERMISSION_VALUES } from "@/constants/admin";
import {
  USER_GROUP_DEFAULTS,
  USER_GROUP_LIMITS,
  USER_GROUP_STATUS_VALUES,
} from "@/constants/user-groups";

const ASSIGNABLE_PERMISSION_VALUES = ADMIN_PERMISSION_VALUES.filter(
  (permission) => permission !== "*",
);

const userGroupIdValueSchema = z
  .string()
  .trim()
  .min(1, "Permission group ID is required")
  .max(128, "Permission group ID is invalid");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Permission group name is required")
  .max(
    USER_GROUP_LIMITS.NAME_MAX_LENGTH,
    `Permission group name must not exceed ${USER_GROUP_LIMITS.NAME_MAX_LENGTH} characters`,
  );

const descriptionValueSchema = z
  .string()
  .trim()
  .max(
    USER_GROUP_LIMITS.DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${USER_GROUP_LIMITS.DESCRIPTION_MAX_LENGTH} characters`,
  );

const permissionSchema = z.enum(ASSIGNABLE_PERMISSION_VALUES);

const permissionArraySchema = z
  .array(permissionSchema)
  .max(
    ASSIGNABLE_PERMISSION_VALUES.length,
    "Too many permissions were selected",
  )
  .transform((permissions) => [...new Set(permissions)]);

const statusSchema = z.enum(USER_GROUP_STATUS_VALUES);

export const createUserGroupSchema = z
  .object({
    name: nameSchema,

    description: descriptionValueSchema
      .optional()
      .default(USER_GROUP_DEFAULTS.description),

    permissions: permissionArraySchema.optional().default([]),

    status: statusSchema.optional().default(USER_GROUP_DEFAULTS.status),
  })
  .strict();

export const updateUserGroupSchema = z
  .object({
    name: nameSchema.optional(),

    description: descriptionValueSchema.optional(),

    permissions: permissionArraySchema.optional(),

    status: statusSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one permission group field is required",
  });

export const userGroupIdSchema = z
  .object({
    groupId: userGroupIdValueSchema,
  })
  .strict();

export const userGroupQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(USER_GROUP_LIMITS.LIST_MAX_LIMIT)
      .default(USER_GROUP_LIMITS.LIST_DEFAULT_LIMIT),

    cursor: z.string().trim().max(128).optional(),

    status: statusSchema.optional(),

    search: z
      .string()
      .trim()
      .max(USER_GROUP_LIMITS.SEARCH_MAX_LENGTH)
      .optional(),
  })
  .strict();
