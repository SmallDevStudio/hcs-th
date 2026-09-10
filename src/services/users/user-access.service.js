import "server-only";

import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  getRolePermissions,
  hasPermission,
  mergePermissions,
} from "@/constants/admin";
import {
  AuthorizationError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";

function normalizePermissionList(permissions) {
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

export function isSuperadmin(user) {
  return user?.role === ADMIN_ROLES.SUPERADMIN;
}

export function canViewManagedUser({ actor, targetUser }) {
  if (!actor || !targetUser) {
    return false;
  }

  if (isSuperadmin(actor)) {
    return true;
  }

  return !isSuperadmin(targetUser);
}

export function assertCanViewManagedUser({ actor, targetUser }) {
  if (
    !canViewManagedUser({
      actor,
      targetUser,
    })
  ) {
    /*
     * ใช้ NotFound เพื่อไม่เปิดเผยว่ามีบัญชี
     * Superadmin อยู่ในระบบ
     */
    throw new NotFoundError("User not found");
  }
}

export function assertCanManageUser({ actor, targetUser }) {
  assertCanViewManagedUser({
    actor,
    targetUser,
  });

  if (!hasPermission(actor.permissions, ADMIN_PERMISSIONS.USERS_UPDATE)) {
    throw new AuthorizationError("You do not have permission to manage users");
  }
}

export function assertCanCreateRole({ actor, role }) {
  if (role === ADMIN_ROLES.SUPERADMIN && !isSuperadmin(actor)) {
    throw new AuthorizationError(
      "Only a superadmin can create another superadmin",
    );
  }
}

export function assertCanAssignRole({ actor, targetUser, nextRole }) {
  assertCanManageUser({
    actor,
    targetUser,
  });

  if (nextRole === ADMIN_ROLES.SUPERADMIN && !isSuperadmin(actor)) {
    throw new AuthorizationError(
      "Only a superadmin can assign the superadmin role",
    );
  }

  if (targetUser.role === ADMIN_ROLES.SUPERADMIN && !isSuperadmin(actor)) {
    throw new NotFoundError("User not found");
  }

  if (actor.uid === targetUser.uid && nextRole !== targetUser.role) {
    throw new InvalidRequestError("You cannot change your own role");
  }
}

export function assertCanChangeUserStatus({ actor, targetUser, nextStatus }) {
  assertCanManageUser({
    actor,
    targetUser,
  });

  if (actor.uid === targetUser.uid && nextStatus !== targetUser.status) {
    throw new InvalidRequestError("You cannot change your own account status");
  }
}

export function assertCanDeleteUser({ actor, targetUser }) {
  assertCanViewManagedUser({
    actor,
    targetUser,
  });

  if (!hasPermission(actor.permissions, ADMIN_PERMISSIONS.USERS_DELETE)) {
    throw new AuthorizationError("You do not have permission to delete users");
  }

  if (actor.uid === targetUser.uid) {
    throw new InvalidRequestError("You cannot delete your own account");
  }
}

export function assertCanResetUserPassword({ actor, targetUser }) {
  assertCanManageUser({
    actor,
    targetUser,
  });

  if (actor.uid === targetUser.uid) {
    throw new InvalidRequestError(
      "Use the account page to change your own password",
    );
  }
}

export function assertCanAssignPermissions({ actor, permissions }) {
  const normalizedPermissions = normalizePermissionList(permissions);

  if (isSuperadmin(actor)) {
    return normalizedPermissions;
  }

  for (const permission of normalizedPermissions) {
    if (!hasPermission(actor.permissions, permission)) {
      throw new AuthorizationError(
        `You cannot assign permission: ${permission}`,
      );
    }
  }

  return normalizedPermissions;
}

export function createEffectivePermissions({
  role,
  directPermissions = [],
  groupPermissions = [],
}) {
  if (role === ADMIN_ROLES.SUPERADMIN) {
    return [ADMIN_PERMISSIONS.ALL];
  }

  return mergePermissions(
    getRolePermissions(role),

    directPermissions,

    groupPermissions,
  );
}

export function normalizeUserAccessInput({
  actor,
  role,
  permissions,
  groupIds,
}) {
  assertCanCreateRole({
    actor,
    role,
  });

  const directPermissions =
    role === ADMIN_ROLES.SUPERADMIN
      ? []
      : assertCanAssignPermissions({
          actor,

          permissions: permissions || [],
        });

  const normalizedGroupIds = [
    ...new Set(
      (Array.isArray(groupIds) ? groupIds : [])
        .map((groupId) => String(groupId || "").trim())
        .filter(Boolean),
    ),
  ].sort();

  return {
    role,

    permissions: directPermissions,

    groupIds: role === ADMIN_ROLES.SUPERADMIN ? [] : normalizedGroupIds,
  };
}

export function normalizeUpdatedUserAccess({ actor, targetUser, input }) {
  const nextRole = input.role ?? targetUser.role;

  assertCanAssignRole({
    actor,

    targetUser,

    nextRole,
  });

  if (input.status !== undefined) {
    assertCanChangeUserStatus({
      actor,

      targetUser,

      nextStatus: input.status,
    });
  }

  const requestedPermissions =
    input.permissions === undefined
      ? targetUser.permissions || []
      : input.permissions;

  const requestedGroupIds =
    input.groupIds === undefined ? targetUser.groupIds || [] : input.groupIds;

  const normalizedAccess = normalizeUserAccessInput({
    actor,

    role: nextRole,

    permissions: requestedPermissions,

    groupIds: requestedGroupIds,
  });

  return normalizedAccess;
}
