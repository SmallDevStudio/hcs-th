import { z } from "zod";

import {
  AUDIT_ACTION_VALUES,
  AUDIT_ENTITY_TYPE_VALUES,
} from "@/constants/audit";

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
    "Invalid date",
  );

export const auditLogQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(25),

    cursor: z.string().trim().optional(),

    action: z.enum(AUDIT_ACTION_VALUES).optional(),

    entityType: z.enum(AUDIT_ENTITY_TYPE_VALUES).optional(),

    actorUid: z.string().trim().min(1).optional(),

    dateFrom: optionalDateSchema,
    dateTo: optionalDateSchema,
  })
  .refine(
    (values) => {
      if (!values.dateFrom || !values.dateTo) {
        return true;
      }

      return (
        new Date(values.dateFrom).getTime() <= new Date(values.dateTo).getTime()
      );
    },
    {
      message: "dateFrom must be before or equal to dateTo",
      path: ["dateFrom"],
    },
  );
