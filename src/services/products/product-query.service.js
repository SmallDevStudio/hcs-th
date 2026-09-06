import "server-only";

import { unstable_cache } from "next/cache";
import { FieldPath } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import {
  PRODUCT_CACHE_TAG,
  PRODUCT_STATUSES,
  normalizeProductTypeSlug,
} from "@/constants/products";
import { InvalidRequestError } from "@/lib/api/errors";
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

export function serializeProductDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    name: serializeLocalizedValue(data.name),

    slug: data.slug || "",

    model: data.model || "",

    sku: data.sku || "",

    categoryId: data.categoryId || null,

    category: data.category
      ? {
          id: data.category.id || null,

          slug: data.category.slug || "",

          name: serializeLocalizedValue(data.category.name),
        }
      : null,

    productType: serializeLocalizedValue(data.productType),

    productTypeSlug: data.productTypeSlug || "",

    series: serializeLocalizedValue(data.series),

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    primaryImageMediaId: data.primaryImageMediaId || null,

    primaryImage: serializeMediaSnapshot(data.primaryImage),

    galleryMediaIds: Array.isArray(data.galleryMediaIds)
      ? data.galleryMediaIds
      : [],

    gallery: Array.isArray(data.gallery)
      ? data.gallery.map(serializeMediaSnapshot).filter(Boolean)
      : [],

    documentMediaIds: Array.isArray(data.documentMediaIds)
      ? data.documentMediaIds
      : [],

    documents: Array.isArray(data.documents)
      ? data.documents.map(serializeMediaSnapshot).filter(Boolean)
      : [],

    features: {
      en: Array.isArray(data.features?.en) ? data.features.en : [],

      th: Array.isArray(data.features?.th) ? data.features.th : [],
    },

    variations: {
      en: Array.isArray(data.variations?.en) ? data.variations.en : [],

      th: Array.isArray(data.variations?.th) ? data.variations.th : [],
    },

    specifications: Array.isArray(data.specifications)
      ? data.specifications
      : [],

    finishes: Array.isArray(data.finishes) ? data.finishes : [],

    standards: Array.isArray(data.standards) ? data.standards : [],

    standardKeys: Array.isArray(data.standardKeys) ? data.standardKeys : [],

    fireRated: Boolean(data.fireRated),

    status: data.status || PRODUCT_STATUSES.DRAFT,

    featured: Boolean(data.featured),

    showOnHome: Boolean(data.showOnHome),

    sortOrder: Number(data.sortOrder || 0),

    seo: {
      title: serializeLocalizedValue(data.seo?.title),

      description: serializeLocalizedValue(data.seo?.description),

      keywords: {
        en: Array.isArray(data.seo?.keywords?.en) ? data.seo.keywords.en : [],

        th: Array.isArray(data.seo?.keywords?.th) ? data.seo.keywords.th : [],
      },
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
    throw new InvalidRequestError("Invalid product cursor");
  }
}

function normalizeSearchToken(search) {
  return String(search || "")
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)[0];
}

function normalizeStandardKey(standard) {
  return String(standard || "")
    .trim()
    .toLocaleLowerCase();
}

export async function getProducts({
  limit,
  cursor,
  status,
  categoryId,
  productTypeSlug,
  standard,
  featured,
  showOnHome,
  fireRated,
  search,
}) {
  let query = adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .where("isDeleted", "==", false);

  if (status) {
    query = query.where("status", "==", status);
  }

  if (categoryId) {
    query = query.where("categoryId", "==", categoryId);
  }

  if (productTypeSlug) {
    query = query.where(
      "productTypeSlug",
      "==",
      normalizeProductTypeSlug(productTypeSlug),
    );
  }

  const standardKey = normalizeStandardKey(standard);

  if (standardKey) {
    query = query.where("standardKeys", "array-contains", standardKey);
  }

  if (featured !== undefined) {
    query = query.where("featured", "==", featured);
  }

  if (showOnHome !== undefined) {
    query = query.where("showOnHome", "==", showOnHome);
  }

  if (fireRated !== undefined) {
    query = query.where("fireRated", "==", fireRated);
  }

  const searchToken = normalizeSearchToken(search);

  /*
   * Firestore อนุญาต array-contains ได้หนึ่ง field ต่อ query
   * จึงไม่อนุญาตให้ใช้ standard และ search พร้อมกัน
   */
  if (standardKey && searchToken) {
    throw new InvalidRequestError(
      "Standard and search filters cannot be used together",
    );
  }

  if (searchToken) {
    query = query.where("searchTokens", "array-contains", searchToken);
  }

  query = query
    .orderBy("sortOrder", "asc")
    .orderBy(FieldPath.documentId(), "asc");

  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    query = query.startAfter(decodedCursor.sortOrder, decodedCursor.documentId);
  }

  const snapshot = await query.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;

  const visibleDocuments = hasMore
    ? snapshot.docs.slice(0, limit)
    : snapshot.docs;

  const items = visibleDocuments.map(serializeProductDocument);

  const lastDocument = visibleDocuments[visibleDocuments.length - 1];

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

const getCachedHomeProducts = unstable_cache(
  async () => {
    const result = await getProducts({
      limit: 8,

      cursor: undefined,

      status: PRODUCT_STATUSES.PUBLISHED,

      categoryId: undefined,

      productTypeSlug: undefined,

      standard: undefined,

      featured: undefined,

      showOnHome: true,

      fireRated: undefined,

      search: undefined,
    });

    return result.items;
  },
  ["public-home-products"],
  {
    tags: [PRODUCT_CACHE_TAG],

    revalidate: 3600,
  },
);

export async function getPublicHomeProducts() {
  return getCachedHomeProducts();
}

export async function getPublicProducts({
  limit,
  cursor,
  categoryId,
  productTypeSlug,
  standard,
  featured,
  fireRated,
  search,
}) {
  return getProducts({
    limit,
    cursor,

    status: PRODUCT_STATUSES.PUBLISHED,

    categoryId,
    productTypeSlug,
    standard,
    featured,

    showOnHome: undefined,

    fireRated,
    search,
  });
}

export async function getPublicProductBySlug(slug) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .where("slug", "==", slug)
    .where("status", "==", PRODUCT_STATUSES.PUBLISHED)
    .where("isDeleted", "==", false)
    .limit(1)
    .get();

  const document = snapshot.docs[0];

  return document ? serializeProductDocument(document) : null;
}

export async function getPublicRelatedProducts({
  productId,
  categoryId,
  limit = 4,
}) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .where("categoryId", "==", categoryId)
    .where("status", "==", PRODUCT_STATUSES.PUBLISHED)
    .where("isDeleted", "==", false)
    .orderBy("sortOrder", "asc")
    .limit(limit + 1)
    .get();

  return snapshot.docs
    .filter((document) => document.id !== productId)
    .slice(0, limit)
    .map(serializeProductDocument);
}
