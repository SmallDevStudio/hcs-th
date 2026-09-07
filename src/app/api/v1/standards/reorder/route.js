import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { STANDARD_CACHE_TAG } from "@/constants/standards";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderStandardsSchema } from "@/modules/standards/standard.schema";
import { reorderStandards } from "@/services/standards/standard.service";

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
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.STANDARDS_UPDATE);

    const payload = reorderStandardsSchema.parse(await request.json());

    const result = await reorderStandards({
      items: payload.items,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateStandardContent();

    return apiSuccess({
      message: "Standards reordered successfully",

      data: result,
    });
  });
}
