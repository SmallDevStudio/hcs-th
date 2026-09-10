import "server-only";

import { unstable_cache } from "next/cache";

import { ABOUT_PAGE_CACHE_TAG, ABOUT_PAGE_ID } from "@/constants/about";
import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import {
  createEmptyAboutPage,
  serializeAboutPageDocument,
} from "@/services/about/about-serializer.service";

export async function getAboutPage() {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PAGES)
    .doc(ABOUT_PAGE_ID)
    .get();

  if (!snapshot.exists) {
    return createEmptyAboutPage();
  }

  return serializeAboutPageDocument(snapshot);
}

const getCachedPublicAboutPage = unstable_cache(
  async () => {
    const snapshot = await adminDb
      .collection(COLLECTIONS.PAGES)
      .doc(ABOUT_PAGE_ID)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    const page = serializeAboutPageDocument(snapshot);

    if (!page.published || page.publishedVersion <= 0) {
      return null;
    }

    return {
      id: page.id,
      version: page.publishedVersion,
      seo: page.published.seo,

      sections: page.published.sections.filter((section) => section.enabled),

      publishedAt: page.published.publishedAt,
      publishedBy: page.published.publishedBy,
    };
  },
  ["public-about-page"],
  {
    tags: [ABOUT_PAGE_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function getPublicAboutPage() {
  return getCachedPublicAboutPage();
}
