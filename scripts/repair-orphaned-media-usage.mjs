import process from "node:process";

import { cert, getApps, initializeApp } from "firebase-admin/app";

import { FieldValue, getFirestore } from "firebase-admin/firestore";

function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function normalizePrivateKey(value) {
  return value.replace(/^"(.*)"$/s, "$1").replace(/\\n/g, "\n");
}

function initializeFirebaseAdmin() {
  const projectId = requireEnvironmentVariable("FIREBASE_ADMIN_PROJECT_ID");

  const clientEmail = requireEnvironmentVariable("FIREBASE_ADMIN_CLIENT_EMAIL");

  const privateKey = normalizePrivateKey(
    requireEnvironmentVariable("FIREBASE_ADMIN_PRIVATE_KEY"),
  );

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

  return getFirestore(app);
}

function normalizeEntityType(entityType) {
  return String(entityType || "")
    .trim()
    .toLocaleLowerCase();
}

function getEntityCollection(entityType) {
  const normalizedType = normalizeEntityType(entityType);

  const collections = {
    category: "categories",
    categories: "categories",
  };

  return collections[normalizedType] || null;
}

async function validateUsageReference({ db, mediaId, usageReference }) {
  const collectionName = getEntityCollection(usageReference?.entityType);

  /*
   * ยังไม่ลบ reference ของ entity
   * ที่ script ไม่รู้จัก เพื่อป้องกัน
   * การทำลายข้อมูลของ module อื่น
   */
  if (!collectionName) {
    return {
      valid: true,
      reason: "unsupported-entity-preserved",
      reference: usageReference,
    };
  }

  const entityId = usageReference?.entityId;

  if (typeof entityId !== "string" || !entityId.trim()) {
    return {
      valid: false,
      reason: "missing-entity-id",
      reference: usageReference,
    };
  }

  const snapshot = await db.collection(collectionName).doc(entityId).get();

  if (!snapshot.exists) {
    return {
      valid: false,
      reason: "entity-not-found",
      reference: usageReference,
    };
  }

  const entityData = snapshot.data();

  if (entityData.isDeleted) {
    return {
      valid: false,
      reason: "entity-is-deleted",
      reference: usageReference,
    };
  }

  if (collectionName === "categories" && entityData.imageMediaId !== mediaId) {
    return {
      valid: false,
      reason: "category-no-longer-uses-media",
      reference: usageReference,
    };
  }

  return {
    valid: true,
    reason: "active-reference",
    reference: usageReference,
  };
}

async function repairMediaUsage({ db, mediaId }) {
  const mediaReference = db.collection("media").doc(mediaId);

  const mediaSnapshot = await mediaReference.get();

  if (!mediaSnapshot.exists) {
    throw new Error(`Media document not found: ${mediaId}`);
  }

  const mediaData = mediaSnapshot.data();

  const currentReferences = Array.isArray(mediaData.usedBy)
    ? mediaData.usedBy
    : [];

  console.log(`Media: ${mediaId}`);

  console.log(`Original name: ${mediaData.originalName || "-"}`);

  console.log(`Current usage count: ${mediaData.usageCount || 0}`);

  console.log(`Current references: ${currentReferences.length}`);

  const results = [];

  for (const usageReference of currentReferences) {
    const result = await validateUsageReference({
      db,
      mediaId,
      usageReference,
    });

    results.push(result);

    console.log(
      [
        result.valid ? "[KEEP]" : "[REMOVE]",

        result.reason,

        JSON.stringify(usageReference),
      ].join(" "),
    );
  }

  const validReferences = results
    .filter((result) => result.valid)
    .map((result) => result.reference);

  const removedReferences = results
    .filter((result) => !result.valid)
    .map((result) => result.reference);

  const nextUsageCount = validReferences.length;

  await mediaReference.update({
    usedBy: validReferences,

    usageCount: nextUsageCount,

    isUsed: nextUsageCount > 0,

    updatedAt: FieldValue.serverTimestamp(),

    updatedBy: "system:media-usage-repair",

    usageRepair: {
      repairedAt: FieldValue.serverTimestamp(),

      previousUsageCount: Number(mediaData.usageCount || 0),

      nextUsageCount,

      removedReferences,
    },
  });

  console.log("");
  console.log("Media usage repair completed.");

  console.log(`Removed references: ${removedReferences.length}`);

  console.log(`Remaining references: ${validReferences.length}`);

  console.log(`New usage count: ${nextUsageCount}`);
}

async function main() {
  const mediaId = process.argv[2]?.trim();

  if (!mediaId) {
    throw new Error(
      [
        "Media ID is required.",
        "",
        "Example:",
        "node --env-file=.env.local scripts/repair-orphaned-media-usage.mjs MEDIA_ID",
      ].join("\n"),
    );
  }

  const db = initializeFirebaseAdmin();

  await repairMediaUsage({
    db,
    mediaId,
  });
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("");
    console.error("Unable to repair media usage:", error);

    process.exitCode = 1;
  });
