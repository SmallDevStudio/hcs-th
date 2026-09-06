import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { clientEnv } from "@/config/env.client";

const firebaseClientConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,

  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseClientConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const firestoreDb = getFirestore(firebaseApp);

export const firebaseStorage = getStorage(firebaseApp);
