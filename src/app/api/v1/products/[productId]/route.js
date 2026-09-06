import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PRODUCT_CACHE_TAG, PRODUCT_STATUSES } from "@/constants/products";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  productIdSchema,
  updateProductSchema,
} from "@/modules/products/product.schema";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/services/products/product.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseProductId(params) {
  const values = await params;

  return productIdSchema.parse({
    productId: values.productId,
  }).productId;
}

function revalidateProductContent() {
  revalidateTag(PRODUCT_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_VIEW);

    const productId = await parseProductId(params);

    const product = await getProductById(productId);

    return apiSuccess({
      message: "Product retrieved successfully",

      data: product,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_UPDATE);

    const productId = await parseProductId(params);

    const payload = updateProductSchema.parse(await request.json());

    if (payload.status === PRODUCT_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_PUBLISH);
    }

    const product = await updateProduct({
      productId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateProductContent();

    return apiSuccess({
      message: "Product updated successfully",

      data: product,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_DELETE);

    const productId = await parseProductId(params);

    const result = await deleteProduct({
      productId,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateProductContent();

    return apiSuccess({
      message: "Product moved to trash successfully",

      data: result,
    });
  });
}
