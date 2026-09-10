import "server-only";

import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  getRolePermissions,
  mergePermissions,
} from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { USER_GROUP_STATUSES } from "@/constants/user-groups";
import { adminDb } from "@/lib/firebase/admin";

function normalizeGroupIds(groupIds) {
  if (!Array.isArray(groupIds)) {
    return [];
  }

  return [
    ...new Set(
      groupIds.map((groupId) => String(groupId || "").trim()).filter(Boolean),
    ),
  ];
}

function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return [
    ...new Set(
      permissions
        .map((permission) => String(permission || "").trim())
        .filter(
          (permission) => permission && permission !== ADMIN_PERMISSIONS.ALL,
        ),
    ),
  ].sort();
}

function serializeResolvedGroup(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: data.name || "",

    status: data.status || USER_GROUP_STATUSES.ACTIVE,

    permissions: normalizePermissions(data.permissions),
  };
}

async function getGroupSnapshots({ groupIds, transaction = null }) {
  const normalizedGroupIds = normalizeGroupIds(groupIds);

  if (!normalizedGroupIds.length) {
    return [];
  }

  const references = normalizedGroupIds.map((groupId) =>
    adminDb.collection(COLLECTIONS.USER_GROUPS).doc(groupId),
  );

  if (transaction) {
    return transaction.getAll(...references);
  }

  return adminDb.getAll(...references);
}

export async function resolveUserGroups({ groupIds, transaction = null }) {
  const normalizedGroupIds = normalizeGroupIds(groupIds);

  if (!normalizedGroupIds.length) {
    return {
      requestedGroupIds: [],

      activeGroupIds: [],

      missingGroupIds: [],

      inactiveGroupIds: [],

      groups: [],

      permissions: [],
    };
  }

  const snapshots = await getGroupSnapshots({
    groupIds: normalizedGroupIds,

    transaction,
  });

  const snapshotsById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const groups = [];

  const missingGroupIds = [];

  const inactiveGroupIds = [];

  for (const groupId of normalizedGroupIds) {
    const snapshot = snapshotsById.get(groupId);

    if (!snapshot?.exists) {
      missingGroupIds.push(groupId);

      continue;
    }

    const group = serializeResolvedGroup(snapshot);

    if (group.status !== USER_GROUP_STATUSES.ACTIVE) {
      inactiveGroupIds.push(groupId);

      continue;
    }

    groups.push(group);
  }

  return {
    requestedGroupIds: normalizedGroupIds,

    activeGroupIds: groups.map((group) => group.id),

    missingGroupIds,

    inactiveGroupIds,

    groups,

    permissions: normalizePermissions(
      groups.flatMap((group) => group.permissions),
    ),
  };
}

export async function resolveUserAccess({ userData, transaction = null }) {
  const role = userData?.role || "";

  if (role === ADMIN_ROLES.SUPERADMIN) {
    return {
      role,

      directPermissions: [],

      groupIds: [],

      activeGroupIds: [],

      groups: [],

      groupPermissions: [],

      effectivePermissions: [ADMIN_PERMISSIONS.ALL],
    };
  }

  const directPermissions = normalizePermissions(userData?.permissions);

  const groupResolution = await resolveUserGroups({
    groupIds: userData?.groupIds,

    transaction,
  });

  return {
    role,

    directPermissions,

    groupIds: groupResolution.requestedGroupIds,

    activeGroupIds: groupResolution.activeGroupIds,

    groups: groupResolution.groups,

    groupPermissions: groupResolution.permissions,

    effectivePermissions: mergePermissions(
      getRolePermissions(role),

      directPermissions,

      groupResolution.permissions,
    ),
  };
}
