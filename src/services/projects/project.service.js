import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  PROJECT_BUILDING_TYPES,
  PROJECT_DEFAULTS,
  PROJECT_STATUSES,
  normalizeProjectSlug,
} from "@/constants/projects";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareProjectRelationships } from "@/services/projects/project-relationships.service";
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

function serializeProject(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: serializeLocalizedValue(data.name),

    slug: data.slug || "",

    buildingType: data.buildingType || PROJECT_BUILDING_TYPES.OTHER,

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

function normalizeIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(value.map((item) => String(item || "").trim()).filter(Boolean)),
  ];
}

function normalizeOptionalMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function normalizeYear(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const year = Number(value);

  return Number.isInteger(year) ? year : null;
}

function createDefaultSeoTitle({ name, locale }) {
  const projectName = name?.[locale] || name?.en || "";

  return projectName ? `${projectName} | HCS Thailand` : "";
}

function createDefaultSeoKeywords({
  name,
  slug,
  buildingType,
  location,
  locale,
}) {
  const projectName = name?.[locale] || name?.en || "";

  const projectLocation = location?.[locale] || location?.en || "";

  return [
    projectName,
    slug,
    buildingType,
    projectLocation,
    locale === "th" ? "ผลงานโครงการ HCS" : "HCS project reference",
    "HCS Thailand",
  ].filter(Boolean);
}

function normalizeSeo({
  seo,
  name,
  slug,
  buildingType,
  location,
  shortDescription,
}) {
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
              buildingType,
              location,
              locale: "en",
            }),

      th:
        inputKeywords.th.length > 0
          ? inputKeywords.th
          : createDefaultSeoKeywords({
              name,
              slug,
              buildingType,
              location,
              locale: "th",
            }),
    },
  };
}

function normalizeProjectInput(input) {
  const name = normalizeLocalizedValue(input.name);

  const slug = normalizeProjectSlug(input.slug);

  const buildingType = input.buildingType || PROJECT_DEFAULTS.buildingType;

  const location = normalizeLocalizedValue(input.location);

  const shortDescription = normalizeLocalizedValue(input.shortDescription);

  const coverImageMediaId = normalizeOptionalMediaId(input.coverImageMediaId);

  const galleryMediaIds = normalizeIds(input.galleryMediaIds).filter(
    (mediaId) => mediaId !== coverImageMediaId,
  );

  return {
    name,

    slug,

    buildingType,

    location,

    client: normalizeLocalizedValue(input.client),

    year: normalizeYear(input.year),

    shortDescription,

    description: normalizeLocalizedValue(input.description),

    challenge: normalizeLocalizedValue(input.challenge),

    solution: normalizeLocalizedValue(input.solution),

    results: normalizeLocalizedArray(input.results),

    coverImageMediaId,

    galleryMediaIds,

    relatedProductIds: normalizeIds(input.relatedProductIds),

    relatedSolutionIds: normalizeIds(input.relatedSolutionIds),

    status: input.status || PROJECT_DEFAULTS.status,

    featured: Boolean(input.featured),

    showOnHome: Boolean(input.showOnHome),

    sortOrder: Number(input.sortOrder ?? PROJECT_DEFAULTS.sortOrder),

    seo: normalizeSeo({
      seo: input.seo,
      name,
      slug,
      buildingType,
      location,
      shortDescription,
    }),
  };
}

function mergeProjectInput(before, input) {
  return normalizeProjectInput({
    name: input.name === undefined ? before.name : input.name,

    slug: input.slug === undefined ? before.slug : input.slug,

    buildingType:
      input.buildingType === undefined
        ? before.buildingType
        : input.buildingType,

    location: input.location === undefined ? before.location : input.location,

    client: input.client === undefined ? before.client : input.client,

    year: input.year === undefined ? before.year : input.year,

    shortDescription:
      input.shortDescription === undefined
        ? before.shortDescription
        : input.shortDescription,

    description:
      input.description === undefined ? before.description : input.description,

    challenge:
      input.challenge === undefined ? before.challenge : input.challenge,

    solution: input.solution === undefined ? before.solution : input.solution,

    results: input.results === undefined ? before.results : input.results,

    coverImageMediaId:
      input.coverImageMediaId === undefined
        ? before.coverImageMediaId
        : input.coverImageMediaId,

    galleryMediaIds:
      input.galleryMediaIds === undefined
        ? before.galleryMediaIds
        : input.galleryMediaIds,

    relatedProductIds:
      input.relatedProductIds === undefined
        ? before.relatedProductIds
        : input.relatedProductIds,

    relatedSolutionIds:
      input.relatedSolutionIds === undefined
        ? before.relatedSolutionIds
        : input.relatedSolutionIds,

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

function assertPublishableProject(project) {
  if (project.status !== PROJECT_STATUSES.PUBLISHED) {
    return;
  }

  const missingFields = [];

  if (!project.name.en) {
    missingFields.push("name.en");
  }

  if (!project.name.th) {
    missingFields.push("name.th");
  }

  if (!project.slug) {
    missingFields.push("slug");
  }

  if (!project.location.en) {
    missingFields.push("location.en");
  }

  if (!project.location.th) {
    missingFields.push("location.th");
  }

  if (!project.shortDescription.en) {
    missingFields.push("shortDescription.en");
  }

  if (!project.shortDescription.th) {
    missingFields.push("shortDescription.th");
  }

  if (!project.description.en) {
    missingFields.push("description.en");
  }

  if (!project.description.th) {
    missingFields.push("description.th");
  }

  if (!project.coverImageMediaId) {
    missingFields.push("coverImageMediaId");
  }

  if (missingFields.length > 0) {
    throw new InvalidRequestError(
      "Published projects require complete bilingual content, location and a cover image",
      {
        missingFields,
      },
    );
  }
}

async function assertUniqueSlug({
  transaction,
  slug,
  excludeProjectId = null,
}) {
  const query = adminDb
    .collection(COLLECTIONS.PROJECTS)
    .where("slug", "==", slug)
    .limit(2);

  const snapshot = await transaction.get(query);

  const duplicate = snapshot.docs.find(
    (document) => document.id !== excludeProjectId,
  );

  if (duplicate) {
    throw new ConflictError("A project with this slug already exists", {
      field: "slug",
      value: slug,
      conflictingProjectId: duplicate.id,
    });
  }
}

function createRelatedProductSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: serializeLocalizedValue(data.name),
    slug: data.slug || "",
    model: data.model || "",
    sku: data.sku || "",
    primaryImage: serializeMediaSnapshot(data.primaryImage),
  };
}

function createRelatedSolutionSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: serializeLocalizedValue(data.name),
    slug: data.slug || "",
    icon: data.icon || "building",
    image: serializeMediaSnapshot(data.image),
  };
}

async function prepareRelatedEntities({
  transaction,
  relatedProductIds,
  relatedSolutionIds,
}) {
  const productReferences = relatedProductIds.map((productId) =>
    adminDb.collection(COLLECTIONS.PRODUCTS).doc(productId),
  );

  const solutionReferences = relatedSolutionIds.map((solutionId) =>
    adminDb.collection(COLLECTIONS.SOLUTIONS).doc(solutionId),
  );

  const productSnapshots =
    productReferences.length > 0
      ? await transaction.getAll(...productReferences)
      : [];

  const solutionSnapshots =
    solutionReferences.length > 0
      ? await transaction.getAll(...solutionReferences)
      : [];

  for (const snapshot of productSnapshots) {
    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new InvalidRequestError(
        `Related product ${snapshot.id} is unavailable`,
        {
          field: "relatedProductIds",
          productId: snapshot.id,
        },
      );
    }
  }

  for (const snapshot of solutionSnapshots) {
    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new InvalidRequestError(
        `Related solution ${snapshot.id} is unavailable`,
        {
          field: "relatedSolutionIds",
          solutionId: snapshot.id,
        },
      );
    }
  }

  const productsById = new Map(
    productSnapshots.map((snapshot) => [
      snapshot.id,
      createRelatedProductSnapshot(snapshot),
    ]),
  );

  const solutionsById = new Map(
    solutionSnapshots.map((snapshot) => [
      snapshot.id,
      createRelatedSolutionSnapshot(snapshot),
    ]),
  );

  return {
    relatedProducts: relatedProductIds
      .map((productId) => productsById.get(productId))
      .filter(Boolean),

    relatedSolutions: relatedSolutionIds
      .map((solutionId) => solutionsById.get(solutionId))
      .filter(Boolean),
  };
}

function getProjectAuditAction({ previousStatus, nextStatus }) {
  if (
    previousStatus !== PROJECT_STATUSES.PUBLISHED &&
    nextStatus === PROJECT_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.PROJECT_PUBLISH;
  }

  if (
    previousStatus === PROJECT_STATUSES.PUBLISHED &&
    nextStatus !== PROJECT_STATUSES.PUBLISHED
  ) {
    return AUDIT_ACTIONS.PROJECT_UNPUBLISH;
  }

  return AUDIT_ACTIONS.PROJECT_UPDATE;
}

export async function createProject({ input, actor, requestMetadata = {} }) {
  const projectId = randomUUID();

  const project = normalizeProjectInput(input);

  assertPublishableProject(project);

  const reference = adminDb.collection(COLLECTIONS.PROJECTS).doc(projectId);

  await adminDb.runTransaction(async (transaction) => {
    await assertUniqueSlug({
      transaction,
      slug: project.slug,
    });

    const relationships = await prepareProjectRelationships({
      transaction,
      projectId,
      previousData: {},
      nextData: project,
      actor,
    });

    const relatedEntities = await prepareRelatedEntities({
      transaction,

      relatedProductIds: project.relatedProductIds,

      relatedSolutionIds: project.relatedSolutionIds,
    });

    const writeData = {
      ...project,

      coverImage: relationships.coverImage,

      gallery: relationships.gallery,

      ...relatedEntities,

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

      action: AUDIT_ACTIONS.PROJECT_CREATE,

      entityType: AUDIT_ENTITY_TYPES.PROJECT,

      entityId: projectId,

      before: null,

      after: writeData,

      metadata: requestMetadata,

      transaction,
    });
  });

  return getProjectById(projectId);
}

export async function getProjectById(projectId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PROJECTS)
    .doc(projectId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Project not found");
  }

  return serializeProject(snapshot);
}

export async function updateProject({
  projectId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.PROJECTS).doc(projectId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Project not found");
    }

    const before = snapshot.data();

    const project = mergeProjectInput(before, input);

    assertPublishableProject(project);

    await assertUniqueSlug({
      transaction,
      slug: project.slug,
      excludeProjectId: projectId,
    });

    const relationships = await prepareProjectRelationships({
      transaction,
      projectId,
      previousData: before,
      nextData: project,
      actor,
    });

    const relatedEntities = await prepareRelatedEntities({
      transaction,

      relatedProductIds: project.relatedProductIds,

      relatedSolutionIds: project.relatedSolutionIds,
    });

    const updates = {
      ...project,

      coverImage: relationships.coverImage,

      gallery: relationships.gallery,

      ...relatedEntities,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: getProjectAuditAction({
        previousStatus: before.status,
        nextStatus: project.status,
      }),

      entityType: AUDIT_ENTITY_TYPES.PROJECT,

      entityId: projectId,

      before,

      after: {
        ...before,
        ...updates,
      },

      metadata: requestMetadata,

      transaction,
    });
  });

  return getProjectById(projectId);
}

export async function deleteProject({
  projectId,
  actor,
  requestMetadata = {},
}) {
  await getProjectById(projectId);

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.PROJECT,
    entityId: projectId,
    actor,
    requestMetadata,
  });
}

export async function reorderProjects({ items, actor, requestMetadata = {} }) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.PROJECTS).doc(item.projectId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      if (!snapshot.exists || snapshot.data()?.isDeleted) {
        throw new NotFoundError(`Project ${snapshot.id} not found`);
      }
    }

    const snapshotsById = new Map(
      snapshots.map((snapshot) => [snapshot.id, snapshot]),
    );

    for (const item of items) {
      const snapshot = snapshotsById.get(item.projectId);

      transaction.update(snapshot.ref, {
        sortOrder: item.sortOrder,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.PROJECT_UPDATE,

        entityType: AUDIT_ENTITY_TYPES.PROJECT,

        entityId: item.projectId,

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
