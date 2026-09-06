import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiCreated, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { createMediaUploadSchema } from "@/modules/media/media.schema";
import { createMediaUploadReservation } from "@/services/media/media.service";

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MEDIA_UPLOAD);

    const payload = createMediaUploadSchema.parse(await request.json());

    const reservation = await createMediaUploadReservation({
      input: payload,
      actor: admin,
    });

    return apiCreated({
      message: "Media upload URL created successfully",
      data: reservation,
    });
  });
}
