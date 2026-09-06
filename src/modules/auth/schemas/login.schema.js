import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "login.validation.emailRequired")
    .email("login.validation.emailInvalid"),

  password: z
    .string()
    .min(1, "login.validation.passwordRequired")
    .min(8, "login.validation.passwordMinimum"),
});
