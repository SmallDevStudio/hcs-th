import "server-only";

import { unstable_cache } from "next/cache";
import { FieldPath } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { SOLUTION_CACHE_TAG, SOLUTION_STATUSES } from "@/constants/solutions";
import { InvalidRequestError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const PUBLIC_SOLUTION_LIMIT = 50;
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

  return value;
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

export function serializeSolutionDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    name: serializeLocalizedValue(data.name),

    slug: data.slug || "",

    eyebrow: serializeLocalizedValue(data.eyebrow),

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    icon: data.icon || "building",

    imageMediaId: data.imageMediaId || null,

    image: serializeMediaSnapshot(data.image),

    features: serializeLocalizedArray(data.features),

    status: data.status || SOLUTION_STATUSES.DRAFT,

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
    throw new InvalidRequestError("Invalid solution cursor");
  }
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function solutionMatchesSearch(solution, search) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    solution.slug,

    solution.name?.en,
    solution.name?.th,

    solution.eyebrow?.en,
    solution.eyebrow?.th,

    solution.shortDescription?.en,
    solution.shortDescription?.th,

    solution.description?.en,
    solution.description?.th,

    ...(solution.features?.en || []),
    ...(solution.features?.th || []),

    solution.seo?.title?.en,
    solution.seo?.title?.th,

    solution.seo?.description?.en,
    solution.seo?.description?.th,

    ...(solution.seo?.keywords?.en || []),
    ...(solution.seo?.keywords?.th || []),
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

function createBaseQuery({ status, featured, showOnHome }) {
  let query = adminDb
    .collection(COLLECTIONS.SOLUTIONS)
    .where("isDeleted", "==", false);

  if (status) {
    query = query.where("status", "==", status);
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

async function getSearchedSolutions({ query, limit, search }) {
  const snapshot = await query.limit(SEARCH_SCAN_LIMIT).get();

  const matchedItems = snapshot.docs
    .map(serializeSolutionDocument)
    .filter((solution) => solutionMatchesSearch(solution, search));

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

export async function getSolutions({
  limit,
  cursor,
  status,
  featured,
  showOnHome,
  search,
}) {
  const query = createBaseQuery({
    status,
    featured,
    showOnHome,
  });

  if (search) {
    if (cursor) {
      throw new InvalidRequestError(
        "Cursor pagination is unavailable while searching solutions",
      );
    }

    return getSearchedSolutions({
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

  const items = visibleDocuments.map(serializeSolutionDocument);

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

const getCachedPublicSolutions = unstable_cache(
  async () => {
    const result = await getSolutions({
      limit: PUBLIC_SOLUTION_LIMIT,
      cursor: undefined,
      status: SOLUTION_STATUSES.PUBLISHED,
      featured: undefined,
      showOnHome: undefined,
      search: undefined,
    });

    return result.items;
  },
  ["public-solutions"],
  {
    tags: [SOLUTION_CACHE_TAG],
    revalidate: 3600,
  },
);

const getCachedPublicHomeSolutions = unstable_cache(
  async () => {
    const result = await getSolutions({
      limit: 8,
      cursor: undefined,
      status: SOLUTION_STATUSES.PUBLISHED,
      featured: undefined,
      showOnHome: true,
      search: undefined,
    });

    return result.items;
  },
  ["public-home-solutions"],
  {
    tags: [SOLUTION_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function getPublicSolutions() {
  return getCachedPublicSolutions();
}

export async function getPublicHomeSolutions() {
  return getCachedPublicHomeSolutions();
}
