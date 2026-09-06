import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { DEFAULT_SITE_SETTINGS } from "@/modules/site-settings/site-settings.defaults";
import { getSiteSettings } from "@/services/site-settings/site-settings.service";

function createFallbackSettings() {
  return {
    id: "global",
    ...structuredClone(DEFAULT_SITE_SETTINGS),
    createdAt: null,
    updatedAt: null,
    updatedBy: null,
  };
}

async function loadPublicSiteSettings() {
  try {
    return await getSiteSettings();
  } catch (error) {
    console.error(
      "Unable to load public site settings. Using fallback settings.",
      error,
    );

    return createFallbackSettings();
  }
}

export const getPublicSiteSettings = unstable_cache(
  loadPublicSiteSettings,
  ["hcs-public-site-settings"],
  {
    tags: [CACHE_TAGS.SITE_SETTINGS],
    revalidate: 3600,
  },
);
