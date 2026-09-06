import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { CACHE_TAGS } from "@/constants/cache-tags";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { updateSiteSettingsSchema } from "@/modules/site-settings/site-settings.schema";
import {
  getSiteSettings,
  updateSiteSettings,
} from "@/services/site-settings/site-settings.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export async function GET() {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.SITE_SETTINGS_VIEW);

    const settings = await getSiteSettings();

    return apiSuccess({
      message: "Site settings retrieved successfully",
      data: settings,
    });
  });
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(
      ADMIN_PERMISSIONS.SITE_SETTINGS_UPDATE,
    );

    const payload = updateSiteSettingsSchema.parse(await request.json());

    const settings = await updateSiteSettings({
      settings: payload,
      actor: admin,
      requestMetadata: getRequestMetadata(request),
    });

    revalidateTag(CACHE_TAGS.SITE_SETTINGS, "max");

    revalidatePath("/en", "layout");
    revalidatePath("/th", "layout");

    return apiSuccess({
      message: "Site settings updated successfully",
      data: settings,
    });
  });
}
