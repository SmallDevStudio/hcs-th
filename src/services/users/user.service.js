import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { USER_STATUSES } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { USER_GROUP_STATUSES } from "@/constants/user-groups";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import {
  assertCanAssignPermissions,
  assertCanDeleteUser,
  assertCanManageUser,
  assertCanResetUserPassword,
  normalizeUpdatedUserAccess,
  normalizeUserAccessInput,
} from "@/services/users/user-access.service";
import { getManagedUserById } from "@/services/users/user-query.service";

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeGroupIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ].sort();
}

function getGroupIdChanges({ previousGroupIds, nextGroupIds }) {
  const previousIds = new Set(normalizeGroupIds(previousGroupIds));

  const nextIds = new Set(normalizeGroupIds(nextGroupIds));

  return {
    addedGroupIds: [...nextIds].filter((groupId) => !previousIds.has(groupId)),

    removedGroupIds: [...previousIds].filter(
      (groupId) => !nextIds.has(groupId),
    ),
  };
}

function createTargetUserSnapshot({ userId, userData }) {
  return {
    uid: userId,

    email: userData.email || "",

    displayName: userData.displayName || "",

    role: userData.role || "",

    status: userData.status || "",

    preferredLocale: userData.preferredLocale || "th",

    permissions: Array.isArray(userData.permissions)
      ? userData.permissions
      : [],

    groupIds: Array.isArray(userData.groupIds) ? userData.groupIds : [],

    lineConnected: userData.lineConnection?.status === "connected",
  };
}

async function loadGroupSnapshots({ transaction, groupIds }) {
  const normalizedGroupIds = normalizeGroupIds(groupIds);

  if (!normalizedGroupIds.length) {
    return new Map();
  }

  const references = normalizedGroupIds.map((groupId) =>
    adminDb.collection(COLLECTIONS.USER_GROUPS).doc(groupId),
  );

  const snapshots = await transaction.getAll(...references);

  return new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
}

function validateAssignedGroups({ groupIds, groupSnapshots, actor }) {
  const normalizedGroupIds = normalizeGroupIds(groupIds);

  const groupPermissions = [];

  for (const groupId of normalizedGroupIds) {
    const snapshot = groupSnapshots.get(groupId);

    if (!snapshot?.exists) {
      throw new InvalidRequestError(
        "A selected permission group was not found",
        {
          field: "groupIds",

          groupId,
        },
      );
    }

    const groupData = snapshot.data();

    if (groupData.status !== USER_GROUP_STATUSES.ACTIVE) {
      throw new InvalidRequestError(
        "Inactive permission groups cannot be assigned to users",
        {
          field: "groupIds",

          groupId,
        },
      );
    }

    if (Array.isArray(groupData.permissions)) {
      groupPermissions.push(...groupData.permissions);
    }
  }

  assertCanAssignPermissions({
    actor,

    permissions: groupPermissions,
  });

  return normalizedGroupIds;
}

function updateGroupMemberCounts({
  transaction,
  groupSnapshots,
  addedGroupIds,
  removedGroupIds,
  actor,
}) {
  for (const groupId of addedGroupIds) {
    const snapshot = groupSnapshots.get(groupId);

    if (!snapshot?.exists) {
      throw new InvalidRequestError(
        "A selected permission group was not found",
        {
          groupId,
        },
      );
    }

    transaction.update(snapshot.ref, {
      memberCount: FieldValue.increment(1),

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });
  }

  for (const groupId of removedGroupIds) {
    const snapshot = groupSnapshots.get(groupId);

    if (!snapshot?.exists) {
      continue;
    }

    const currentMemberCount = Math.max(
      0,
      Number(snapshot.data()?.memberCount || 0),
    );

    transaction.update(snapshot.ref, {
      memberCount: Math.max(0, currentMemberCount - 1),

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });
  }
}

function normalizeFirebaseAuthError(error) {
  if (error?.code === "auth/email-already-exists") {
    return new ConflictError("A user with this email already exists", {
      field: "email",
    });
  }

  if (error?.code === "auth/invalid-email") {
    return new InvalidRequestError("The user email address is invalid", {
      field: "email",
    });
  }

  return error;
}

async function deleteFirebaseUserIfPresent(userId) {
  try {
    await adminAuth.deleteUser(userId);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }
  }
}

async function rollbackFirebaseUser({ userId, authUser }) {
  try {
    await adminAuth.updateUser(userId, {
      email: authUser.email,

      displayName: authUser.displayName || null,

      photoURL: authUser.photoURL || null,

      disabled: Boolean(authUser.disabled),
    });
  } catch (error) {
    console.error("Unable to roll back Firebase Auth user:", error);
  }
}

export async function createUser({ input, actor, requestMetadata = {} }) {
  const normalizedAccess = normalizeUserAccessInput({
    actor,

    role: input.role,

    permissions: input.permissions,

    groupIds: input.groupIds,
  });

  const email = normalizeEmail(input.email);

  let authUser;

  try {
    authUser = await adminAuth.createUser({
      email,

      password: input.password,

      displayName: input.displayName,

      ...(input.photoURL
        ? {
            photoURL: input.photoURL,
          }
        : {}),

      disabled: input.status === USER_STATUSES.INACTIVE,
    });
  } catch (error) {
    throw normalizeFirebaseAuthError(error);
  }

  const userReference = adminDb.collection(COLLECTIONS.USERS).doc(authUser.uid);

  try {
    await adminDb.runTransaction(async (transaction) => {
      const groupSnapshots = await loadGroupSnapshots({
        transaction,

        groupIds: normalizedAccess.groupIds,
      });

      const validatedGroupIds = validateAssignedGroups({
        groupIds: normalizedAccess.groupIds,

        groupSnapshots,

        actor,
      });

      const writeData = {
        uid: authUser.uid,

        email,

        displayName: input.displayName,

        photoURL: input.photoURL || null,

        role: normalizedAccess.role,

        permissions: normalizedAccess.permissions,

        groupIds: validatedGroupIds,

        status: input.status,

        preferredLocale: input.preferredLocale || "th",

        mustChangePassword: Boolean(input.mustChangePassword),

        lineConnection: {
          status: "disconnected",

          userId: null,

          displayName: "",

          pictureUrl: "",

          connectedAt: null,

          connectedBy: null,

          disconnectedAt: null,

          disconnectedBy: null,
        },

        lastLoginAt: null,

        passwordChangedAt: null,

        passwordSetAt: FieldValue.serverTimestamp(),

        passwordSetBy: actor.uid,

        passwordResetRequestedAt: null,

        createdAt: FieldValue.serverTimestamp(),

        createdBy: actor.uid,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      };

      updateGroupMemberCounts({
        transaction,

        groupSnapshots,

        addedGroupIds: validatedGroupIds,

        removedGroupIds: [],

        actor,
      });

      transaction.create(userReference, writeData);

      const targetUser = createTargetUserSnapshot({
        userId: authUser.uid,

        userData: writeData,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.USER_CREATE,

        entityType: AUDIT_ENTITY_TYPES.USER,

        entityId: authUser.uid,

        before: null,

        after: {
          ...targetUser,

          mustChangePassword: Boolean(input.mustChangePassword),
        },

        metadata: {
          ...requestMetadata,

          targetUser,

          initialPasswordConfigured: true,

          mustChangePassword: Boolean(input.mustChangePassword),
        },

        transaction,
      });
    });
  } catch (error) {
    await deleteFirebaseUserIfPresent(authUser.uid).catch((rollbackError) => {
      console.error(
        "Unable to roll back Firebase Auth user creation:",
        rollbackError,
      );
    });

    throw error;
  }

  return getManagedUserById({
    userId: authUser.uid,

    actor,
  });
}

export async function updateUser({
  userId,
  input,
  actor,
  requestMetadata = {},
}) {
  const currentUser = await getManagedUserById({
    userId,

    actor,
  });

  assertCanManageUser({
    actor,

    targetUser: currentUser,
  });

  const normalizedAccess = normalizeUpdatedUserAccess({
    actor,

    targetUser: currentUser,

    input,
  });

  const nextEmail =
    input.email === undefined ? currentUser.email : normalizeEmail(input.email);

  const nextDisplayName =
    input.displayName === undefined
      ? currentUser.displayName
      : input.displayName;

  const nextPhotoUrl =
    input.photoURL === undefined ? currentUser.photoURL : input.photoURL;

  const nextStatus =
    input.status === undefined ? currentUser.status : input.status;

  const allGroupIds = normalizeGroupIds([
    ...currentUser.groupIds,

    ...normalizedAccess.groupIds,
  ]);

  /*
   * ตรวจ Group และ permission ก่อนแก้ Firebase Auth
   */
  await adminDb.runTransaction(async (transaction) => {
    const groupSnapshots = await loadGroupSnapshots({
      transaction,

      groupIds: allGroupIds,
    });

    validateAssignedGroups({
      groupIds: normalizedAccess.groupIds,

      groupSnapshots,

      actor,
    });
  });

  const previousAuthUser = await adminAuth.getUser(userId);

  try {
    await adminAuth.updateUser(userId, {
      email: nextEmail,

      displayName: nextDisplayName,

      photoURL: nextPhotoUrl || null,

      disabled: nextStatus === USER_STATUSES.INACTIVE,
    });
  } catch (error) {
    throw normalizeFirebaseAuthError(error);
  }

  try {
    await adminDb.runTransaction(async (transaction) => {
      const userReference = adminDb.collection(COLLECTIONS.USERS).doc(userId);

      const userSnapshot = await transaction.get(userReference);

      if (!userSnapshot.exists) {
        throw new NotFoundError("User not found");
      }

      const before = userSnapshot.data();

      const transactionTarget = {
        uid: userId,

        ...before,
      };

      assertCanManageUser({
        actor,

        targetUser: transactionTarget,
      });

      const transactionAccess = normalizeUpdatedUserAccess({
        actor,

        targetUser: transactionTarget,

        input,
      });

      const transactionGroupIds = normalizeGroupIds([
        ...(Array.isArray(before.groupIds) ? before.groupIds : []),

        ...transactionAccess.groupIds,
      ]);

      const groupSnapshots = await loadGroupSnapshots({
        transaction,

        groupIds: transactionGroupIds,
      });

      const validatedGroupIds = validateAssignedGroups({
        groupIds: transactionAccess.groupIds,

        groupSnapshots,

        actor,
      });

      const { addedGroupIds, removedGroupIds } = getGroupIdChanges({
        previousGroupIds: before.groupIds,

        nextGroupIds: validatedGroupIds,
      });

      const updates = {
        ...(input.email !== undefined
          ? {
              email: nextEmail,
            }
          : {}),

        ...(input.displayName !== undefined
          ? {
              displayName: nextDisplayName,
            }
          : {}),

        ...(input.photoURL !== undefined
          ? {
              photoURL: nextPhotoUrl || null,
            }
          : {}),

        role: transactionAccess.role,

        permissions: transactionAccess.permissions,

        groupIds: validatedGroupIds,

        ...(input.status !== undefined
          ? {
              status: nextStatus,
            }
          : {}),

        ...(input.preferredLocale !== undefined
          ? {
              preferredLocale: input.preferredLocale,
            }
          : {}),

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      };

      updateGroupMemberCounts({
        transaction,

        groupSnapshots,

        addedGroupIds,

        removedGroupIds,

        actor,
      });

      transaction.update(userReference, updates);

      const after = {
        ...before,

        ...updates,
      };

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.USER_UPDATE,

        entityType: AUDIT_ENTITY_TYPES.USER,

        entityId: userId,

        before: createTargetUserSnapshot({
          userId,

          userData: before,
        }),

        after: createTargetUserSnapshot({
          userId,

          userData: after,
        }),

        metadata: {
          ...requestMetadata,

          targetUser: createTargetUserSnapshot({
            userId,

            userData: after,
          }),
        },

        transaction,
      });
    });
  } catch (error) {
    await rollbackFirebaseUser({
      userId,

      authUser: previousAuthUser,
    });

    throw error;
  }

  if (input.status === USER_STATUSES.INACTIVE) {
    await adminAuth.revokeRefreshTokens(userId);
  }

  return getManagedUserById({
    userId,

    actor,
  });
}

export async function hardDeleteUser({ userId, actor, requestMetadata = {} }) {
  const targetUser = await getManagedUserById({
    userId,

    actor,
  });

  assertCanDeleteUser({
    actor,

    targetUser,
  });

  /*
   * ลบ Firebase Auth ก่อน
   * หาก Firestore transaction ล้มเหลว สามารถเรียกซ้ำได้
   * เพราะ deleteFirebaseUserIfPresent รองรับ user-not-found
   */
  await deleteFirebaseUserIfPresent(userId);

  let deletedUserSnapshot = null;

  await adminDb.runTransaction(async (transaction) => {
    const userReference = adminDb.collection(COLLECTIONS.USERS).doc(userId);

    const siteSettingsReference = adminDb
      .collection(COLLECTIONS.SITE_SETTINGS)
      .doc("global");

    const [userSnapshot, siteSettingsSnapshot] = await Promise.all([
      transaction.get(userReference),

      transaction.get(siteSettingsReference),
    ]);

    if (!userSnapshot.exists) {
      throw new NotFoundError("User not found");
    }

    const userData = userSnapshot.data();

    assertCanDeleteUser({
      actor,

      targetUser: {
        uid: userId,

        ...userData,
      },
    });

    const groupIds = normalizeGroupIds(userData.groupIds);

    const groupSnapshots = await loadGroupSnapshots({
      transaction,

      groupIds,
    });

    deletedUserSnapshot = createTargetUserSnapshot({
      userId,

      userData,
    });

    updateGroupMemberCounts({
      transaction,

      groupSnapshots,

      addedGroupIds: [],

      removedGroupIds: groupIds,

      actor,
    });

    if (siteSettingsSnapshot.exists) {
      const settings = siteSettingsSnapshot.data();

      const recipientUserIds = normalizeGroupIds(
        settings.notifications?.line?.recipientUserIds,
      ).filter((recipientUserId) => recipientUserId !== userId);

      transaction.update(siteSettingsReference, {
        "notifications.line.recipientUserIds": recipientUserIds,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });
    }

    transaction.delete(userReference);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.USER_DELETE,

      entityType: AUDIT_ENTITY_TYPES.USER,

      entityId: userId,

      before: deletedUserSnapshot,

      after: null,

      metadata: {
        ...requestMetadata,

        hardDelete: true,

        targetUser: deletedUserSnapshot,
      },

      transaction,
    });
  });

  return {
    uid: userId,

    deleted: true,

    user: deletedUserSnapshot,
  };
}

export async function setUserPassword({
  userId,
  input,
  actor,
  requestMetadata = {},
}) {
  const targetUser = await getManagedUserById({
    userId,

    actor,
  });

  assertCanResetUserPassword({
    actor,

    targetUser,
  });

  try {
    await adminAuth.updateUser(userId, {
      password: input.password,
    });

    await adminAuth.revokeRefreshTokens(userId);
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      throw new NotFoundError("User not found");
    }

    if (error?.code === "auth/invalid-password") {
      throw new InvalidRequestError(
        "Password must contain at least 8 characters",
        {
          field: "password",
        },
      );
    }

    throw error;
  }

  const userReference = adminDb.collection(COLLECTIONS.USERS).doc(userId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userReference);

    if (!snapshot.exists) {
      throw new NotFoundError("User not found");
    }

    const userData = snapshot.data();

    const targetUserSnapshot = createTargetUserSnapshot({
      userId,

      userData,
    });

    const updates = {
      mustChangePassword: Boolean(input.mustChangePassword),

      passwordChangedAt: null,

      passwordSetAt: FieldValue.serverTimestamp(),

      passwordSetBy: actor.uid,

      passwordResetRequestedAt: null,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    transaction.update(userReference, updates);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.USER_PASSWORD_SET,

      entityType: AUDIT_ENTITY_TYPES.USER,

      entityId: userId,

      before: {
        mustChangePassword: Boolean(userData.mustChangePassword),

        passwordSetAt: userData.passwordSetAt || null,
      },

      after: {
        mustChangePassword: Boolean(input.mustChangePassword),

        passwordSetAt: updates.passwordSetAt,
      },

      metadata: {
        ...requestMetadata,

        targetUser: targetUserSnapshot,

        passwordConfigured: true,

        sessionsRevoked: true,
      },

      transaction,
    });
  });

  return getManagedUserById({
    userId,

    actor,
  });
}
