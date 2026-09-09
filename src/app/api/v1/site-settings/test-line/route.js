import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { InvalidRequestError } from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { sendLineTestNotification } from "@/services/notifications/line-notification.service";
import { getInternalNotificationSettings } from "@/services/site-settings/site-settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.SITE_SETTINGS_UPDATE);

    const notificationSettings = await getInternalNotificationSettings();

    const lineSettings = notificationSettings.line;

    if (!lineSettings.channelAccessTokenEncrypted) {
      throw new InvalidRequestError(
        "LINE channel access token is not configured",
      );
    }

    if (
      !Array.isArray(lineSettings.targetIds) ||
      !lineSettings.targetIds.length
    ) {
      throw new InvalidRequestError(
        "At least one LINE user or group ID is required",
      );
    }

    const result = await sendLineTestNotification({
      settings: lineSettings,
    });

    return apiSuccess({
      message:
        result.failedCount > 0
          ? "LINE test notification was sent to some targets"
          : "LINE test notification sent successfully",

      data: {
        success: result.success,

        sentCount: result.sentCount || 0,

        failedCount: result.failedCount || 0,

        results: result.results || [],
      },
    });
  });
}
