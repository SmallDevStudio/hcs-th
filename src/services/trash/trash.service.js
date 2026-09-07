import "server-only";

import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STORAGE_ROOT } from "@/constants/media";
import {
  TRASH_RETENTION_DAYS,
  getTrashCollection,
  isTrashEntityType,
} from "@/constants/trash";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareMediaUsageTransition } from "@/services/media/media-usage.service";
import {
  prepareProductRelationshipRelease,
  prepareProductRelationshipRestore,
} from "@/services/products/product-relationships.service";

const IMAGE_USAGE_ENTITY_TYPES = new Set([
  AUDIT_ENTITY_TYPES.CATEGORY || "category",

  AUDIT_ENTITY_TYPES.SOLUTION || "solution",
]);

const PRODUCT_ENTITY_TYPE = AUDIT_ENTITY_TYPES.PRODUCT || "product";

function serializeFirestoreValue(value) {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [
        key,
        serializeFirestoreValue(childValue),
      ]),
    );
  }

  return value;
}

function createTrashId(entityType, entityId) {
  return `${entityType}--${entityId}`;
}

function createExpirationDate() {
  const expirationDate = new Date();

  expirationDate.setUTCDate(expirationDate.getUTCDate() + TRASH_RETENTION_DAYS);

  return Timestamp.fromDate(expirationDate);
}

function encodeCursor({ deletedAt, documentId }) {
  return Buffer.from(
    JSON.stringify({
      deletedAt,
      documentId,
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      typeof decoded.deletedAt !== "string" ||
      typeof decoded.documentId !== "string" ||
      !decoded.documentId ||
      Number.isNaN(new Date(decoded.deletedAt).getTime())
    ) {
      throw new Error("Invalid cursor");
    }

    return decoded;
  } catch {
    throw new InvalidRequestError("Invalid trash cursor");
  }
}

function getMediaStoragePath(trashData) {
  if (trashData.entityType !== AUDIT_ENTITY_TYPES.MEDIA) {
    return null;
  }

  const storagePath = trashData.originalData?.storagePath;

  if (
    typeof storagePath !== "string" ||
    !storagePath.startsWith(`${MEDIA_STORAGE_ROOT}/`)
  ) {
    throw new InvalidRequestError(
      "Media trash item has an invalid storage path",
    );
  }

  return storagePath;
}

function getEntityImageMediaId({ entityType, data }) {
  if (!IMAGE_USAGE_ENTITY_TYPES.has(entityType)) {
    return null;
  }

  if (typeof data?.imageMediaId !== "string" || !data.imageMediaId.trim()) {
    return null;
  }

  return data.imageMediaId.trim();
}

function getProductRelationshipMetadata(data = {}) {
  if (!data) {
    return null;
  }

  return {
    categoryId: data.categoryId || null,

    primaryImageMediaId: data.primaryImageMediaId || null,

    galleryMediaIds: Array.isArray(data.galleryMediaIds)
      ? data.galleryMediaIds
      : [],

    documentMediaIds: Array.isArray(data.documentMediaIds)
      ? data.documentMediaIds
      : [],
  };
}

async function prepareImageUsageRelease({
  transaction,
  entityType,
  entityId,
  sourceData,
  actor,
}) {
  const imageMediaId = getEntityImageMediaId({
    entityType,
    data: sourceData,
  });

  if (!imageMediaId) {
    return null;
  }

  return prepareMediaUsageTransition({
    transaction,

    previousMediaId: imageMediaId,
    nextMediaId: null,

    entityType,
    entityId,
    field: "image",

    actor,
  });
}

async function prepareImageUsageRestore({
  transaction,
  entityType,
  entityId,
  originalData,
  actor,
}) {
  const imageMediaId = getEntityImageMediaId({
    entityType,
    data: originalData,
  });

  if (!imageMediaId) {
    return null;
  }

  try {
    return await prepareMediaUsageTransition({
      transaction,

      previousMediaId: null,
      nextMediaId: imageMediaId,

      entityType,
      entityId,
      field: "image",

      actor,
    });
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof InvalidRequestError
    ) {
      throw new ConflictError(
        "The image used by this item is no longer available. Restore the media item first.",
        {
          imageMediaId,
        },
      );
    }

    throw error;
  }
}

async function prepareEntityRelationshipRelease({
  transaction,
  entityType,
  entityId,
  sourceData,
  actor,
}) {
  if (entityType === PRODUCT_ENTITY_TYPE) {
    const transition = await prepareProductRelationshipRelease({
      transaction,

      productId: entityId,
      productData: sourceData,

      actor,
    });

    return {
      type: "product",
      transition,
    };
  }

  const transition = await prepareImageUsageRelease({
    transaction,
    entityType,
    entityId,
    sourceData,
    actor,
  });

  return {
    type: transition ? "image" : null,
    transition,
  };
}

async function prepareEntityRelationshipRestore({
  transaction,
  entityType,
  entityId,
  originalData,
  actor,
}) {
  if (entityType === PRODUCT_ENTITY_TYPE) {
    try {
      const transition = await prepareProductRelationshipRestore({
        transaction,

        productId: entityId,
        productData: originalData,

        actor,
      });

      return {
        type: "product",
        transition,
      };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof InvalidRequestError
      ) {
        throw new ConflictError(
          "This product cannot be restored because its category or media is no longer available. Restore the related items first.",
          {
            relationships: getProductRelationshipMetadata(originalData),
          },
        );
      }

      throw error;
    }
  }

  const transition = await prepareImageUsageRestore({
    transaction,
    entityType,
    entityId,
    originalData,
    actor,
  });

  return {
    type: transition ? "image" : null,
    transition,
  };
}

function createRestoredData({ entityType, originalData, relationship }) {
  if (
    entityType !== PRODUCT_ENTITY_TYPE ||
    relationship?.type !== "product" ||
    !relationship.transition
  ) {
    return originalData;
  }

  return {
    ...originalData,

    category: relationship.transition.category,

    primaryImage: relationship.transition.primaryImage,

    gallery: relationship.transition.gallery,

    documents: relationship.transition.documents,
  };
}

async function markPermanentDeletionStarted({ trashReference, actor }) {
  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(trashReference);

    if (!snapshot.exists) {
      throw new NotFoundError("Trash item not found");
    }

    transaction.update(trashReference, {
      permanentDeletion: {
        status: "processing",

        requestedBy: {
          uid: actor.uid,
          email: actor.email || "",
          displayName: actor.displayName || "",
          role: actor.role || "",
        },

        requestedAt: FieldValue.serverTimestamp(),

        error: null,
      },
    });
  });
}

async function markPermanentDeletionFailed({ trashReference, actor, error }) {
  try {
    await trashReference.set(
      {
        permanentDeletion: {
          status: "failed",

          requestedBy: {
            uid: actor.uid,
            email: actor.email || "",
            displayName: actor.displayName || "",
            role: actor.role || "",
          },

          requestedAt: FieldValue.serverTimestamp(),

          failedAt: FieldValue.serverTimestamp(),

          error:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Unable to delete the storage object",
        },
      },
      {
        merge: true,
      },
    );
  } catch (updateError) {
    console.error("Unable to record permanent deletion failure:", updateError);
  }
}

async function deleteMediaStorageObject(storagePath) {
  if (!storagePath) {
    return;
  }

  await adminBucket.file(storagePath).delete({
    ignoreNotFound: true,
  });
}

export async function softDeleteEntity({
  entityType,
  entityId,
  actor,
  requestMetadata = {},
}) {
  if (!isTrashEntityType(entityType)) {
    throw new InvalidRequestError("Unsupported trash entity type");
  }

  const collectionName = getTrashCollection(entityType);

  const sourceReference = adminDb.collection(collectionName).doc(entityId);

  const trashReference = adminDb
    .collection(COLLECTIONS.TRASH)
    .doc(createTrashId(entityType, entityId));

  await adminDb.runTransaction(async (transaction) => {
    const [sourceSnapshot, trashSnapshot] = await Promise.all([
      transaction.get(sourceReference),
      transaction.get(trashReference),
    ]);

    if (!sourceSnapshot.exists) {
      throw new NotFoundError("Source document not found");
    }

    if (trashSnapshot.exists) {
      throw new ConflictError("This document is already in trash");
    }

    const sourceData = sourceSnapshot.data();

    if (sourceData.isDeleted) {
      throw new ConflictError("This document is already deleted");
    }

    /*
     * อ่าน Category และ Media ทั้งหมดก่อนเริ่ม write
     */
    const relationship = await prepareEntityRelationshipRelease({
      transaction,

      entityType,
      entityId,
      sourceData,

      actor,
    });

    transaction.set(trashReference, {
      entityType,
      entityId,

      sourceCollection: collectionName,

      displayName:
        sourceData.name?.en ||
        sourceData.title?.en ||
        sourceData.displayName?.en ||
        sourceData.originalName ||
        sourceData.name ||
        sourceData.title ||
        entityId,

      originalData: sourceData,

      deletedBy: {
        uid: actor.uid,
        email: actor.email || "",
        displayName: actor.displayName || "",
        role: actor.role || "",
      },

      deletedAt: FieldValue.serverTimestamp(),

      expiresAt: createExpirationDate(),

      permanentDeletion: null,

      relationshipsReleased: Boolean(relationship.transition),

      relationshipType: relationship.type || null,

      mediaUsageReleased: Boolean(relationship.transition),
    });

    transaction.update(sourceReference, {
      isDeleted: true,

      deletedAt: FieldValue.serverTimestamp(),

      deletedBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });

    relationship.transition?.apply();

    await writeAuditLog({
      actor,

      action: `${entityType.toUpperCase()}_DELETE`,

      entityType,
      entityId,

      before: sourceData,

      after: {
        ...sourceData,

        isDeleted: true,
        deletedBy: actor.uid,
      },

      metadata: {
        ...requestMetadata,

        imageMediaId: getEntityImageMediaId({
          entityType,
          data: sourceData,
        }),

        productRelationships:
          entityType === PRODUCT_ENTITY_TYPE
            ? getProductRelationshipMetadata(sourceData)
            : null,

        relationshipType: relationship.type || null,

        relationshipsReleased: Boolean(relationship.transition),
      },

      transaction,
    });
  });

  return {
    trashId: trashReference.id,

    entityType,
    entityId,
  };
}

export async function getTrashItems({ limit, cursor, entityType }) {
  let query = adminDb.collection(COLLECTIONS.TRASH);

  if (entityType) {
    query = query.where("entityType", "==", entityType);
  }

  query = query
    .orderBy("deletedAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");

  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    query = query.startAfter(
      Timestamp.fromDate(new Date(decodedCursor.deletedAt)),

      decodedCursor.documentId,
    );
  }

  const snapshot = await query.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;

  const visibleDocuments = hasMore
    ? snapshot.docs.slice(0, limit)
    : snapshot.docs;

  const items = visibleDocuments.map((document) => ({
    id: document.id,

    ...serializeFirestoreValue(document.data()),
  }));

  const lastDocument = visibleDocuments[visibleDocuments.length - 1];

  const deletedAt = lastDocument?.get("deletedAt");

  const nextCursor =
    hasMore && lastDocument && deletedAt
      ? encodeCursor({
          deletedAt: deletedAt.toDate().toISOString(),

          documentId: lastDocument.id,
        })
      : null;

  return {
    items,

    pagination: {
      limit,
      count: items.length,
      hasMore,
      nextCursor,
    },
  };
}

export async function restoreTrashItem({
  trashId,
  actor,
  requestMetadata = {},
}) {
  const trashReference = adminDb.collection(COLLECTIONS.TRASH).doc(trashId);

  let restoredResult = null;

  await adminDb.runTransaction(async (transaction) => {
    const trashSnapshot = await transaction.get(trashReference);

    if (!trashSnapshot.exists) {
      throw new NotFoundError("Trash item not found");
    }

    const trashData = trashSnapshot.data();

    if (trashData.permanentDeletion) {
      throw new ConflictError(
        "Permanent deletion has already started for this item",
      );
    }

    if (
      !isTrashEntityType(trashData.entityType) ||
      !trashData.entityId ||
      !trashData.originalData
    ) {
      throw new InvalidRequestError("Trash item data is invalid");
    }

    const sourceCollection = getTrashCollection(trashData.entityType);

    const sourceReference = adminDb
      .collection(sourceCollection)
      .doc(trashData.entityId);

    const sourceSnapshot = await transaction.get(sourceReference);

    if (sourceSnapshot.exists && !sourceSnapshot.data()?.isDeleted) {
      throw new ConflictError("An active document with this ID already exists");
    }

    /*
     * Restore Product จะตรวจ Category และ Media
     * ก่อนเริ่ม transaction writes
     */
    const relationship = await prepareEntityRelationshipRestore({
      transaction,

      entityType: trashData.entityType,

      entityId: trashData.entityId,

      originalData: trashData.originalData,

      actor,
    });

    const restoredOriginalData = createRestoredData({
      entityType: trashData.entityType,

      originalData: trashData.originalData,

      relationship,
    });

    transaction.set(
      sourceReference,
      {
        ...restoredOriginalData,

        isDeleted: false,
        deletedAt: null,
        deletedBy: null,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,

        restoredAt: FieldValue.serverTimestamp(),

        restoredBy: actor.uid,
      },
      {
        merge: false,
      },
    );

    relationship.transition?.apply();

    transaction.delete(trashReference);

    await writeAuditLog({
      actor,

      action: `${trashData.entityType.toUpperCase()}_RESTORE`,

      entityType: trashData.entityType,

      entityId: trashData.entityId,

      before: {
        isDeleted: true,
      },

      after: {
        ...restoredOriginalData,

        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },

      metadata: {
        ...requestMetadata,

        trashId,

        imageMediaId: getEntityImageMediaId({
          entityType: trashData.entityType,

          data: restoredOriginalData,
        }),

        productRelationships:
          trashData.entityType === PRODUCT_ENTITY_TYPE
            ? getProductRelationshipMetadata(restoredOriginalData)
            : null,

        relationshipType: relationship.type || null,

        relationshipsRestored: Boolean(relationship.transition),
      },

      transaction,
    });

    restoredResult = {
      entityType: trashData.entityType,

      entityId: trashData.entityId,
    };
  });

  return restoredResult;
}

export async function permanentlyDeleteTrashItem({
  trashId,
  actor,
  requestMetadata = {},
}) {
  const trashReference = adminDb.collection(COLLECTIONS.TRASH).doc(trashId);

  const initialSnapshot = await trashReference.get();

  if (!initialSnapshot.exists) {
    throw new NotFoundError("Trash item not found");
  }

  const initialTrashData = initialSnapshot.data();

  if (
    !isTrashEntityType(initialTrashData.entityType) ||
    !initialTrashData.entityId
  ) {
    throw new InvalidRequestError("Trash item data is invalid");
  }

  const storagePath = getMediaStoragePath(initialTrashData);

  await markPermanentDeletionStarted({
    trashReference,
    actor,
  });

  if (storagePath) {
    try {
      await deleteMediaStorageObject(storagePath);
    } catch (error) {
      await markPermanentDeletionFailed({
        trashReference,
        actor,
        error,
      });

      throw new InvalidRequestError(
        "Unable to permanently delete the media file from storage",
      );
    }
  }

  let deletedResult = null;

  await adminDb.runTransaction(async (transaction) => {
    const trashSnapshot = await transaction.get(trashReference);

    if (!trashSnapshot.exists) {
      throw new NotFoundError("Trash item not found");
    }

    const trashData = trashSnapshot.data();

    if (!isTrashEntityType(trashData.entityType) || !trashData.entityId) {
      throw new InvalidRequestError("Trash item data is invalid");
    }

    const sourceCollection = getTrashCollection(trashData.entityType);

    const sourceReference = adminDb
      .collection(sourceCollection)
      .doc(trashData.entityId);

    /*
     * Category count และ Media usage ถูก release
     * ตั้งแต่ soft delete แล้ว จึงไม่เปลี่ยนซ้ำที่นี่
     */
    transaction.delete(sourceReference);
    transaction.delete(trashReference);

    await writeAuditLog({
      actor,

      action: "TRASH_DELETE_PERMANENTLY",

      entityType: trashData.entityType,

      entityId: trashData.entityId,

      before: trashData.originalData || null,

      after: null,

      metadata: {
        ...requestMetadata,

        trashId,

        permanent: true,

        storageDeleted: Boolean(storagePath),

        storagePath,
      },

      transaction,
    });

    deletedResult = {
      entityType: trashData.entityType,

      entityId: trashData.entityId,

      storageDeleted: Boolean(storagePath),
    };
  });

  return deletedResult;
}
