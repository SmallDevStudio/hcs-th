import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { unpublishAboutPage } from "@/services/about/about.service";

import {
  attachAboutVersionHeaders,
  getRequestMetadata,
  revalidateAboutPublic,
} from "@/app/api/v1/about/about-route.utils";

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_PUBLISH);

    const page = await unpublishAboutPage({
      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateAboutPublic();

    const response = apiSuccess({
      message: "About page unpublished successfully",

      data: page,
    });

    return attachAboutVersionHeaders(response, page);
  });
}
