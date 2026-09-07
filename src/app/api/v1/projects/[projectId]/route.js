import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { PROJECT_CACHE_TAG, PROJECT_STATUSES } from "@/constants/projects";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  projectIdSchema,
  updateProjectSchema,
} from "@/modules/projects/project.schema";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/services/projects/project.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseProjectId(params) {
  const values = await params;

  return projectIdSchema.parse({
    projectId: values.projectId,
  }).projectId;
}

function revalidateProjectContent() {
  revalidateTag(PROJECT_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/projects", "layout");
  revalidatePath("/th/projects", "layout");
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PROJECTS_VIEW);

    const projectId = await parseProjectId(params);

    const project = await getProjectById(projectId);

    return apiSuccess({
      message: "Project retrieved successfully",
      data: project,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PROJECTS_UPDATE);

    const projectId = await parseProjectId(params);

    const payload = updateProjectSchema.parse(await request.json());

    if (payload.status === PROJECT_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PROJECTS_PUBLISH);
    }

    const project = await updateProject({
      projectId,
      input: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateProjectContent();

    return apiSuccess({
      message: "Project updated successfully",
      data: project,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PROJECTS_DELETE);

    const projectId = await parseProjectId(params);

    const result = await deleteProject({
      projectId,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateProjectContent();

    return apiSuccess({
      message: "Project moved to trash successfully",
      data: result,
    });
  });
}
