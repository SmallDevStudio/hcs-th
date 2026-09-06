import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { completeMediaUploadSchema } from "@/modules/media/media.schema";
import { completeMediaUpload } from "@/services/media/media.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function POST(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MEDIA_UPLOAD);

    const { mediaId } = await params;
    const requestBody = await request.json();

    const payload = completeMediaUploadSchema.parse({
      ...requestBody,
      mediaId,
    });

    const asset = await completeMediaUpload({
      mediaId: payload.mediaId,
      storagePath: payload.storagePath,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Media upload completed successfully",
      data: asset,
    });
  });
}
