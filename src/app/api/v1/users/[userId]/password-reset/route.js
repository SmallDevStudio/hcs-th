import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  adminSetUserPasswordSchema,
  userIdSchema,
} from "@/modules/users/user.schema";
import { setUserPassword } from "@/services/users/user.service";

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

export async function POST(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.USERS_UPDATE);

    const userId = await parseUserId(params);

    const payload = adminSetUserPasswordSchema.parse(await request.json());

    const user = await setUserPassword({
      userId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "User password set successfully",

      data: user,
    });
  });
}
