import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { auditLogQuerySchema } from "@/modules/audit/audit-query.schema";
import { getAuditLogs } from "@/services/audit/audit-query.service";

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.AUDIT_LOGS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = auditLogQuerySchema.parse(queryValues);

    const result = await getAuditLogs(filters);

    return apiSuccess({
      message: "Audit logs retrieved successfully",
      data: result.items,
      meta: {
        pagination: result.pagination,
        filters: {
          action: filters.action || null,
          entityType: filters.entityType || null,
          actorUid: filters.actorUid || null,
          dateFrom: filters.dateFrom || null,
          dateTo: filters.dateTo || null,
        },
      },
    });
  });
}
