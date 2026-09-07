import { SolutionsClient } from "@/components/admin/solutions/SolutionsClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getSolutions } from "@/services/solutions/solution-query.service";

export const metadata = {
  title: "Solutions",
};

export default async function AdminSolutionsPage() {
  const admin = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.SOLUTIONS_VIEW,
  );

  const result = await getSolutions({
    limit: 25,
    cursor: undefined,
    status: undefined,
    featured: undefined,
    showOnHome: undefined,
    search: undefined,
  });

  return (
    <SolutionsClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.SOLUTIONS_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.SOLUTIONS_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.SOLUTIONS_DELETE,
      )}
    />
  );
}
