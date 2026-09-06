import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const requiredEnvironmentVariables = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  "BOOTSTRAP_ADMIN_EMAIL",
  "BOOTSTRAP_ADMIN_PASSWORD",
  "BOOTSTRAP_ADMIN_NAME",
];

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName],
);

if (missingEnvironmentVariables.length > 0) {
  console.error(
    "Missing environment variables:",
    missingEnvironmentVariables.join(", "),
  );

  process.exit(1);
}

if (process.env.BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
  console.error(
    "BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.",
  );

  process.exit(1);
}

const appName = "hcs-bootstrap";

const existingApp = getApps().find((app) => app.name === appName);

const firebaseApp =
  existingApp ||
  initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,

        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,

        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
          /\\n/g,
          "\n",
        ),
      }),

      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    },
    appName,
  );

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const email = process.env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();

const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

const displayName = process.env.BOOTSTRAP_ADMIN_NAME.trim();

async function getOrCreateAuthUser() {
  try {
    const existingUser = await auth.getUserByEmail(email);

    console.log(`Firebase Auth user already exists: ${existingUser.uid}`);

    return existingUser;
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  const createdUser = await auth.createUser({
    email,
    password,
    displayName,
    emailVerified: true,
    disabled: false,
  });

  console.log(`Firebase Auth user created: ${createdUser.uid}`);

  return createdUser;
}

async function bootstrapSuperadmin() {
  const authUser = await getOrCreateAuthUser();

  await auth.setCustomUserClaims(authUser.uid, {
    role: "superadmin",
    status: "active",
    permissions: ["*"],
  });

  const userReference = db.collection("users").doc(authUser.uid);

  const auditReference = db.collection("auditLogs").doc();

  const batch = db.batch();

  batch.set(
    userReference,
    {
      uid: authUser.uid,
      email,
      displayName,

      photoURL: authUser.photoURL || null,

      role: "superadmin",
      permissions: ["*"],
      status: "active",

      preferredLocale: "th",

      lastLoginAt: null,
      lastLoginIp: null,

      createdAt: FieldValue.serverTimestamp(),

      updatedAt: FieldValue.serverTimestamp(),

      createdBy: "system",
      updatedBy: "system",

      deletedAt: null,
      deletedBy: null,
    },
    {
      merge: true,
    },
  );

  batch.set(auditReference, {
    actor: {
      uid: authUser.uid,
      email,
      displayName,
    },

    action: "USER_BOOTSTRAP",
    entityType: "user",
    entityId: authUser.uid,

    description: "Initial superadmin account created",

    before: null,

    after: {
      uid: authUser.uid,
      email,
      displayName,
      role: "superadmin",
      status: "active",
    },

    metadata: {
      source: "bootstrap-script",
    },

    createdAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();

  console.log("");
  console.log("HCS superadmin bootstrap completed successfully.");
  console.log(`UID: ${authUser.uid}`);
  console.log(`Email: ${email}`);
  console.log("Role: superadmin");
}

bootstrapSuperadmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unable to bootstrap superadmin:", error);

    process.exit(1);
  });
