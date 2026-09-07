import { HomeHeroesClient } from "@/components/admin/home/HomeHeroesClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getHomeHeroes } from "@/services/home/home-hero-query.service";

export const metadata = {
  title: "Home Page",
};

export default async function AdminHomePage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

  const result = await getHomeHeroes({
    limit: 100,

    status: undefined,
  });

  return (
    <HomeHeroesClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_DELETE,
      )}
      canPublish={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_PUBLISH,
      )}
    />
  );
}
