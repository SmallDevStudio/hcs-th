import { z } from "zod";

export const completePasswordChangeSchema = z
  .object({
    idToken: z
      .string()
      .trim()
      .min(100, "Firebase authentication token is required")
      .max(10000, "Firebase authentication token is invalid"),
  })
  .strict();
