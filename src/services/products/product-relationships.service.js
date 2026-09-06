import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { CATEGORY_STATUSES } from "@/constants/categories";
import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/constants/media";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const PRODUCT_ENTITY_TYPE = AUDIT_ENTITY_TYPES.PRODUCT;

export const PRODUCT_MEDIA_FIELDS = Object.freeze({
  PRIMARY_IMAGE: "primaryImage",
  GALLERY: "gallery",
  DOCUMENTS: "documents",
});

function uniqueValues(values = []) {
  return [
    ...new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : value))
        .filter(Boolean),
    ),
  ];
}

function normalizeMediaIds(value) {
  return uniqueValues(Array.isArray(value) ? value : []);
}

function getRelationshipState(value = {}) {
  return {
    categoryId:
      typeof value.categoryId === "string" && value.categoryId.trim()
        ? value.categoryId.trim()
        : null,

    primaryImageMediaId:
      typeof value.primaryImageMediaId === "string" &&
      value.primaryImageMediaId.trim()
        ? value.primaryImageMediaId.trim()
        : null,

    galleryMediaIds: normalizeMediaIds(value.galleryMediaIds),

    documentMediaIds: normalizeMediaIds(value.documentMediaIds),
  };
}

function createEmptyRelationshipState() {
  return {
    categoryId: null,
    primaryImageMediaId: null,
    galleryMediaIds: [],
    documentMediaIds: [],
  };
}

function getStateMediaIds(state) {
  return uniqueValues([
    state.primaryImageMediaId,
    ...state.galleryMediaIds,
    ...state.documentMediaIds,
  ]);
}

function createUsageReference({ productId, field }) {
  return {
    entityType: PRODUCT_ENTITY_TYPE,
    entityId: productId,
    field,
  };
}

function isSameUsageReference(first, second) {
  return (
    first?.entityType === second?.entityType &&
    first?.entityId === second?.entityId &&
    first?.field === second?.field
  );
}

function isProductUsageReference(reference, productId) {
  return (
    reference?.entityType === PRODUCT_ENTITY_TYPE &&
    reference?.entityId === productId
  );
}

function containsUsageReference(references, expectedReference) {
  return references.some((reference) =>
    isSameUsageReference(reference, expectedReference),
  );
}

function createCategorySnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    slug: data.slug || "",

    name: {
      en: data.name?.en || "",
      th: data.name?.th || "",
    },
  };
}

function createMediaSnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    type: data.type || null,

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

function validateCategory(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("Selected product category was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== CATEGORY_STATUSES.ACTIVE) {
    throw new InvalidRequestError("Selected product category is not active");
  }
}

function validateMediaAsset({ snapshot, expectedType, field }) {
  if (!snapshot?.exists) {
    throw new NotFoundError(`Selected media asset for ${field} was not found`);
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== MEDIA_STATUSES.ACTIVE) {
    throw new InvalidRequestError(
      `Selected media asset for ${field} is not active`,
    );
  }

  if (data.type !== expectedType) {
    throw new InvalidRequestError(
      expectedType === MEDIA_TYPES.IMAGE
        ? `${field} must contain image files only`
        : `${field} must contain document files only`,
    );
  }

  if (!data.publicUrl || !data.storagePath) {
    throw new InvalidRequestError(
      `Selected media asset for ${field} is incomplete`,
    );
  }
}

function buildDesiredReferences({ state, productId }) {
  const referencesByMediaId = new Map();

  function addReference(mediaId, field) {
    if (!mediaId) {
      return;
    }

    const currentReferences = referencesByMediaId.get(mediaId) || [];

    const usageReference = createUsageReference({
      productId,
      field,
    });

    if (!containsUsageReference(currentReferences, usageReference)) {
      currentReferences.push(usageReference);
    }

    referencesByMediaId.set(mediaId, currentReferences);
  }

  addReference(state.primaryImageMediaId, PRODUCT_MEDIA_FIELDS.PRIMARY_IMAGE);

  for (const mediaId of state.galleryMediaIds) {
    addReference(mediaId, PRODUCT_MEDIA_FIELDS.GALLERY);
  }

  for (const mediaId of state.documentMediaIds) {
    addReference(mediaId, PRODUCT_MEDIA_FIELDS.DOCUMENTS);
  }

  return referencesByMediaId;
}

function getExpectedMediaType(field) {
  if (field === PRODUCT_MEDIA_FIELDS.DOCUMENTS) {
    return MEDIA_TYPES.DOCUMENT;
  }

  return MEDIA_TYPES.IMAGE;
}

function validateDesiredMedia({ referencesByMediaId, snapshotsById }) {
  for (const [mediaId, references] of referencesByMediaId) {
    const snapshot = snapshotsById.get(mediaId);

    for (const reference of references) {
      validateMediaAsset({
        snapshot,
        expectedType: getExpectedMediaType(reference.field),
        field: reference.field,
      });
    }
  }
}

function createRelationshipSnapshots({ state, snapshotsById }) {
  const primaryImage = state.primaryImageMediaId
    ? createMediaSnapshot(snapshotsById.get(state.primaryImageMediaId))
    : null;

  const gallery = state.galleryMediaIds
    .map((mediaId) => createMediaSnapshot(snapshotsById.get(mediaId)))
    .filter(Boolean);

  const documents = state.documentMediaIds
    .map((mediaId) => createMediaSnapshot(snapshotsById.get(mediaId)))
    .filter(Boolean);

  return {
    primaryImage,
    gallery,
    documents,
  };
}

function calculateMediaUsageUpdate({
  snapshot,
  productId,
  desiredReferences,
  actor,
}) {
  const mediaData = snapshot.data();

  const currentReferences = Array.isArray(mediaData.usedBy)
    ? mediaData.usedBy
    : [];

  const productReferences = currentReferences.filter((reference) =>
    isProductUsageReference(reference, productId),
  );

  const otherReferences = currentReferences.filter(
    (reference) => !isProductUsageReference(reference, productId),
  );

  const uniqueDesiredReferences = desiredReferences.filter(
    (reference, index, references) =>
      references.findIndex((candidate) =>
        isSameUsageReference(candidate, reference),
      ) === index,
  );

  const finalReferences = [...otherReferences, ...uniqueDesiredReferences];

  const currentUsageCount = Math.max(0, Number(mediaData.usageCount || 0));

  const removedCount = productReferences.filter(
    (reference) => !containsUsageReference(uniqueDesiredReferences, reference),
  ).length;

  const addedCount = uniqueDesiredReferences.filter(
    (reference) => !containsUsageReference(productReferences, reference),
  ).length;

  const nextUsageCount = Math.max(
    0,
    currentUsageCount - removedCount + addedCount,
  );

  return {
    usedBy: finalReferences,

    usageCount: nextUsageCount,

    isUsed: nextUsageCount > 0,

    updatedAt: FieldValue.serverTimestamp(),

    updatedBy: actor.uid,
  };
}

function applyCategoryCountTransition({
  transaction,
  previousCategorySnapshot,
  nextCategorySnapshot,
  previousCategoryId,
  nextCategoryId,
  actor,
}) {
  if (previousCategoryId === nextCategoryId) {
    return;
  }

  if (previousCategorySnapshot?.exists) {
    const previousData = previousCategorySnapshot.data();

    const previousCount = Math.max(0, Number(previousData.productCount || 0));

    transaction.update(previousCategorySnapshot.ref, {
      productCount: Math.max(0, previousCount - 1),

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });
  }

  if (nextCategorySnapshot?.exists) {
    transaction.update(nextCategorySnapshot.ref, {
      productCount: FieldValue.increment(1),

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });
  }
}

async function prepareRelationshipTransition({
  transaction,
  productId,
  previousState,
  nextState,
  actor,
  validateNextRelationships,
}) {
  const categoryIds = uniqueValues([
    previousState.categoryId,
    nextState.categoryId,
  ]);

  const categoryReferences = categoryIds.map((categoryId) =>
    adminDb.collection(COLLECTIONS.CATEGORIES).doc(categoryId),
  );

  const previousMediaIds = getStateMediaIds(previousState);
  const nextMediaIds = getStateMediaIds(nextState);

  const allMediaIds = uniqueValues([...previousMediaIds, ...nextMediaIds]);

  const mediaReferences = allMediaIds.map((mediaId) =>
    adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId),
  );

  const allReferences = [...categoryReferences, ...mediaReferences];

  /*
   * Firestore transaction กำหนดให้การอ่านทั้งหมด
   * ต้องเกิดขึ้นก่อน transaction writes
   */
  const snapshots = allReferences.length
    ? await transaction.getAll(...allReferences)
    : [];

  const categorySnapshots = snapshots.slice(0, categoryReferences.length);

  const mediaSnapshots = snapshots.slice(categoryReferences.length);

  const categorySnapshotsById = new Map(
    categorySnapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const mediaSnapshotsById = new Map(
    mediaSnapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const previousCategorySnapshot = previousState.categoryId
    ? categorySnapshotsById.get(previousState.categoryId)
    : null;

  const nextCategorySnapshot = nextState.categoryId
    ? categorySnapshotsById.get(nextState.categoryId)
    : null;

  const desiredReferencesByMediaId = buildDesiredReferences({
    state: nextState,
    productId,
  });

  if (validateNextRelationships) {
    if (!nextState.categoryId) {
      throw new InvalidRequestError("Product category is required");
    }

    validateCategory(nextCategorySnapshot);

    validateDesiredMedia({
      referencesByMediaId: desiredReferencesByMediaId,
      snapshotsById: mediaSnapshotsById,
    });
  }

  const relationshipSnapshots = createRelationshipSnapshots({
    state: nextState,
    snapshotsById: mediaSnapshotsById,
  });

  function apply() {
    applyCategoryCountTransition({
      transaction,

      previousCategorySnapshot,
      nextCategorySnapshot,

      previousCategoryId: previousState.categoryId,
      nextCategoryId: nextState.categoryId,

      actor,
    });

    for (const mediaId of allMediaIds) {
      const snapshot = mediaSnapshotsById.get(mediaId);

      /*
       * ตอน release หาก media ถูก hard delete ไปแล้ว
       * จะข้ามได้โดยไม่ทำให้ Product soft delete ล้มเหลว
       *
       * ตอน create/update/restore ถูก validate ไว้ก่อนแล้ว
       */
      if (!snapshot?.exists) {
        continue;
      }

      const desiredReferences = desiredReferencesByMediaId.get(mediaId) || [];

      const usageUpdate = calculateMediaUsageUpdate({
        snapshot,
        productId,
        desiredReferences,
        actor,
      });

      transaction.update(snapshot.ref, usageUpdate);
    }
  }

  return {
    category: createCategorySnapshot(nextCategorySnapshot),

    primaryImage: relationshipSnapshots.primaryImage,

    gallery: relationshipSnapshots.gallery,

    documents: relationshipSnapshots.documents,

    previousState,
    nextState,

    categoryChanged: previousState.categoryId !== nextState.categoryId,

    mediaChanged:
      JSON.stringify(previousMediaIds) !== JSON.stringify(nextMediaIds),

    apply,
  };
}

export async function prepareProductRelationships({
  transaction,
  productId,
  previousData = {},
  nextData,
  actor,
}) {
  if (!nextData) {
    throw new InvalidRequestError("Product relationship data is required");
  }

  return prepareRelationshipTransition({
    transaction,
    productId,

    previousState: getRelationshipState(previousData),

    nextState: getRelationshipState(nextData),

    actor,

    validateNextRelationships: true,
  });
}

export async function prepareProductRelationshipRelease({
  transaction,
  productId,
  productData,
  actor,
}) {
  if (!productData) {
    throw new InvalidRequestError(
      "Product data is required to release relationships",
    );
  }

  return prepareRelationshipTransition({
    transaction,
    productId,

    previousState: getRelationshipState(productData),

    nextState: createEmptyRelationshipState(),

    actor,

    /*
     * Release ไม่ต้องบังคับให้ Category หรือ Media ยัง active
     * เพราะเป้าหมายคือถอด reference ที่เหลืออยู่ออก
     */
    validateNextRelationships: false,
  });
}

export async function prepareProductRelationshipRestore({
  transaction,
  productId,
  productData,
  actor,
}) {
  if (!productData) {
    throw new InvalidRequestError(
      "Product data is required to restore relationships",
    );
  }

  return prepareRelationshipTransition({
    transaction,
    productId,

    previousState: createEmptyRelationshipState(),

    nextState: getRelationshipState(productData),

    actor,

    /*
     * Restore ต้องตรวจ Category, Media และชนิดไฟล์ทั้งหมดใหม่
     * เพื่อไม่คืน Product ที่อ้างอิงข้อมูลซึ่งใช้ไม่ได้แล้ว
     */
    validateNextRelationships: true,
  });
}
