import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PROJECT_CACHE_TAG, PROJECT_STATUSES } from "@/constants/projects";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createProjectSchema,
  projectQuerySchema,
} from "@/modules/projects/project.schema";
import { getProjects } from "@/services/projects/project-query.service";
import { createProject } from "@/services/projects/project.service";

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

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PROJECTS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = projectQuerySchema.parse(queryValues);

    const result = await getProjects(filters);

    return apiSuccess({
      message: "Projects retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          buildingType: filters.buildingType || null,

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
    const admin = await requirePermission(ADMIN_PERMISSIONS.PROJECTS_CREATE);

    const payload = createProjectSchema.parse(await request.json());

    if (payload.status === PROJECT_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PROJECTS_PUBLISH);
    }

    const project = await createProject({
      input: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateProjectContent();

    return apiCreated({
      message: "Project created successfully",
      data: project,
    });
  });
}
