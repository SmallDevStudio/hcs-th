import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { HOME_HERO_CACHE_TAG, HOME_SECTION_STATUSES } from "@/constants/home";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  homeHeroIdSchema,
  updateHomeHeroSchema,
} from "@/modules/home/home-hero.schema";
import { getHomeHeroById } from "@/services/home/home-hero-query.service";
import {
  deleteHomeHero,
  updateHomeHero,
} from "@/services/home/home-hero.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseHeroId(params) {
  const values = await params;

  return homeHeroIdSchema.parse({
    heroId: values.heroId,
  }).heroId;
}

function revalidateHomeHeroContent() {
  revalidateTag(HOME_HERO_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/admin/home");
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

    const heroId = await parseHeroId(params);

    const hero = await getHomeHeroById(heroId);

    return apiSuccess({
      message: "Home Hero slide retrieved successfully",

      data: hero,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_UPDATE);

    const heroId = await parseHeroId(params);

    const payload = updateHomeHeroSchema.parse(await request.json());

    if (payload.status === HOME_SECTION_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PAGES_PUBLISH);
    }

    const hero = await updateHomeHero({
      heroId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateHomeHeroContent();

    return apiSuccess({
      message: "Home Hero slide updated successfully",

      data: hero,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_DELETE);

    const heroId = await parseHeroId(params);

    const result = await deleteHomeHero({
      heroId,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateHomeHeroContent();

    return apiSuccess({
      message: "Home Hero slide moved to trash successfully",

      data: result,
    });
  });
}
