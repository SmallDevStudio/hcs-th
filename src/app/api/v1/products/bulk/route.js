import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PRODUCT_CACHE_TAG } from "@/constants/products";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { bulkProductActionSchema } from "@/modules/products/product.schema";
import { bulkUpdateProducts } from "@/services/products/product.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",
    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateProductContent() {
  revalidateTag(PRODUCT_CACHE_TAG, "max");
  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");
}

export async function POST(request) {
  return withApiHandler(async () => {
    const payload = bulkProductActionSchema.parse(await request.json());

    const permissionByAction = {
      publish: ADMIN_PERMISSIONS.PRODUCTS_PUBLISH,
      unpublish: ADMIN_PERMISSIONS.PRODUCTS_PUBLISH,
      deactivate: ADMIN_PERMISSIONS.PRODUCTS_UPDATE,
      delete: ADMIN_PERMISSIONS.PRODUCTS_DELETE,
    };

    const admin = await requirePermission(permissionByAction[payload.action]);

    const result = await bulkUpdateProducts({
      action: payload.action,
      productIds: payload.productIds,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateProductContent();

    return apiSuccess({
      message: "Bulk product operation completed",
      data: result,
    });
  });
}
