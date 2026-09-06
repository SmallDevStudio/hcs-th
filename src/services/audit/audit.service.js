import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";

function removeUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    typeof value.toDate !== "function"
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, childValue]) => childValue !== undefined)
        .map(([key, childValue]) => [key, removeUndefined(childValue)]),
    );
  }

  return value;
}

function valuesAreEqual(previousValue, nextValue) {
  return JSON.stringify(previousValue) === JSON.stringify(nextValue);
}

export function createTopLevelChanges(before = {}, after = {}) {
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  const changes = {};

  for (const key of keys) {
    const previousValue = before?.[key] ?? null;
    const nextValue = after?.[key] ?? null;

    if (!valuesAreEqual(previousValue, nextValue)) {
      changes[key] = {
        before: previousValue,
        after: nextValue,
      };
    }
  }

  return changes;
}

export function createAuditLogData({
  actor,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
  metadata = {},
}) {
  return removeUndefined({
    action,
    entityType,
    entityId,

    actor: {
      uid: actor.uid,
      email: actor.email || "",
      displayName: actor.displayName || "",
      role: actor.role || "",
    },

    changes:
      before || after ? createTopLevelChanges(before || {}, after || {}) : {},

    metadata: {
      source: "admin",
      ...metadata,
    },

    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function writeAuditLog({
  actor,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
  metadata = {},
  transaction = null,
  batch = null,
}) {
  const auditReference = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();

  const auditData = createAuditLogData({
    actor,
    action,
    entityType,
    entityId,
    before,
    after,
    metadata,
  });

  if (transaction) {
    transaction.set(auditReference, auditData);
    return auditReference.id;
  }

  if (batch) {
    batch.set(auditReference, auditData);
    return auditReference.id;
  }

  await auditReference.set(auditData);

  return auditReference.id;
}
