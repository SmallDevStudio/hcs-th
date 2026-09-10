import { FieldValue } from "firebase-admin/firestore";

import { USER_STATUSES, isAdminRole } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  AuthenticationError,
  AuthorizationError,
  InvalidRequestError,
} from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import {
  clearSessionCookie,
  createAndSetSession,
  verifySessionCookie,
} from "@/lib/firebase/auth-session";
import { createSessionSchema } from "@/modules/auth/schemas/session.schema";
import { writeAuditLog } from "@/services/audit/audit.service";
import { resolveUserAccess } from "@/services/user-groups/user-group-resolution.service";
import { serializeUserData } from "@/services/users/user-serializer.service";

function getRequestMetadata(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  const ipAddress =
    forwardedFor?.split(",").at(0)?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const userAgent = request.headers.get("user-agent") || null;

  return {
    ipAddress,

    userAgent,
  };
}

function createSessionAdminData({ uid, userData, resolvedAccess }) {
  const serializedUser = serializeUserData({
    uid,

    data: userData,

    resolvedAccess,
  });

  return {
    ...serializedUser,

    /*
     * permissions ใช้ effective permissions
     * เพื่อให้ component เดิมทำงานต่อได้
     */
    permissions: resolvedAccess.effectivePermissions,

    directPermissions: resolvedAccess.directPermissions,

    groupPermissions: resolvedAccess.groupPermissions,

    effectivePermissions: resolvedAccess.effectivePermissions,
  };
}

export async function POST(request) {
  return withApiHandler(async () => {
    let requestBody;

    try {
      requestBody = await request.json();
    } catch {
      throw new InvalidRequestError("Request body must be valid JSON");
    }

    const { idToken } = createSessionSchema.parse(requestBody);

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch {
      throw new AuthenticationError("Invalid or expired authentication token");
    }

    const authUser = await adminAuth.getUser(decodedToken.uid);

    if (authUser.disabled) {
      throw new AuthorizationError("This account has been disabled");
    }

    const userReference = adminDb
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid);

    const userSnapshot = await userReference.get();

    if (!userSnapshot.exists) {
      throw new AuthorizationError("This account does not have admin access");
    }

    const userData = userSnapshot.data();

    if (userData.status !== USER_STATUSES.ACTIVE) {
      throw new AuthorizationError("This account is not active");
    }

    if (!isAdminRole(userData.role)) {
      throw new AuthorizationError("This account does not have an admin role");
    }

    if (userData.deletedAt) {
      throw new AuthorizationError("This account has been deleted");
    }

    const resolvedAccess = await resolveUserAccess({
      userData,
    });

    const adminUser = createSessionAdminData({
      uid: decodedToken.uid,

      userData,

      resolvedAccess,
    });

    await createAndSetSession(idToken);

    const requestMetadata = getRequestMetadata(request);

    const batch = adminDb.batch();

    batch.update(userReference, {
      lastLoginAt: FieldValue.serverTimestamp(),

      lastLoginIp: requestMetadata.ipAddress,

      lastLoginUserAgent: requestMetadata.userAgent,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: decodedToken.uid,
    });

    await writeAuditLog({
      actor: adminUser,

      action: AUDIT_ACTIONS.AUTH_LOGIN,

      entityType: AUDIT_ENTITY_TYPES.AUTH,

      entityId: decodedToken.uid,

      before: {
        status: "signed_out",
      },

      after: {
        status: "authenticated",

        role: userData.role,
      },

      metadata: {
        ...requestMetadata,

        description: "Admin signed in",
      },

      batch,
    });

    await batch.commit();

    return apiSuccess({
      message: "Signed in successfully",

      data: {
        user: adminUser,
      },
    });
  });
}

export async function DELETE(request) {
  return withApiHandler(async () => {
    const decodedToken = await verifySessionCookie({
      checkRevoked: false,
    });

    await clearSessionCookie();

    if (decodedToken?.uid) {
      const userSnapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .doc(decodedToken.uid)
        .get();

      const userData = userSnapshot.exists ? userSnapshot.data() : null;

      const requestMetadata = getRequestMetadata(request);

      const actor = {
        uid: decodedToken.uid,

        email: userData?.email || decodedToken.email || "",

        displayName: userData?.displayName || decodedToken.name || "",

        role: userData?.role || "",
      };

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.AUTH_LOGOUT,

        entityType: AUDIT_ENTITY_TYPES.AUTH,

        entityId: decodedToken.uid,

        before: {
          status: "authenticated",
        },

        after: {
          status: "signed_out",
        },

        metadata: {
          ...requestMetadata,

          description: "Admin signed out",
        },
      });
    }

    return apiSuccess({
      message: "Signed out successfully",

      data: null,
    });
  });
}
