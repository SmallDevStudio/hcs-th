import { ProjectsClient } from "@/components/admin/projects/ProjectsClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getProducts } from "@/services/products/product-query.service";
import { getProjects } from "@/services/projects/project-query.service";
import { getSolutions } from "@/services/solutions/solution-query.service";

export const metadata = {
  title: "Project References",
};

export default async function AdminProjectsPage() {
  const admin = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.PROJECTS_VIEW,
  );

  const [projectsResult, productsResult, solutionsResult] = await Promise.all([
    getProjects({
      limit: 25,
      cursor: undefined,
      status: undefined,
      buildingType: undefined,
      featured: undefined,
      showOnHome: undefined,
      search: undefined,
    }),

    getProducts({
      limit: 100,
      cursor: undefined,
      status: undefined,
      categoryId: undefined,
      productTypeSlug: undefined,
      standard: undefined,
      featured: undefined,
      showOnHome: undefined,
      fireRated: undefined,
      search: undefined,
    }),

    getSolutions({
      limit: 100,
      cursor: undefined,
      status: undefined,
      featured: undefined,
      showOnHome: undefined,
      search: undefined,
    }),
  ]);

  const userPermissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];

  return (
    <ProjectsClient
      initialItems={projectsResult.items}
      initialPagination={projectsResult.pagination}
      products={productsResult.items}
      solutions={solutionsResult.items}
      canCreate={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.PROJECTS_CREATE,
      )}
      canUpdate={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.PROJECTS_UPDATE,
      )}
      canDelete={hasPermission(
        userPermissions,
        ADMIN_PERMISSIONS.PROJECTS_DELETE,
      )}
    />
  );
}
