import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { CATEGORY_CACHE_TAG } from "@/constants/categories";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  categoryIdSchema,
  updateCategorySchema,
} from "@/modules/categories/category.schema";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/services/categories/category.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseCategoryId(params) {
  const values = await params;

  return categoryIdSchema.parse({
    categoryId: values.categoryId,
  }).categoryId;
}

function revalidateCategoryContent() {
  revalidateTag(CATEGORY_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_VIEW);

    const categoryId = await parseCategoryId(params);

    const category = await getCategoryById(categoryId);

    return apiSuccess({
      message: "Category retrieved successfully",
      data: category,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_UPDATE);

    const categoryId = await parseCategoryId(params);

    const payload = updateCategorySchema.parse(await request.json());

    const category = await updateCategory({
      categoryId,
      input: payload,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateCategoryContent();

    return apiSuccess({
      message: "Category updated successfully",
      data: category,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.CATEGORIES_DELETE);

    const categoryId = await parseCategoryId(params);

    const result = await deleteCategory({
      categoryId,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateCategoryContent();

    return apiSuccess({
      message: "Category moved to trash successfully",
      data: result,
    });
  });
}
