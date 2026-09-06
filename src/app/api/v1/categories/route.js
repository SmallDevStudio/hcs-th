import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { CATEGORY_CACHE_TAG } from "@/constants/categories";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  categoryQuerySchema,
  createCategorySchema,
} from "@/modules/categories/category.schema";
import { createCategory } from "@/services/categories/category.service";
import { getCategories } from "@/services/categories/category-query.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateCategoryContent() {
  revalidateTag(CATEGORY_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");
}

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = categoryQuerySchema.parse(queryValues);

    const result = await getCategories(filters);

    return apiSuccess({
      message: "Categories retrieved successfully",
      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          featured: filters.featured === undefined ? null : filters.featured,

          showOnHome:
            filters.showOnHome === undefined ? null : filters.showOnHome,

          search: filters.search || null,
        },
      },
    });
  });
}

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_CREATE);

    const payload = createCategorySchema.parse(await request.json());

    const category = await createCategory({
      input: payload,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateCategoryContent();

    return apiCreated({
      message: "Category created successfully",
      data: category,
    });
  });
}
