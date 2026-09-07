import "server-only";

import { FieldPath } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";

import { COLLECTIONS } from "@/constants/collections";
import { STANDARD_CACHE_TAG, STANDARD_STATUSES } from "@/constants/standards";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

const PUBLIC_STANDARD_LIMIT = 100;
const PUBLIC_HOME_STANDARD_LIMIT = 5;
const SEARCH_SCAN_LIMIT = 300;

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

    title: serializeLocalizedValue(value.title),

    altText: serializeLocalizedValue(value.altText),
  };
}

function serializeCategorySnapshot(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,

    slug: value.slug || "",

    name: serializeLocalizedValue(value.name),
  };
}

function serializeProductSnapshot(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,

    slug: value.slug || "",

    model: value.model || "",

    sku: value.sku || "",

    name: serializeLocalizedValue(value.name),

    category: value.category ? serializeCategorySnapshot(value.category) : null,

    primaryImage: serializeMediaSnapshot(value.primaryImage),
  };
}

export function serializeStandardDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    code: data.code || "",

    standardKey: data.standardKey || "",

    slug: data.slug || "",

    name: serializeLocalizedValue(data.name),

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    classification: serializeLocalizedValue(data.classification),

    conformityReference: data.conformityReference || "",

    issuer: serializeLocalizedValue(data.issuer),

    documentType: data.documentType || "certificate",

    documentLanguage: data.documentLanguage || "en",

    documentMediaId: data.documentMediaId || null,

    document: serializeMediaSnapshot(data.document),

    relatedCategoryIds: Array.isArray(data.relatedCategoryIds)
      ? data.relatedCategoryIds
      : [],

    relatedCategories: Array.isArray(data.relatedCategories)
      ? data.relatedCategories.map(serializeCategorySnapshot).filter(Boolean)
      : [],

    relatedProductIds: Array.isArray(data.relatedProductIds)
      ? data.relatedProductIds
      : [],

    relatedProducts: Array.isArray(data.relatedProducts)
      ? data.relatedProducts.map(serializeProductSnapshot).filter(Boolean)
      : [],

    issueDate: data.issueDate || null,

    expiryDate: data.expiryDate || null,

    status: data.status || STANDARD_STATUSES.DRAFT,

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
    throw new InvalidRequestError("Invalid standard cursor");
  }
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function standardMatchesSearch(standard, search) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    standard.code,
    standard.standardKey,
    standard.slug,

    standard.name?.en,
    standard.name?.th,

    standard.shortDescription?.en,
    standard.shortDescription?.th,

    standard.description?.en,
    standard.description?.th,

    standard.classification?.en,
    standard.classification?.th,

    standard.conformityReference,

    standard.issuer?.en,
    standard.issuer?.th,

    standard.documentType,
    standard.documentLanguage,

    standard.document?.originalName,
    standard.document?.title?.en,
    standard.document?.title?.th,

    ...(standard.relatedCategories || []).flatMap((category) => [
      category.slug,
      category.name?.en,
      category.name?.th,
    ]),

    ...(standard.relatedProducts || []).flatMap((product) => [
      product.slug,
      product.model,
      product.sku,
      product.name?.en,
      product.name?.th,
    ]),

    standard.seo?.title?.en,
    standard.seo?.title?.th,

    standard.seo?.description?.en,
    standard.seo?.description?.th,

    ...(standard.seo?.keywords?.en || []),

    ...(standard.seo?.keywords?.th || []),
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

function standardMatchesFilters(
  standard,
  {
    status,
    documentType,
    documentLanguage,
    categoryId,
    productId,
    featured,
    showOnHome,
    search,
  },
) {
  if (status && standard.status !== status) {
    return false;
  }

  if (documentType && standard.documentType !== documentType) {
    return false;
  }

  if (documentLanguage && standard.documentLanguage !== documentLanguage) {
    return false;
  }

  if (categoryId && !standard.relatedCategoryIds.includes(categoryId)) {
    return false;
  }

  if (productId && !standard.relatedProductIds.includes(productId)) {
    return false;
  }

  if (featured !== undefined && standard.featured !== featured) {
    return false;
  }

  if (showOnHome !== undefined && standard.showOnHome !== showOnHome) {
    return false;
  }

  return standardMatchesSearch(standard, search);
}

function createBaseQuery() {
  return adminDb
    .collection(COLLECTIONS.STANDARDS)
    .where("isDeleted", "==", false)
    .orderBy("sortOrder", "asc")
    .orderBy(FieldPath.documentId(), "asc");
}

async function getFilteredStandards({ query, limit, filters }) {
  const snapshot = await query.limit(SEARCH_SCAN_LIMIT).get();

  const matchedItems = snapshot.docs
    .map(serializeStandardDocument)
    .filter((standard) => standardMatchesFilters(standard, filters));

  const hasMore = matchedItems.length > limit;

  const items = matchedItems.slice(0, limit);

  return {
    items,

    pagination: {
      limit,
      count: items.length,
      hasMore,
      nextCursor: null,
    },
  };
}

export async function getStandards({
  limit,
  cursor,
  status,
  documentType,
  documentLanguage,
  categoryId,
  productId,
  featured,
  showOnHome,
  search,
}) {
  const query = createBaseQuery();

  const hasFilters = Boolean(
    status ||
    documentType ||
    documentLanguage ||
    categoryId ||
    productId ||
    search ||
    featured !== undefined ||
    showOnHome !== undefined,
  );

  if (hasFilters) {
    if (cursor) {
      throw new InvalidRequestError(
        "Cursor pagination is unavailable while filtering standards",
      );
    }

    return getFilteredStandards({
      query,
      limit,

      filters: {
        status,
        documentType,
        documentLanguage,
        categoryId,
        productId,
        featured,
        showOnHome,
        search,
      },
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

  const items = visibleDocuments.map(serializeStandardDocument);

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

async function findPublicStandardBySlug(slug) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.STANDARDS)
    .where("slug", "==", slug)
    .where("status", "==", STANDARD_STATUSES.PUBLISHED)
    .where("isDeleted", "==", false)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return serializeStandardDocument(snapshot.docs[0]);
}

const getCachedPublicStandards = unstable_cache(
  async () => {
    const result = await getStandards({
      limit: PUBLIC_STANDARD_LIMIT,

      cursor: undefined,

      status: STANDARD_STATUSES.PUBLISHED,

      documentType: undefined,

      documentLanguage: undefined,

      categoryId: undefined,

      productId: undefined,

      featured: undefined,

      showOnHome: undefined,

      search: undefined,
    });

    return result.items;
  },

  ["public-standards"],

  {
    tags: [STANDARD_CACHE_TAG],

    revalidate: 3600,
  },
);

const getCachedPublicHomeStandards = unstable_cache(
  async () => {
    const result = await getStandards({
      limit: PUBLIC_HOME_STANDARD_LIMIT,

      cursor: undefined,

      status: STANDARD_STATUSES.PUBLISHED,

      documentType: undefined,

      documentLanguage: undefined,

      categoryId: undefined,

      productId: undefined,

      featured: undefined,

      showOnHome: true,

      search: undefined,
    });

    return result.items;
  },

  ["public-home-standards"],

  {
    tags: [STANDARD_CACHE_TAG],

    revalidate: 3600,
  },
);

const getCachedPublicStandardBySlug = unstable_cache(
  async (slug) => findPublicStandardBySlug(slug),

  ["public-standard-by-slug"],

  {
    tags: [STANDARD_CACHE_TAG],

    revalidate: 3600,
  },
);

export async function getPublicStandards() {
  return getCachedPublicStandards();
}

export async function getPublicHomeStandards() {
  return getCachedPublicHomeStandards();
}

export async function getPublicStandardBySlug(slug) {
  const standard = await getCachedPublicStandardBySlug(slug);

  if (!standard) {
    throw new NotFoundError("Standard not found");
  }

  return standard;
}
