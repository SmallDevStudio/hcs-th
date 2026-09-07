import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { STANDARD_CACHE_TAG, STANDARD_STATUSES } from "@/constants/standards";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createStandardSchema,
  standardQuerySchema,
} from "@/modules/standards/standard.schema";
import { getStandards } from "@/services/standards/standard-query.service";
import { createStandard } from "@/services/standards/standard.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateStandardContent() {
  revalidateTag(STANDARD_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/standards");
  revalidatePath("/th/standards");

  revalidatePath("/en/products");
  revalidatePath("/th/products");
}

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.STANDARDS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = standardQuerySchema.parse(queryValues);

    const result = await getStandards(filters);

    return apiSuccess({
      message: "Standards retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          documentType: filters.documentType || null,

          documentLanguage: filters.documentLanguage || null,

          categoryId: filters.categoryId || null,

          productId: filters.productId || null,

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
    const admin = await requirePermission(ADMIN_PERMISSIONS.STANDARDS_CREATE);

    const payload = createStandardSchema.parse(await request.json());

    const standard = await createStandard({
      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateStandardContent();

    return apiCreated({
      message: "Standard created successfully",

      data: standard,
    });
  });
}
