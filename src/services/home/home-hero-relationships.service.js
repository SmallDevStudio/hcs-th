import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/constants/media";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const HOME_SECTION_ENTITY_TYPE =
  AUDIT_ENTITY_TYPES.HOME_SECTION || "homeSection";

export const HOME_HERO_MEDIA_FIELDS = Object.freeze({
  DESKTOP_IMAGE: "desktopImage",
  MOBILE_IMAGE: "mobileImage",
});

function normalizeMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function normalizeMediaIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map(normalizeMediaId).filter(Boolean))];
}

function getHomeHeroRelationshipState(value = {}) {
  return {
    desktopImageMediaId: normalizeMediaId(value.desktopImageMediaId),

    mobileImageMediaId: normalizeMediaId(value.mobileImageMediaId),
  };
}

function createEmptyRelationshipState() {
  return {
    desktopImageMediaId: null,
    mobileImageMediaId: null,
  };
}

function createUsageReference({ homeSectionId, field }) {
  return {
    entityType: HOME_SECTION_ENTITY_TYPE,
    entityId: homeSectionId,
    field,
  };
}

function isHomeSectionUsageReference(reference, homeSectionId) {
  return (
    reference?.entityType === HOME_SECTION_ENTITY_TYPE &&
    reference?.entityId === homeSectionId
  );
}

function isSameUsageReference(firstReference, secondReference) {
  return (
    firstReference?.entityType === secondReference?.entityType &&
    firstReference?.entityId === secondReference?.entityId &&
    firstReference?.field === secondReference?.field
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

    extension: data.extension || "",

    size: Number(data.size || 0),

    width: data.width || null,

    height: data.height || null,

    title: {
      en: data.title?.en || "",
      th: data.title?.th || "",
    },

    altText: {
      en: data.altText?.en || "",
      th: data.altText?.th || "",
    },
  };
}

function validateSelectableImage(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("Selected Home Hero image was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== MEDIA_STATUSES.ACTIVE) {
    throw new InvalidRequestError("Selected Home Hero image is not active");
  }

  if (data.type !== MEDIA_TYPES.IMAGE) {
    throw new InvalidRequestError("Home Hero media asset must be an image");
  }

  if (!data.publicUrl || !data.storagePath) {
    throw new InvalidRequestError("Selected Home Hero image is incomplete");
  }
}

/**
 * สร้างรายการ usage reference ที่ควรมีสำหรับ Media แต่ละรายการ
 *
 * ถ้า Desktop และ Mobile ใช้ Media เดียวกัน จะเก็บเพียงหนึ่ง reference
 * โดยให้ Desktop เป็น field หลัก เพื่อไม่ให้ usageCount ถูกนับซ้ำ
 */
function createDesiredUsageReferences({ state, mediaId, homeSectionId }) {
  if (!mediaId) {
    return [];
  }

  const isDesktopImage = state.desktopImageMediaId === mediaId;

  const isMobileImage = state.mobileImageMediaId === mediaId;

  if (isDesktopImage) {
    return [
      createUsageReference({
        homeSectionId,
        field: HOME_HERO_MEDIA_FIELDS.DESKTOP_IMAGE,
      }),
    ];
  }

  if (isMobileImage) {
    return [
      createUsageReference({
        homeSectionId,
        field: HOME_HERO_MEDIA_FIELDS.MOBILE_IMAGE,
      }),
    ];
  }

  return [];
}

function usageReferencesAreEqual(currentReferences, nextReferences) {
  if (currentReferences.length !== nextReferences.length) {
    return false;
  }

  return currentReferences.every((reference) =>
    nextReferences.some((candidate) =>
      isSameUsageReference(reference, candidate),
    ),
  );
}

function calculateMediaUsageUpdate({
  snapshot,
  homeSectionId,
  desiredReferences,
  actor,
}) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  const currentReferences = Array.isArray(data.usedBy) ? data.usedBy : [];

  const currentHomeSectionReferences = currentReferences.filter((reference) =>
    isHomeSectionUsageReference(reference, homeSectionId),
  );

  const otherReferences = currentReferences.filter(
    (reference) => !isHomeSectionUsageReference(reference, homeSectionId),
  );

  const finalReferences = [...otherReferences, ...desiredReferences];

  const currentUsageCount = Math.max(0, Number(data.usageCount || 0));

  const nextUsageCount = Math.max(
    0,
    currentUsageCount -
      currentHomeSectionReferences.length +
      desiredReferences.length,
  );

  const referencesChanged = !usageReferencesAreEqual(
    currentReferences,
    finalReferences,
  );

  if (!referencesChanged && currentUsageCount === nextUsageCount) {
    return null;
  }

  return {
    reference: snapshot.ref,

    data: {
      usedBy: finalReferences,

      usageCount: nextUsageCount,

      isUsed: nextUsageCount > 0,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    },
  };
}

async function prepareHomeHeroRelationshipTransition({
  transaction,
  homeSectionId,
  previousData,
  nextData,
  actor,
}) {
  if (!transaction) {
    throw new InvalidRequestError(
      "Home Hero relationship transaction is required",
    );
  }

  if (!homeSectionId) {
    throw new InvalidRequestError("Home Hero section ID is required");
  }

  if (!actor?.uid) {
    throw new InvalidRequestError("Home Hero relationship actor is required");
  }

  if (!nextData) {
    throw new InvalidRequestError("Home Hero relationship data is required");
  }

  const previousState = getHomeHeroRelationshipState(previousData);

  const nextState = getHomeHeroRelationshipState(nextData);

  const allMediaIds = normalizeMediaIds([
    previousState.desktopImageMediaId,
    previousState.mobileImageMediaId,
    nextState.desktopImageMediaId,
    nextState.mobileImageMediaId,
  ]);

  const mediaReferences = allMediaIds.map((mediaId) =>
    adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId),
  );

  const snapshots = mediaReferences.length
    ? await transaction.getAll(...mediaReferences)
    : [];

  const snapshotsById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  if (nextState.desktopImageMediaId) {
    validateSelectableImage(snapshotsById.get(nextState.desktopImageMediaId));
  }

  if (nextState.mobileImageMediaId) {
    validateSelectableImage(snapshotsById.get(nextState.mobileImageMediaId));
  }

  const desktopImage = nextState.desktopImageMediaId
    ? createMediaSnapshot(snapshotsById.get(nextState.desktopImageMediaId))
    : null;

  const mobileImage = nextState.mobileImageMediaId
    ? createMediaSnapshot(snapshotsById.get(nextState.mobileImageMediaId))
    : null;

  const mediaUsageUpdates = [];

  for (const mediaId of allMediaIds) {
    const desiredReferences = createDesiredUsageReferences({
      state: nextState,
      mediaId,
      homeSectionId,
    });

    const update = calculateMediaUsageUpdate({
      snapshot: snapshotsById.get(mediaId),

      homeSectionId,

      desiredReferences,

      actor,
    });

    if (update) {
      mediaUsageUpdates.push(update);
    }
  }

  return {
    desktopImage,
    mobileImage,

    previousDesktopImageMediaId: previousState.desktopImageMediaId,

    nextDesktopImageMediaId: nextState.desktopImageMediaId,

    previousMobileImageMediaId: previousState.mobileImageMediaId,

    nextMobileImageMediaId: nextState.mobileImageMediaId,

    desktopImageChanged:
      previousState.desktopImageMediaId !== nextState.desktopImageMediaId,

    mobileImageChanged:
      previousState.mobileImageMediaId !== nextState.mobileImageMediaId,

    imagesChanged:
      previousState.desktopImageMediaId !== nextState.desktopImageMediaId ||
      previousState.mobileImageMediaId !== nextState.mobileImageMediaId,

    apply() {
      for (const update of mediaUsageUpdates) {
        transaction.update(update.reference, update.data);
      }
    },
  };
}

export async function prepareHomeHeroRelationships({
  transaction,
  homeSectionId,
  previousData = {},
  nextData,
  actor,
}) {
  return prepareHomeHeroRelationshipTransition({
    transaction,
    homeSectionId,
    previousData,
    nextData,
    actor,
  });
}

export async function prepareHomeHeroRelationshipRelease({
  transaction,
  homeSectionId,
  homeSectionData,
  actor,
}) {
  if (!homeSectionData) {
    throw new InvalidRequestError(
      "Home Hero data is required to release relationships",
    );
  }

  return prepareHomeHeroRelationshipTransition({
    transaction,

    homeSectionId,

    previousData: homeSectionData,

    nextData: createEmptyRelationshipState(),

    actor,
  });
}

export async function prepareHomeHeroRelationshipRestore({
  transaction,
  homeSectionId,
  homeSectionData,
  actor,
}) {
  if (!homeSectionData) {
    throw new InvalidRequestError(
      "Home Hero data is required to restore relationships",
    );
  }

  return prepareHomeHeroRelationshipTransition({
    transaction,

    homeSectionId,

    previousData: createEmptyRelationshipState(),

    nextData: homeSectionData,

    actor,
  });
}
