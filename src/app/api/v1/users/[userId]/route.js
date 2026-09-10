import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { updateUserSchema, userIdSchema } from "@/modules/users/user.schema";
import { getManagedUserById } from "@/services/users/user-query.service";
import { hardDeleteUser, updateUser } from "@/services/users/user.service";

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

async function parseUserId(params) {
  const values = await params;

  return userIdSchema.parse({
    userId: values.userId,
  }).userId;
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_VIEW);

    const userId = await parseUserId(params);

    const user = await getManagedUserById({
      userId,

      actor: admin,
    });

    return apiSuccess({
      message: "User retrieved successfully",

      data: user,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_UPDATE);

    const userId = await parseUserId(params);

    const payload = updateUserSchema.parse(await request.json());

    const user = await updateUser({
      userId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "User updated successfully",

      data: user,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_DELETE);

    const userId = await parseUserId(params);

    const result = await hardDeleteUser({
      userId,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "User permanently deleted successfully",

      data: result,
    });
  });
}
