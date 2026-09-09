import { z } from "zod";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { InvalidRequestError } from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { createContactAttachmentDownload } from "@/services/contact-messages/contact-attachment.service";
import { getContactMessageById } from "@/services/contact-messages/contact-message-query.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const messageIdSchema = z
  .object({
    messageId: z.string().trim().min(1).max(128),
  })
  .strict();

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.MESSAGES_VIEW);

    const values = await params;

    const { messageId } = messageIdSchema.parse({
      messageId: values.messageId,
    });

    const message = await getContactMessageById(messageId);

    if (!message.attachment?.storagePath) {
      throw new InvalidRequestError("This contact message has no attachment");
    }

    const download = await createContactAttachmentDownload({
      storagePath: message.attachment.storagePath,

      originalName: message.attachment.originalName,
    });

    return apiSuccess({
      message: "Contact attachment download URL created successfully",

      data: download,
    });
  });
}
