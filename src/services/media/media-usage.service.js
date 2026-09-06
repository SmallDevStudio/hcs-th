import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/constants/media";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

function createUsageReference({ entityType, entityId, field }) {
  return {
    entityType,
    entityId,
    field,
  };
}

function isSameUsageReference(currentReference, expectedReference) {
  return (
    currentReference?.entityType === expectedReference.entityType &&
    currentReference?.entityId === expectedReference.entityId &&
    currentReference?.field === expectedReference.field
  );
}

function hasUsageReference(mediaData, usageReference) {
  if (!Array.isArray(mediaData?.usedBy)) {
    return false;
  }

  return mediaData.usedBy.some((reference) =>
    isSameUsageReference(reference, usageReference),
  );
}

function createMediaSnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    publicUrl: data.publicUrl || null,
    storagePath: data.storagePath || null,
    originalName: data.originalName || "",
    mimeType: data.mimeType || "",
    width: data.width || null,
    height: data.height || null,

    altText: {
      en: data.altText?.en || "",
      th: data.altText?.th || "",
    },
  };
}

function validateSelectableImage(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("Selected media image was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== MEDIA_STATUSES.ACTIVE) {
    throw new InvalidRequestError("Selected media image is not active");
  }

  if (data.type !== MEDIA_TYPES.IMAGE) {
    throw new InvalidRequestError("Selected media asset must be an image");
  }

  if (!data.publicUrl || !data.storagePath) {
    throw new InvalidRequestError("Selected media image is incomplete");
  }
}

export async function prepareMediaUsageTransition({
  transaction,
  previousMediaId,
  nextMediaId,
  entityType,
  entityId,
  field,
  actor,
}) {
  const previousId = previousMediaId || null;
  const nextId = nextMediaId || null;

  const usageReference = createUsageReference({
    entityType,
    entityId,
    field,
  });

  const mediaIds = [...new Set([previousId, nextId].filter(Boolean))];

  const references = mediaIds.map((mediaId) =>
    adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId),
  );

  const snapshots = references.length
    ? await transaction.getAll(...references)
    : [];

  const snapshotsById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const previousSnapshot = previousId ? snapshotsById.get(previousId) : null;

  const nextSnapshot = nextId ? snapshotsById.get(nextId) : null;

  if (nextId) {
    validateSelectableImage(nextSnapshot);
  }

  const image = nextSnapshot ? createMediaSnapshot(nextSnapshot) : null;

  function apply() {
    if (previousId === nextId) {
      return;
    }

    if (previousSnapshot?.exists) {
      const previousData = previousSnapshot.data();

      const referenceExists = hasUsageReference(previousData, usageReference);

      if (referenceExists) {
        const previousUsageCount = Math.max(
          0,
          Number(previousData.usageCount || 0),
        );

        const nextUsageCount = Math.max(0, previousUsageCount - 1);

        transaction.update(previousSnapshot.ref, {
          usageCount: nextUsageCount,
          isUsed: nextUsageCount > 0,

          usedBy: FieldValue.arrayRemove(usageReference),

          updatedAt: FieldValue.serverTimestamp(),

          updatedBy: actor.uid,
        });
      }
    }

    if (nextSnapshot?.exists) {
      const nextData = nextSnapshot.data();

      const referenceExists = hasUsageReference(nextData, usageReference);

      if (!referenceExists) {
        const nextUsageCount =
          Math.max(0, Number(nextData.usageCount || 0)) + 1;

        transaction.update(nextSnapshot.ref, {
          usageCount: nextUsageCount,
          isUsed: true,

          usedBy: FieldValue.arrayUnion(usageReference),

          updatedAt: FieldValue.serverTimestamp(),

          updatedBy: actor.uid,
        });
      }
    }
  }

  return {
    image,
    apply,
  };
}
