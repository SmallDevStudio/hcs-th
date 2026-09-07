import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { SOLUTION_CACHE_TAG, SOLUTION_STATUSES } from "@/constants/solutions";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  solutionIdSchema,
  updateSolutionSchema,
} from "@/modules/solutions/solution.schema";
import {
  deleteSolution,
  getSolutionById,
  updateSolution,
} from "@/services/solutions/solution.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseSolutionId(params) {
  const values = await params;

  return solutionIdSchema.parse({
    solutionId: values.solutionId,
  }).solutionId;
}

function revalidateSolutionContent() {
  revalidateTag(SOLUTION_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/solutions");
  revalidatePath("/th/solutions");
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_VIEW);

    const solutionId = await parseSolutionId(params);

    const solution = await getSolutionById(solutionId);

    return apiSuccess({
      message: "Solution retrieved successfully",
      data: solution,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_UPDATE);

    const solutionId = await parseSolutionId(params);

    const payload = updateSolutionSchema.parse(await request.json());

    if (payload.status === SOLUTION_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_PUBLISH);
    }

    const solution = await updateSolution({
      solutionId,
      input: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateSolutionContent();

    return apiSuccess({
      message: "Solution updated successfully",
      data: solution,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_DELETE);

    const solutionId = await parseSolutionId(params);

    const result = await deleteSolution({
      solutionId,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateSolutionContent();

    return apiSuccess({
      message: "Solution moved to trash successfully",
      data: result,
    });
  });
}
