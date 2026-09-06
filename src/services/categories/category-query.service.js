import "server-only";

import { unstable_cache } from "next/cache";
import { FieldPath } from "firebase-admin/firestore";

import { CATEGORY_CACHE_TAG, CATEGORY_STATUSES } from "@/constants/categories";
import { COLLECTIONS } from "@/constants/collections";
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

function serializeCategory(document) {
  const data = document.data();

  return {
    id: document.id,

    name: {
      en: data.name?.en || "",
      th: data.name?.th || "",
    },

    description: {
      en: data.description?.en || "",
      th: data.description?.th || "",
    },

    slug: data.slug || "",
    icon: data.icon || "door",

    imageMediaId: data.imageMediaId || null,
    image: data.image || null,

    status: data.status || CATEGORY_STATUSES.INACTIVE,

    featured: Boolean(data.featured),
    showOnHome: Boolean(data.showOnHome),

    sortOrder: Number(data.sortOrder || 0),
    productCount: Number(data.productCount || 0),

    seo: {
      title: {
        en: data.seo?.title?.en || "",
        th: data.seo?.title?.th || "",
      },

      description: {
        en: data.seo?.description?.en || "",
        th: data.seo?.description?.th || "",
      },

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
    throw new InvalidRequestError("Invalid category cursor");
  }
}

function normalizeSearchToken(search) {
  return String(search || "")
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)[0];
}

export async function getCategories({
  limit,
  cursor,
  status,
  featured,
  showOnHome,
  search,
}) {
  let query = adminDb
    .collection(COLLECTIONS.CATEGORIES)
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

  const searchToken = normalizeSearchToken(search);

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

  const items = visibleDocuments.map(serializeCategory);

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

const getCachedHomeCategories = unstable_cache(
  async () => {
    const result = await getCategories({
      limit: 8,
      cursor: undefined,
      status: CATEGORY_STATUSES.ACTIVE,
      featured: undefined,
      showOnHome: true,
      search: undefined,
    });

    return result.items;
  },
  ["public-home-categories"],
  {
    tags: [CATEGORY_CACHE_TAG],
    revalidate: 3600,
  },
);

export async function getPublicHomeCategories() {
  return getCachedHomeCategories();
}

export async function getPublicCategoryBySlug(slug) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.CATEGORIES)
    .where("slug", "==", slug)
    .where("status", "==", CATEGORY_STATUSES.ACTIVE)
    .where("isDeleted", "==", false)
    .limit(1)
    .get();

  const document = snapshot.docs[0];

  return document ? serializeCategory(document) : null;
}
