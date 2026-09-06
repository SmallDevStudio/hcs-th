import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PRODUCT_CACHE_TAG, PRODUCT_STATUSES } from "@/constants/products";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createProductSchema,
  productQuerySchema,
} from "@/modules/products/product.schema";
import { getProducts } from "@/services/products/product-query.service";
import { createProduct } from "@/services/products/product.service";

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

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = productQuerySchema.parse(queryValues);

    const result = await getProducts(filters);

    return apiSuccess({
      message: "Products retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          categoryId: filters.categoryId || null,

          productTypeSlug: filters.productTypeSlug || null,

          standard: filters.standard || null,

          featured: filters.featured === undefined ? null : filters.featured,

          showOnHome:
            filters.showOnHome === undefined ? null : filters.showOnHome,

          fireRated: filters.fireRated === undefined ? null : filters.fireRated,

          search: filters.search || null,
        },
      },
    });
  });
}

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_CREATE);

    const payload = createProductSchema.parse(await request.json());

    if (payload.status === PRODUCT_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PRODUCTS_PUBLISH);
    }

    const product = await createProduct({
      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateProductContent();

    return apiCreated({
      message: "Product created successfully",

      data: product,
    });
  });
}
