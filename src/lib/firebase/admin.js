import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { serverEnv } from "@/config/env.server";

const firebaseAdminConfig = {
  credential: cert({
    projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,

    clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,

    privateKey: serverEnv.firebaseAdminPrivateKey,
  }),

  projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,

  storageBucket: serverEnv.FIREBASE_ADMIN_STORAGE_BUCKET,
};

const existingAdminApp = getApps().find((app) => app.name === "hcs-admin");

export const firebaseAdminApp =
  existingAdminApp || initializeApp(firebaseAdminConfig, "hcs-admin");

export const adminAuth = getAuth(firebaseAdminApp);

export const adminDb = getFirestore(firebaseAdminApp);

export const adminStorage = getStorage(firebaseAdminApp);

export const adminBucket = adminStorage.bucket(
  serverEnv.FIREBASE_ADMIN_STORAGE_BUCKET,
);
