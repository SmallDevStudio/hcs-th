import "server-only";

import { USER_STATUSES, hasPermission, isAdminRole } from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { AuthenticationError, AuthorizationError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/lib/firebase/auth-session";
import { resolveUserAccess } from "@/services/user-groups/user-group-resolution.service";
import { serializeUserData } from "@/services/users/user-serializer.service";

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

  const resolvedAccess = await resolveUserAccess({
    userData,
  });

  const serializedUser = serializeUserData({
    uid: userSnapshot.id,

    data: userData,

    resolvedAccess,
  });

  return {
    ...serializedUser,

    /*
     * รักษา compatibility กับระบบเดิม:
     * admin.permissions ต้องเป็นสิทธิ์ที่ใช้งานจริง
     */
    permissions: resolvedAccess.effectivePermissions,

    directPermissions: resolvedAccess.directPermissions,

    groupPermissions: resolvedAccess.groupPermissions,

    effectivePermissions: resolvedAccess.effectivePermissions,
  };
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

  if (admin.mustChangePassword) {
    throw new AuthorizationError(
      "Password change is required before continuing",
    );
  }

  if (!hasPermission(admin.permissions, requiredPermission)) {
    throw new AuthorizationError();
  }

  return admin;
}
