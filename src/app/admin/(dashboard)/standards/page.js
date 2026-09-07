import { StandardsClient } from "@/components/admin/standards/StandardsClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getStandards } from "@/services/standards/standard-query.service";

export const metadata = {
  title: "Standards & Certificates",
};

async function loadStandards() {
  try {
    return await getStandards({
      limit: 25,
      cursor: undefined,

      status: undefined,

      documentType: undefined,

      documentLanguage: undefined,

      categoryId: undefined,

      productId: undefined,

      featured: undefined,

      showOnHome: undefined,

      search: undefined,
    });
  } catch (error) {
    console.error("Unable to load admin standards:", error);

    return {
      items: [],

      pagination: {
        limit: 25,
        count: 0,
        hasMore: false,
        nextCursor: null,
      },
    };
  }
}

export default async function AdminStandardsPage() {
  const admin = await getCurrentAdmin();

  const userPermissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];

  const result = await loadStandards();

  return (
    <StandardsClient
      initialStandards={result.items}
      initialPagination={result.pagination}
      canCreate={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.STANDARDS_CREATE,
      )}
      canUpdate={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.STANDARDS_UPDATE,
      )}
      canDelete={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.STANDARDS_DELETE,
      )}
    />
  );
}
