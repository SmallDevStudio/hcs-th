import { z } from "zod";

export const createSessionSchema = z.object({
  idToken: z
    .string({
      error: "Firebase ID token is required",
    })
    .min(20, "Firebase ID token is invalid"),
});
