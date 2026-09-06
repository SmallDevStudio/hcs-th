import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { mediaQuerySchema } from "@/modules/media/media.schema";
import { getMediaAssets } from "@/services/media/media.service";

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.MEDIA_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = mediaQuerySchema.parse(queryValues);

    const result = await getMediaAssets(filters);

    return apiSuccess({
      message: "Media assets retrieved successfully",
      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          type: filters.type || null,
          folder: filters.folder || null,
          status: filters.status || null,
          search: filters.search || null,
          usage: filters.usage,
        },
      },
    });
  });
}
