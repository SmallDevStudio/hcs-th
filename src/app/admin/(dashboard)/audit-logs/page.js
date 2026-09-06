import { AuditLogsClient } from "@/components/admin/audit/AuditLogsClient";
import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getAuditLogs } from "@/services/audit/audit-query.service";

export const metadata = {
  title: "Audit Logs",
};

export default async function AdminAuditLogsPage() {
  await requireAdminPagePermission(ADMIN_PERMISSIONS.AUDIT_LOGS_VIEW);

  const result = await getAuditLogs({
    limit: 25,
    cursor: undefined,
    action: undefined,
    entityType: undefined,
    actorUid: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  return (
    <AuditLogsClient
      initialItems={result.items}
      initialPagination={result.pagination}
    />
  );
}
