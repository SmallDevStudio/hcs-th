import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { requirePermission } from "@/lib/auth/current-admin";
import { contactMessageQuerySchema } from "@/modules/contact-messages/contact-message.schema";
import { getContactMessages } from "@/services/contact-messages/contact-message-query.service";
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

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.MESSAGES_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = contactMessageQuerySchema.parse(queryValues);

    const result = await getContactMessages({
      limit: filters.limit,
      cursor: filters.cursor,
      status: filters.status || undefined,
      search: filters.search || undefined,
    });

    return apiSuccess({
      message: "Contact messages retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,

          search: filters.search || null,
        },
      },
    });
  });
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
