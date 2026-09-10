import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { createUserSchema, userQuerySchema } from "@/modules/users/user.schema";
import {
  getManagedUsers,
  getUserManagementOptions,
} from "@/services/users/user-query.service";
import { createUser } from "@/services/users/user.service";

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
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = userQuerySchema.parse(queryValues);

    const result = await getManagedUsers({
      actor: admin,

      ...filters,
    });

    return apiSuccess({
      message: "Users retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: result.filters,

        options: getUserManagementOptions({
          actor: admin,
        }),
      },
    });
  });
}

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_CREATE);

    const payload = createUserSchema.parse(await request.json());

    const user = await createUser({
      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiCreated({
      message: "User created successfully",

      data: user,
    });
  });
}
