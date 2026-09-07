import "server-only";

import { unstable_cache } from "next/cache";

import { COLLECTIONS } from "@/constants/collections";
import {
  HOME_HERO_CACHE_TAG,
  HOME_HERO_LIMITS,
  HOME_SECTION_STATUSES,
  HOME_SECTION_TYPES,
} from "@/constants/home";
import { NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function serializeLocalizedValue(value) {
  return {
    en: value?.en || "",

    th: value?.th || "",
  };
}

function serializeAction(value) {
  return {
    label: serializeLocalizedValue(value?.label),

    href: value?.href || "",
  };
}

function serializeMediaSnapshot(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,

    publicUrl: value.publicUrl || null,

    storagePath: value.storagePath || null,

    originalName: value.originalName || "",

    mimeType: value.mimeType || "",

    extension: value.extension || "",

    size: Number(value.size || 0),

    width: value.width || null,

    height: value.height || null,

    title: serializeLocalizedValue(value.title),

    altText: serializeLocalizedValue(value.altText),
  };
}

function serializeDisplaySchedule(value) {
  return {
    startsAt: serializeTimestamp(value?.startsAt),

    endsAt: serializeTimestamp(value?.endsAt),
  };
}

export function serializeHomeHeroDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    sectionType: data.sectionType || HOME_SECTION_TYPES.HERO_SLIDE,

    eyebrow: serializeLocalizedValue(data.eyebrow),

    titleLineOne: serializeLocalizedValue(data.titleLineOne),

    titleLineTwo: serializeLocalizedValue(data.titleLineTwo),

    description: serializeLocalizedValue(data.description),

    primaryAction: serializeAction(data.primaryAction),

    secondaryAction: serializeAction(data.secondaryAction),

    desktopImageMediaId: data.desktopImageMediaId || null,

    desktopImage: serializeMediaSnapshot(data.desktopImage),

    mobileImageMediaId: data.mobileImageMediaId || null,

    mobileImage: serializeMediaSnapshot(data.mobileImage),

    status: data.status || HOME_SECTION_STATUSES.DRAFT,

    sortOrder: Number(data.sortOrder || 0),

    displaySchedule: serializeDisplaySchedule(data.displaySchedule),

    createdAt: serializeTimestamp(data.createdAt),

    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),

    updatedBy: data.updatedBy || null,
  };
}

function isHomeHeroDocument(document) {
  const data = document.data();

  return (
    data?.sectionType === HOME_SECTION_TYPES.HERO_SLIDE &&
    data?.isDeleted !== true
  );
}

function compareHomeHeroes(firstDocument, secondDocument) {
  const firstOrder = Number(firstDocument.get("sortOrder") || 0);

  const secondOrder = Number(secondDocument.get("sortOrder") || 0);

  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }

  return firstDocument.id.localeCompare(secondDocument.id);
}

export async function getHomeHeroes({
  limit = HOME_HERO_LIMITS.LIST_DEFAULT_LIMIT,

  status,
} = {}) {
  const safeLimit = Math.min(
    Math.max(1, Number(limit || 1)),

    HOME_HERO_LIMITS.LIST_MAX_LIMIT,
  );

  /*
   * Home Sections มีข้อมูลจำนวนน้อย
   * จึงอ่าน collection แล้วกรองใน server memory
   *
   * วิธีนี้หลีกเลี่ยง Composite Index สำหรับ:
   * isDeleted + sectionType + status + sortOrder
   */
  const snapshot = await adminDb.collection(COLLECTIONS.HOME_SECTIONS).get();

  const matchedDocuments = snapshot.docs
    .filter(isHomeHeroDocument)
    .filter((document) => {
      if (!status) {
        return true;
      }

      return document.get("status") === status;
    })
    .sort(compareHomeHeroes);

  const hasMore = matchedDocuments.length > safeLimit;

  const visibleDocuments = matchedDocuments.slice(0, safeLimit);

  const items = visibleDocuments.map(serializeHomeHeroDocument);

  return {
    items,

    pagination: {
      limit: safeLimit,

      count: items.length,

      hasMore,

      nextCursor: null,
    },
  };
}

export async function getHomeHeroById(heroId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.HOME_SECTIONS)
    .doc(heroId)
    .get();

  const data = snapshot.data();

  if (
    !snapshot.exists ||
    data?.isDeleted ||
    data?.sectionType !== HOME_SECTION_TYPES.HERO_SLIDE
  ) {
    throw new NotFoundError("Home Hero slide not found");
  }

  return serializeHomeHeroDocument(snapshot);
}

function isHeroCurrentlyVisible(hero, currentTime) {
  if (hero.status !== HOME_SECTION_STATUSES.PUBLISHED) {
    return false;
  }

  const startsAt = hero.displaySchedule?.startsAt;

  const endsAt = hero.displaySchedule?.endsAt;

  const currentTimestamp = currentTime.getTime();

  if (startsAt) {
    const startsTimestamp = new Date(startsAt).getTime();

    if (!Number.isNaN(startsTimestamp) && startsTimestamp > currentTimestamp) {
      return false;
    }
  }

  if (endsAt) {
    const endsTimestamp = new Date(endsAt).getTime();

    if (!Number.isNaN(endsTimestamp) && endsTimestamp <= currentTimestamp) {
      return false;
    }
  }

  return true;
}

const getCachedPublishedHomeHeroes = unstable_cache(
  async () => {
    const result = await getHomeHeroes({
      limit: HOME_HERO_LIMITS.LIST_MAX_LIMIT,

      status: HOME_SECTION_STATUSES.PUBLISHED,
    });

    return result.items;
  },

  ["public-home-hero-slides"],

  {
    tags: [HOME_HERO_CACHE_TAG],

    /*
     * Slide อาจเริ่มหรือหมดเวลาโดยไม่มีการแก้ไข
     * จึงตรวจ cache ใหม่ทุก 60 วินาที
     */
    revalidate: 60,
  },
);

export async function getPublicHomeHeroes() {
  const heroes = await getCachedPublishedHomeHeroes();

  const currentTime = new Date();

  return heroes.filter((hero) => isHeroCurrentlyVisible(hero, currentTime));
}
