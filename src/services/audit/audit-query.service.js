import "server-only";

import { FieldPath, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { InvalidRequestError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

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

function encodeCursor({ createdAt, documentId }) {
  const payload = JSON.stringify({
    createdAt,
    documentId,
  });

  return Buffer.from(payload, "utf8").toString("base64url");
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
      typeof decoded.createdAt !== "string" ||
      typeof decoded.documentId !== "string" ||
      !decoded.documentId ||
      Number.isNaN(new Date(decoded.createdAt).getTime())
    ) {
      throw new Error("Invalid cursor data");
    }

    return decoded;
  } catch {
    throw new InvalidRequestError("Invalid audit log cursor");
  }
}

function createEndOfDay(dateValue) {
  const date = new Date(dateValue);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
}

export async function getAuditLogs({
  limit,
  cursor,
  action,
  entityType,
  actorUid,
  dateFrom,
  dateTo,
}) {
  const collectionReference = adminDb.collection(COLLECTIONS.AUDIT_LOGS);

  let query = collectionReference;

  if (action) {
    query = query.where("action", "==", action);
  }

  if (entityType) {
    query = query.where("entityType", "==", entityType);
  }

  if (actorUid) {
    query = query.where("actor.uid", "==", actorUid);
  }

  if (dateFrom) {
    query = query.where(
      "createdAt",
      ">=",
      Timestamp.fromDate(new Date(dateFrom)),
    );
  }

  if (dateTo) {
    query = query.where(
      "createdAt",
      "<=",
      Timestamp.fromDate(createEndOfDay(dateTo)),
    );
  }

  query = query
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");

  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    query = query.startAfter(
      Timestamp.fromDate(new Date(decodedCursor.createdAt)),
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

  const lastDocumentCreatedAt = lastDocument?.get("createdAt");

  const nextCursor =
    hasMore && lastDocument && lastDocumentCreatedAt
      ? encodeCursor({
          createdAt: lastDocumentCreatedAt.toDate().toISOString(),
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
