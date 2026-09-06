import "server-only";

import { AuthenticationError, AuthorizationError } from "@/lib/api/errors";
import { verifySessionCookie } from "@/lib/firebase/auth-session";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/collections";
import { USER_STATUSES, isAdminRole } from "@/constants/admin";

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function serializeAdminUser(data) {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName || "",
    photoURL: data.photoURL || null,

    role: data.role,
    permissions: Array.isArray(data.permissions) ? data.permissions : [],

    status: data.status,
    preferredLocale: data.preferredLocale || "th",

    lastLoginAt: serializeTimestamp(data.lastLoginAt),

    createdAt: serializeTimestamp(data.createdAt),

    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export async function getCurrentAdmin() {
  const decodedToken = await verifySessionCookie({
    checkRevoked: true,
  });

  if (!decodedToken?.uid) {
    return null;
  }

  const userSnapshot = await adminDb
    .collection(COLLECTIONS.USERS)
    .doc(decodedToken.uid)
    .get();

  if (!userSnapshot.exists) {
    return null;
  }

  const userData = userSnapshot.data();

  if (
    userData.status !== USER_STATUSES.ACTIVE ||
    !isAdminRole(userData.role) ||
    userData.deletedAt
  ) {
    return null;
  }

  return serializeAdminUser({
    ...userData,
    uid: userSnapshot.id,
  });
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new AuthenticationError();
  }

  return admin;
}

export async function requirePermission(requiredPermission) {
  const admin = await requireCurrentAdmin();

  const canAccess =
    admin.permissions.includes("*") ||
    admin.permissions.includes(requiredPermission);

  if (!canAccess) {
    throw new AuthorizationError();
  }

  return admin;
}
