import "server-only";

import { ADMIN_ROLES, USER_STATUSES } from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { resolveUserAccess } from "@/services/user-groups/user-group-resolution.service";
import { canViewManagedUser } from "@/services/users/user-access.service";
import { serializeUserData } from "@/services/users/user-serializer.service";

const USER_LIST_DEFAULT_LIMIT = 25;

const USER_LIST_MAX_LIMIT = 100;

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US");
}

function normalizeLimit(value) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return USER_LIST_DEFAULT_LIMIT;
  }

  return Math.min(parsedValue, USER_LIST_MAX_LIMIT);
}

function userMatchesSearch(user, normalizedSearch) {
  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    user.displayName,
    user.email,
    user.role,
    user.status,

    ...(Array.isArray(user.groups)
      ? user.groups.map((group) => group.name)
      : []),
  ]
    .join(" ")
    .normalize("NFKC")
    .toLocaleLowerCase("en-US");

  return searchableText.includes(normalizedSearch);
}

function userMatchesFilters({ user, role, status, groupId, normalizedSearch }) {
  if (role && user.role !== role) {
    return false;
  }

  if (status && user.status !== status) {
    return false;
  }

  if (groupId && !user.groupIds.includes(groupId)) {
    return false;
  }

  return userMatchesSearch(user, normalizedSearch);
}

function sortUsers(firstUser, secondUser) {
  const firstName = firstUser.displayName || firstUser.email;

  const secondName = secondUser.displayName || secondUser.email;

  const nameComparison = firstName.localeCompare(secondName, "en", {
    sensitivity: "base",
  });

  if (nameComparison !== 0) {
    return nameComparison;
  }

  const emailComparison = firstUser.email.localeCompare(
    secondUser.email,
    "en",
    {
      sensitivity: "base",
    },
  );

  if (emailComparison !== 0) {
    return emailComparison;
  }

  return firstUser.uid.localeCompare(secondUser.uid);
}

async function serializeManagedUser({ snapshot }) {
  const data = snapshot.data();

  const resolvedAccess = await resolveUserAccess({
    userData: data,
  });

  return serializeUserData({
    uid: snapshot.id,

    data,

    resolvedAccess,
  });
}

export async function getManagedUserById({ userId, actor }) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get();

  if (!snapshot.exists || snapshot.data()?.deletedAt) {
    throw new NotFoundError("User not found");
  }

  const user = await serializeManagedUser({
    snapshot,
  });

  if (
    !canViewManagedUser({
      actor,

      targetUser: user,
    })
  ) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function getManagedUsers({
  actor,
  limit = USER_LIST_DEFAULT_LIMIT,
  cursor,
  role,
  status,
  groupId,
  search,
} = {}) {
  const safeLimit = normalizeLimit(limit);

  const normalizedSearch = normalizeSearchValue(search);

  const snapshot = await adminDb.collection(COLLECTIONS.USERS).get();

  const visibleDocuments = snapshot.docs.filter((document) => {
    const data = document.data();

    if (data.deletedAt) {
      return false;
    }

    return canViewManagedUser({
      actor,

      targetUser: {
        uid: document.id,

        role: data.role,
      },
    });
  });

  const users = await Promise.all(
    visibleDocuments.map((document) =>
      serializeManagedUser({
        snapshot: document,
      }),
    ),
  );

  let filteredUsers = users
    .filter((user) =>
      userMatchesFilters({
        user,

        role,

        status,

        groupId,

        normalizedSearch,
      }),
    )
    .sort(sortUsers);

  if (cursor) {
    const cursorIndex = filteredUsers.findIndex((user) => user.uid === cursor);

    filteredUsers =
      cursorIndex >= 0 ? filteredUsers.slice(cursorIndex + 1) : filteredUsers;
  }

  const requestedUsers = filteredUsers.slice(0, safeLimit + 1);

  const hasMore = requestedUsers.length > safeLimit;

  const items = hasMore ? requestedUsers.slice(0, safeLimit) : requestedUsers;

  return {
    items,

    pagination: {
      limit: safeLimit,

      count: items.length,

      hasMore,

      nextCursor: hasMore && items.length ? items[items.length - 1].uid : null,
    },

    filters: {
      role: role || null,

      status: status || null,

      groupId: groupId || null,

      search: search || "",
    },
  };
}

export function getUserManagementOptions({ actor }) {
  const roles =
    actor.role === ADMIN_ROLES.SUPERADMIN
      ? [ADMIN_ROLES.SUPERADMIN, ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR]
      : [ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR];

  return {
    roles,

    statuses: [USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE],

    canManageSuperadmins: actor.role === ADMIN_ROLES.SUPERADMIN,
  };
}
