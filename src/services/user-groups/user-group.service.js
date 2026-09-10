import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  USER_GROUP_LIMITS,
  USER_GROUP_STATUSES,
} from "@/constants/user-groups";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import {
  createTopLevelChanges,
  writeAuditLog,
} from "@/services/audit/audit.service";

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

function normalizeGroupName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeGroupNameForComparison(value) {
  return normalizeGroupName(value).toLocaleLowerCase("en-US");
}

function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return [
    ...new Set(
      permissions.filter(
        (permission) =>
          typeof permission === "string" &&
          permission !== ADMIN_PERMISSIONS.ALL,
      ),
    ),
  ].sort();
}

function serializeUserGroupSnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: data.name || "",
    description: data.description || "",

    permissions: Array.isArray(data.permissions) ? data.permissions : [],

    status: data.status || USER_GROUP_STATUSES.ACTIVE,

    memberCount: Math.max(0, Number(data.memberCount || 0)),

    createdAt: serializeTimestamp(data.createdAt),
    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}

function createGroupAuditSnapshot(group) {
  return {
    id: group.id,

    name: group.name,
    description: group.description,

    permissions: group.permissions,

    status: group.status,

    memberCount: group.memberCount,
  };
}

function assertActorCanAssignPermissions({ actor, permissions }) {
  for (const permission of permissions) {
    if (!hasPermission(actor.permissions, permission)) {
      throw new AuthorizationError(
        `You cannot assign permission: ${permission}`,
      );
    }
  }
}

async function assertUniqueGroupName({
  transaction,
  nameNormalized,
  excludeGroupId = null,
}) {
  const query = adminDb
    .collection(COLLECTIONS.USER_GROUPS)
    .where("nameNormalized", "==", nameNormalized);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.some(
    (document) => document.id !== excludeGroupId,
  );

  if (duplicate) {
    throw new ConflictError(
      "A permission group with this name already exists",
      {
        field: "name",
      },
    );
  }
}

async function assertGroupHasNoMembers({ transaction, groupId }) {
  const query = adminDb
    .collection(COLLECTIONS.USERS)
    .where("groupIds", "array-contains", groupId)
    .limit(1);

  const snapshot = await transaction.get(query);

  if (!snapshot.empty) {
    throw new ConflictError(
      "This permission group is assigned to users and cannot be deleted",
      {
        groupId,
      },
    );
  }
}

export async function getUserGroupById(groupId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.USER_GROUPS)
    .doc(groupId)
    .get();

  if (!snapshot.exists) {
    throw new NotFoundError("Permission group not found");
  }

  return serializeUserGroupSnapshot(snapshot);
}

export async function getUserGroups({
  limit = USER_GROUP_LIMITS.LIST_DEFAULT_LIMIT,
  cursor,
  status,
  search,
} = {}) {
  const safeLimit = Math.min(
    Math.max(1, Number(limit) || USER_GROUP_LIMITS.LIST_DEFAULT_LIMIT),
    USER_GROUP_LIMITS.LIST_MAX_LIMIT,
  );

  const snapshot = await adminDb.collection(COLLECTIONS.USER_GROUPS).get();

  const normalizedSearch = String(search || "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US");

  let items = snapshot.docs
    .map(serializeUserGroupSnapshot)
    .filter(Boolean)
    .filter((group) => {
      if (status && group.status !== status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [group.name, group.description]
        .join(" ")
        .normalize("NFKC")
        .toLocaleLowerCase("en-US");

      return searchableText.includes(normalizedSearch);
    })
    .sort((firstGroup, secondGroup) => {
      const nameComparison = firstGroup.name.localeCompare(
        secondGroup.name,
        "en",
        {
          sensitivity: "base",
        },
      );

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return firstGroup.id.localeCompare(secondGroup.id);
    });

  if (cursor) {
    const cursorIndex = items.findIndex((group) => group.id === cursor);

    items = cursorIndex >= 0 ? items.slice(cursorIndex + 1) : items;
  }

  const requestedItems = items.slice(0, safeLimit + 1);

  const hasMore = requestedItems.length > safeLimit;

  const pageItems = hasMore
    ? requestedItems.slice(0, safeLimit)
    : requestedItems;

  return {
    items: pageItems,

    pagination: {
      limit: safeLimit,
      count: pageItems.length,
      hasMore,

      nextCursor:
        hasMore && pageItems.length ? pageItems[pageItems.length - 1].id : null,
    },
  };
}

export async function createUserGroup({ input, actor, requestMetadata = {} }) {
  const groupId = randomUUID();

  const name = normalizeGroupName(input.name);

  const nameNormalized = normalizeGroupNameForComparison(name);

  const permissions = normalizePermissions(input.permissions);

  assertActorCanAssignPermissions({
    actor,
    permissions,
  });

  const reference = adminDb.collection(COLLECTIONS.USER_GROUPS).doc(groupId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueGroupName({
      transaction,
      nameNormalized,
    });

    const writeData = {
      name,
      nameNormalized,

      description: String(input.description || "").trim(),

      permissions,

      status: input.status || USER_GROUP_STATUSES.ACTIVE,

      memberCount: 0,

      createdAt: FieldValue.serverTimestamp(),
      createdBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    transaction.create(reference, writeData);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.GROUP_CREATE,
      entityType: AUDIT_ENTITY_TYPES.USER_GROUP,
      entityId: groupId,

      before: null,

      after: writeData,

      metadata: {
        ...requestMetadata,

        targetGroup: {
          id: groupId,
          name,
          status: writeData.status,
        },
      },

      transaction,
    });
  });

  return getUserGroupById(groupId);
}

export async function updateUserGroup({
  groupId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.USER_GROUPS).doc(groupId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists) {
      throw new NotFoundError("Permission group not found");
    }

    const before = snapshot.data();

    const name =
      input.name === undefined ? before.name : normalizeGroupName(input.name);

    const nameNormalized =
      input.name === undefined
        ? before.nameNormalized
        : normalizeGroupNameForComparison(name);

    const permissions =
      input.permissions === undefined
        ? normalizePermissions(before.permissions)
        : normalizePermissions(input.permissions);

    assertActorCanAssignPermissions({
      actor,
      permissions,
    });

    if (nameNormalized !== before.nameNormalized) {
      await assertUniqueGroupName({
        transaction,
        nameNormalized,
        excludeGroupId: groupId,
      });
    }

    const updates = {
      ...(input.name !== undefined
        ? {
            name,
            nameNormalized,
          }
        : {}),

      ...(input.description !== undefined
        ? {
            description: String(input.description).trim(),
          }
        : {}),

      ...(input.permissions !== undefined
        ? {
            permissions,
          }
        : {}),

      ...(input.status !== undefined
        ? {
            status: input.status,
          }
        : {}),

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.GROUP_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.USER_GROUP,
      entityId: groupId,

      before,

      after: {
        ...before,
        ...updates,
      },

      metadata: {
        ...requestMetadata,

        targetGroup: {
          id: groupId,
          name,
          status: input.status ?? before.status,
        },

        changedFields: Object.keys(
          createTopLevelChanges(before, {
            ...before,
            ...updates,
          }),
        ),
      },

      transaction,
    });
  });

  return getUserGroupById(groupId);
}

export async function deleteUserGroup({
  groupId,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.USER_GROUPS).doc(groupId);

  let deletedGroup = null;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists) {
      throw new NotFoundError("Permission group not found");
    }

    await assertGroupHasNoMembers({
      transaction,
      groupId,
    });

    deletedGroup = serializeUserGroupSnapshot(snapshot);

    transaction.delete(reference);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.GROUP_DELETE,
      entityType: AUDIT_ENTITY_TYPES.USER_GROUP,
      entityId: groupId,

      before: snapshot.data(),

      after: null,

      metadata: {
        ...requestMetadata,

        hardDelete: true,

        targetGroup: createGroupAuditSnapshot(deletedGroup),
      },

      transaction,
    });
  });

  return {
    id: groupId,
    deleted: true,

    group: createGroupAuditSnapshot(deletedGroup),
  };
}
