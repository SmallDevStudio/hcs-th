import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createUserGroupSchema,
  userGroupQuerySchema,
} from "@/modules/user-groups/user-group.schema";
import {
  createUserGroup,
  getUserGroups,
} from "@/services/user-groups/user-group.service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.GROUPS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = userGroupQuerySchema.parse(queryValues);

    const result = await getUserGroups(filters);

    return apiSuccess({
      message: "Permission groups retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          search: filters.search || "",
        },
      },
    });
  });
}

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.GROUPS_CREATE);

    const payload = createUserGroupSchema.parse(await request.json());

    const group = await createUserGroup({
      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiCreated({
      message: "Permission group created successfully",

      data: group,
    });
  });
}
