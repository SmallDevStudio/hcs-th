import "server-only";

import { randomUUID } from "node:crypto";

import { FieldPath, FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import {
  CATEGORY_DEFAULTS,
  CATEGORY_STATUSES,
  normalizeCategorySlug,
} from "@/constants/categories";
import { COLLECTIONS } from "@/constants/collections";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareMediaUsageTransition } from "@/services/media/media-usage.service";
import { softDeleteEntity } from "@/services/trash/trash.service";

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

function serializeCategory(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: {
      en: data.name?.en || "",
      th: data.name?.th || "",
    },

    description: {
      en: data.description?.en || "",
      th: data.description?.th || "",
    },

    slug: data.slug || "",
    icon: data.icon || CATEGORY_DEFAULTS.icon,

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

    isDeleted: Boolean(data.isDeleted),

    createdAt: serializeTimestamp(data.createdAt),
    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}

function normalizeLocalizedValue(value = {}) {
  return {
    en: value.en?.trim() || "",
    th: value.th?.trim() || "",
  };
}

function normalizeKeywords(keywords = []) {
  return [
    ...new Set(
      keywords
        .map((keyword) => keyword.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
}

function createSearchTokens({ name, slug }) {
  const values = [name.en, name.th, slug];

  const tokens = values.flatMap((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .split(/[\s,._\-()[\]{}]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );

  return [...new Set(tokens)].slice(0, 100);
}

function createSeoFallback({ name, description, seo }) {
  const normalizedSeo = {
    title: normalizeLocalizedValue(seo?.title),

    description: normalizeLocalizedValue(seo?.description),

    keywords: {
      en: normalizeKeywords(seo?.keywords?.en),

      th: normalizeKeywords(seo?.keywords?.th),
    },
  };

  for (const locale of ["en", "th"]) {
    normalizedSeo.title[locale] =
      normalizedSeo.title[locale] || name[locale].slice(0, 70);

    normalizedSeo.description[locale] =
      normalizedSeo.description[locale] || description[locale].slice(0, 180);

    if (!normalizedSeo.keywords[locale].length) {
      normalizedSeo.keywords[locale] = [
        name[locale],
        locale === "en" ? "HCS Thailand" : "HCS ประเทศไทย",
      ].filter(Boolean);
    }
  }

  return normalizedSeo;
}

function normalizeCategoryInput(input) {
  const name = normalizeLocalizedValue(input.name);

  const description = normalizeLocalizedValue(input.description);

  const slug = normalizeCategorySlug(input.slug);

  return {
    name,
    description,
    slug,

    icon: input.icon || CATEGORY_DEFAULTS.icon,

    imageMediaId: input.imageMediaId || null,

    status: input.status || CATEGORY_DEFAULTS.status,

    featured: Boolean(input.featured),

    showOnHome: input.showOnHome !== false,

    sortOrder: Number(input.sortOrder || 0),

    seo: createSeoFallback({
      name,
      description,
      seo: input.seo,
    }),

    searchTokens: createSearchTokens({
      name,
      slug,
    }),
  };
}

function mergeCategoryInput(existingData, input) {
  const mergedInput = {
    name:
      input.name !== undefined
        ? {
            ...existingData.name,
            ...input.name,
          }
        : existingData.name,

    description:
      input.description !== undefined
        ? {
            ...existingData.description,
            ...input.description,
          }
        : existingData.description,

    slug: input.slug !== undefined ? input.slug : existingData.slug,

    icon: input.icon !== undefined ? input.icon : existingData.icon,

    imageMediaId:
      input.imageMediaId !== undefined
        ? input.imageMediaId
        : existingData.imageMediaId,

    status: input.status !== undefined ? input.status : existingData.status,

    featured:
      input.featured !== undefined ? input.featured : existingData.featured,

    showOnHome:
      input.showOnHome !== undefined
        ? input.showOnHome
        : existingData.showOnHome,

    sortOrder:
      input.sortOrder !== undefined ? input.sortOrder : existingData.sortOrder,

    seo:
      input.seo !== undefined
        ? {
            ...existingData.seo,

            ...input.seo,

            title: {
              ...existingData.seo?.title,
              ...input.seo?.title,
            },

            description: {
              ...existingData.seo?.description,
              ...input.seo?.description,
            },

            keywords: {
              ...existingData.seo?.keywords,
              ...input.seo?.keywords,
            },
          }
        : existingData.seo,
  };

  return normalizeCategoryInput(mergedInput);
}

async function assertUniqueSlug({
  transaction,
  slug,
  excludeCategoryId = null,
}) {
  const query = adminDb
    .collection(COLLECTIONS.CATEGORIES)
    .where("slug", "==", slug)
    .limit(2);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.find(
    (document) =>
      document.id !== excludeCategoryId && !document.data()?.isDeleted,
  );

  if (duplicate) {
    throw new ConflictError("A category with this slug already exists", {
      field: "slug",
      slug,
    });
  }
}

async function getFeaturedCategories({
  transaction,
  excludeCategoryId = null,
}) {
  const query = adminDb
    .collection(COLLECTIONS.CATEGORIES)
    .where("featured", "==", true);

  const snapshot = await transaction.get(query);

  return snapshot.docs.filter(
    (document) =>
      document.id !== excludeCategoryId && !document.data()?.isDeleted,
  );
}

function demoteFeaturedCategories({ transaction, documents, actor }) {
  for (const document of documents) {
    transaction.update(document.ref, {
      featured: false,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    });
  }
}

export async function createCategory({ input, actor, requestMetadata = {} }) {
  const categoryId = randomUUID();
  const category = normalizeCategoryInput(input);

  const reference = adminDb.collection(COLLECTIONS.CATEGORIES).doc(categoryId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueSlug({
      transaction,
      slug: category.slug,
    });

    const featuredDocuments = category.featured
      ? await getFeaturedCategories({
          transaction,
        })
      : [];

    const mediaTransition = await prepareMediaUsageTransition({
      transaction,
      previousMediaId: null,
      nextMediaId: category.imageMediaId,
      entityType: AUDIT_ENTITY_TYPES.CATEGORY,
      entityId: categoryId,
      field: "image",
      actor,
    });

    const writeData = {
      ...category,
      image: mediaTransition.image,

      productCount: 0,

      isDeleted: false,
      deletedAt: null,
      deletedBy: null,

      createdAt: FieldValue.serverTimestamp(),
      createdBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    demoteFeaturedCategories({
      transaction,
      documents: featuredDocuments,
      actor,
    });

    mediaTransition.apply();

    transaction.create(reference, writeData);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.CATEGORY_CREATE,
      entityType: AUDIT_ENTITY_TYPES.CATEGORY,
      entityId: categoryId,
      before: null,
      after: writeData,
      metadata: requestMetadata,
      transaction,
    });
  });

  return getCategoryById(categoryId);
}

export async function getCategoryById(categoryId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.CATEGORIES)
    .doc(categoryId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Category not found");
  }

  return serializeCategory(snapshot);
}

export async function updateCategory({
  categoryId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.CATEGORIES).doc(categoryId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Category not found");
    }

    const before = snapshot.data();

    const category = mergeCategoryInput(before, input);

    await assertUniqueSlug({
      transaction,
      slug: category.slug,
      excludeCategoryId: categoryId,
    });

    const featuredDocuments = category.featured
      ? await getFeaturedCategories({
          transaction,
          excludeCategoryId: categoryId,
        })
      : [];

    const mediaTransition = await prepareMediaUsageTransition({
      transaction,
      previousMediaId: before.imageMediaId,
      nextMediaId: category.imageMediaId,
      entityType: AUDIT_ENTITY_TYPES.CATEGORY,
      entityId: categoryId,
      field: "image",
      actor,
    });

    const updates = {
      ...category,
      image: mediaTransition.image,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    demoteFeaturedCategories({
      transaction,
      documents: featuredDocuments,
      actor,
    });

    mediaTransition.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.CATEGORY_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.CATEGORY,
      entityId: categoryId,
      before,
      after: {
        ...before,
        ...updates,
      },
      metadata: requestMetadata,
      transaction,
    });
  });

  return getCategoryById(categoryId);
}

export async function deleteCategory({
  categoryId,
  actor,
  requestMetadata = {},
}) {
  const category = await getCategoryById(categoryId);

  if (category.productCount > 0) {
    throw new ConflictError("Category containing products cannot be deleted", {
      productCount: category.productCount,
    });
  }

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.CATEGORY,
    entityId: categoryId,
    actor,
    requestMetadata,
  });
}

export async function reorderCategories({
  items,
  actor,
  requestMetadata = {},
}) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.CATEGORIES).doc(item.categoryId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      if (!snapshot.exists || snapshot.data()?.isDeleted) {
        throw new NotFoundError(`Category ${snapshot.id} not found`);
      }
    }

    for (const item of items) {
      const reference = adminDb
        .collection(COLLECTIONS.CATEGORIES)
        .doc(item.categoryId);

      const snapshot = snapshots.find(
        (currentSnapshot) => currentSnapshot.id === item.categoryId,
      );

      transaction.update(reference, {
        sortOrder: item.sortOrder,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,
        action: AUDIT_ACTIONS.CATEGORY_UPDATE,
        entityType: AUDIT_ENTITY_TYPES.CATEGORY,
        entityId: item.categoryId,

        before: {
          sortOrder: snapshot.data()?.sortOrder ?? null,
        },

        after: {
          sortOrder: item.sortOrder,
        },

        metadata: {
          ...requestMetadata,
          operation: "reorder",
        },

        transaction,
      });
    }
  });

  return {
    updatedCount: items.length,
  };
}
