import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { HOME_HERO_CACHE_TAG, HOME_SECTION_STATUSES } from "@/constants/home";
import { apiCreated, apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  createHomeHeroSchema,
  homeHeroQuerySchema,
} from "@/modules/home/home-hero.schema";
import { getHomeHeroes } from "@/services/home/home-hero-query.service";
import { createHomeHero } from "@/services/home/home-hero.service";

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

export async function GET(request) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.PAGES_VIEW);

    const queryValues = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const filters = homeHeroQuerySchema.parse(queryValues);

    const result = await getHomeHeroes(filters);

    return apiSuccess({
      message: "Home Hero slides retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,

        filters: {
          status: filters.status || null,
        },
      },
    });
  });
}

export async function POST(request) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.PAGES_CREATE);

    const payload = createHomeHeroSchema.parse(await request.json());

    if (payload.status === HOME_SECTION_STATUSES.PUBLISHED) {
      await requirePermission(ADMIN_PERMISSIONS.PAGES_PUBLISH);
    }

    const hero = await createHomeHero({
      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateHomeHeroContent();

    return apiCreated({
      message: "Home Hero slide created successfully",

      data: hero,
    });
  });
}
