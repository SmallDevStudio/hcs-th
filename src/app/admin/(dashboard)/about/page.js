import { AboutBuilderClient } from "@/components/admin/about/AboutBuilderClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getAboutPage } from "@/services/about/about-query.service";

export const metadata = {
  title: "About Page",
};

export default async function AdminAboutPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

  const page = await getAboutPage();

  return (
    <AboutBuilderClient
      initialPage={page}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_UPDATE,
      )}
      canPublish={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PAGES_PUBLISH,
      )}
    />
  );
}
