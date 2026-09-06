import "server-only";

import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

import {
  TRASH_RETENTION_DAYS,
  getTrashCollection,
  isTrashEntityType,
} from "@/constants/trash";
import { COLLECTIONS } from "@/constants/collections";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";

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

    transaction.set(trashReference, {
      entityType,
      entityId,
      sourceCollection: collectionName,

      displayName:
        sourceData.name?.en ||
        sourceData.title?.en ||
        sourceData.displayName?.en ||
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
    });

    transaction.update(sourceReference, {
      isDeleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: actor.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    });

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
      metadata: requestMetadata,
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

    transaction.set(
      sourceReference,
      {
        ...trashData.originalData,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
        restoredAt: FieldValue.serverTimestamp(),
        restoredBy: actor.uid,
      },
      {
        merge: false,
      },
    );

    transaction.delete(trashReference);

    await writeAuditLog({
      actor,
      action: `${trashData.entityType.toUpperCase()}_RESTORE`,
      entityType: trashData.entityType,
      entityId: trashData.entityId,
      before: {
        isDeleted: true,
      },
      after: trashData.originalData,
      metadata: {
        ...requestMetadata,
        trashId,
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
      },
      transaction,
    });

    deletedResult = {
      entityType: trashData.entityType,
      entityId: trashData.entityId,
    };
  });

  return deletedResult;
}
