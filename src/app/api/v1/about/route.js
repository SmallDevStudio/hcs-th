import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { saveAboutDraftSchema } from "@/modules/about/about.schema";
import { getAboutPage } from "@/services/about/about-query.service";
import { saveAboutDraft } from "@/services/about/about.service";

import {
  attachAboutVersionHeaders,
  getRequestMetadata,
  parseExpectedDraftVersion,
  revalidateAboutAdmin,
} from "@/app/api/v1/about/about-route.utils";

export async function GET() {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

    const page = await getAboutPage();

    const response = apiSuccess({
      message: "About page retrieved successfully",

      data: page,
    });

    return attachAboutVersionHeaders(response, page);
  });
}

export async function PATCH(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_UPDATE);

    const expectedDraftVersion = parseExpectedDraftVersion(request);

    const payload = saveAboutDraftSchema.parse(await request.json());

    const page = await saveAboutDraft({
      input: payload,

      expectedDraftVersion,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateAboutAdmin();

    const response = apiSuccess({
      message: "About page draft saved successfully",

      data: page,
    });

    return attachAboutVersionHeaders(response, page);
  });
}
