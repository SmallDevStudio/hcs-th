import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { SOLUTION_CACHE_TAG, SOLUTION_STATUSES } from "@/constants/solutions";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createSolutionSchema,
  solutionQuerySchema,
} from "@/modules/solutions/solution.schema";
import { getSolutions } from "@/services/solutions/solution-query.service";
import { createSolution } from "@/services/solutions/solution.service";

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

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = solutionQuerySchema.parse(queryValues);

    const result = await getSolutions(filters);

    return apiSuccess({
      message: "Solutions retrieved successfully",

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
    const admin = await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_CREATE);

    const payload = createSolutionSchema.parse(await request.json());

    if (payload.status === SOLUTION_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.SOLUTIONS_PUBLISH);
    }

    const solution = await createSolution({
      input: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateSolutionContent();

    return apiCreated({
      message: "Solution created successfully",
      data: solution,
    });
  });
}
