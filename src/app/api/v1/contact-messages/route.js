import { apiCreated, withApiHandler } from "@/lib/api/response";
import { createContactMessage } from "@/services/contact-messages/contact-message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRequestIpAddress(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    ""
  );
}

export async function POST(request) {
  return withApiHandler(async () => {
    const input = await request.json();

    const message = await createContactMessage({
      input,

      requestMetadata: {
        ipAddress: getRequestIpAddress(request),

        userAgent: request.headers.get("user-agent") || "",

        referer: request.headers.get("referer") || "",

        page: input?.locale === "th" ? "/th/contact" : "/en/contact",
      },
    });

    return apiCreated({
      data: message,
      message: "Your enquiry has been submitted successfully",
    });
  });
}
