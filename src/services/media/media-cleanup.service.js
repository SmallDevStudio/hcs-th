import "server-only";

import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  MEDIA_LIMITS,
  MEDIA_STATUSES,
  MEDIA_STORAGE_ROOT,
} from "@/constants/media";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";

const CLEANUP_BATCH_LIMIT = 100;

const SYSTEM_ACTOR = Object.freeze({
  uid: "system:media-cleanup",
  email: "",
  displayName: "Media Cleanup",
  role: "system",
});

function createCleanupCutoff() {
  return Timestamp.fromMillis(
    Date.now() -
      MEDIA_LIMITS.INCOMPLETE_UPLOAD_RETENTION_HOURS * 60 * 60 * 1000,
  );
}

function isValidStoragePath(storagePath) {
  return (
    typeof storagePath === "string" &&
    storagePath.startsWith(`${MEDIA_STORAGE_ROOT}/`)
  );
}

async function getCleanupCandidates({ status, cutoff, limit }) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.MEDIA)
    .where("status", "==", status)
    .where("createdAt", "<=", cutoff)
    .orderBy("createdAt", "asc")
    .orderBy(FieldPath.documentId(), "asc")
    .limit(limit)
    .get();

  return snapshot.docs;
}

async function claimCleanupCandidate({ mediaId, expectedStatus, cutoff }) {
  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  let claimedData = null;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data();
    const createdAt = data.createdAt;

    if (
      data.status !== expectedStatus ||
      data.isDeleted ||
      !createdAt?.toMillis ||
      createdAt.toMillis() > cutoff.toMillis()
    ) {
      return;
    }

    transaction.update(reference, {
      status: MEDIA_STATUSES.CLEANING,
      cleanupStartedAt: FieldValue.serverTimestamp(),
      failureReason: null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: SYSTEM_ACTOR.uid,
    });

    claimedData = {
      ...data,
      id: snapshot.id,
    };
  });

  return claimedData;
}

async function markCleanupFailed({ mediaId, error }) {
  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  try {
    await reference.set(
      {
        status: MEDIA_STATUSES.FAILED,

        failureReason:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "Media cleanup failed",

        cleanupFailedAt: FieldValue.serverTimestamp(),

        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: SYSTEM_ACTOR.uid,
      },
      {
        merge: true,
      },
    );
  } catch (updateError) {
    console.error(
      `Unable to mark media cleanup failure for ${mediaId}:`,
      updateError,
    );
  }
}

async function deleteClaimedMedia({ mediaId, claimedData }) {
  const storagePath = claimedData.storagePath;

  if (isValidStoragePath(storagePath)) {
    await adminBucket.file(storagePath).delete({
      ignoreNotFound: true,
    });
  }

  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists) {
      return;
    }

    const currentData = snapshot.data();

    if (currentData.status !== MEDIA_STATUSES.CLEANING) {
      return;
    }

    transaction.delete(reference);

    await writeAuditLog({
      actor: SYSTEM_ACTOR,
      action: AUDIT_ACTIONS.MEDIA_CLEANUP,
      entityType: AUDIT_ENTITY_TYPES.MEDIA,
      entityId: mediaId,
      before: claimedData,
      after: null,

      metadata: {
        source: "cron",
        reason: "incomplete-upload-expired",
        storagePath: isValidStoragePath(storagePath) ? storagePath : null,
        storageDeleted: isValidStoragePath(storagePath),
      },

      transaction,
    });
  });
}

async function processCandidate({ document, expectedStatus, cutoff }) {
  const claimedData = await claimCleanupCandidate({
    mediaId: document.id,
    expectedStatus,
    cutoff,
  });

  if (!claimedData) {
    return {
      mediaId: document.id,
      status: "skipped",
    };
  }

  try {
    await deleteClaimedMedia({
      mediaId: document.id,
      claimedData,
    });

    return {
      mediaId: document.id,
      status: "deleted",
    };
  } catch (error) {
    await markCleanupFailed({
      mediaId: document.id,
      error,
    });

    console.error(`Media cleanup failed for ${document.id}:`, error);

    return {
      mediaId: document.id,
      status: "failed",
    };
  }
}

export async function cleanupIncompleteMediaUploads({
  limit = CLEANUP_BATCH_LIMIT,
} = {}) {
  const cutoff = createCleanupCutoff();

  const perStatusLimit = Math.max(1, Math.floor(limit / 2));

  const [uploadingDocuments, failedDocuments] = await Promise.all([
    getCleanupCandidates({
      status: MEDIA_STATUSES.UPLOADING,
      cutoff,
      limit: perStatusLimit,
    }),

    getCleanupCandidates({
      status: MEDIA_STATUSES.FAILED,
      cutoff,
      limit: perStatusLimit,
    }),
  ]);

  const candidates = [
    ...uploadingDocuments.map((document) => ({
      document,
      expectedStatus: MEDIA_STATUSES.UPLOADING,
    })),

    ...failedDocuments.map((document) => ({
      document,
      expectedStatus: MEDIA_STATUSES.FAILED,
    })),
  ];

  const results = [];

  for (const candidate of candidates) {
    const result = await processCandidate({
      ...candidate,
      cutoff,
    });

    results.push(result);
  }

  const summary = results.reduce(
    (currentSummary, result) => {
      currentSummary[result.status] += 1;
      return currentSummary;
    },
    {
      deleted: 0,
      skipped: 0,
      failed: 0,
    },
  );

  return {
    cutoff: cutoff.toDate().toISOString(),
    scanned: candidates.length,
    ...summary,
  };
}
