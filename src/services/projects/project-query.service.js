import "server-only";

import { unstable_cache } from "next/cache";
import { FieldPath } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { PROJECT_CACHE_TAG, PROJECT_STATUSES } from "@/constants/projects";
import { InvalidRequestError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const PUBLIC_PROJECT_LIMIT = 100;
const PUBLIC_HOME_PROJECT_LIMIT = 8;
const SEARCH_SCAN_LIMIT = 250;

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

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function serializeLocalizedValue(value) {
  return {
    en: value?.en || "",
    th: value?.th || "",
  };
}

function serializeLocalizedArray(value) {
  return {
    en: Array.isArray(value?.en) ? value.en : [],
    th: Array.isArray(value?.th) ? value.th : [],
  };
}

function serializeMediaSnapshot(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,
    type: value.type || null,
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

function serializeRelatedProduct(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,
    name: serializeLocalizedValue(value.name),
    slug: value.slug || "",
    model: value.model || "",
    sku: value.sku || "",
    primaryImage: serializeMediaSnapshot(value.primaryImage),
  };
}

function serializeRelatedSolution(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,
    name: serializeLocalizedValue(value.name),
    slug: value.slug || "",
    icon: value.icon || "building",
    image: serializeMediaSnapshot(value.image),
  };
}

export function serializeProjectDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    name: serializeLocalizedValue(data.name),

    slug: data.slug || "",

    buildingType: data.buildingType || "other",

    location: serializeLocalizedValue(data.location),

    client: serializeLocalizedValue(data.client),

    year: typeof data.year === "number" ? data.year : null,

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    challenge: serializeLocalizedValue(data.challenge),

    solution: serializeLocalizedValue(data.solution),

    results: serializeLocalizedArray(data.results),

    coverImageMediaId: data.coverImageMediaId || null,

    coverImage: serializeMediaSnapshot(data.coverImage),

    galleryMediaIds: Array.isArray(data.galleryMediaIds)
      ? data.galleryMediaIds
      : [],

    gallery: Array.isArray(data.gallery)
      ? data.gallery.map(serializeMediaSnapshot).filter(Boolean)
      : [],

    relatedProductIds: Array.isArray(data.relatedProductIds)
      ? data.relatedProductIds
      : [],

    relatedProducts: Array.isArray(data.relatedProducts)
      ? data.relatedProducts.map(serializeRelatedProduct).filter(Boolean)
      : [],

    relatedSolutionIds: Array.isArray(data.relatedSolutionIds)
      ? data.relatedSolutionIds
      : [],

    relatedSolutions: Array.isArray(data.relatedSolutions)
      ? data.relatedSolutions.map(serializeRelatedSolution).filter(Boolean)
      : [],

    status: data.status || PROJECT_STATUSES.DRAFT,

    featured: Boolean(data.featured),

    showOnHome: Boolean(data.showOnHome),

    sortOrder: Number(data.sortOrder || 0),

    seo: {
      title: serializeLocalizedValue(data.seo?.title),

      description: serializeLocalizedValue(data.seo?.description),

      keywords: serializeLocalizedArray(data.seo?.keywords),
    },

    createdAt: serializeTimestamp(data.createdAt),

    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),

    updatedBy: data.updatedBy || null,
  };
}

function encodeCursor({ sortOrder, documentId }) {
  return Buffer.from(
    JSON.stringify({
      sortOrder,
      documentId,
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      typeof decoded.sortOrder !== "number" ||
      typeof decoded.documentId !== "string" ||
      !decoded.documentId
    ) {
      throw new Error("Invalid cursor");
    }

    return decoded;
  } catch {
    throw new InvalidRequestError("Invalid project cursor");
  }
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function projectMatchesSearch(project, search) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    project.slug,
    project.buildingType,

    project.name?.en,
    project.name?.th,

    project.location?.en,
    project.location?.th,

    project.client?.en,
    project.client?.th,

    project.shortDescription?.en,
    project.shortDescription?.th,

    project.description?.en,
    project.description?.th,

    project.challenge?.en,
    project.challenge?.th,

    project.solution?.en,
    project.solution?.th,

    ...(project.results?.en || []),
    ...(project.results?.th || []),

    project.seo?.title?.en,
    project.seo?.title?.th,

    project.seo?.description?.en,
    project.seo?.description?.th,

    ...(project.seo?.keywords?.en || []),
    ...(project.seo?.keywords?.th || []),
  ];

  if (project.year) {
    searchableValues.push(String(project.year));
  }

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

function createBaseQuery({ status, buildingType, featured, showOnHome }) {
  let query = adminDb
    .collection(COLLECTIONS.PROJECTS)
    .where("isDeleted", "==", false);

  if (status) {
    query = query.where("status", "==", status);
  }

  if (buildingType) {
    query = query.where("buildingType", "==", buildingType);
  }

  if (featured !== undefined) {
    query = query.where("featured", "==", featured);
  }

  if (showOnHome !== undefined) {
    query = query.where("showOnHome", "==", showOnHome);
  }

  return query
    .orderBy("sortOrder", "asc")
    .orderBy(FieldPath.documentId(), "asc");
}

async function getSearchedProjects({ query, limit, search }) {
  const snapshot = await query.limit(SEARCH_SCAN_LIMIT).get();

  const matchedItems = snapshot.docs
    .map(serializeProjectDocument)
    .filter((project) => projectMatchesSearch(project, search));

  const hasMore = matchedItems.length > limit;

  return {
    items: matchedItems.slice(0, limit),

    pagination: {
      limit,
      count: Math.min(matchedItems.length, limit),
      hasMore,
      nextCursor: null,
    },
  };
}

export async function getProjects({
  limit,
  cursor,
  status,
  buildingType,
  featured,
  showOnHome,
  search,
}) {
  const query = createBaseQuery({
    status,
    buildingType,
    featured,
    showOnHome,
  });

  if (search) {
    if (cursor) {
      throw new InvalidRequestError(
        "Cursor pagination is unavailable while searching projects",
      );
    }

    return getSearchedProjects({
      query,
      limit,
      search,
    });
  }

  const decodedCursor = decodeCursor(cursor);

  const paginatedQuery = decodedCursor
    ? query.startAfter(decodedCursor.sortOrder, decodedCursor.documentId)
    : query;

  const snapshot = await paginatedQuery.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;

  const visibleDocuments = hasMore
    ? snapshot.docs.slice(0, limit)
    : snapshot.docs;

  const items = visibleDocuments.map(serializeProjectDocument);

  const lastDocument = visibleDocuments.at(-1);

  const nextCursor =
    hasMore && lastDocument
      ? encodeCursor({
          sortOrder: Number(lastDocument.get("sortOrder") || 0),

          documentId: lastDocument.id,
        })
      : null;

  return {
    items,

    pagination: {
      limit,
      count: items.length,
      hasMore,
      nextCursor,
    },
  };
}

export async function getPublicProjectBySlugUncached(slug) {
  const normalizedSlug = String(slug || "")
    .trim()
    .toLocaleLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const snapshot = await adminDb
    .collection(COLLECTIONS.PROJECTS)
    .where("slug", "==", normalizedSlug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const document = snapshot.docs[0];
  const data = document.data();

  if (data.isDeleted || data.status !== PROJECT_STATUSES.PUBLISHED) {
    return null;
  }

  return serializeProjectDocument(document);
}

const getCachedPublicProjects = unstable_cache(
  async () => {
    const result = await getProjects({
      limit: PUBLIC_PROJECT_LIMIT,
      cursor: undefined,
      status: PROJECT_STATUSES.PUBLISHED,
      buildingType: undefined,
      featured: undefined,
      showOnHome: undefined,
      search: undefined,
    });

    return result.items;
  },
  ["public-projects"],
  {
    tags: [PROJECT_CACHE_TAG],
    revalidate: 3600,
  },
);

const getCachedPublicHomeProjects = unstable_cache(
  async () => {
    const result = await getProjects({
      limit: PUBLIC_HOME_PROJECT_LIMIT,
      cursor: undefined,
      status: PROJECT_STATUSES.PUBLISHED,
      buildingType: undefined,
      featured: undefined,
      showOnHome: true,
      search: undefined,
    });

    return result.items;
  },
  ["public-home-projects"],
  {
    tags: [PROJECT_CACHE_TAG],
    revalidate: 3600,
  },
);

const getCachedPublicProjectBySlug = unstable_cache(
  async (slug) => getPublicProjectBySlugUncached(slug),
  ["public-project-by-slug"],
  {
    tags: [PROJECT_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function getPublicProjects() {
  return getCachedPublicProjects();
}

export async function getPublicHomeProjects() {
  return getCachedPublicHomeProjects();
}

export async function getPublicProjectBySlug(slug) {
  return getCachedPublicProjectBySlug(slug);
}
