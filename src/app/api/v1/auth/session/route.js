import { FieldValue } from "firebase-admin/firestore";
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
import { COLLECTIONS } from "@/constants/collections";
import { USER_STATUSES, isAdminRole } from "@/constants/admin";

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

function createPublicAdminData(uid, userData) {
  return {
    uid,
    email: userData.email,
    displayName: userData.displayName || "",
    photoURL: userData.photoURL || null,

    role: userData.role,

    permissions: Array.isArray(userData.permissions)
      ? userData.permissions
      : [],

    status: userData.status,

    preferredLocale: userData.preferredLocale || "th",
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

    await createAndSetSession(idToken);

    const requestMetadata = getRequestMetadata(request);

    const auditReference = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();

    const batch = adminDb.batch();

    batch.update(userReference, {
      lastLoginAt: FieldValue.serverTimestamp(),

      lastLoginIp: requestMetadata.ipAddress,

      lastLoginUserAgent: requestMetadata.userAgent,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: decodedToken.uid,
    });

    batch.set(auditReference, {
      actor: {
        uid: decodedToken.uid,

        email: userData.email || authUser.email || null,

        displayName: userData.displayName || authUser.displayName || "",
      },

      action: "AUTH_LOGIN",
      entityType: "session",
      entityId: decodedToken.uid,

      description: "Admin signed in",

      before: null,

      after: {
        status: "authenticated",
        role: userData.role,
      },

      metadata: {
        ipAddress: requestMetadata.ipAddress,

        userAgent: requestMetadata.userAgent,
      },

      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return apiSuccess({
      message: "Signed in successfully",

      data: {
        user: createPublicAdminData(decodedToken.uid, userData),
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

      await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
        actor: {
          uid: decodedToken.uid,

          email: userData?.email || decodedToken.email || null,

          displayName: userData?.displayName || decodedToken.name || "",
        },

        action: "AUTH_LOGOUT",
        entityType: "session",
        entityId: decodedToken.uid,

        description: "Admin signed out",

        before: {
          status: "authenticated",
        },

        after: {
          status: "signed_out",
        },

        metadata: {
          ipAddress: requestMetadata.ipAddress,

          userAgent: requestMetadata.userAgent,
        },

        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return apiSuccess({
      message: "Signed out successfully",
      data: null,
    });
  });
}
