import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { mediaIdSchema, updateMediaSchema } from "@/modules/media/media.schema";
import {
  deleteMediaAsset,
  getMediaAssetById,
  updateMediaAsset,
} from "@/services/media/media.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseMediaId(params) {
  const values = await params;

  return mediaIdSchema.parse({
    mediaId: values.mediaId,
  }).mediaId;
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.MEDIA_VIEW);

    const mediaId = await parseMediaId(params);

    const asset = await getMediaAssetById(mediaId);

    return apiSuccess({
      message: "Media asset retrieved successfully",
      data: asset,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MEDIA_UPDATE);

    const mediaId = await parseMediaId(params);

    const payload = updateMediaSchema.parse(await request.json());

    const asset = await updateMediaAsset({
      mediaId,
      input: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Media asset updated successfully",
      data: asset,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MEDIA_DELETE);

    const mediaId = await parseMediaId(params);

    const result = await deleteMediaAsset({
      mediaId,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Media asset moved to trash successfully",
      data: result,
    });
  });
}
