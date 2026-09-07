import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  STANDARD_DEFAULTS,
  STANDARD_STATUSES,
  createStandardKey,
  normalizeStandardCode,
  normalizeStandardSlug,
} from "@/constants/standards";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareStandardRelationships } from "@/services/standards/standard-relationships.service";
import { softDeleteEntity } from "@/services/trash/trash.service";

const STANDARD_ENTITY_TYPE = AUDIT_ENTITY_TYPES.STANDARD || "standard";

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

export function serializeStandard(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    code: data.code || "",

    standardKey: data.standardKey || "",

    slug: data.slug || "",

    name: serializeLocalizedValue(data.name),

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    classification: serializeLocalizedValue(data.classification),

    conformityReference: data.conformityReference || "",

    issuer: serializeLocalizedValue(data.issuer),

    documentType: data.documentType || STANDARD_DEFAULTS.documentType,

    documentLanguage:
      data.documentLanguage || STANDARD_DEFAULTS.documentLanguage,

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

function normalizeLocalizedValue(value, fallback = "") {
  return {
    en: String(value?.en ?? fallback).trim(),

    th: String(value?.th ?? fallback).trim(),
  };
}

function normalizeLocalizedArray(value) {
  return {
    en: [
      ...new Set(
        (Array.isArray(value?.en) ? value.en : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean),
      ),
    ],

    th: [
      ...new Set(
        (Array.isArray(value?.th) ? value.th : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean),
      ),
    ],
  };
}

function normalizeIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];
}

function normalizeDate(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return String(value).trim();
}

function normalizeSeo({ seo, code, name, shortDescription }) {
  const title = normalizeLocalizedValue(seo?.title);

  const description = normalizeLocalizedValue(seo?.description);

  return {
    title: {
      en: title.en || `${code} ${name.en} | HCS Thailand`,

      th: title.th || `${code} ${name.th} | HCS Thailand`,
    },

    description: {
      en: description.en || shortDescription.en,

      th: description.th || shortDescription.th,
    },

    keywords: normalizeLocalizedArray(seo?.keywords),
  };
}

function createSearchTokens({
  code,
  slug,
  name,
  classification,
  conformityReference,
  issuer,
}) {
  const values = [
    code,
    slug,

    name.en,
    name.th,

    classification.en,
    classification.th,

    conformityReference,

    issuer.en,
    issuer.th,
  ];

  return [
    ...new Set(
      values
        .flatMap((value) => {
          const normalizedValue = String(value || "")
            .trim()
            .toLocaleLowerCase();

          if (!normalizedValue) {
            return [];
          }

          return [
            normalizedValue,

            ...normalizedValue.split(/[\s,./\\|()[\]_-]+/).filter(Boolean),
          ];
        })
        .filter(Boolean),
    ),
  ];
}

function normalizeStandardInput(input) {
  const code = normalizeStandardCode(input.code);

  const slug = normalizeStandardSlug(input.slug || code);

  const name = normalizeLocalizedValue(input.name);

  const shortDescription = normalizeLocalizedValue(input.shortDescription);

  const description = normalizeLocalizedValue(input.description);

  const classification = normalizeLocalizedValue(input.classification);

  const issuer = normalizeLocalizedValue(input.issuer);

  const conformityReference = String(input.conformityReference || "").trim();

  const seo = normalizeSeo({
    seo: input.seo,
    code,
    name,
    shortDescription,
  });

  return {
    code,

    standardKey: createStandardKey(code),

    slug,

    name,

    shortDescription,

    description,

    classification,

    conformityReference,

    issuer,

    documentType: input.documentType || STANDARD_DEFAULTS.documentType,

    documentLanguage:
      input.documentLanguage || STANDARD_DEFAULTS.documentLanguage,

    documentMediaId: input.documentMediaId || null,

    relatedCategoryIds: normalizeIds(input.relatedCategoryIds),

    relatedProductIds: normalizeIds(input.relatedProductIds),

    issueDate: normalizeDate(input.issueDate),

    expiryDate: normalizeDate(input.expiryDate),

    status: input.status || STANDARD_DEFAULTS.status,

    featured: Boolean(input.featured),

    showOnHome: Boolean(input.showOnHome),

    sortOrder: Number(input.sortOrder || 0),

    seo,

    searchTokens: createSearchTokens({
      code,
      slug,
      name,
      classification,
      conformityReference,
      issuer,
    }),
  };
}

function mergeStandardInput(existingData, input) {
  return normalizeStandardInput({
    code: input.code !== undefined ? input.code : existingData.code,

    slug: input.slug !== undefined ? input.slug : existingData.slug,

    name: input.name !== undefined ? input.name : existingData.name,

    shortDescription:
      input.shortDescription !== undefined
        ? input.shortDescription
        : existingData.shortDescription,

    description:
      input.description !== undefined
        ? input.description
        : existingData.description,

    classification:
      input.classification !== undefined
        ? input.classification
        : existingData.classification,

    conformityReference:
      input.conformityReference !== undefined
        ? input.conformityReference
        : existingData.conformityReference,

    issuer: input.issuer !== undefined ? input.issuer : existingData.issuer,

    documentType:
      input.documentType !== undefined
        ? input.documentType
        : existingData.documentType,

    documentLanguage:
      input.documentLanguage !== undefined
        ? input.documentLanguage
        : existingData.documentLanguage,

    documentMediaId:
      input.documentMediaId !== undefined
        ? input.documentMediaId
        : existingData.documentMediaId,

    relatedCategoryIds:
      input.relatedCategoryIds !== undefined
        ? input.relatedCategoryIds
        : existingData.relatedCategoryIds,

    relatedProductIds:
      input.relatedProductIds !== undefined
        ? input.relatedProductIds
        : existingData.relatedProductIds,

    issueDate:
      input.issueDate !== undefined ? input.issueDate : existingData.issueDate,

    expiryDate:
      input.expiryDate !== undefined
        ? input.expiryDate
        : existingData.expiryDate,

    status: input.status !== undefined ? input.status : existingData.status,

    featured:
      input.featured !== undefined ? input.featured : existingData.featured,

    showOnHome:
      input.showOnHome !== undefined
        ? input.showOnHome
        : existingData.showOnHome,

    sortOrder:
      input.sortOrder !== undefined ? input.sortOrder : existingData.sortOrder,

    seo: input.seo !== undefined ? input.seo : existingData.seo,
  });
}

function assertValidDates(standard) {
  if (
    standard.issueDate &&
    standard.expiryDate &&
    standard.expiryDate < standard.issueDate
  ) {
    throw new InvalidRequestError(
      "Expiry date must be later than or equal to issue date",
      {
        field: "expiryDate",
      },
    );
  }
}

function assertPublishableStandard(standard) {
  assertValidDates(standard);

  if (standard.status !== STANDARD_STATUSES.PUBLISHED) {
    return;
  }

  const requiredFields = [
    {
      path: "code",
      value: standard.code,
    },
    {
      path: "name.en",
      value: standard.name.en,
    },
    {
      path: "name.th",
      value: standard.name.th,
    },
    {
      path: "shortDescription.en",
      value: standard.shortDescription.en,
    },
    {
      path: "shortDescription.th",
      value: standard.shortDescription.th,
    },
  ];

  const missingField = requiredFields.find(({ value }) => !value);

  if (missingField) {
    throw new InvalidRequestError(
      `Published standard requires ${missingField.path}`,
      {
        field: missingField.path,
      },
    );
  }
}

async function assertUniqueField({
  transaction,
  field,
  value,
  excludeStandardId = null,
}) {
  if (!value) {
    return;
  }

  const query = adminDb
    .collection(COLLECTIONS.STANDARDS)
    .where(field, "==", value)
    .limit(2);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.find(
    (document) =>
      document.id !== excludeStandardId && !document.data()?.isDeleted,
  );

  if (duplicate) {
    throw new ConflictError(`A standard with this ${field} already exists`, {
      field,
      value,
    });
  }
}

function getAuditAction({ previousStatus, nextStatus }) {
  if (
    previousStatus !== STANDARD_STATUSES.PUBLISHED &&
    nextStatus === STANDARD_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.STANDARD_PUBLISH || AUDIT_ACTIONS.STANDARD_UPDATE;
  }

  if (
    previousStatus === STANDARD_STATUSES.PUBLISHED &&
    nextStatus !== STANDARD_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.STANDARD_UNPUBLISH || AUDIT_ACTIONS.STANDARD_UPDATE;
  }

  return AUDIT_ACTIONS.STANDARD_UPDATE;
}

export async function createStandard({ input, actor, requestMetadata = {} }) {
  const standardId = randomUUID();

  const standard = normalizeStandardInput(input);

  assertPublishableStandard(standard);

  const reference = adminDb.collection(COLLECTIONS.STANDARDS).doc(standardId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueField({
      transaction,
      field: "slug",
      value: standard.slug,
    });

    await assertUniqueField({
      transaction,
      field: "standardKey",
      value: standard.standardKey,
    });

    const relationships = await prepareStandardRelationships({
      transaction,

      standardId,

      previousData: {},

      nextData: standard,

      actor,
    });

    const writeData = {
      ...standard,

      document: relationships.document,

      relatedCategories: relationships.categories,

      relatedProducts: relationships.products,

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

      action: AUDIT_ACTIONS.STANDARD_CREATE,

      entityType: STANDARD_ENTITY_TYPE,

      entityId: standardId,

      before: null,

      after: writeData,

      metadata: requestMetadata,

      transaction,
    });
  });

  return getStandardById(standardId);
}

export async function getStandardById(standardId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.STANDARDS)
    .doc(standardId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Standard not found");
  }

  return serializeStandard(snapshot);
}

export async function updateStandard({
  standardId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.STANDARDS).doc(standardId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Standard not found");
    }

    const before = snapshot.data();

    const standard = mergeStandardInput(before, input);

    assertPublishableStandard(standard);

    await assertUniqueField({
      transaction,

      field: "slug",

      value: standard.slug,

      excludeStandardId: standardId,
    });

    await assertUniqueField({
      transaction,

      field: "standardKey",

      value: standard.standardKey,

      excludeStandardId: standardId,
    });

    const relationships = await prepareStandardRelationships({
      transaction,

      standardId,

      previousData: before,

      nextData: standard,

      actor,
    });

    const updates = {
      ...standard,

      document: relationships.document,

      relatedCategories: relationships.categories,

      relatedProducts: relationships.products,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: getAuditAction({
        previousStatus: before.status,

        nextStatus: standard.status,
      }),

      entityType: STANDARD_ENTITY_TYPE,

      entityId: standardId,

      before,

      after: {
        ...before,
        ...updates,
      },

      metadata: requestMetadata,

      transaction,
    });
  });

  return getStandardById(standardId);
}

export async function deleteStandard({
  standardId,
  actor,
  requestMetadata = {},
}) {
  await getStandardById(standardId);

  return softDeleteEntity({
    entityType: STANDARD_ENTITY_TYPE,

    entityId: standardId,

    actor,

    requestMetadata,
  });
}

export async function reorderStandards({ items, actor, requestMetadata = {} }) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.STANDARDS).doc(item.standardId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      if (!snapshot.exists || snapshot.data()?.isDeleted) {
        throw new NotFoundError(`Standard ${snapshot.id} not found`);
      }
    }

    const snapshotsById = new Map(
      snapshots.map((snapshot) => [snapshot.id, snapshot]),
    );

    for (const item of items) {
      const snapshot = snapshotsById.get(item.standardId);

      transaction.update(snapshot.ref, {
        sortOrder: item.sortOrder,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.STANDARD_UPDATE,

        entityType: STANDARD_ENTITY_TYPE,

        entityId: item.standardId,

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
