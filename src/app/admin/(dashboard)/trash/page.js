import { TrashClient } from "@/components/admin/trash/TrashClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getTrashItems } from "@/services/trash/trash.service";

export const metadata = {
  title: "Trash",
};

export default async function AdminTrashPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.TRASH_VIEW);

  const result = await getTrashItems({
    limit: 25,
    cursor: undefined,
    entityType: undefined,
  });

  return (
    <TrashClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canRestore={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.TRASH_RESTORE,
      )}
      canDeletePermanently={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.TRASH_DELETE_PERMANENTLY,
      )}
    />
  );
}
