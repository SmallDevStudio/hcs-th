import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PRODUCT_CACHE_TAG } from "@/constants/products";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderProductsSchema } from "@/modules/products/product.schema";
import { reorderProducts } from "@/services/products/product.service";

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

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_UPDATE);

    const payload = reorderProductsSchema.parse(await request.json());

    const result = await reorderProducts({
      items: payload.items,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateProductContent();

    return apiSuccess({
      message: "Products reordered successfully",

      data: result,
    });
  });
}
