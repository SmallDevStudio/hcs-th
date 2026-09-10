import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { publishAboutPageSchema } from "@/modules/about/about.schema";
import { publishAboutPage } from "@/services/about/about.service";

import {
  attachAboutVersionHeaders,
  getRequestMetadata,
  parseExpectedDraftVersion,
  revalidateAboutPublic,
} from "@/app/api/v1/about/about-route.utils";

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_PUBLISH);

    const expectedDraftVersion = parseExpectedDraftVersion(request);

    const payload = publishAboutPageSchema.parse({
      expectedDraftVersion,
    });

    const page = await publishAboutPage({
      expectedDraftVersion: payload.expectedDraftVersion,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateAboutPublic();

    const response = apiSuccess({
      message: "About page published successfully",

      data: page,
    });

    return attachAboutVersionHeaders(response, page);
  });
}
