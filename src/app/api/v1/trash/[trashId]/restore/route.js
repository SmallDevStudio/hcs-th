import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { restoreTrashItem } from "@/services/trash/trash.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function POST(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.TRASH_RESTORE);

    const { trashId } = await params;

    const result = await restoreTrashItem({
      trashId,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Trash item restored successfully",
      data: result,
    });
  });
}
