import { z } from "zod";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { InvalidRequestError } from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { sendSmtpTestEmail } from "@/services/email/smtp.service";
import { getInternalNotificationSettings } from "@/services/site-settings/site-settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const testEmailSchema = z
  .object({
    recipient: z
      .string()
      .trim()
      .email("A valid test email address is required"),
  })
  .strict();

export async function POST(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.SITE_SETTINGS_UPDATE);

    const payload = testEmailSchema.parse(await request.json());

    const notificationSettings = await getInternalNotificationSettings();

    const emailSettings = notificationSettings.email;

    if (!emailSettings.smtpHost) {
      throw new InvalidRequestError("SMTP host is not configured");
    }

    if (!emailSettings.smtpUsername) {
      throw new InvalidRequestError("SMTP username is not configured");
    }

    if (!emailSettings.smtpPasswordEncrypted) {
      throw new InvalidRequestError("SMTP password is not configured");
    }

    if (!emailSettings.fromEmail) {
      throw new InvalidRequestError("Sender email is not configured");
    }

    const result = await sendSmtpTestEmail({
      settings: emailSettings,

      recipient: payload.recipient,
    });

    return apiSuccess({
      message: "SMTP test email sent successfully",

      data: {
        messageId: result.messageId || "",

        accepted: result.accepted || [],

        rejected: result.rejected || [],
      },
    });
  });
}
