import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { HOME_HERO_CACHE_TAG } from "@/constants/home";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import { reorderHomeHeroesSchema } from "@/modules/home/home-hero.schema";
import { reorderHomeHeroes } from "@/services/home/home-hero.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateHomeHeroContent() {
  revalidateTag(HOME_HERO_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/admin/home");
}

export async function PUT(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_UPDATE);

    const payload = reorderHomeHeroesSchema.parse(await request.json());

    const result = await reorderHomeHeroes({
      items: payload.items,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateHomeHeroContent();

    return apiSuccess({
      message: "Home Hero slides reordered successfully",

      data: result,
    });
  });
}
