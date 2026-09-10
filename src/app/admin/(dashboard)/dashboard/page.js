import { AdminDashboardContent } from "@/components/admin/dashboard/AdminDashboardContent";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getAdminDashboardData } from "@/services/dashboard/dashboard.service";

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
  );

  const canViewAuditLogs = hasPermission(
    admin.permissions,
    ADMIN_PERMISSIONS.AUDIT_LOGS_VIEW,
  );

  const dashboardData = await getAdminDashboardData({
    includeRecentActivity: canViewAuditLogs,
  });

  return (
    <AdminDashboardContent
      admin={admin}
      statistics={dashboardData.statistics}
      recentActivity={dashboardData.recentActivity}
      canViewAuditLogs={canViewAuditLogs}
    />
  );
}
