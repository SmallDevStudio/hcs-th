import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PROJECT_CACHE_TAG } from "@/constants/projects";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderProjectsSchema } from "@/modules/projects/project.schema";
import { reorderProjects } from "@/services/projects/project.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateProjectContent() {
  revalidateTag(PROJECT_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/projects", "layout");
  revalidatePath("/th/projects", "layout");
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PROJECTS_UPDATE);

    const payload = reorderProjectsSchema.parse(await request.json());

    const result = await reorderProjects({
      items: payload.items,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateProjectContent();

    return apiSuccess({
      message: "Projects reordered successfully",
      data: result,
    });
  });
}
