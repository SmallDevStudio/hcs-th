import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  SOLUTION_DEFAULTS,
  SOLUTION_STATUSES,
  normalizeSolutionSlug,
} from "@/constants/solutions";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareSolutionRelationships } from "@/services/solutions/solution-relationships.service";
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

    publicUrl: value.publicUrl || null,

    storagePath: value.storagePath || null,

    originalName: value.originalName || "",

    mimeType: value.mimeType || "",

    width: value.width || null,

    height: value.height || null,

    altText: serializeLocalizedValue(value.altText),
  };
}

function serializeSolution(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: serializeLocalizedValue(data.name),

    slug: data.slug || "",

    eyebrow: serializeLocalizedValue(data.eyebrow),

    shortDescription: serializeLocalizedValue(data.shortDescription),

    description: serializeLocalizedValue(data.description),

    icon: data.icon || SOLUTION_DEFAULTS.icon,

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

function createDefaultSeoTitle({ name, locale }) {
  const solutionName = name?.[locale] || name?.en || "";

  return solutionName ? `${solutionName} | HCS Thailand` : "";
}

function createDefaultSeoKeywords({ name, slug, locale }) {
  const solutionName = name?.[locale] || name?.en || "";

  return [
    solutionName,
    slug,
    locale === "th" ? "โซลูชันระบบประตู" : "door opening solutions",
    "HCS Thailand",
  ].filter(Boolean);
}

function normalizeSeo({ seo, name, slug, shortDescription }) {
  const inputTitle = normalizeLocalizedValue(seo?.title);

  const inputDescription = normalizeLocalizedValue(seo?.description);

  const inputKeywords = normalizeLocalizedArray(seo?.keywords);

  return {
    title: {
      en:
        inputTitle.en ||
        createDefaultSeoTitle({
          name,
          locale: "en",
        }),

      th:
        inputTitle.th ||
        createDefaultSeoTitle({
          name,
          locale: "th",
        }),
    },

    description: {
      en: inputDescription.en || shortDescription.en,

      th: inputDescription.th || shortDescription.th,
    },

    keywords: {
      en:
        inputKeywords.en.length > 0
          ? inputKeywords.en
          : createDefaultSeoKeywords({
              name,
              slug,
              locale: "en",
            }),

      th:
        inputKeywords.th.length > 0
          ? inputKeywords.th
          : createDefaultSeoKeywords({
              name,
              slug,
              locale: "th",
            }),
    },
  };
}

function normalizeSolutionInput(input) {
  const name = normalizeLocalizedValue(input.name);

  const slug = normalizeSolutionSlug(input.slug);

  const shortDescription = normalizeLocalizedValue(input.shortDescription);

  return {
    name,

    slug,

    eyebrow: normalizeLocalizedValue(input.eyebrow),

    shortDescription,

    description: normalizeLocalizedValue(input.description),

    icon: input.icon || SOLUTION_DEFAULTS.icon,

    imageMediaId:
      typeof input.imageMediaId === "string" && input.imageMediaId.trim()
        ? input.imageMediaId.trim()
        : null,

    features: normalizeLocalizedArray(input.features),

    status: input.status || SOLUTION_DEFAULTS.status,

    featured: Boolean(input.featured),

    showOnHome: Boolean(input.showOnHome),

    sortOrder: Number(input.sortOrder ?? SOLUTION_DEFAULTS.sortOrder),

    seo: normalizeSeo({
      seo: input.seo,

      name,

      slug,

      shortDescription,
    }),
  };
}

function mergeSolutionInput(before, input) {
  return normalizeSolutionInput({
    name: input.name === undefined ? before.name : input.name,

    slug: input.slug === undefined ? before.slug : input.slug,

    eyebrow: input.eyebrow === undefined ? before.eyebrow : input.eyebrow,

    shortDescription:
      input.shortDescription === undefined
        ? before.shortDescription
        : input.shortDescription,

    description:
      input.description === undefined ? before.description : input.description,

    icon: input.icon === undefined ? before.icon : input.icon,

    imageMediaId:
      input.imageMediaId === undefined
        ? before.imageMediaId
        : input.imageMediaId,

    features: input.features === undefined ? before.features : input.features,

    status: input.status === undefined ? before.status : input.status,

    featured: input.featured === undefined ? before.featured : input.featured,

    showOnHome:
      input.showOnHome === undefined ? before.showOnHome : input.showOnHome,

    sortOrder:
      input.sortOrder === undefined ? before.sortOrder : input.sortOrder,

    seo:
      input.seo === undefined
        ? before.seo
        : {
            title:
              input.seo.title === undefined
                ? before.seo?.title
                : input.seo.title,

            description:
              input.seo.description === undefined
                ? before.seo?.description
                : input.seo.description,

            keywords:
              input.seo.keywords === undefined
                ? before.seo?.keywords
                : input.seo.keywords,
          },
  });
}

function assertPublishableSolution(solution) {
  if (solution.status !== SOLUTION_STATUSES.PUBLISHED) {
    return;
  }

  const missingFields = [];

  if (!solution.name.en) {
    missingFields.push("name.en");
  }

  if (!solution.name.th) {
    missingFields.push("name.th");
  }

  if (!solution.slug) {
    missingFields.push("slug");
  }

  if (!solution.shortDescription.en) {
    missingFields.push("shortDescription.en");
  }

  if (!solution.shortDescription.th) {
    missingFields.push("shortDescription.th");
  }

  if (!solution.description.en) {
    missingFields.push("description.en");
  }

  if (!solution.description.th) {
    missingFields.push("description.th");
  }

  if (!solution.imageMediaId) {
    missingFields.push("imageMediaId");
  }

  if (missingFields.length > 0) {
    throw new InvalidRequestError(
      "Published solutions require complete bilingual content and a primary image",
      {
        missingFields,
      },
    );
  }
}

async function assertUniqueSlug({
  transaction,
  slug,
  excludeSolutionId = null,
}) {
  const query = adminDb
    .collection(COLLECTIONS.SOLUTIONS)
    .where("slug", "==", slug)
    .limit(2);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.find(
    (document) => document.id !== excludeSolutionId,
  );

  if (duplicate) {
    throw new ConflictError("A solution with this slug already exists", {
      field: "slug",

      value: slug,

      conflictingSolutionId: duplicate.id,
    });
  }
}

function getSolutionAuditAction({ previousStatus, nextStatus }) {
  if (
    previousStatus !== SOLUTION_STATUSES.PUBLISHED &&
    nextStatus === SOLUTION_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.SOLUTION_PUBLISH;
  }

  if (
    previousStatus === SOLUTION_STATUSES.PUBLISHED &&
    nextStatus !== SOLUTION_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.SOLUTION_UNPUBLISH;
  }

  return AUDIT_ACTIONS.SOLUTION_UPDATE;
}

export async function createSolution({ input, actor, requestMetadata = {} }) {
  const solutionId = randomUUID();

  const solution = normalizeSolutionInput(input);

  assertPublishableSolution(solution);

  const reference = adminDb.collection(COLLECTIONS.SOLUTIONS).doc(solutionId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueSlug({
      transaction,

      slug: solution.slug,
    });

    const relationships = await prepareSolutionRelationships({
      transaction,

      solutionId,

      previousData: {},

      nextData: solution,

      actor,
    });

    const writeData = {
      ...solution,

      image: relationships.image,

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

      action: AUDIT_ACTIONS.SOLUTION_CREATE,

      entityType: AUDIT_ENTITY_TYPES.SOLUTION,

      entityId: solutionId,

      before: null,

      after: writeData,

      metadata: requestMetadata,

      transaction,
    });
  });

  return getSolutionById(solutionId);
}

export async function getSolutionById(solutionId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.SOLUTIONS)
    .doc(solutionId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Solution not found");
  }

  return serializeSolution(snapshot);
}

export async function updateSolution({
  solutionId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.SOLUTIONS).doc(solutionId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Solution not found");
    }

    const before = snapshot.data();

    const solution = mergeSolutionInput(before, input);

    assertPublishableSolution(solution);

    await assertUniqueSlug({
      transaction,

      slug: solution.slug,

      excludeSolutionId: solutionId,
    });

    const relationships = await prepareSolutionRelationships({
      transaction,

      solutionId,

      previousData: before,

      nextData: solution,

      actor,
    });

    const updates = {
      ...solution,

      image: relationships.image,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: getSolutionAuditAction({
        previousStatus: before.status,

        nextStatus: solution.status,
      }),

      entityType: AUDIT_ENTITY_TYPES.SOLUTION,

      entityId: solutionId,

      before,

      after: {
        ...before,

        ...updates,
      },

      metadata: requestMetadata,

      transaction,
    });
  });

  return getSolutionById(solutionId);
}

export async function deleteSolution({
  solutionId,
  actor,
  requestMetadata = {},
}) {
  await getSolutionById(solutionId);

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.SOLUTION,

    entityId: solutionId,

    actor,

    requestMetadata,
  });
}

export async function reorderSolutions({ items, actor, requestMetadata = {} }) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.SOLUTIONS).doc(item.solutionId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      if (!snapshot.exists || snapshot.data()?.isDeleted) {
        throw new NotFoundError(`Solution ${snapshot.id} not found`);
      }
    }

    const snapshotsById = new Map(
      snapshots.map((snapshot) => [snapshot.id, snapshot]),
    );

    for (const item of items) {
      const snapshot = snapshotsById.get(item.solutionId);

      transaction.update(snapshot.ref, {
        sortOrder: item.sortOrder,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.SOLUTION_UPDATE,

        entityType: AUDIT_ENTITY_TYPES.SOLUTION,

        entityId: item.solutionId,

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
