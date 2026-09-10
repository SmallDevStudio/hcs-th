import { FieldValue } from "firebase-admin/firestore";

import { USER_STATUSES, isAdminRole } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  AuthenticationError,
  AuthorizationError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createAndSetSession } from "@/lib/firebase/auth-session";
import { completePasswordChangeSchema } from "@/modules/users/password-change.schema";
import { writeAuditLog } from "@/services/audit/audit.service";

const RECENT_AUTH_MAX_AGE_SECONDS = 5 * 60;

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function assertRecentlyAuthenticated(decodedToken) {
  const authenticatedAt = Number(decodedToken.auth_time || 0);

  const currentTime = Math.floor(Date.now() / 1000);

  if (
    !authenticatedAt ||
    currentTime - authenticatedAt > RECENT_AUTH_MAX_AGE_SECONDS ||
    authenticatedAt > currentTime + 60
  ) {
    throw new AuthenticationError("Please confirm your current password again");
  }
}

function createTargetUserSnapshot({ userId, userData }) {
  return {
    uid: userId,

    email: userData.email || "",

    displayName: userData.displayName || "",

    role: userData.role || "",

    status: userData.status || "",
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

    const { idToken } = completePasswordChangeSchema.parse(requestBody);

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch {
      throw new AuthenticationError("Invalid or expired authentication token");
    }

    assertRecentlyAuthenticated(decodedToken);

    const authUser = await adminAuth.getUser(decodedToken.uid);

    if (authUser.disabled) {
      throw new AuthorizationError("This account has been disabled");
    }

    const userReference = adminDb
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid);

    const userSnapshot = await userReference.get();

    if (!userSnapshot.exists) {
      throw new NotFoundError("User not found");
    }

    const userData = userSnapshot.data();

    if (
      userData.status !== USER_STATUSES.ACTIVE ||
      !isAdminRole(userData.role) ||
      userData.deletedAt
    ) {
      throw new AuthorizationError(
        "This account does not have active admin access",
      );
    }

    const actor = {
      uid: decodedToken.uid,

      email: userData.email || decodedToken.email || "",

      displayName: userData.displayName || decodedToken.name || "",

      role: userData.role || "",
    };

    const requestMetadata = getRequestMetadata(request);

    await adminDb.runTransaction(async (transaction) => {
      const transactionSnapshot = await transaction.get(userReference);

      if (!transactionSnapshot.exists) {
        throw new NotFoundError("User not found");
      }

      const transactionUserData = transactionSnapshot.data();

      const targetUser = createTargetUserSnapshot({
        userId: decodedToken.uid,

        userData: transactionUserData,
      });

      const updates = {
        mustChangePassword: false,

        passwordChangedAt: FieldValue.serverTimestamp(),

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: decodedToken.uid,
      };

      transaction.update(userReference, updates);

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.USER_PASSWORD_CHANGE,

        entityType: AUDIT_ENTITY_TYPES.USER,

        entityId: decodedToken.uid,

        before: {
          mustChangePassword: Boolean(transactionUserData.mustChangePassword),

          passwordChangedAt: transactionUserData.passwordChangedAt || null,
        },

        after: {
          mustChangePassword: false,

          passwordChangedAt: updates.passwordChangedAt,
        },

        metadata: {
          ...requestMetadata,

          targetUser,

          selfService: true,
        },

        transaction,
      });
    });

    await createAndSetSession(idToken);

    return apiSuccess({
      message: "Password changed successfully",

      data: {
        changed: true,

        mustChangePassword: false,
      },
    });
  });
}
