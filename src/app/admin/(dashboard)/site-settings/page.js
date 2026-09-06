import { SiteSettingsForm } from "@/components/admin/site-settings/SiteSettingsForm";
import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getSiteSettings } from "@/services/site-settings/site-settings.service";

export const metadata = {
  title: "Site Settings",
};

export default async function AdminSiteSettingsPage() {
  await requireAdminPagePermission(ADMIN_PERMISSIONS.SITE_SETTINGS_VIEW);

  const settings = await getSiteSettings();

  return <SiteSettingsForm initialSettings={settings} />;
}
