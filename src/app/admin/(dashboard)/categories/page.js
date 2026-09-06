import { CategoriesClient } from "@/components/admin/categories/CategoriesClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getCategories } from "@/services/categories/category-query.service";

export const metadata = {
  title: "Product Categories",
};

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.CATEGORIES_VIEW,
  );

  const result = await getCategories({
    limit: 25,
    cursor: undefined,
    status: undefined,
    featured: undefined,
    showOnHome: undefined,
    search: undefined,
  });

  return (
    <CategoriesClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.CATEGORIES_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.CATEGORIES_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.CATEGORIES_DELETE,
      )}
    />
  );
}
