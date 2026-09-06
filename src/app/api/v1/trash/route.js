import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { trashQuerySchema } from "@/modules/trash/trash.schema";
import { getTrashItems } from "@/services/trash/trash.service";

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.TRASH_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = trashQuerySchema.parse(queryValues);

    const result = await getTrashItems(filters);

    return apiSuccess({
      message: "Trash items retrieved successfully",
      data: result.items,
      meta: {
        pagination: result.pagination,
        filters: {
          entityType: filters.entityType || null,
        },
      },
    });
  });
}
