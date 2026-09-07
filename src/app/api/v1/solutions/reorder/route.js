import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { SOLUTION_CACHE_TAG } from "@/constants/solutions";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderSolutionsSchema } from "@/modules/solutions/solution.schema";
import { reorderSolutions } from "@/services/solutions/solution.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateSolutionContent() {
  revalidateTag(SOLUTION_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/solutions");
  revalidatePath("/th/solutions");
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_UPDATE);

    const payload = reorderSolutionsSchema.parse(await request.json());

    const result = await reorderSolutions({
      items: payload.items,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateSolutionContent();

    return apiSuccess({
      message: "Solutions reordered successfully",
      data: result,
    });
  });
}
