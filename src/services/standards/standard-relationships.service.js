import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { CATEGORY_STATUSES } from "@/constants/categories";
import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/constants/media";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const STANDARD_ENTITY_TYPE = AUDIT_ENTITY_TYPES.STANDARD || "standard";

export const STANDARD_MEDIA_FIELDS = Object.freeze({
  DOCUMENT: "document",
});

function normalizeId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function normalizeIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map(normalizeId).filter(Boolean))];
}

function getStandardRelationshipState(value = {}) {
  return {
    documentMediaId: normalizeId(value.documentMediaId),

    relatedCategoryIds: normalizeIds(value.relatedCategoryIds),

    relatedProductIds: normalizeIds(value.relatedProductIds),
  };
}

function createEmptyRelationshipState() {
  return {
    documentMediaId: null,
    relatedCategoryIds: [],
    relatedProductIds: [],
  };
}

function createUsageReference({ standardId }) {
  return {
    entityType: STANDARD_ENTITY_TYPE,
    entityId: standardId,
    field: STANDARD_MEDIA_FIELDS.DOCUMENT,
  };
}

function isSameUsageReference(firstReference, secondReference) {
  return (
    firstReference?.entityType === secondReference?.entityType &&
    firstReference?.entityId === secondReference?.entityId &&
    firstReference?.field === secondReference?.field
  );
}

function isStandardUsageReference(reference, standardId) {
  return (
    reference?.entityType === STANDARD_ENTITY_TYPE &&
    reference?.entityId === standardId
  );
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

function createProductSnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    slug: data.slug || "",

    model: data.model || "",

    sku: data.sku || "",

    name: {
      en: data.name?.en || "",
      th: data.name?.th || "",
    },

    category: data.category
      ? {
          id: data.category.id || null,

          slug: data.category.slug || "",

          name: {
            en: data.category.name?.en || "",

            th: data.category.name?.th || "",
          },
        }
      : null,

    primaryImage: data.primaryImage || null,
  };
}

function validateDocumentMedia(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("Selected standard document was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== MEDIA_STATUSES.ACTIVE) {
    throw new InvalidRequestError("Selected standard document is not active");
  }

  if (data.type !== MEDIA_TYPES.DOCUMENT) {
    throw new InvalidRequestError(
      "Standard document must contain a document file",
    );
  }

  if (!data.publicUrl || !data.storagePath) {
    throw new InvalidRequestError("Selected standard document is incomplete");
  }
}

function validateCategory(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("A selected product category was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== CATEGORY_STATUSES.ACTIVE) {
    throw new InvalidRequestError("A selected product category is not active");
  }
}

function validateProduct(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("A selected product was not found");
  }

  if (snapshot.data()?.isDeleted) {
    throw new InvalidRequestError("A selected product has been deleted");
  }
}

function calculateDocumentUsageUpdate({
  snapshot,
  standardId,
  shouldUseDocument,
  actor,
}) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  const currentReferences = Array.isArray(data.usedBy) ? data.usedBy : [];

  const standardReferences = currentReferences.filter((reference) =>
    isStandardUsageReference(reference, standardId),
  );

  const otherReferences = currentReferences.filter(
    (reference) => !isStandardUsageReference(reference, standardId),
  );

  const nextStandardReferences = shouldUseDocument
    ? [
        createUsageReference({
          standardId,
        }),
      ]
    : [];

  const finalReferences = [...otherReferences, ...nextStandardReferences];

  const currentUsageCount = Math.max(0, Number(data.usageCount || 0));

  const nextUsageCount = Math.max(
    0,
    currentUsageCount -
      standardReferences.length +
      nextStandardReferences.length,
  );

  const referencesChanged =
    currentReferences.length !== finalReferences.length ||
    currentReferences.some(
      (reference) =>
        !finalReferences.some((candidate) =>
          isSameUsageReference(reference, candidate),
        ),
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

async function prepareStandardRelationshipTransition({
  transaction,
  standardId,
  previousData,
  nextData,
  actor,
}) {
  if (!transaction) {
    throw new InvalidRequestError(
      "Standard relationship transaction is required",
    );
  }

  if (!standardId) {
    throw new InvalidRequestError("Standard ID is required");
  }

  if (!actor?.uid) {
    throw new InvalidRequestError("Standard relationship actor is required");
  }

  if (!nextData) {
    throw new InvalidRequestError("Standard relationship data is required");
  }

  const previousState = getStandardRelationshipState(previousData);

  const nextState = getStandardRelationshipState(nextData);

  const allMediaIds = normalizeIds([
    previousState.documentMediaId,
    nextState.documentMediaId,
  ]);

  const allCategoryIds = normalizeIds([
    ...previousState.relatedCategoryIds,
    ...nextState.relatedCategoryIds,
  ]);

  const allProductIds = normalizeIds([
    ...previousState.relatedProductIds,
    ...nextState.relatedProductIds,
  ]);

  const mediaReferences = allMediaIds.map((mediaId) =>
    adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId),
  );

  const categoryReferences = allCategoryIds.map((categoryId) =>
    adminDb.collection(COLLECTIONS.CATEGORIES).doc(categoryId),
  );

  const productReferences = allProductIds.map((productId) =>
    adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId),
  );

  const allReferences = [
    ...mediaReferences,
    ...categoryReferences,
    ...productReferences,
  ];

  const snapshots = allReferences.length
    ? await transaction.getAll(...allReferences)
    : [];

  const snapshotsByPath = new Map(
    snapshots.map((snapshot) => [snapshot.ref.path, snapshot]),
  );

  function getSnapshot(reference) {
    return snapshotsByPath.get(reference.path);
  }

  const mediaSnapshotsById = new Map(
    mediaReferences.map((reference) => [reference.id, getSnapshot(reference)]),
  );

  const categorySnapshotsById = new Map(
    categoryReferences.map((reference) => [
      reference.id,
      getSnapshot(reference),
    ]),
  );

  const productSnapshotsById = new Map(
    productReferences.map((reference) => [
      reference.id,
      getSnapshot(reference),
    ]),
  );

  if (nextState.documentMediaId) {
    validateDocumentMedia(mediaSnapshotsById.get(nextState.documentMediaId));
  }

  for (const categoryId of nextState.relatedCategoryIds) {
    validateCategory(categorySnapshotsById.get(categoryId));
  }

  for (const productId of nextState.relatedProductIds) {
    validateProduct(productSnapshotsById.get(productId));
  }

  const document = nextState.documentMediaId
    ? createMediaSnapshot(mediaSnapshotsById.get(nextState.documentMediaId))
    : null;

  const categories = nextState.relatedCategoryIds
    .map((categoryId) =>
      createCategorySnapshot(categorySnapshotsById.get(categoryId)),
    )
    .filter(Boolean);

  const products = nextState.relatedProductIds
    .map((productId) =>
      createProductSnapshot(productSnapshotsById.get(productId)),
    )
    .filter(Boolean);

  const mediaUsageUpdates = [];

  for (const mediaId of allMediaIds) {
    const update = calculateDocumentUsageUpdate({
      snapshot: mediaSnapshotsById.get(mediaId),

      standardId,

      shouldUseDocument: nextState.documentMediaId === mediaId,

      actor,
    });

    if (update) {
      mediaUsageUpdates.push(update);
    }
  }

  return {
    document,
    categories,
    products,

    previousDocumentMediaId: previousState.documentMediaId,

    nextDocumentMediaId: nextState.documentMediaId,

    previousCategoryIds: previousState.relatedCategoryIds,

    nextCategoryIds: nextState.relatedCategoryIds,

    previousProductIds: previousState.relatedProductIds,

    nextProductIds: nextState.relatedProductIds,

    documentChanged:
      previousState.documentMediaId !== nextState.documentMediaId,

    categoriesChanged:
      JSON.stringify(previousState.relatedCategoryIds) !==
      JSON.stringify(nextState.relatedCategoryIds),

    productsChanged:
      JSON.stringify(previousState.relatedProductIds) !==
      JSON.stringify(nextState.relatedProductIds),

    apply() {
      for (const update of mediaUsageUpdates) {
        transaction.update(update.reference, update.data);
      }
    },
  };
}

export async function prepareStandardRelationships({
  transaction,
  standardId,
  previousData = {},
  nextData,
  actor,
}) {
  return prepareStandardRelationshipTransition({
    transaction,
    standardId,
    previousData,
    nextData,
    actor,
  });
}

export async function prepareStandardRelationshipRelease({
  transaction,
  standardId,
  standardData,
  actor,
}) {
  if (!standardData) {
    throw new InvalidRequestError(
      "Standard data is required to release relationships",
    );
  }

  return prepareStandardRelationshipTransition({
    transaction,

    standardId,

    previousData: standardData,

    nextData: createEmptyRelationshipState(),

    actor,
  });
}

export async function prepareStandardRelationshipRestore({
  transaction,
  standardId,
  standardData,
  actor,
}) {
  if (!standardData) {
    throw new InvalidRequestError(
      "Standard data is required to restore relationships",
    );
  }

  return prepareStandardRelationshipTransition({
    transaction,

    standardId,

    previousData: createEmptyRelationshipState(),

    nextData: standardData,

    actor,
  });
}
