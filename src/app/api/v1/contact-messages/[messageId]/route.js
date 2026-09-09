import { z } from "zod";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { updateContactMessageSchema } from "@/modules/contact-messages/contact-message.schema";
import { getContactMessageById } from "@/services/contact-messages/contact-message-query.service";
import {
  deleteContactMessage,
  updateContactMessage,
} from "@/services/contact-messages/contact-message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactMessageIdSchema = z
  .object({
    messageId: z.string().trim().min(1).max(128),
  })
  .strict();

async function parseMessageId(params) {
  const values = await params;

  return contactMessageIdSchema.parse({
    messageId: values.messageId,
  }).messageId;
}

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.MESSAGES_VIEW);

    const messageId = await parseMessageId(params);

    const message = await getContactMessageById(messageId);

    return apiSuccess({
      message: "Contact message retrieved successfully",

      data: message,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MESSAGES_UPDATE);

    const messageId = await parseMessageId(params);

    const payload = updateContactMessageSchema.parse(await request.json());

    const message = await updateContactMessage({
      messageId,
      input: payload,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Contact message updated successfully",

      data: message,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.MESSAGES_DELETE);

    const messageId = await parseMessageId(params);

    const result = await deleteContactMessage({
      messageId,
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Contact message moved to trash successfully",

      data: result,
    });
  });
}
