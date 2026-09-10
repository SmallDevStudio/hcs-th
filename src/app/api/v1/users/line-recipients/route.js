import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { getConnectedLineRecipients } from "@/services/users/line-recipient-query.service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.SITE_SETTINGS_VIEW);

    const recipients = await getConnectedLineRecipients({
      actor: admin,
    });

    return apiSuccess({
      message: "Connected LINE users retrieved successfully",

      data: recipients,

      meta: {
        count: recipients.length,
      },
    });
  });
}
