import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requireCurrentAdmin } from "@/lib/auth/current-admin";
import {
  disconnectUserLineAccount,
  getUserLineConnection,
} from "@/services/line/line-account.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function GET() {
  return withApiHandler(async () => {
    const admin = await requireCurrentAdmin();

    const connection = await getUserLineConnection(admin.uid);

    return apiSuccess({
      message: "LINE connection retrieved successfully",

      data: connection,
    });
  });
}

export async function DELETE(request) {
  return withApiHandler(async () => {
    const admin = await requireCurrentAdmin();

    const connection = await disconnectUserLineAccount({
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "LINE account disconnected successfully",

      data: connection,
    });
  });
}
