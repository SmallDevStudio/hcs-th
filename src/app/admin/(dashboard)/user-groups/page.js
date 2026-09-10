import { UserGroupsClient } from "@/components/admin/user-groups/UserGroupsClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Permission Groups | HCS Admin",
};

export default async function AdminUserGroupsPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.GROUPS_VIEW);

  return (
    <UserGroupsClient
      currentUser={admin}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.GROUPS_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.GROUPS_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.GROUPS_DELETE,
      )}
    />
  );
}
