import { z } from "zod";

import { TRASH_ENTITY_TYPES } from "@/constants/trash";

export const trashQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),

  cursor: z.string().trim().optional(),

  entityType: z.enum(TRASH_ENTITY_TYPES).optional(),
});

export const softDeleteEntitySchema = z.object({
  entityType: z.enum(TRASH_ENTITY_TYPES),
  entityId: z.string().trim().min(1).max(500),
});
