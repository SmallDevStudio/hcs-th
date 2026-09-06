import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { CATEGORY_CACHE_TAG } from "@/constants/categories";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderCategoriesSchema } from "@/modules/categories/category.schema";
import { reorderCategories } from "@/services/categories/category.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_UPDATE);

    const payload = reorderCategoriesSchema.parse(await request.json());

    const result = await reorderCategories({
      items: payload.items,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateTag(CATEGORY_CACHE_TAG, "max");

    revalidatePath("/en", "layout");
    revalidatePath("/th", "layout");

    return apiSuccess({
      message: "Categories reordered successfully",
      data: result,
    });
  });
}
