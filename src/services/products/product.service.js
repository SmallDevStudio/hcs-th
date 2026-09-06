import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";

import { COLLECTIONS } from "@/constants/collections";

import {
  PRODUCT_DEFAULTS,
  PRODUCT_STATUSES,
  normalizeProductSlug,
  normalizeProductTypeSlug,
} from "@/constants/products";

import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";

import { adminDb } from "@/lib/firebase/admin";

import { writeAuditLog } from "@/services/audit/audit.service";

import { prepareProductRelationships } from "@/services/products/product-relationships.service";

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

function serializeProduct(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

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
      ? data.gallery.map(serializeMediaSnapshot)
      : [],

    documentMediaIds: Array.isArray(data.documentMediaIds)
      ? data.documentMediaIds
      : [],

    documents: Array.isArray(data.documents)
      ? data.documents.map(serializeMediaSnapshot)
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

function normalizeStringArray(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];
}

function normalizeLocalizedStringArray(value = {}) {
  return {
    en: normalizeStringArray(value.en),

    th: normalizeStringArray(value.th),
  };
}

function normalizeMediaIds(values = []) {
  return normalizeStringArray(values);
}

function normalizeSpecifications(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => ({
      id: item.id || randomUUID(),

      label: normalizeLocalizedValue(item.label),

      value: normalizeLocalizedValue(item.value),

      sortOrder: Number(item.sortOrder || 0),
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function normalizeFinishes(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => ({
      id: item.id || randomUUID(),

      code: String(item.code || "")
        .trim()
        .toLocaleUpperCase(),

      name: normalizeLocalizedValue(item.name),

      sortOrder: Number(item.sortOrder || 0),
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function normalizeStandards(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => ({
      id: item.id || randomUUID(),

      name: String(item.name || "").trim(),

      classification: String(item.classification || "").trim(),

      conformityReference: String(item.conformityReference || "").trim(),

      sortOrder: Number(item.sortOrder || 0),
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function normalizeSeoKeywords(values = []) {
  return [
    ...new Set(
      normalizeStringArray(values).map((keyword) =>
        keyword.toLocaleLowerCase(),
      ),
    ),
  ];
}

function createSeoFallback({
  name,
  model,
  shortDescription,
  description,
  seo,
}) {
  const normalizedSeo = {
    title: normalizeLocalizedValue(seo?.title),

    description: normalizeLocalizedValue(seo?.description),

    keywords: {
      en: normalizeSeoKeywords(seo?.keywords?.en),

      th: normalizeSeoKeywords(seo?.keywords?.th),
    },
  };

  for (const locale of ["en", "th"]) {
    const productTitle = [model, name[locale]].filter(Boolean).join(" ");

    normalizedSeo.title[locale] =
      normalizedSeo.title[locale] ||
      `${productTitle} | HCS Thailand`.slice(0, 70);

    normalizedSeo.description[locale] =
      normalizedSeo.description[locale] ||
      shortDescription[locale] ||
      description[locale].slice(0, 180);

    if (!normalizedSeo.keywords[locale].length) {
      normalizedSeo.keywords[locale] = [
        model,
        name[locale],

        locale === "en" ? "door hardware" : "อุปกรณ์ประตู",

        locale === "en" ? "HCS Thailand" : "HCS ประเทศไทย",
      ]
        .map((value) =>
          String(value || "")
            .trim()
            .toLocaleLowerCase(),
        )
        .filter(Boolean);
    }
  }

  return normalizedSeo;
}

function createSearchTokens({
  name,
  slug,
  model,
  sku,
  productType,
  productTypeSlug,
  series,
  standards,
}) {
  const values = [
    name.en,
    name.th,

    slug,
    model,
    sku,

    productType.en,
    productType.th,
    productTypeSlug,

    series.en,
    series.th,

    ...standards.map((standard) => standard.name),

    ...standards.map((standard) => standard.conformityReference),
  ];

  const tokens = values.flatMap((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .split(/[\s,._\-()[\]{}\/]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );

  return [...new Set(tokens)].slice(0, 200);
}

function createStandardKeys(standards) {
  return [
    ...new Set(
      standards
        .map((standard) => standard.name.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
}

function normalizeProductInput(input) {
  const name = normalizeLocalizedValue(input.name);

  const productType = normalizeLocalizedValue(input.productType);

  const series = normalizeLocalizedValue(input.series);

  const shortDescription = normalizeLocalizedValue(input.shortDescription);

  const description = normalizeLocalizedValue(input.description);

  const slug = normalizeProductSlug(input.slug);

  const productTypeSlug = normalizeProductTypeSlug(input.productTypeSlug);

  const specifications = normalizeSpecifications(input.specifications);

  const finishes = normalizeFinishes(input.finishes);

  const standards = normalizeStandards(input.standards);

  const galleryMediaIds = normalizeMediaIds(input.galleryMediaIds);

  const documentMediaIds = normalizeMediaIds(input.documentMediaIds);

  const features = normalizeLocalizedStringArray(input.features);

  const variations = normalizeLocalizedStringArray(input.variations);

  const model = String(input.model || "").trim();

  const sku = String(input.sku || "").trim();

  const seo = createSeoFallback({
    name,
    model,
    shortDescription,
    description,
    seo: input.seo,
  });

  return {
    name,
    slug,
    model,
    sku,

    categoryId: input.categoryId,

    productType,
    productTypeSlug,
    series,

    shortDescription,
    description,

    primaryImageMediaId: input.primaryImageMediaId || null,

    galleryMediaIds,
    documentMediaIds,

    features,
    variations,

    specifications,
    finishes,
    standards,

    standardKeys: createStandardKeys(standards),

    fireRated: Boolean(input.fireRated),

    status: input.status || PRODUCT_DEFAULTS.status,

    featured: Boolean(input.featured),

    showOnHome: Boolean(input.showOnHome),

    sortOrder: Number(input.sortOrder || 0),

    seo,

    searchTokens: createSearchTokens({
      name,
      slug,
      model,
      sku,
      productType,
      productTypeSlug,
      series,
      standards,
    }),
  };
}

function mergeProductInput(existingData, input) {
  const merged = {
    name: input.name !== undefined ? input.name : existingData.name,

    slug: input.slug !== undefined ? input.slug : existingData.slug,

    model: input.model !== undefined ? input.model : existingData.model,

    sku: input.sku !== undefined ? input.sku : existingData.sku,

    categoryId:
      input.categoryId !== undefined
        ? input.categoryId
        : existingData.categoryId,

    productType:
      input.productType !== undefined
        ? input.productType
        : existingData.productType,

    productTypeSlug:
      input.productTypeSlug !== undefined
        ? input.productTypeSlug
        : existingData.productTypeSlug,

    series: input.series !== undefined ? input.series : existingData.series,

    shortDescription:
      input.shortDescription !== undefined
        ? input.shortDescription
        : existingData.shortDescription,

    description:
      input.description !== undefined
        ? input.description
        : existingData.description,

    primaryImageMediaId:
      input.primaryImageMediaId !== undefined
        ? input.primaryImageMediaId
        : existingData.primaryImageMediaId,

    galleryMediaIds:
      input.galleryMediaIds !== undefined
        ? input.galleryMediaIds
        : existingData.galleryMediaIds,

    documentMediaIds:
      input.documentMediaIds !== undefined
        ? input.documentMediaIds
        : existingData.documentMediaIds,

    features:
      input.features !== undefined ? input.features : existingData.features,

    variations:
      input.variations !== undefined
        ? input.variations
        : existingData.variations,

    specifications:
      input.specifications !== undefined
        ? input.specifications
        : existingData.specifications,

    finishes:
      input.finishes !== undefined ? input.finishes : existingData.finishes,

    standards:
      input.standards !== undefined ? input.standards : existingData.standards,

    fireRated:
      input.fireRated !== undefined ? input.fireRated : existingData.fireRated,

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

  return normalizeProductInput(merged);
}

function assertPublishableProduct(product) {
  if (product.status !== PRODUCT_STATUSES.PUBLISHED) {
    return;
  }

  const missingFields = [];

  if (!product.primaryImageMediaId) {
    missingFields.push("primaryImageMediaId");
  }

  if (!product.shortDescription.en) {
    missingFields.push("shortDescription.en");
  }

  if (!product.shortDescription.th) {
    missingFields.push("shortDescription.th");
  }

  if (!product.description.en) {
    missingFields.push("description.en");
  }

  if (!product.description.th) {
    missingFields.push("description.th");
  }

  if (missingFields.length) {
    throw new InvalidRequestError(
      "Published products require complete public content",
      {
        missingFields,
      },
    );
  }
}

async function assertUniqueField({
  transaction,
  field,
  value,
  excludeProductId = null,
}) {
  if (!value) {
    return;
  }

  const query = adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .where(field, "==", value)
    .limit(2);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.find(
    (document) => document.id !== excludeProductId,
  );

  if (duplicate) {
    throw new ConflictError(`A product with this ${field} already exists`, {
      field,
      value,
    });
  }
}

export async function createProduct({ input, actor, requestMetadata = {} }) {
  const productId = randomUUID();

  const product = normalizeProductInput(input);

  assertPublishableProduct(product);

  const reference = adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueField({
      transaction,

      field: "slug",
      value: product.slug,
    });

    await assertUniqueField({
      transaction,

      field: "sku",
      value: product.sku,
    });

    const relationships = await prepareProductRelationships({
      transaction,
      productId,

      previousData: {},

      nextData: product,

      actor,
    });

    const writeData = {
      ...product,

      category: relationships.category,

      primaryImage: relationships.primaryImage,

      gallery: relationships.gallery,

      documents: relationships.documents,

      isDeleted: false,
      deletedAt: null,
      deletedBy: null,

      createdAt: FieldValue.serverTimestamp(),

      createdBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.create(reference, writeData);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.PRODUCT_CREATE,

      entityType: AUDIT_ENTITY_TYPES.PRODUCT,

      entityId: productId,

      before: null,
      after: writeData,

      metadata: requestMetadata,

      transaction,
    });
  });

  return getProductById(productId);
}

export async function getProductById(productId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .doc(productId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Product not found");
  }

  return serializeProduct(snapshot);
}

export async function updateProduct({
  productId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Product not found");
    }

    const before = snapshot.data();

    const product = mergeProductInput(before, input);

    assertPublishableProduct(product);

    await assertUniqueField({
      transaction,

      field: "slug",
      value: product.slug,

      excludeProductId: productId,
    });

    await assertUniqueField({
      transaction,

      field: "sku",
      value: product.sku,

      excludeProductId: productId,
    });

    const relationships = await prepareProductRelationships({
      transaction,
      productId,

      previousData: before,

      nextData: product,

      actor,
    });

    const updates = {
      ...product,

      category: relationships.category,

      primaryImage: relationships.primaryImage,

      gallery: relationships.gallery,

      documents: relationships.documents,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.PRODUCT_UPDATE,

      entityType: AUDIT_ENTITY_TYPES.PRODUCT,

      entityId: productId,

      before,

      after: {
        ...before,
        ...updates,
      },

      metadata: requestMetadata,

      transaction,
    });
  });

  return getProductById(productId);
}

export async function deleteProduct({
  productId,
  actor,
  requestMetadata = {},
}) {
  await getProductById(productId);

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.PRODUCT,

    entityId: productId,

    actor,
    requestMetadata,
  });
}

export async function reorderProducts({ items, actor, requestMetadata = {} }) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.PRODUCTS).doc(item.productId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      if (!snapshot.exists || snapshot.data()?.isDeleted) {
        throw new NotFoundError(`Product ${snapshot.id} not found`);
      }
    }

    for (const item of items) {
      const snapshot = snapshots.find(
        (currentSnapshot) => currentSnapshot.id === item.productId,
      );

      transaction.update(snapshot.ref, {
        sortOrder: item.sortOrder,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.PRODUCT_UPDATE,

        entityType: AUDIT_ENTITY_TYPES.PRODUCT,

        entityId: item.productId,

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
