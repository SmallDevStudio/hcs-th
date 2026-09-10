import { UsersClient } from "@/components/admin/users/UsersClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import {
  getManagedUsers,
  getUserManagementOptions,
} from "@/services/users/user-query.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management | HCS Admin",
};

export default async function AdminUsersPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.USERS_VIEW);

  const result = await getManagedUsers({
    actor: admin,
    limit: 25,
  });

  const options = getUserManagementOptions({
    actor: admin,
  });

  return (
    <UsersClient
      currentUser={admin}
      initialItems={result.items}
      initialPagination={result.pagination}
      initialFilters={result.filters}
      options={options}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.USERS_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.USERS_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.USERS_DELETE,
      )}
      canManageGroups={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.GROUPS_VIEW,
      )}
    />
  );
}
