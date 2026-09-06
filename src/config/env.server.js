import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  FIREBASE_ADMIN_STORAGE_BUCKET: z.string().min(1),

  AUTH_SESSION_COOKIE_NAME: z.string().min(1).default("hcs_admin_session"),

  AUTH_SESSION_MAX_AGE: z.coerce.number().int().positive().default(432000),

  AUTH_SECRET: z.string().min(32),
  REVALIDATE_SECRET: z.string().min(32),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,

  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,

  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,

  FIREBASE_ADMIN_STORAGE_BUCKET: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,

  AUTH_SESSION_COOKIE_NAME: process.env.AUTH_SESSION_COOKIE_NAME,

  AUTH_SESSION_MAX_AGE: process.env.AUTH_SESSION_MAX_AGE,

  AUTH_SECRET: process.env.AUTH_SECRET,

  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});

if (!parsedServerEnv.success) {
  console.error(
    "Invalid server environment variables:",
    parsedServerEnv.error.flatten().fieldErrors,
  );

  throw new Error("Invalid server environment variables. Check .env.local.");
}

const parsedData = parsedServerEnv.data;

export const serverEnv = Object.freeze({
  ...parsedData,

  firebaseAdminPrivateKey: parsedData.FIREBASE_ADMIN_PRIVATE_KEY.replace(
    /\\n/g,
    "\n",
  ),

  sessionMaxAgeMilliseconds: parsedData.AUTH_SESSION_MAX_AGE * 1000,
});
