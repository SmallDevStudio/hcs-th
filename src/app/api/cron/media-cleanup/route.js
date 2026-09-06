import { serverEnv } from "@/config/env.server";
import { AuthenticationError } from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { cleanupIncompleteMediaUploads } from "@/services/media/media-cleanup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCronRequest(request) {
  const authorization = request.headers.get("authorization");

  const expectedAuthorization = `Bearer ${serverEnv.CRON_SECRET}`;

  if (!serverEnv.CRON_SECRET || authorization !== expectedAuthorization) {
    throw new AuthenticationError("Invalid cron authorization");
  }
}

export async function GET(request) {
  return withApiHandler(async () => {
    verifyCronRequest(request);

    const result = await cleanupIncompleteMediaUploads({
      limit: 100,
    });

    return apiSuccess({
      message: "Incomplete media upload cleanup completed",
      data: result,
    });
  });
}
