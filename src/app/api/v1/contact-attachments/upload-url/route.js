import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { createContactAttachmentUpload } from "@/services/contact-messages/contact-attachment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return withApiHandler(async () => {
    const input = await request.json();

    const upload = await createContactAttachmentUpload({
      originalName: input?.originalName,
      mimeType: input?.mimeType,
      size: input?.size,
    });

    return apiSuccess({
      data: upload,
      message: "Contact attachment upload prepared",
    });
  });
}
